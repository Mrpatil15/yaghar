"""
supabase_client.py - Centralized Supabase PostgreSQL & Auth integration for YAGHAR.
Provides live cloud persistence, workspace-scoping, and resilient data access.
"""

import os
import streamlit as st
from typing import Optional, Dict, Any, List, Tuple
from supabase import create_client, Client

_client_instance: Optional[Client] = None

def get_supabase_credentials() -> Tuple[str, str]:
    """Retrieves Supabase URL and anon/service key from secrets, environment, or default cloud project."""
    url = ""
    key = ""

    # 0. Try session state (if user entered in UI)
    try:
        if "custom_supabase_url" in st.session_state and st.session_state.custom_supabase_url:
            url = str(st.session_state.custom_supabase_url).strip()
        if "custom_supabase_key" in st.session_state and st.session_state.custom_supabase_key:
            key = str(st.session_state.custom_supabase_key).strip()
    except Exception:
        pass

    # 1. Try Streamlit secrets
    if not url or not key:
        try:
            if "SUPABASE_URL" in st.secrets:
                url = str(st.secrets["SUPABASE_URL"]).strip()
            if "SUPABASE_ANON_KEY" in st.secrets:
                key = str(st.secrets["SUPABASE_ANON_KEY"]).strip()
            elif "SUPABASE_KEY" in st.secrets:
                key = str(st.secrets["SUPABASE_KEY"]).strip()
        except Exception:
            pass

    # 2. Try OS environment variables
    if not url:
        url = os.environ.get("SUPABASE_URL", "") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
    if not key:
        key = os.environ.get("SUPABASE_ANON_KEY", "") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

    # 3. Try .streamlit/secrets.toml
    if not url or not key:
        secrets_path = os.path.join(os.path.dirname(__file__), ".streamlit", "secrets.toml")
        if os.path.exists(secrets_path):
            try:
                with open(secrets_path, "r", encoding="utf-8") as f:
                    for line in f:
                        if line.startswith("SUPABASE_URL"):
                            url = line.split("=", 1)[1].strip().strip('"').strip("'")
                        elif line.startswith("SUPABASE_ANON_KEY") or line.startswith("SUPABASE_KEY"):
                            key = line.split("=", 1)[1].strip().strip('"').strip("'")
            except Exception:
                pass

    # 4. Try .env.local fallback
    if not url or not key:
        env_path = os.path.join(os.path.dirname(__file__), ".env.local")
        if os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith("NEXT_PUBLIC_SUPABASE_URL=") or line.startswith("SUPABASE_URL="):
                            url = line.split("=", 1)[1].strip().strip('"').strip("'")
                        elif line.startswith("SUPABASE_SERVICE_ROLE_KEY=") or line.startswith("NEXT_PUBLIC_SUPABASE_ANON_KEY="):
                            key = line.split("=", 1)[1].strip().strip('"').strip("'")
            except Exception:
                pass

    # 5. Default project credentials for seamless Streamlit Cloud operation
    if not url or not key:
        url = "https://bbskftjdzwtvrmpbmskd.supabase.co"
        key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJic2tmdGpkend0dnJtcGJtc2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5ODA1NjEsImV4cCI6MjEwNTU1NjU2MX0.Pf4L0jYlm1M6EEOqvDsJ_feAPnjBiJWVMJob3QHHv1w"

    return url, key


def get_supabase_client() -> Optional[Client]:
    """Returns singleton Supabase client or initializes it."""
    global _client_instance
    if _client_instance is not None:
        return _client_instance

    url, key = get_supabase_credentials()
    if url and key:
        try:
            _client_instance = create_client(url, key)
            return _client_instance
        except Exception as e:
            print(f"[Supabase] Initialization error: {e}")
            return None
    return None


def is_supabase_configured() -> bool:
    """Checks whether Supabase credentials are valid and reachable."""
    client = get_supabase_client()
    if not client:
        return False
    try:
        client.table("workspaces").select("id").limit(1).execute()
        return True
    except Exception:
        return False


def get_active_workspace_id() -> str:
    """Returns the current workspace ID, or default workspace from Supabase."""
    if "active_workspace_id" in st.session_state and st.session_state.active_workspace_id:
        return st.session_state.active_workspace_id

    client = get_supabase_client()
    if client:
        try:
            res = client.table("workspaces").select("id, name").limit(1).execute()
            if res.data:
                ws_id = res.data[0]["id"]
                st.session_state.active_workspace_id = ws_id
                st.session_state.active_workspace_name = res.data[0].get("name", "Shree Ganesh Realty")
                return ws_id
        except Exception as e:
            print(f"[Supabase] Workspace lookup error: {e}")

    # Fallback UUID
    fallback_id = "a0000000-0000-0000-0000-000000000001"
    st.session_state.active_workspace_id = fallback_id
    st.session_state.active_workspace_name = "Shree Ganesh Realty"
    return fallback_id


# ----------------- Supabase Leads Service -----------------

def fetch_supabase_leads(workspace_id: Optional[str] = None, max_records: int = 25000) -> List[Dict[str, Any]]:
    """Fetches all leads live from Supabase (paginated beyond 1000 limit), parsing score/tier transparently. Falls back to SQLite."""
    client = get_supabase_client()
    if not client:
        try:
            import database
            return database.get_all_leads()
        except Exception:
            return []

    ws_id = workspace_id or get_active_workspace_id()
    try:
        all_leads = []
        page_size = 1000
        start = 0

        # PostgREST caps at 1000 rows by default; paginate to retrieve full dataset (e.g. 7900+ leads)
        while start < max_records:
            end = start + page_size - 1
            res = client.table("leads").select("*").eq("workspace_id", ws_id).order("created_at", desc=True).range(start, end).execute()
            rows = res.data or []
            if not rows:
                break
            all_leads.extend(rows)
            if len(rows) < page_size:
                break
            start += page_size

        # If Supabase returned 0 leads, check if local SQLite has leads
        if not all_leads:
            try:
                import database
                sqlite_leads = database.get_all_leads()
                if sqlite_leads:
                    return sqlite_leads
            except Exception:
                pass

        # Transparently parse score, tier, and call_status from explicit columns or tags
        for r in all_leads:
            tags = r.get("tags") or []
            if r.get("score") is None:
                score_tag = next((t for t in tags if str(t).startswith("score:")), None)
                if score_tag:
                    try:
                        r["score"] = float(score_tag.split(":", 1)[1])
                    except Exception:
                        r["score"] = 50.0
                else:
                    r["score"] = 50.0

            if not r.get("tier"):
                tier_tag = next((t for t in tags if str(t).startswith("tier:")), None)
                r["tier"] = tier_tag.split(":", 1)[1] if tier_tag else ("Hot" if (r.get("score") or 0) >= 70 else ("Warm" if (r.get("score") or 0) >= 40 else "Cold"))

            if not r.get("call_status"):
                call_tag = next((t for t in tags if str(t).startswith("call:")), None)
                r["call_status"] = call_tag.split(":", 1)[1] if call_tag else "Not Called"

        return all_leads
    except Exception as e:
        print(f"[Supabase] fetch_supabase_leads error: {e}")
        try:
            import database
            return database.get_all_leads()
        except Exception:
            return []


def insert_supabase_leads(leads_data: List[Dict[str, Any]], workspace_id: Optional[str] = None, progress_callback = None) -> int:
    """Inserts a batch of leads directly into Supabase with progress updates and SQLite backup fallback."""
    if not leads_data:
        return 0

    client = get_supabase_client()
    ws_id = workspace_id or get_active_workspace_id()

    # If Supabase client is not available, immediately persist into local SQLite
    if not client:
        try:
            import database
            batch_records = []
            for l in leads_data:
                batch_records.append({
                    "batch_id": 1,
                    "name": l.get("name", "Unknown"),
                    "phone": l.get("phone", ""),
                    "raw_phone": l.get("raw_phone", l.get("phone", "")),
                    "source": l.get("source", "Upload"),
                    "enquiry_date": l.get("enquiry_date", ""),
                    "raw_notes": l.get("notes") or l.get("raw_notes") or "",
                    "cleaned_flag": 0 if l.get("is_dead") else 1,
                    "flag_reason": "",
                    "score": float(l.get("score") or 50.0),
                    "tier": l.get("tier") or "Warm",
                    "assigned_script": l.get("assigned_script", "")
                })
            count = database.insert_leads_bulk(batch_records)
            if progress_callback:
                progress_callback(count, len(leads_data))
            return count
        except Exception as ex:
            print(f"[Fallback SQLite] insert error: {ex}")
            return 0

    records_to_insert = []
    for l in leads_data:
        score = float(l.get("score") or 50.0)
        tier = l.get("tier") or ("Hot" if score >= 70 else ("Warm" if score >= 40 else "Cold"))
        call_status = l.get("call_status") or "Not Called"

        tags = list(l.get("tags") or [])
        tags.extend([f"tier:{tier}", f"score:{score}", f"call:{call_status}"])
        tags = list(dict.fromkeys([str(t) for t in tags]))

        rec = {
            "workspace_id": ws_id,
            "name": str(l.get("name", "Unknown Lead")).strip(),
            "phone": str(l.get("phone", "")).strip(),
            "email": str(l.get("email", "")).strip() or None,
            "source": str(l.get("source", "Upload")).strip(),
            "stage": str(l.get("stage", "new")).strip(),
            "notes": str(l.get("notes") or l.get("raw_notes") or "").strip() or None,
            "property_interest": str(l.get("property_interest") or l.get("source") or "").strip() or None,
            "budget_min": l.get("budget_min") or l.get("budget"),
            "budget_max": l.get("budget_max") or l.get("budget"),
            "tags": tags,
            "is_dead": bool(l.get("is_dead", False))
        }

        if "score" in l:
            rec["score"] = score
        if "tier" in l:
            rec["tier"] = tier
        if "call_status" in l:
            rec["call_status"] = call_status

        records_to_insert.append(rec)

    # Insert in chunks of 250 for high throughput
    chunk_size = 250
    inserted_count = 0
    total_records = len(records_to_insert)

    for i in range(0, total_records, chunk_size):
        chunk = records_to_insert[i:i + chunk_size]
        try:
            res = client.table("leads").insert(chunk).execute()
            if res.data:
                inserted_count += len(res.data)
        except Exception as e:
            # Fallback if explicit score/tier columns don't exist yet in Supabase table
            err_str = str(e).lower()
            if "column" in err_str and ("score" in err_str or "tier" in err_str or "call_status" in err_str):
                cleaned_chunk = []
                for r in chunk:
                    clean_r = {k: v for k, v in r.items() if k not in ["score", "tier", "call_status", "property_interest"]}
                    cleaned_chunk.append(clean_r)
                try:
                    res = client.table("leads").insert(cleaned_chunk).execute()
                    if res.data:
                        inserted_count += len(res.data)
                except Exception as ex2:
                    print(f"[Supabase] Chunk insert retry error: {ex2}")
            else:
                print(f"[Supabase] Chunk insert error: {e}")

        if progress_callback:
            try:
                progress_callback(min(inserted_count, total_records), total_records)
            except Exception:
                pass

    # Also mirror into local SQLite for offline redundancy
    try:
        import database
        batch_records = []
        for l in leads_data:
            batch_records.append({
                "batch_id": 1,
                "name": l.get("name", "Unknown"),
                "phone": l.get("phone", ""),
                "raw_phone": l.get("raw_phone", l.get("phone", "")),
                "source": l.get("source", "Upload"),
                "enquiry_date": l.get("enquiry_date", ""),
                "raw_notes": l.get("notes") or l.get("raw_notes") or "",
                "cleaned_flag": 0 if l.get("is_dead") else 1,
                "flag_reason": "",
                "score": float(l.get("score") or 50.0),
                "tier": l.get("tier") or "Warm",
                "assigned_script": l.get("assigned_script", "")
            })
        database.insert_leads_bulk(batch_records)
    except Exception:
        pass

    return inserted_count


def update_supabase_lead_status(lead_id: Any, new_status: str, call_status: Optional[str] = None, notes: Optional[str] = None):
    """Updates a lead's stage and call status live in Supabase and SQLite."""
    # Check if lead_id is an integer (from SQLite fallback)
    is_sqlite_id = False
    try:
        if isinstance(lead_id, int) or (isinstance(lead_id, str) and lead_id.isdigit()):
            is_sqlite_id = True
    except Exception:
        pass

    if is_sqlite_id:
        try:
            import database
            database.update_lead_call_outcome(int(lead_id), call_status or new_status, notes or "")
            return True
        except Exception as e:
            print(f"[SQLite] update error: {e}")

    client = get_supabase_client()
    if not client:
        return False

    update_payload: Dict[str, Any] = {"stage": new_status}
    if notes is not None:
        update_payload["notes"] = notes

    try:
        # Fetch current tags to update call tag
        curr = client.table("leads").select("tags").eq("id", str(lead_id)).execute()
        if curr.data:
            existing_tags = curr.data[0].get("tags") or []
            updated_tags = [t for t in existing_tags if not str(t).startswith("call:")]
            if call_status:
                updated_tags.append(f"call:{call_status}")
            update_payload["tags"] = updated_tags

        if call_status:
            update_payload["call_status"] = call_status

        client.table("leads").update(update_payload).eq("id", str(lead_id)).execute()
        return True
    except Exception as e:
        # Fallback without call_status column if not yet added
        if "call_status" in update_payload:
            del update_payload["call_status"]
            try:
                client.table("leads").update(update_payload).eq("id", str(lead_id)).execute()
                return True
            except Exception:
                pass
        print(f"[Supabase] update_lead error: {e}")
        return False


# ----------------- Supabase Properties Service -----------------

def fetch_supabase_properties(workspace_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetches all property listings live from Supabase."""
    client = get_supabase_client()
    if not client:
        return []

    ws_id = workspace_id or get_active_workspace_id()
    try:
        res = client.table("properties").select("*").eq("workspace_id", ws_id).order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        print(f"[Supabase] fetch_supabase_properties error: {e}")
        return []


def insert_supabase_property(prop_data: Dict[str, Any], workspace_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Creates a new property listing in Supabase."""
    client = get_supabase_client()
    if not client:
        return None

    ws_id = workspace_id or get_active_workspace_id()
    prop_data["workspace_id"] = ws_id
    try:
        res = client.table("properties").insert(prop_data).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        print(f"[Supabase] insert_supabase_property error: {e}")
        return None


# ----------------- Supabase Follow-ups / Tasks Service -----------------

def fetch_supabase_follow_ups(workspace_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetches upcoming and pending follow-ups live from Supabase."""
    client = get_supabase_client()
    if not client:
        return []

    ws_id = workspace_id or get_active_workspace_id()
    try:
        res = client.table("follow_ups").select("*, leads(name, phone)").eq("workspace_id", ws_id).order("due_date", desc=False).execute()
        return res.data or []
    except Exception as e:
        print(f"[Supabase] fetch_supabase_follow_ups error: {e}")
        return []


def insert_supabase_follow_up(lead_id: str, due_date: str, notes: str = "", workspace_id: Optional[str] = None) -> bool:
    """Schedules a new follow-up task in Supabase."""
    client = get_supabase_client()
    if not client:
        return False

    ws_id = workspace_id or get_active_workspace_id()
    try:
        client.table("follow_ups").insert({
            "workspace_id": ws_id,
            "lead_id": lead_id,
            "due_date": due_date,
            "notes": notes,
            "status": "pending"
        }).execute()
        return True
    except Exception as e:
        print(f"[Supabase] insert_supabase_follow_up error: {e}")
        return False


def complete_supabase_follow_up(task_id: str) -> bool:
    """Marks a follow-up task completed in Supabase."""
    client = get_supabase_client()
    if not client:
        return False
    try:
        client.table("follow_ups").update({"status": "completed"}).eq("id", task_id).execute()
        return True
    except Exception as e:
        print(f"[Supabase] complete_supabase_follow_up error: {e}")
        return False
