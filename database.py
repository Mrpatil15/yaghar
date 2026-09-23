"""
database.py - SQLite storage engine for Dead-Lead Reactivation Service
Manages clients, batches, leads, and client configuration settings.
"""

import sqlite3
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dead_leads.db")

def get_connection():
    """Returns a SQLite connection with row factory enabled."""
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database schema if not already present."""
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Clients table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact TEXT,
        corridor TEXT,
        date_onboarded TEXT,
        referral_notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Batches table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        batch_name TEXT NOT NULL,
        upload_date TEXT NOT NULL,
        delivery_date TEXT,
        source_file TEXT,
        flat_fee_amount REAL DEFAULT 0.0,
        payment_status TEXT DEFAULT 'Unpaid',
        invoice_number TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
    );
    """)

    # 3. Leads table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_id INTEGER NOT NULL,
        name TEXT,
        phone TEXT,
        raw_phone TEXT,
        source TEXT,
        enquiry_date TEXT,
        raw_notes TEXT,
        cleaned_flag INTEGER DEFAULT 1,
        flag_reason TEXT,
        score REAL,
        tier TEXT,
        assigned_script TEXT,
        call_status TEXT DEFAULT 'Not Called',
        call_notes TEXT DEFAULT '',
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (batch_id) REFERENCES batches (id) ON DELETE CASCADE
    );
    """)

    # 4. Client Configs (Scoring weights, thresholds, Hinglish script templates)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS client_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER UNIQUE,
        weight_recency REAL DEFAULT 40.0,
        weight_source REAL DEFAULT 30.0,
        weight_fit REAL DEFAULT 30.0,
        hot_threshold REAL DEFAULT 70.0,
        warm_threshold REAL DEFAULT 40.0,
        script_hot TEXT,
        script_warm TEXT,
        script_cold TEXT,
        invoice_counter INTEGER DEFAULT 1001,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
    );
    """)

    conn.commit()
    conn.close()

# ----------------- Client Helpers -----------------

def get_all_clients() -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("SELECT * FROM clients ORDER BY name ASC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_client_by_id(client_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    row = conn.execute("SELECT * FROM clients WHERE id = ?", (client_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def create_client(name: str, contact: str, corridor: str, date_onboarded: str, referral_notes: str = "") -> int:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO clients (name, contact, corridor, date_onboarded, referral_notes)
        VALUES (?, ?, ?, ?, ?)
    """, (name.strip(), contact.strip(), corridor.strip(), date_onboarded, referral_notes.strip()))
    client_id = cur.lastrowid
    
    # Initialize default config for this client
    default_hot = (
        "Namaste {name} ji, main {corridor} property desk se bol raha hoon. "
        "Aapne pehle {corridor} me property search ke liye enquiry ki thi. "
        "Abhi ek bahut exclusive pre-launch/ready inventory aayi hai special rate par. "
        "Kya aapka plan abhi active hai? 2 minute baat ho sakti hai?"
    )
    default_warm = (
        "Hello {name} ji, hope you are doing well! "
        "Humne dekha aapka pehle {source} ke through flat requirement register hua tha. "
        "Market me abhi fresh options aaye hain aapke budget corridor me. "
        "Kya aapka requirement abhi open hai ya finalize ho gaya?"
    )
    default_cold = (
        "Namaste {name} ji, YAGHAR Advisory team se quick check. "
        "Aapne pehle {corridor} area me enquire kiya tha. "
        "Bas follow up karna tha ki aapka property hunt complete ho chuka hai ya still exploring? "
        "Agar drop hua ho to batayein, hum close kar denge."
    )
    cur.execute("""
        INSERT OR IGNORE INTO client_configs (client_id, weight_recency, weight_source, weight_fit, 
                                             hot_threshold, warm_threshold, script_hot, script_warm, script_cold)
        VALUES (?, 40.0, 30.0, 30.0, 70.0, 40.0, ?, ?, ?)
    """, (client_id, default_hot, default_warm, default_cold))
    
    conn.commit()
    conn.close()
    return client_id

def update_client_referral_notes(client_id: int, notes: str):
    conn = get_connection()
    conn.execute("UPDATE clients SET referral_notes = ? WHERE id = ?", (notes, client_id))
    conn.commit()
    conn.close()

# ----------------- Batch Helpers -----------------

def create_batch(client_id: int, batch_name: str, upload_date: str, source_file: str, flat_fee_amount: float = 0.0) -> int:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO batches (client_id, batch_name, upload_date, source_file, flat_fee_amount, payment_status)
        VALUES (?, ?, ?, ?, ?, 'Unpaid')
    """, (client_id, batch_name, upload_date, source_file, flat_fee_amount))
    batch_id = cur.lastrowid
    conn.commit()
    conn.close()
    return batch_id

def get_all_batches() -> List[Dict[str, Any]]:
    conn = get_connection()
    query = """
    SELECT b.*, c.name as client_name, c.corridor, c.referral_notes,
           COUNT(l.id) as total_leads,
           SUM(CASE WHEN l.cleaned_flag = 1 THEN 1 ELSE 0 END) as valid_leads,
           SUM(CASE WHEN l.call_status = 'Connected' THEN 1 ELSE 0 END) as connected_leads,
           SUM(CASE WHEN l.call_status = 'Converted' THEN 1 ELSE 0 END) as converted_leads,
           SUM(CASE WHEN l.call_status = 'Not Interested' THEN 1 ELSE 0 END) as not_interested_leads
    FROM batches b
    JOIN clients c ON b.client_id = c.id
    LEFT JOIN leads l ON b.id = l.batch_id
    GROUP BY b.id
    ORDER BY b.id DESC
    """
    rows = conn.execute(query).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_batch_by_id(batch_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    query = """
    SELECT b.*, c.name as client_name, c.contact as client_contact, c.corridor, c.referral_notes
    FROM batches b
    JOIN clients c ON b.client_id = c.id
    WHERE b.id = ?
    """
    row = conn.execute(query, (batch_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def update_batch_delivery(batch_id: int, delivery_date: str):
    conn = get_connection()
    conn.execute("UPDATE batches SET delivery_date = ? WHERE id = ?", (delivery_date, batch_id))
    conn.commit()
    conn.close()

def update_batch_payment_status(batch_id: int, status: str, invoice_number: Optional[str] = None):
    conn = get_connection()
    if invoice_number:
        conn.execute("UPDATE batches SET payment_status = ?, invoice_number = ? WHERE id = ?", (status, invoice_number, batch_id))
    else:
        conn.execute("UPDATE batches SET payment_status = ? WHERE id = ?", (status, batch_id))
    conn.commit()
    conn.close()

# ----------------- Lead Helpers -----------------

def insert_leads_bulk(leads_data: List[Dict[str, Any]]) -> int:
    """Inserts a list of parsed lead dictionaries into the database."""
    if not leads_data:
        return 0
    conn = get_connection()
    cur = conn.cursor()
    for d in leads_data:
        d.setdefault("score", None)
        d.setdefault("tier", None)
        d.setdefault("assigned_script", None)
    cur.executemany("""
        INSERT INTO leads (batch_id, name, phone, raw_phone, source, enquiry_date, raw_notes, cleaned_flag, flag_reason, call_status, score, tier, assigned_script)
        VALUES (:batch_id, :name, :phone, :raw_phone, :source, :enquiry_date, :raw_notes, :cleaned_flag, :flag_reason, 'Not Called', :score, :tier, :assigned_script)
    """, leads_data)
    count = cur.rowcount
    conn.commit()
    conn.close()
    return count

def get_leads_by_batch(batch_id: int, cleaned_only: bool = False) -> List[Dict[str, Any]]:
    conn = get_connection()
    if cleaned_only:
        rows = conn.execute("SELECT * FROM leads WHERE batch_id = ? AND cleaned_flag = 1 ORDER BY score DESC, id ASC", (batch_id,)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM leads WHERE batch_id = ? ORDER BY id ASC", (batch_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_all_leads(cleaned_only: bool = False) -> List[Dict[str, Any]]:
    conn = get_connection()
    if cleaned_only:
        rows = conn.execute("SELECT * FROM leads WHERE cleaned_flag = 1 ORDER BY score DESC, id ASC").fetchall()
    else:
        rows = conn.execute("SELECT * FROM leads ORDER BY id DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_lead_scores(batch_id: int, score_updates: List[Dict[str, Any]]):
    """Bulk updates lead score, tier, and assigned_script."""
    conn = get_connection()
    cur = conn.cursor()
    cur.executemany("""
        UPDATE leads
        SET score = :score, tier = :tier, assigned_script = :assigned_script, last_updated = CURRENT_TIMESTAMP
        WHERE id = :id AND batch_id = :batch_id
    """, score_updates)
    conn.commit()
    conn.close()

def update_lead_call_outcome(lead_id: int, call_status: str, call_notes: str = ""):
    conn = get_connection()
    conn.execute("""
        UPDATE leads
        SET call_status = ?, call_notes = ?, last_updated = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (call_status, call_notes, lead_id))
    conn.commit()
    conn.close()

def update_lead_cleaned_flag(lead_id: int, cleaned_flag: int, flag_reason: str = ""):
    conn = get_connection()
    conn.execute("""
        UPDATE leads
        SET cleaned_flag = ?, flag_reason = ?
        WHERE id = ?
    """, (cleaned_flag, flag_reason, lead_id))
    conn.commit()
    conn.close()

# ----------------- Settings / Config Helpers -----------------

def get_client_config(client_id: int) -> Dict[str, Any]:
    conn = get_connection()
    row = conn.execute("SELECT * FROM client_configs WHERE client_id = ?", (client_id,)).fetchone()
    if not row:
        # Create default config row
        default_hot = (
            "Namaste {name} ji, main {corridor} property desk se bol raha hoon. "
            "Aapne pehle {corridor} me property search ke liye enquiry ki thi. "
            "Abhi ek bahut exclusive pre-launch/ready inventory aayi hai special rate par. "
            "Kya aapka plan abhi active hai? 2 minute baat ho sakti hai?"
        )
        default_warm = (
            "Hello {name} ji, hope you are doing well! "
            "Humne dekha aapka pehle {source} ke through flat requirement register hua tha. "
            "Market me abhi fresh options aaye hain aapke budget corridor me. "
            "Kya aapka requirement abhi open hai ya finalize ho gaya?"
        )
        default_cold = (
            "Namaste {name} ji, YAGHAR Advisory team se quick check. "
            "Aapne pehle {corridor} area me enquire kiya tha. "
            "Bas follow up karna tha ki aapka property hunt complete ho chuka hai ya still exploring? "
            "Agar drop hua ho to batayein, hum close kar denge."
        )
        conn.execute("""
            INSERT OR IGNORE INTO client_configs (client_id, weight_recency, weight_source, weight_fit, 
                                                 hot_threshold, warm_threshold, script_hot, script_warm, script_cold)
            VALUES (?, 40.0, 30.0, 30.0, 70.0, 40.0, ?, ?, ?)
        """, (client_id, default_hot, default_warm, default_cold))
        conn.commit()
        row = conn.execute("SELECT * FROM client_configs WHERE client_id = ?", (client_id,)).fetchone()
    conn.close()
    return dict(row)

def update_client_config(client_id: int, weight_recency: float, weight_source: float, weight_fit: float,
                         hot_threshold: float, warm_threshold: float, script_hot: str, script_warm: str, script_cold: str):
    conn = get_connection()
    conn.execute("""
        UPDATE client_configs
        SET weight_recency = ?, weight_source = ?, weight_fit = ?,
            hot_threshold = ?, warm_threshold = ?,
            script_hot = ?, script_warm = ?, script_cold = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE client_id = ?
    """, (weight_recency, weight_source, weight_fit, hot_threshold, warm_threshold, script_hot, script_warm, script_cold, client_id))
    conn.commit()
    conn.close()

def get_next_invoice_number(client_id: int) -> str:
    """Generates an auto-incrementing invoice number format like INV-2026-1001."""
    conn = get_connection()
    cfg = conn.execute("SELECT invoice_counter FROM client_configs WHERE client_id = ?", (client_id,)).fetchone()
    counter = cfg["invoice_counter"] if cfg and cfg["invoice_counter"] else 1001
    conn.execute("UPDATE client_configs SET invoice_counter = ? WHERE client_id = ?", (counter + 1, client_id))
    conn.commit()
    conn.close()
    
    year = datetime.now().year
    return f"INV-{year}-{counter:04d}"

def auto_process_full_batch(client_id: int, 
                            batch_name: str, 
                            source_file: str, 
                            df_raw: Any, 
                            col_name: str, 
                            col_phone: str, 
                            col_date: str = "", 
                            col_source: str = "", 
                            col_notes: str = "", 
                            flat_fee: float = 15000.0) -> Tuple[int, Dict[str, Any]]:
    """
    Executes complete end-to-end processing in a single pass:
    Creates batch -> cleans & normalizes phone -> multi-factor scoring -> 
    Hinglish script segmentation -> saves all records to database.
    """
    import cleaning
    import scoring
    import scripts
    from datetime import date

    # 1. Create batch record
    batch_id = create_batch(
        client_id=client_id,
        batch_name=batch_name,
        upload_date=str(date.today()),
        source_file=source_file,
        flat_fee_amount=flat_fee
    )
    update_batch_delivery(batch_id, str(date.today()))

    # 2. Clean and standardize leads
    cleaned_df, summary = cleaning.clean_and_standardize_leads(
        df=df_raw,
        col_name=col_name,
        col_phone=col_phone,
        col_date=col_date,
        col_source=col_source,
        col_notes=col_notes
    )

    # 3. Get client config
    client = get_client_by_id(client_id)
    corridor = client.get("corridor", "Central Mumbai") if client else ""
    cfg = get_client_config(client_id)

    w_rec = float(cfg.get("weight_recency", 40.0))
    w_src = float(cfg.get("weight_source", 30.0))
    w_fit = float(cfg.get("weight_fit", 30.0))

    # 4. Score all leads
    scored_df = scoring.compute_composite_scores(
        cleaned_df,
        weight_recency=w_rec,
        weight_source=w_src,
        weight_fit=w_fit,
        corridor=corridor
    )

    # 5. Segment and assign Hinglish scripts
    hot_th = float(cfg.get("hot_threshold", 70.0))
    warm_th = float(cfg.get("warm_threshold", 40.0))
    templates = {
        "Hot": cfg.get("script_hot", scripts.DEFAULT_SCRIPTS["Hot"]),
        "Warm": cfg.get("script_warm", scripts.DEFAULT_SCRIPTS["Warm"]),
        "Cold": cfg.get("script_cold", scripts.DEFAULT_SCRIPTS["Cold"])
    }

    segmented_df = scripts.segment_and_assign_scripts(
        df=scored_df,
        hot_threshold=hot_th,
        warm_threshold=warm_th,
        script_templates=templates,
        corridor=corridor
    )

    # 6. Bulk insert leads with scores, tiers, and scripts directly in one pass
    leads_to_insert = []
    for _, r in segmented_df.iterrows():
        leads_to_insert.append({
            "batch_id": batch_id,
            "name": r["name"],
            "phone": r["phone"],
            "raw_phone": r["raw_phone"],
            "source": r["source"],
            "enquiry_date": r["enquiry_date"],
            "raw_notes": r["raw_notes"],
            "cleaned_flag": r["cleaned_flag"],
            "flag_reason": r["flag_reason"],
            "score": r["score"],
            "tier": r["tier"],
            "assigned_script": r["assigned_script"]
        })
    insert_leads_bulk(leads_to_insert)

    summary["batch_id"] = batch_id
    summary["hot_count"] = int((segmented_df["tier"] == "Hot").sum())
    summary["warm_count"] = int((segmented_df["tier"] == "Warm").sum())
    summary["cold_count"] = int((segmented_df["tier"] == "Cold").sum())
    summary["mean_score"] = round(segmented_df["score"].mean(), 1) if not segmented_df.empty else 0.0

    return batch_id, summary

# Initialize on module import
init_db()

