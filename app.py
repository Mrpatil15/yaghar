"""
app.py - Dead-Lead Reactivation Service Web App
Built with Streamlit, SQLite, and pandas for Real Estate Brokerage Client Advisory.
"""

import os
import io
from datetime import datetime, date
import pandas as pd
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go

# Core backend modules
import database as db
import cleaning
import scoring
import scripts
import export
import invoicing
import workability

# Page Configuration
st.set_page_config(
    page_title="Dead-Lead Reactivation Studio | YAGHAR Advisory",
    page_icon="🏢",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ----------------- Custom Styling & Theme (Attractive Luxury Look) -----------------
CUSTOM_CSS = """
<style>
    /* Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* Top Brand Bar */
    .brand-banner {
        background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%) !important;
        border: 1px solid rgba(245, 158, 11, 0.45) !important;
        border-radius: 14px;
        padding: 22px 28px;
        margin-bottom: 24px;
        box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.35);
    }
    .brand-banner h1, .brand-title {
        color: #FFFFFF !important;
        font-size: 1.75rem !important;
        font-weight: 800 !important;
        letter-spacing: -0.5px;
        margin: 0 !important;
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .brand-banner p, .brand-subtitle {
        color: #CBD5E1 !important;
        font-size: 0.95rem !important;
        margin-top: 8px !important;
        font-weight: 400 !important;
    }
    .brand-badge {
        background: rgba(217, 119, 6, 0.15);
        color: #F59E0B;
        border: 1px solid rgba(245, 158, 11, 0.4);
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Executive Stat Card */
    .metric-card {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 2px 8px -2px rgba(15, 23, 42, 0.06);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .metric-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px -4px rgba(15, 23, 42, 0.1);
    }
    .metric-label {
        font-size: 0.78rem;
        font-weight: 600;
        color: #64748B;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .metric-value {
        font-size: 1.65rem;
        font-weight: 800;
        color: #0F172A;
        margin: 4px 0;
    }
    .metric-sub {
        font-size: 0.8rem;
        color: #10B981;
        font-weight: 600;
    }

    /* Tier Pills */
    .badge-hot {
        background-color: #DCFCE7;
        color: #15803D;
        border: 1px solid #86EFAC;
        padding: 3px 10px;
        border-radius: 999px;
        font-weight: 700;
        font-size: 0.78rem;
    }
    .badge-warm {
        background-color: #FEF3C7;
        color: #B45309;
        border: 1px solid #FCD34D;
        padding: 3px 10px;
        border-radius: 999px;
        font-weight: 700;
        font-size: 0.78rem;
    }
    .badge-cold {
        background-color: #E0F2FE;
        color: #0369A1;
        border: 1px solid #BAE6FD;
        padding: 3px 10px;
        border-radius: 999px;
        font-weight: 700;
        font-size: 0.78rem;
    }
    .badge-alert {
        background-color: #FEE2E2;
        color: #B91C1C;
        border: 1px solid #FCA5A5;
        padding: 4px 10px;
        border-radius: 6px;
        font-weight: 700;
        font-size: 0.8rem;
    }
    .badge-paid {
        background-color: #DCFCE7;
        color: #15803D;
        border: 1px solid #86EFAC;
        padding: 3px 10px;
        border-radius: 6px;
        font-weight: 700;
        font-size: 0.8rem;
    }
    .badge-unpaid {
        background-color: #FEF2F2;
        color: #DC2626;
        border: 1px solid #FECACA;
        padding: 3px 10px;
        border-radius: 6px;
        font-weight: 700;
        font-size: 0.8rem;
    }

    /* Script Preview Box */
    .script-box {
        background-color: #F8FAFC;
        border-left: 4px solid #D97706;
        border-radius: 0 8px 8px 0;
        padding: 14px 18px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #1E293B;
        font-size: 0.95rem;
        line-height: 1.55;
        margin: 8px 0;
    }

    /* Active Context Banner */
    .context-bar {
        background: #F1F5F9;
        border: 1px solid #CBD5E1;
        border-radius: 8px;
        padding: 8px 16px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.88rem;
        color: #334155;
    }

    /* Sidebar tweaks */
    [data-testid="stSidebar"] {
        background-color: #0B132B !important;
    }
    [data-testid="stSidebar"] [data-testid="stMarkdownContainer"] p,
    [data-testid="stSidebar"] label,
    [data-testid="stSidebar"] span {
        color: #E2E8F0 !important;
    }
    [data-testid="stSidebar"] .stRadio label {
        padding: 6px 12px;
        border-radius: 6px;
        transition: background 0.15s ease;
    }
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

# ----------------- Session State Initialization -----------------
if "active_client_id" not in st.session_state:
    st.session_state.active_client_id = None
if "active_batch_id" not in st.session_state:
    st.session_state.active_batch_id = None
if "nav_radio" not in st.session_state:
    st.session_state.nav_radio = "🏠 Follow-up Dashboard"

# Ensure DB initialized
db.init_db()

# ----------------- Sidebar Navigation -----------------
NAV_PAGES = [
    "🏠 Follow-up Dashboard",
    "📥 1. Client & Batch Intake",
    "🏆 Workable Leads & Pipeline",
    "🧹 2. Cleaning & Standardization",
    "🎯 3. Lead Scoring Engine",
    "📜 4. Segmentation & Scripts",
    "📦 5. Delivery Export & Calling",
    "🧾 6. Non-GST Invoicing"
]

with st.sidebar:
    st.markdown("""
    <div style="padding: 10px 0 20px 0; text-align: center;">
        <span style="font-size: 2.2rem;">🏢</span>
        <h2 style="color: #F8FAFC; margin: 4px 0 0 0; font-size: 1.35rem; font-weight: 800; letter-spacing: -0.5px;">YAGHAR</h2>
        <div style="color: #F59E0B; font-size: 0.72rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
            Dead-Lead Reactivation Studio
        </div>
    </div>
    """, unsafe_allow_html=True)

    nav_option = st.radio(
        "Navigation",
        NAV_PAGES,
        key="nav_radio",
        label_visibility="collapsed"
    )

    st.markdown("---")

    # Client & Batch Quick Selector in Sidebar
    clients = db.get_all_clients()
    if clients:
        client_options = {c["id"]: f"{c['name']} ({c['corridor']})" for c in clients}
        
        # Intelligent default: select client and batch that already have leads
        if st.session_state.active_client_id not in client_options:
            all_b_init = db.get_all_batches()
            b_with_leads = [b for b in all_b_init if (b.get("total_leads") or 0) > 0]
            if b_with_leads:
                st.session_state.active_client_id = b_with_leads[0]["client_id"]
                st.session_state.active_batch_id = b_with_leads[0]["id"]
            else:
                st.session_state.active_client_id = list(client_options.keys())[0]

        selected_client_idx = 0
        if st.session_state.active_client_id in client_options:
            selected_client_idx = list(client_options.keys()).index(st.session_state.active_client_id)

        chosen_client_id = st.selectbox(
            "🏢 Active Client",
            options=list(client_options.keys()),
            format_func=lambda cid: client_options[cid],
            index=selected_client_idx
        )
        st.session_state.active_client_id = chosen_client_id

        # Batch selector for active client
        all_batches = db.get_all_batches()
        client_batches = [b for b in all_batches if b["client_id"] == chosen_client_id]
        if client_batches:
            batch_options = {b["id"]: f"Batch #{b['id']}: {b['batch_name']} ({b.get('total_leads',0)} leads)" for b in client_batches}
            
            # Default to batch with leads if current not set
            if st.session_state.active_batch_id not in batch_options:
                b_leads = [b for b in client_batches if (b.get("total_leads") or 0) > 0]
                if b_leads:
                    st.session_state.active_batch_id = b_leads[0]["id"]
                else:
                    st.session_state.active_batch_id = list(batch_options.keys())[0]

            selected_batch_idx = 0
            if st.session_state.active_batch_id in batch_options:
                selected_batch_idx = list(batch_options.keys()).index(st.session_state.active_batch_id)

            chosen_batch_id = st.selectbox(
                "📦 Active Batch",
                options=list(batch_options.keys()),
                format_func=lambda bid: batch_options[bid],
                index=selected_batch_idx
            )
            st.session_state.active_batch_id = chosen_batch_id
        else:
            st.session_state.active_batch_id = None
            st.info("No batches for this client yet.")
    else:
        st.session_state.active_client_id = None
        st.session_state.active_batch_id = None
        st.info("No clients created yet.")



    st.markdown("""
    <div style="font-size: 0.72rem; color: #64748B; text-align: center; margin-top: 30px;">
        Internal Reactivation Terminal v2.0<br/>YAGHAR Real Estate Advisory
    </div>
    """, unsafe_allow_html=True)


# ----------------- Helper Context Banner -----------------
def render_context_banner():
    if st.session_state.active_client_id and st.session_state.active_batch_id:
        client = db.get_client_by_id(st.session_state.active_client_id)
        batch = db.get_batch_by_id(st.session_state.active_batch_id)
        if client and batch:
            st.markdown(f"""
            <div class="context-bar">
                <div>
                    <b>Active Brokerage:</b> <span style="color: #0F172A; font-weight:700;">{client['name']}</span> 
                    &nbsp;•&nbsp; <b>Corridor:</b> <span style="color: #D97706; font-weight:600;">{client['corridor']}</span>
                </div>
                <div>
                    <b>Working Batch:</b> <span style="color: #0F172A; font-weight:700;">{batch['batch_name']}</span> 
                    &nbsp;•&nbsp; Status: <span class="{'badge-paid' if batch['payment_status']=='Paid' else 'badge-unpaid'}">{batch['payment_status']}</span>
                </div>
            </div>
            """, unsafe_allow_html=True)

# =======================================================================================
# PAGE 0: FOLLOW-UP DASHBOARD (HOME)
# =======================================================================================
if nav_option == "🏠 Follow-up Dashboard":
    st.markdown("""
    <div class="brand-banner">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h1 class="brand-title">
                <span>🏢</span> Dead-Lead Reactivation Hub
            </h1>
            <span class="brand-badge">Agency Operations</span>
        </div>
        <div class="brand-subtitle">
            Track client batches, 7-day follow-up milestones, conversion velocity, and fee receivables.
        </div>
    </div>
    """, unsafe_allow_html=True)

    all_batches = db.get_all_batches()
    all_clients = db.get_all_clients()

    # Metric Cards Top Row
    m1, m2, m3, m4, m5 = st.columns(5)
    total_clients_count = len(all_clients)
    total_batches_count = len(all_batches)
    total_reactivated = sum(b.get("valid_leads", 0) or 0 for b in all_batches)
    total_revenue_collected = sum(b["flat_fee_amount"] for b in all_batches if b["payment_status"] == "Paid")
    unpaid_receivables = sum(b["flat_fee_amount"] for b in all_batches if b["payment_status"] != "Paid")

    with m1:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Active Clients</div>
            <div class="metric-value">{total_clients_count}</div>
            <div class="metric-sub">Brokerage Firms</div>
        </div>
        """, unsafe_allow_html=True)
    with m2:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Batches Processed</div>
            <div class="metric-value">{total_batches_count}</div>
            <div class="metric-sub">Delivery Runs</div>
        </div>
        """, unsafe_allow_html=True)
    with m3:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Leads Revived</div>
            <div class="metric-value">{total_reactivated:,}</div>
            <div class="metric-sub">Cleaned & Scored</div>
        </div>
        """, unsafe_allow_html=True)
    with m4:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Revenue Collected</div>
            <div class="metric-value">₹ {total_revenue_collected:,.0f}</div>
            <div class="metric-sub">Paid Invoices</div>
        </div>
        """, unsafe_allow_html=True)
    with m5:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Pending Receivables</div>
            <div class="metric-value" style="color: #DC2626;">₹ {unpaid_receivables:,.0f}</div>
            <div class="metric-sub" style="color: #EF4444;">Unpaid Batches</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<br/>", unsafe_allow_html=True)

    # Batches Table with 7-Day Follow-Up Due Flag
    st.subheader("📋 Client Batches & Follow-up Tracking")
    
    if not all_batches:
        st.markdown("""
        <div style="background: #F8FAFC; border: 1.5px dashed #CBD5E1; border-radius: 12px; padding: 28px 24px; text-align: center; margin: 16px 0;">
            <span style="font-size: 2.2rem;">📂</span>
            <h3 style="color: #0F172A; margin: 8px 0 4px 0; font-weight: 700;">No Batches Found Yet</h3>
            <p style="color: #64748B; font-size: 0.92rem; max-width: 520px; margin: 0 auto 16px auto;">
                Ready to process a raw lead list (like <b>data_heawen.xlsx</b>)? Onboard your brokerage client and map your lead columns in <b>Step 1: Client & Batch Intake</b>.
            </p>
        </div>
        """, unsafe_allow_html=True)
        if st.button("🚀 Go to '1. Client & Batch Intake' to Upload Leads →", type="primary", use_container_width=True, key="dash_start_btn"):
            st.session_state.nav_radio = "📥 1. Client & Batch Intake"
            st.rerun()
    else:
        batch_rows = []
        today = date.today()

        for b in all_batches:
            # Days since delivery calculation
            days_since = "Not Delivered"
            followup_badge = "—"
            
            if b.get("delivery_date"):
                try:
                    deliv_dt = datetime.strptime(b["delivery_date"], "%Y-%m-%d").date()
                    diff_days = (today - deliv_dt).days
                    days_since = f"{diff_days} days ago"
                    if diff_days >= 7:
                        followup_badge = f"🚨 Due (Day {diff_days})"
                    else:
                        followup_badge = f"🟢 In Progress ({7 - diff_days}d left)"
                except Exception:
                    days_since = b["delivery_date"]

            # Conversion percentages
            valid_count = b.get("valid_leads", 0) or 0
            conn_count = b.get("connected_leads", 0) or 0
            conv_count = b.get("converted_leads", 0) or 0

            pct_connected = f"{(conn_count / valid_count * 100):.1f}%" if valid_count > 0 else "0.0%"
            pct_converted = f"{(conv_count / valid_count * 100):.1f}%" if valid_count > 0 else "0.0%"

            batch_rows.append({
                "Batch ID": b["id"],
                "Client Firm": b["client_name"],
                "Corridor": b["corridor"],
                "Batch Name": b["batch_name"],
                "Leads (Clean)": f"{valid_count} / {b.get('total_leads', 0)}",
                "Delivery Date": b.get("delivery_date") or "Pending",
                "Days Since Delivery": days_since,
                "7-Day Follow-up Alert": followup_badge,
                "% Connected": pct_connected,
                "% Converted / Visit": pct_converted,
                "Flat Fee": f"₹ {b['flat_fee_amount']:,.0f}",
                "Payment": b["payment_status"]
            })

        df_display = pd.DataFrame(batch_rows)
        st.dataframe(df_display, use_container_width=True, hide_index=True)

    st.markdown("---")

    # Lower section: Re-import Client Sheet & Referral Notes
    col_reimport, col_notes = st.columns([1.1, 0.9])

    with col_reimport:
        st.subheader("📥 Sync Client Calling Feedback")
        if not all_batches:
            st.info("ℹ️ **Uploading a new raw lead file (e.g. data_heawen.xlsx)?**\n\nPlease go to **'📥 1. Client & Batch Intake'** in the left sidebar to onboard your client and map columns.\n\n*(This section is only used after your client returns their Excel sheet with completed call statuses)*")
        else:
            st.caption("Upload the client's returned Excel sheet to update conversion stats automatically.")
            
            target_batch_id = st.selectbox(
                "Select Batch to Sync Feedback",
                options=[b["id"] for b in all_batches],
                format_func=lambda bid: f"#{bid} - {next((b['batch_name'] for b in all_batches if b['id']==bid), '')}"
            )
            
            returned_file = st.file_uploader("Upload Client Returned Sheet (.xlsx / .csv)", type=["xlsx", "csv"], key="dash_returned")
            if returned_file and target_batch_id:
                if st.button("⚡ Process Client Feedback & Update Stats", type="primary"):
                    res = export.reimport_client_status_sheet(target_batch_id, returned_file)
                    if res["success"]:
                        st.success(res["message"])
                        st.rerun()
                    else:
                        st.error(res["message"])

    with col_notes:
        st.subheader("📝 Client Referral & Growth Notes")
        st.caption("Keep private relationship logs, referral contacts, and corridor expansion notes.")
        
        if all_clients:
            note_client_id = st.selectbox(
                "Select Client Firm",
                options=[c["id"] for c in all_clients],
                format_func=lambda cid: next(c["name"] for c in all_clients if c["id"]==cid),
                key="dash_note_client"
            )
            client_obj = next((c for c in all_clients if c["id"] == note_client_id), None)
            current_notes = client_obj.get("referral_notes", "") if client_obj else ""

            updated_notes = st.text_area("Client Notes / Referral Log", value=current_notes, height=130)
            if st.button("💾 Save Client Notes"):
                db.update_client_referral_notes(note_client_id, updated_notes)
                st.success("Referral notes updated!")
                st.rerun()
        else:
            st.info("Add a client first to manage referral notes.")

# =======================================================================================
# PAGE 1: CLIENT & BATCH INTAKE
# =======================================================================================
elif nav_option == "📥 1. Client & Batch Intake":
    st.markdown("""
    <div class="brand-banner">
        <h1 class="brand-title"><span>📥</span> Client & Batch Intake</h1>
        <div class="brand-subtitle">
            Onboard new real estate brokerages, upload raw lead exports, and map disparate column schemas.
        </div>
    </div>
    """, unsafe_allow_html=True)

    tab_client, tab_batch = st.tabs(["🏢 Client Onboarding", "📁 Raw Batch Upload & Column Mapping"])

    # TAB 1: Client Onboarding
    with tab_client:
        col_c1, col_c2 = st.columns([1, 1.2])
        with col_c1:
            st.subheader("Add New Brokerage Client")
            with st.form("new_client_form"):
                new_c_name = st.text_input("Brokerage / Firm Name *", placeholder="e.g. Lodha Realty Partners / Square Yards Desk")
                new_c_contact = st.text_input("Contact Person & Mobile", placeholder="e.g. Rahul Mehta (+91 98200 12345)")
                new_c_corridor = st.text_input("Focus Corridor / Micro-Market *", placeholder="e.g. Central Mumbai (Chembur, Wadala, Ghatkopar)")
                new_c_date = st.date_input("Date Onboarded", value=date.today())
                new_c_notes = st.text_area("Initial Referral / Commercial Notes", placeholder="e.g. Flat fee ₹15k agreed, 7-day turnaround")

                submit_client = st.form_submit_button("Create Client Firm", type="primary")
                if submit_client:
                    if not new_c_name.strip() or not new_c_corridor.strip():
                        st.error("Client Name and Focus Corridor are required!")
                    else:
                        cid = db.create_client(new_c_name, new_c_contact, new_c_corridor, str(new_c_date), new_c_notes)
                        st.session_state.active_client_id = cid
                        st.success(f"Client '{new_c_name}' created successfully!")
                        st.rerun()

        with col_c2:
            st.subheader("Existing Brokerage Directory")
            all_c = db.get_all_clients()
            if all_c:
                c_df = pd.DataFrame([{
                    "ID": c["id"],
                    "Name": c["name"],
                    "Contact": c["contact"],
                    "Corridor": c["corridor"],
                    "Onboarded": c["date_onboarded"],
                    "Referral Notes": c["referral_notes"]
                } for c in all_c])
                st.dataframe(c_df, use_container_width=True, hide_index=True)
            else:
                st.info("No clients onboarded yet.")

    # TAB 2: Batch Upload & Column Mapping
    with tab_batch:
        st.subheader("Upload Raw Dead-Lead List")
        all_c = db.get_all_clients()
        if not all_c:
            st.markdown("""
            <div style="background:#FFFBEB; border:1px solid #FCD34D; border-radius:10px; padding:18px; margin-bottom:18px;">
                <b style="color:#B45309; font-size:1.05rem;">🏢 Quick Brokerage Setup</b><br/>
                <span style="color:#475569; font-size:0.9rem;">You haven't onboarded a client firm yet. Set a name and focus corridor below to begin uploading your leads immediately:</span>
            </div>
            """, unsafe_allow_html=True)
            q_col1, q_col2 = st.columns(2)
            with q_col1:
                q_name = st.text_input("Brokerage / Client Firm Name *", value="Central Mumbai Realty Desk")
            with q_col2:
                q_corridor = st.text_input("Focus Corridor / Micro-Market *", value="Central Mumbai (Chembur, Wadala, Ghatkopar)")
            if st.button("✨ Set Client Firm & Enable Lead Upload", type="primary"):
                cid = db.create_client(q_name, "+91 98200 00000", q_corridor, str(date.today()), "Self onboarded")
                st.session_state.active_client_id = cid
                st.success(f"Firm '{q_name}' onboarded! You can now upload your leads below.")
                st.rerun()
        else:
            col_b1, col_b2 = st.columns([1, 1.5])
            with col_b1:
                intake_client_id = st.selectbox(
                    "Assign to Brokerage Client *",
                    options=[c["id"] for c in all_c],
                    format_func=lambda cid: next(c["name"] for c in all_c if c["id"]==cid),
                    index=0 if not st.session_state.active_client_id else [c["id"] for c in all_c].index(st.session_state.active_client_id) if st.session_state.active_client_id in [c["id"] for c in all_c] else 0
                )
                batch_name_input = st.text_input("Batch Reference Name *", value=f"Dead Leads Run — {datetime.now().strftime('%b %Y')}")
                flat_fee_input = st.number_input("Agreed Service Flat Fee (INR ₹)", min_value=0.0, value=15000.0, step=2500.0)
                uploaded_file = st.file_uploader("Upload CSV or Excel Export (e.g. data_heawen.xlsx)", type=["csv", "xlsx", "xls"])

            with col_b2:
                if uploaded_file is not None:
                    try:
                        if uploaded_file.name.endswith(".csv"):
                            df_raw = pd.read_csv(uploaded_file)
                        else:
                            df_raw = pd.read_excel(uploaded_file)

                        st.success(f"Loaded **{len(df_raw)}** rows from `{uploaded_file.name}`")
                        st.caption("Preview of raw file:")
                        st.dataframe(df_raw.head(3), use_container_width=True)

                        st.markdown("#### 🔗 Column Mapping")
                        st.caption("Map the file's custom headers to expected standard fields:")

                        cols = list(df_raw.columns)
                        cols_with_none = ["-- Select --"] + cols

                        # Intelligent auto-detector for column mapping
                        def detect_col(candidates, options):
                            for cand in candidates:
                                for opt in options:
                                    if cand in opt.lower():
                                        return opt
                            return options[0]

                        col_name_guess = detect_col(["name", "customer", "lead", "client"], cols)
                        col_phone_guess = detect_col(["phone", "mobile", "contact", "cell", "number"], cols)
                        col_date_guess = detect_col(["date", "time", "created", "enquiry", "added"], cols)
                        col_source_guess = detect_col(["source", "campaign", "channel", "portal", "origin"], cols)
                        col_notes_guess = detect_col(["note", "remark", "requirement", "comment", "desc", "budget"], cols)

                        m_c1, m_c2 = st.columns(2)
                        with m_c1:
                            map_name = st.selectbox("1. Lead Full Name *", cols, index=cols.index(col_name_guess) if col_name_guess in cols else 0)
                            map_phone = st.selectbox("2. Phone Number *", cols, index=cols.index(col_phone_guess) if col_phone_guess in cols else 0)
                            map_date = st.selectbox("3. Enquiry Date", cols_with_none, index=cols_with_none.index(col_date_guess) if col_date_guess in cols_with_none else 0)

                        with m_c2:
                            map_source = st.selectbox("4. Lead Source", cols_with_none, index=cols_with_none.index(col_source_guess) if col_source_guess in cols_with_none else 0)
                            map_notes = st.selectbox("5. Notes / Requirements", cols_with_none, index=cols_with_none.index(col_notes_guess) if col_notes_guess in cols_with_none else 0)

                        # Primary 1-Click Auto-Pilot Banner & Action
                        st.markdown("""
                        <div style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); border: 1.5px solid #F59E0B; border-radius: 10px; padding: 16px 20px; margin: 16px 0 10px 0;">
                            <div style="color: #F59E0B; font-weight: 800; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">⭐ Recommended Instant Mode</div>
                            <div style="color: #FFFFFF; font-size: 1.15rem; font-weight: 700; margin: 4px 0;">⚡ 1-Click Auto-Pilot: Load, Clean, Score & Rank All Leads</div>
                            <div style="color: #CBD5E1; font-size: 0.88rem;">Automatically normalizes phone numbers (+91), dedupes, scores intent, assigns personalized Hinglish call pitches, and opens the Workable Leads Ranking queue immediately!</div>
                        </div>
                        """, unsafe_allow_html=True)

                        if st.button("🚀 1-Click Auto-Pilot: Clean, Score, Assign Scripts & Rank All Leads →", type="primary", use_container_width=True):
                            with st.spinner("Executing full reactivation engine..."):
                                new_batch_id, summary = db.auto_process_full_batch(
                                    client_id=intake_client_id,
                                    batch_name=batch_name_input,
                                    source_file=uploaded_file.name,
                                    df_raw=df_raw,
                                    col_name=map_name,
                                    col_phone=map_phone,
                                    col_date=map_date if map_date != "-- Select --" else "",
                                    col_source=map_source if map_source != "-- Select --" else "",
                                    col_notes=map_notes if map_notes != "-- Select --" else "",
                                    flat_fee=float(flat_fee_input)
                                )
                                st.session_state.active_client_id = intake_client_id
                                st.session_state.active_batch_id = new_batch_id
                                st.session_state.nav_radio = "🏆 Workable Leads & Pipeline"
                                st.success(f"✅ Successfully processed {summary['total_raw']} leads! ({summary['valid_count']} clean, {summary['duplicates_count']} duplicates filtered). Redirecting to Workable Leads Pipeline...")
                                st.rerun()

                        with st.expander("🛠️ Advanced Mode: Manual Multi-Step Save"):
                            st.caption("Only saves cleaned leads without automated scoring if you want to inspect weights step-by-step.")
                            if st.button("Save Raw Leads Only (Manual Progression)"):
                                new_batch_id = db.create_batch(
                                    client_id=intake_client_id,
                                    batch_name=batch_name_input,
                                    upload_date=str(date.today()),
                                    source_file=uploaded_file.name,
                                    flat_fee_amount=float(flat_fee_input)
                                )
                                db.update_batch_delivery(new_batch_id, str(date.today()))
                                cleaned_df, summary = cleaning.clean_and_standardize_leads(
                                    df=df_raw,
                                    col_name=map_name,
                                    col_phone=map_phone,
                                    col_date=map_date if map_date != "-- Select --" else "",
                                    col_source=map_source if map_source != "-- Select --" else "",
                                    col_notes=map_notes if map_notes != "-- Select --" else ""
                                )
                                leads_to_insert = []
                                for _, r in cleaned_df.iterrows():
                                    leads_to_insert.append({
                                        "batch_id": new_batch_id,
                                        "name": r["name"],
                                        "phone": r["phone"],
                                        "raw_phone": r["raw_phone"],
                                        "source": r["source"],
                                        "enquiry_date": r["enquiry_date"],
                                        "raw_notes": r["raw_notes"],
                                        "cleaned_flag": r["cleaned_flag"],
                                        "flag_reason": r["flag_reason"]
                                    })
                                db.insert_leads_bulk(leads_to_insert)
                                st.session_state.active_client_id = intake_client_id
                                st.session_state.active_batch_id = new_batch_id
                                st.success(f"Batch #{new_batch_id} saved! Proceeding to Step 2: Cleaning.")
                                st.session_state.nav_radio = "🧹 2. Cleaning & Standardization"
                                st.rerun()

                    except Exception as e:
                        st.error(f"Error parsing file: {e}")
                else:
                    st.info("Select an Excel or CSV file from your computer (like `data_heawen.xlsx`) to preview and map columns.")

# =======================================================================================
# PAGE: WORKABLE LEADS & RESPONSE PIPELINE
# =======================================================================================
elif nav_option == "🏆 Workable Leads & Pipeline":
    render_context_banner()
    st.markdown("""
    <div class="brand-banner">
        <h1 class="brand-title"><span>🏆</span> Workable Leads & Response Pipeline</h1>
        <div class="brand-subtitle">
            Dynamic prioritization: leads are continuously ranked by response status, site visit likelihood, and buyer readiness.
        </div>
    </div>
    """, unsafe_allow_html=True)

    if not st.session_state.active_batch_id or not st.session_state.active_client_id:
        st.warning("Please select or upload a batch first in '1. Client & Batch Intake'.")
    else:
        raw_leads = db.get_leads_by_batch(st.session_state.active_batch_id, cleaned_only=True)
        if not raw_leads:
            st.info("No clean leads found in this batch. Please upload a lead file or complete intake.")
        else:
            # Rank leads dynamically on basis of response & lead score
            ranked_leads = workability.rank_leads_by_workability(raw_leads)

            total_count = len(ranked_leads)
            workable_count = sum(1 for l in ranked_leads if l["is_workable"])
            site_visits = sum(1 for l in ranked_leads if l.get("call_status") in ("Site Visit Booked", "Converted"))
            callbacks = sum(1 for l in ranked_leads if l.get("call_status") in ("High Interest / Callback",))
            pending_calls = sum(1 for l in ranked_leads if l.get("call_status") in ("Not Called", "Pending Call"))

            # Executive Pipeline Metric Cards
            w1, w2, w3, w4, w5 = st.columns(5)
            with w1:
                st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-label">Total Leads</div>
                    <div class="metric-value">{total_count}</div>
                    <div class="metric-sub" style="color: #64748B;">In Active Batch</div>
                </div>
                """, unsafe_allow_html=True)
            with w2:
                st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-label">🎯 Workable Leads</div>
                    <div class="metric-value" style="color: #10B981;">{workable_count}</div>
                    <div class="metric-sub">{round(workable_count/total_count*100, 1) if total_count else 0}% Workable Rate</div>
                </div>
                """, unsafe_allow_html=True)
            with w3:
                st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-label">📅 Site Visits Booked</div>
                    <div class="metric-value" style="color: #059669;">{site_visits}</div>
                    <div class="metric-sub">Appointments</div>
                </div>
                """, unsafe_allow_html=True)
            with w4:
                st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-label">🔥 Callbacks Requested</div>
                    <div class="metric-value" style="color: #D97706;">{callbacks}</div>
                    <div class="metric-sub">High Intent</div>
                </div>
                """, unsafe_allow_html=True)
            with w5:
                st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-label">📞 Pending Calls</div>
                    <div class="metric-value" style="color: #2563EB;">{pending_calls}</div>
                    <div class="metric-sub">Awaiting Contact</div>
                </div>
                """, unsafe_allow_html=True)

            st.markdown("<br/>", unsafe_allow_html=True)

            # Filter Bar & Export
            col_f1, col_f2, col_f3 = st.columns([1.5, 1.2, 1.1])
            with col_f1:
                filter_opt = st.selectbox(
                    "Filter Pipeline Stage",
                    [
                        "🔥 Only Workable Leads",
                        "Show All Leads",
                        "📅 Site Visits Booked",
                        "🔥 High Interest Callbacks",
                        "📞 Connected - Exploring",
                        "🔄 Ringing / Retry Queue",
                        "💤 Pending Initial Call",
                        "❌ Dropped / Unworkable"
                    ],
                    index=0
                )
            with col_f2:
                search_query = st.text_input("🔍 Search Name, Phone, or Notes", placeholder="Type name, phone, or keyword...")
            with col_f3:
                st.write("")
                st.write("")
                batch_obj = db.get_batch_by_id(st.session_state.active_batch_id)
                excel_workable = export.generate_workable_excel(ranked_leads, batch_obj or {})
                st.download_button(
                    label="📥 Export Ranked Sheet (Excel)",
                    data=excel_workable,
                    file_name=f"Workable_Ranked_{batch_obj.get('client_name', 'Client').replace(' ', '_')}.xlsx",
                    mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    use_container_width=True,
                    type="primary"
                )

            # Filtering logic
            display_leads = ranked_leads
            if filter_opt == "🔥 Only Workable Leads":
                display_leads = [l for l in display_leads if l["is_workable"]]
            elif filter_opt == "📅 Site Visits Booked":
                display_leads = [l for l in display_leads if l.get("call_status") in ("Site Visit Booked", "Converted")]
            elif filter_opt == "🔥 High Interest Callbacks":
                display_leads = [l for l in display_leads if l.get("call_status") in ("High Interest / Callback",)]
            elif filter_opt == "📞 Connected - Exploring":
                display_leads = [l for l in display_leads if l.get("call_status") in ("Connected - Exploring", "Connected")]
            elif filter_opt == "🔄 Ringing / Retry Queue":
                display_leads = [l for l in display_leads if l.get("call_status") in ("Ringing / No Answer", "Call Busy / Later")]
            elif filter_opt == "💤 Pending Initial Call":
                display_leads = [l for l in display_leads if l.get("call_status") in ("Not Called", "Pending Call")]
            elif filter_opt == "❌ Dropped / Unworkable":
                display_leads = [l for l in display_leads if not l["is_workable"]]

            if search_query:
                sq = search_query.lower()
                display_leads = [l for l in display_leads if sq in str(l.get("name","")).lower() or sq in str(l.get("phone","")) or sq in str(l.get("raw_notes","")).lower()]

            st.write(f"Displaying **{len(display_leads)}** leads ordered by Workability Rank:")

            # Render Ranked Lead Cards
            for l in display_leads:
                rank_num = l["workable_rank"]
                badge_label, bg_color, text_color = workability.WORKABLE_TIER_BADGES.get(
                    l["workable_tier"], (l["workable_tier"], "#F1F5F9", "#334155")
                )

                if rank_num == 1:
                    rank_badge = f"<span style='background:#FEF3C7; color:#B45309; font-weight:800; padding:4px 10px; border-radius:6px; font-size:0.92rem; border:1px solid #FCD34D;'>🥇 Rank #{rank_num}</span>"
                elif rank_num == 2:
                    rank_badge = f"<span style='background:#F1F5F9; color:#334155; font-weight:800; padding:4px 10px; border-radius:6px; font-size:0.92rem; border:1px solid #CBD5E1;'>🥈 Rank #{rank_num}</span>"
                elif rank_num == 3:
                    rank_badge = f"<span style='background:#FFEDD5; color:#C2410C; font-weight:800; padding:4px 10px; border-radius:6px; font-size:0.92rem; border:1px solid #FDBA74;'>🥉 Rank #{rank_num}</span>"
                else:
                    rank_badge = f"<span style='background:#F8FAFC; color:#64748B; font-weight:700; padding:4px 8px; border-radius:6px; font-size:0.85rem; border:1px solid #E2E8F0;'>Rank #{rank_num}</span>"

                status_pill = f"<span style='background:{bg_color}; color:{text_color}; font-weight:700; padding:4px 12px; border-radius:999px; font-size:0.8rem;'>{badge_label}</span>"

                raw_p = str(l.get("phone", ""))
                wa_p = f"91{raw_p}" if len(raw_p) == 10 else "".join(c for c in raw_p if c.isdigit())

                with st.container():
                    st.markdown(f"""
                    <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; padding:16px 20px; margin-bottom:12px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
                        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                            <div style="display:flex; align-items:center; gap:12px;">
                                {rank_badge}
                                <span style="font-size:1.15rem; font-weight:700; color:#0F172A;">{l['name']}</span>
                                <code style="font-size:0.9rem; background:#F8FAFC; padding:2px 8px; border-radius:4px; border:1px solid #E2E8F0;">+91 {raw_p}</code>
                                {status_pill}
                            </div>
                            <div>
                                <span style="font-size:0.82rem; color:#64748B;">Workable Score: <b style="color:#0F172A; font-size:0.95rem;">{l['workable_score']}/100</b> &nbsp;|&nbsp; Base Score: <b>{l.get('score', 0)}/100</b> ({l.get('tier', 'Warm')})</span>
                            </div>
                        </div>
                        <div style="margin: 8px 0; font-size:0.88rem; color:#475569;">
                            <b>Source:</b> {l.get('source', 'Direct')} &nbsp;•&nbsp; <b>Date:</b> {l.get('enquiry_date', '—')} &nbsp;•&nbsp; <b>Requirement:</b> <i>{l.get('raw_notes') or 'No notes provided'}</i>
                        </div>
                        <div class="script-box">
                            <b>Assigned Hinglish Pitch Script:</b><br/>
                            {l.get('assigned_script') or 'No script assigned yet.'}
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; flex-wrap:wrap; gap:10px;">
                            <div style="display:flex; gap:8px;">
                                <a href="https://wa.me/{wa_p}?text={l.get('assigned_script','')}" target="_blank" style="background:#25D366; color:white; padding:5px 14px; border-radius:6px; text-decoration:none; font-weight:600; font-size:0.82rem;">
                                    💬 Open WhatsApp
                                </a>
                                <a href="tel:+91{raw_p}" style="background:#0F172A; color:white; padding:5px 14px; border-radius:6px; text-decoration:none; font-weight:600; font-size:0.82rem;">
                                    📞 Call Lead
                                </a>
                            </div>
                            <div style="font-size:0.85rem; color:#0F172A; font-weight:600;">
                                Current Outcome: <span style="color:#D97706;">{l.get('call_status', 'Not Called')}</span>
                                {f" — <i>Notes: {l.get('call_notes')}</i>" if l.get('call_notes') else ""}
                            </div>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)

                    # 1-Tap Response Buttons
                    b_col1, b_col2, b_col3, b_col4, b_col5 = st.columns(5)
                    if b_col1.button("📅 Site Visit Booked", key=f"rk_sv_{l['id']}", help="Promote lead to Rank #1 Ultra Hot"):
                        db.update_lead_call_outcome(l['id'], "Site Visit Booked", "Site Visit Confirmed")
                        st.rerun()
                    if b_col2.button("🔥 High Interest", key=f"rk_hi_{l['id']}", help="Requested callback / interested in project"):
                        db.update_lead_call_outcome(l['id'], "High Interest / Callback", "Requested Callback")
                        st.rerun()
                    if b_col3.button("📞 Connected", key=f"rk_co_{l['id']}", help="Spoke, exploring options"):
                        db.update_lead_call_outcome(l['id'], "Connected - Exploring", "Connected, exploring")
                        st.rerun()
                    if b_col4.button("🔄 Ringing / Busy", key=f"rk_rg_{l['id']}", help="Ringing / No Answer - retry later"):
                        db.update_lead_call_outcome(l['id'], "Ringing / No Answer", "Ringing / Try again")
                        st.rerun()
                    if b_col5.button("❌ Not Interested", key=f"rk_no_{l['id']}", help="Drop from workable queue"):
                        db.update_lead_call_outcome(l['id'], "Not Interested", "Not interested / Drop")
                        st.rerun()

                    with st.expander("📝 Add Custom Notes / Meeting Date", expanded=False):
                        note_text = st.text_input("Meeting / Outcome Remarks", value=l.get("call_notes") or "", key=f"note_in_{l['id']}")
                        if st.button("Save Note", key=f"save_n_{l['id']}"):
                            db.update_lead_call_outcome(l['id'], l.get('call_status') or 'Not Called', note_text)
                            st.success("Note saved!")
                            st.rerun()

# =======================================================================================
# PAGE 2: CLEANING & STANDARDIZATION
# =======================================================================================
elif nav_option == "🧹 2. Cleaning & Standardization":
    render_context_banner()
    st.markdown("""
    <div class="brand-banner">
        <h1 class="brand-title"><span>🧹</span> Cleaning & Standardization</h1>
        <div class="brand-subtitle">
            Auto-deduplicate by phone, normalize Indian phone formats (+91), and review flagged junk/test leads.
        </div>
    </div>
    """, unsafe_allow_html=True)

    if not st.session_state.active_batch_id:
        st.warning("Please select or upload a batch first.")
    else:
        leads = db.get_leads_by_batch(st.session_state.active_batch_id)
        if not leads:
            st.info("No leads found in this batch.")
        else:
            df_leads = pd.DataFrame(leads)

            total_leads = len(df_leads)
            valid_leads = int((df_leads["cleaned_flag"] == 1).sum())
            flagged_leads = total_leads - valid_leads
            duplicates = int(df_leads["flag_reason"].str.contains("Duplicate", na=False).sum())
            invalid_phones = int(df_leads["flag_reason"].str.contains("phone|length|digit", case=False, na=False).sum())
            junk_tests = int(df_leads["flag_reason"].str.contains("test|dummy|name", case=False, na=False).sum())

            # Before / After Metrics Row
            c1, c2, c3, c4 = st.columns(4)
            with c1:
                st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-label">Total Raw Leads</div>
                    <div class="metric-value">{total_leads}</div>
                    <div class="metric-sub" style="color: #64748B;">Uploaded rows</div>
                </div>
                """, unsafe_allow_html=True)
            with c2:
                st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-label">Clean & Valid</div>
                    <div class="metric-value" style="color: #10B981;">{valid_leads}</div>
                    <div class="metric-sub">{round(valid_leads/total_leads*100, 1) if total_leads else 0}% Yield</div>
                </div>
                """, unsafe_allow_html=True)
            with c3:
                st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-label">Duplicates Removed</div>
                    <div class="metric-value" style="color: #F59E0B;">{duplicates}</div>
                    <div class="metric-sub">Unique phone filter</div>
                </div>
                """, unsafe_allow_html=True)
            with c4:
                st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-label">Flagged Junk / Invalid</div>
                    <div class="metric-value" style="color: #EF4444;">{flagged_leads}</div>
                    <div class="metric-sub">{invalid_phones} phone / {junk_tests} junk</div>
                </div>
                """, unsafe_allow_html=True)

            st.markdown("<br/>", unsafe_allow_html=True)

            tab_clean, tab_flagged = st.tabs([f"✅ Clean Leads ({valid_leads})", f"⚠️ Flagged for Manual Review ({flagged_leads})"])

            with tab_clean:
                clean_view = df_leads[df_leads["cleaned_flag"] == 1][["id", "name", "phone", "raw_phone", "source", "enquiry_date", "raw_notes"]]
                st.dataframe(clean_view, use_container_width=True, hide_index=True)

            with tab_flagged:
                if flagged_leads == 0:
                    st.success("Zero flagged issues! All leads in this batch are valid.")
                else:
                    st.caption("Review leads flagged by the automated phone validation and test-pattern detector. You can re-include approved leads or discard them:")
                    flagged_view = df_leads[df_leads["cleaned_flag"] == 0]

                    for _, r in flagged_view.iterrows():
                        f_col1, f_col2, f_col3, f_col4 = st.columns([1.5, 1.2, 1.8, 1.2])
                        with f_col1:
                            st.write(f"**{r['name']}**")
                            st.caption(f"Raw Phone: `{r['raw_phone']}`")
                        with f_col2:
                            st.markdown(f"<span class='badge-alert'>{r['flag_reason']}</span>", unsafe_allow_html=True)
                        with f_col3:
                            st.caption(f"Notes: {r['raw_notes'][:60]}..." if r['raw_notes'] else "No notes")
                        with f_col4:
                            if st.button("Include & Approve", key=f"appr_{r['id']}"):
                                db.update_lead_cleaned_flag(r['id'], 1, "Manually approved by consultant")
                                st.success(f"Lead #{r['id']} approved!")
                                st.rerun()

# =======================================================================================
# PAGE 3: LEAD SCORING ENGINE
# =======================================================================================
elif nav_option == "🎯 3. Lead Scoring Engine":
    render_context_banner()
    st.markdown("""
    <div class="brand-banner">
        <h1 class="brand-title"><span>🎯</span> Dynamic Lead Scoring Engine</h1>
        <div class="brand-subtitle">
            Configure weighted scoring (Recency, Acquisition Source, Budget/Corridor Fit) and preview distribution live.
        </div>
    </div>
    """, unsafe_allow_html=True)

    if not st.session_state.active_batch_id or not st.session_state.active_client_id:
        st.warning("Please select a client and batch first.")
    else:
        client_cfg = db.get_client_config(st.session_state.active_client_id)
        client = db.get_client_by_id(st.session_state.active_client_id)
        batch = db.get_batch_by_id(st.session_state.active_batch_id)

        leads = db.get_leads_by_batch(st.session_state.active_batch_id, cleaned_only=True)
        if not leads:
            st.info("No clean leads available to score in this batch. Please clean the batch in Step 2 first.")
        else:
            df_leads = pd.DataFrame(leads)

            col_sliders, col_chart = st.columns([1, 1.3])

            with col_sliders:
                st.subheader("⚙️ Scoring Weights")
                st.caption("Adjust sliders to tune relative importance per client:")

                w_recency = st.slider("1. Recency of Enquiry Weight (%)", 0, 100, int(client_cfg.get("weight_recency", 40.0)), step=5)
                w_source = st.slider("2. Acquisition Source Quality (%)", 0, 100, int(client_cfg.get("weight_source", 30.0)), step=5)
                w_fit = st.slider("3. Budget & Corridor Fit (%)", 0, 100, int(client_cfg.get("weight_fit", 30.0)), step=5)

                tot_w = w_recency + w_source + w_fit
                if tot_w != 100:
                    st.caption(f"Normalized total weight: **{tot_w}%** (will automatically scale to 100)")

                # Compute live scores
                scored_df = scoring.compute_composite_scores(
                    df_leads,
                    weight_recency=float(w_recency),
                    weight_source=float(w_source),
                    weight_fit=float(w_fit),
                    corridor=client.get("corridor", "")
                )

                st.markdown("<br/>", unsafe_allow_html=True)
                if st.button("💾 Finalize & Save Scores to Batch", type="primary", use_container_width=True):
                    # Save weights to client config
                    db.update_client_config(
                        client_id=st.session_state.active_client_id,
                        weight_recency=float(w_recency),
                        weight_source=float(w_source),
                        weight_fit=float(w_fit),
                        hot_threshold=client_cfg.get("hot_threshold", 70.0),
                        warm_threshold=client_cfg.get("warm_threshold", 40.0),
                        script_hot=client_cfg.get("script_hot", ""),
                        script_warm=client_cfg.get("script_warm", ""),
                        script_cold=client_cfg.get("script_cold", "")
                    )

                    # Update scores in leads table
                    score_updates = []
                    for _, r in scored_df.iterrows():
                        score_updates.append({
                            "id": r["id"],
                            "batch_id": st.session_state.active_batch_id,
                            "score": r["score"],
                            "tier": r.get("tier"),
                            "assigned_script": r.get("assigned_script")
                        })
                    db.update_lead_scores(st.session_state.active_batch_id, score_updates)
                    st.success("Scores saved! Proceeding to Step 4: Segmentation & Scripts.")
                    st.rerun()

            with col_chart:
                st.subheader("📊 Live Score Distribution")
                mean_score = round(scored_df["score"].mean(), 1)
                max_score = scored_df["score"].max()
                min_score = scored_df["score"].min()

                m_c1, m_c2, m_c3 = st.columns(3)
                m_c1.metric("Average Score", f"{mean_score}/100")
                m_c2.metric("Highest Score", f"{max_score}/100")
                m_c3.metric("Lowest Score", f"{min_score}/100")

                # Plotly Distribution Histogram
                fig = px.histogram(
                    scored_df,
                    x="score",
                    nbins=20,
                    color_discrete_sequence=["#D97706"],
                    labels={"score": "Lead Reactivation Score (0 - 100)"},
                    title="Score Frequency Distribution"
                )
                fig.update_layout(
                    paper_bgcolor="rgba(0,0,0,0)",
                    plot_bgcolor="rgba(0,0,0,0)",
                    font_family="Plus Jakarta Sans",
                    margin=dict(l=20, r=20, t=40, b=20),
                    bargap=0.08
                )
                st.plotly_chart(fig, use_container_width=True)

            st.markdown("---")
            st.subheader("Preview Scored Leads")
            display_preview = scored_df[["name", "phone", "source", "enquiry_date", "score_recency", "score_source", "score_fit", "score", "raw_notes"]]
            st.dataframe(display_preview.sort_values(by="score", ascending=False), use_container_width=True, hide_index=True)

# =======================================================================================
# PAGE 4: SEGMENTATION & HINGLISH SCRIPT ASSIGNMENT
# =======================================================================================
elif nav_option == "📜 4. Segmentation & Scripts":
    render_context_banner()
    st.markdown("""
    <div class="brand-banner">
        <h1 class="brand-title"><span>📜</span> Segmentation & Hinglish Scripts</h1>
        <div class="brand-subtitle">
            Auto-bucket leads into Hot / Warm / Cold and assign tailored, authentic Indian real estate pitch scripts.
        </div>
    </div>
    """, unsafe_allow_html=True)

    if not st.session_state.active_batch_id or not st.session_state.active_client_id:
        st.warning("Please select a client and batch first.")
    else:
        client_cfg = db.get_client_config(st.session_state.active_client_id)
        client = db.get_client_by_id(st.session_state.active_client_id)
        leads = db.get_leads_by_batch(st.session_state.active_batch_id, cleaned_only=True)

        if not leads:
            st.info("No clean leads in this batch.")
        else:
            df_leads = pd.DataFrame(leads)

            # Check if scored
            if df_leads["score"].isnull().all():
                st.warning("Leads have not been scored yet. Please complete Step 3: Lead Scoring first.")
            else:
                col_thresh, col_scripts = st.columns([1, 1.4])

                with col_thresh:
                    st.subheader("🎚️ Tier Thresholds")
                    st.caption("Adjust score cut-offs for each tier:")

                    hot_cut = st.slider("🔥 Hot Tier Cutoff (Score ≥)", 50, 95, int(client_cfg.get("hot_threshold", 70.0)))
                    warm_cut = st.slider("☀️ Warm Tier Cutoff (Score ≥)", 20, hot_cut - 5, int(client_cfg.get("warm_threshold", 40.0)))
                    st.caption(f"❄️ Cold Tier: Score < {warm_cut}")

                    # Calculate tier counts
                    hot_count = int((df_leads["score"] >= hot_cut).sum())
                    warm_count = int(((df_leads["score"] >= warm_cut) & (df_leads["score"] < hot_cut)).sum())
                    cold_count = int((df_leads["score"] < warm_cut).sum())

                    st.markdown("<br/>", unsafe_allow_html=True)
                    st.markdown(f"""
                    <div style="display: flex; gap: 8px; flex-direction: column;">
                        <div style="display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 10px 14px; border-radius: 8px;">
                            <span><span class="badge-hot">🔥 HOT TIER</span> (Score ≥ {hot_cut})</span>
                            <b>{hot_count} leads ({round(hot_count/len(df_leads)*100, 1)}%)</b>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 10px 14px; border-radius: 8px;">
                            <span><span class="badge-warm">☀️ WARM TIER</span> ({warm_cut} ≤ Score < {hot_cut})</span>
                            <b>{warm_count} leads ({round(warm_count/len(df_leads)*100, 1)}%)</b>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 10px 14px; border-radius: 8px;">
                            <span><span class="badge-cold">❄️ COLD TIER</span> (Score < {warm_cut})</span>
                            <b>{cold_count} leads ({round(cold_count/len(df_leads)*100, 1)}%)</b>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)

                with col_scripts:
                    st.subheader("🗣️ Hinglish Script Templates")
                    st.caption("Available dynamic placeholders: `{name}`, `{corridor}`, `{source}`, `{date}`")

                    script_hot_input = st.text_area(
                        "🔥 Hot Tier Script Template",
                        value=client_cfg.get("script_hot", scripts.DEFAULT_SCRIPTS["Hot"]),
                        height=95
                    )
                    script_warm_input = st.text_area(
                        "☀️ Warm Tier Script Template",
                        value=client_cfg.get("script_warm", scripts.DEFAULT_SCRIPTS["Warm"]),
                        height=95
                    )
                    script_cold_input = st.text_area(
                        "❄️ Cold Tier Script Template",
                        value=client_cfg.get("script_cold", scripts.DEFAULT_SCRIPTS["Cold"]),
                        height=95
                    )

                st.markdown("<br/>", unsafe_allow_html=True)
                if st.button("⚡ Assign Scripts & Segment Batch", type="primary", use_container_width=True):
                    # Save templates & thresholds to DB
                    db.update_client_config(
                        client_id=st.session_state.active_client_id,
                        weight_recency=client_cfg.get("weight_recency", 40.0),
                        weight_source=client_cfg.get("weight_source", 30.0),
                        weight_fit=client_cfg.get("weight_fit", 30.0),
                        hot_threshold=float(hot_cut),
                        warm_threshold=float(warm_cut),
                        script_hot=script_hot_input,
                        script_warm=script_warm_input,
                        script_cold=script_cold_input
                    )

                    # Compute segmentation and script assignment
                    template_dict = {
                        "Hot": script_hot_input,
                        "Warm": script_warm_input,
                        "Cold": script_cold_input
                    }
                    segmented_df = scripts.segment_and_assign_scripts(
                        df=df_leads,
                        hot_threshold=float(hot_cut),
                        warm_threshold=float(warm_cut),
                        script_templates=template_dict,
                        corridor=client.get("corridor", "Central Mumbai")
                    )

                    # Persist to database
                    updates = []
                    for _, r in segmented_df.iterrows():
                        updates.append({
                            "id": r["id"],
                            "batch_id": st.session_state.active_batch_id,
                            "score": r["score"],
                            "tier": r["tier"],
                            "assigned_script": r["assigned_script"]
                        })
                    db.update_lead_scores(st.session_state.active_batch_id, updates)
                    st.success("Segmentation & Scripts successfully assigned! Proceeding to Step 5: Delivery Export.")
                    st.rerun()

                st.markdown("---")
                st.subheader("Live Script Assignment Preview")
                template_dict = {
                    "Hot": script_hot_input,
                    "Warm": script_warm_input,
                    "Cold": script_cold_input
                }
                preview_df = scripts.segment_and_assign_scripts(
                    df_leads,
                    hot_threshold=float(hot_cut),
                    warm_threshold=float(warm_cut),
                    script_templates=template_dict,
                    corridor=client.get("corridor", "Central Mumbai")
                )

                for _, sample_row in preview_df.head(4).iterrows():
                    tier_badge = f"<span class='badge-{'hot' if sample_row['tier']=='Hot' else 'warm' if sample_row['tier']=='Warm' else 'cold'}'>{sample_row['tier']} (Score: {sample_row['score']})</span>"
                    st.markdown(f"""
                    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <b>{sample_row['name']}</b> &nbsp;•&nbsp; <code>{sample_row['phone']}</code> &nbsp;•&nbsp; Source: {sample_row['source']}
                            {tier_badge}
                        </div>
                        <div class="script-box">"{sample_row['assigned_script']}"</div>
                    </div>
                    """, unsafe_allow_html=True)

# =======================================================================================
# PAGE 5: DELIVERY EXPORT & CALLING TRACKER
# =======================================================================================
elif nav_option == "📦 5. Delivery Export & Calling":
    render_context_banner()
    st.markdown("""
    <div class="brand-banner">
        <h1 class="brand-title"><span>📦</span> Delivery Export & In-App Calling</h1>
        <div class="brand-subtitle">
            Generate client-ready formatted Excel deliverable, or execute the Hot-Tier calling add-on directly in-app.
        </div>
    </div>
    """, unsafe_allow_html=True)

    if not st.session_state.active_batch_id or not st.session_state.active_client_id:
        st.warning("Please select a client and batch first.")
    else:
        batch = db.get_batch_by_id(st.session_state.active_batch_id)
        leads = db.get_leads_by_batch(st.session_state.active_batch_id, cleaned_only=True)

        if not leads:
            st.info("No clean leads found in this batch.")
        else:
            tab_export, tab_call_console = st.tabs(["📊 Client-Ready Excel Export", "📞 In-App Calling Console (Hot-Tier Add-on)"])

            with tab_export:
                st.subheader("Client Handover Package")
                st.caption("Exports a styled Excel workbook with lead tier badges, assigned Hinglish scripts, blank calling status column, and SOP guidelines.")

                col_e1, col_e2 = st.columns([1, 1.2])
                with col_e1:
                    st.markdown(f"""
                    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px;">
                        <b>Deliverable Details:</b><br/>
                        • <b>Client Firm:</b> {batch['client_name']}<br/>
                        • <b>Corridor:</b> {batch['corridor']}<br/>
                        • <b>Batch:</b> {batch['batch_name']}<br/>
                        • <b>Lead Volume:</b> {len(leads)} Scored Leads<br/>
                        • <b>Format:</b> Excel (.xlsx) with OpenPyXL visual styling
                    </div>
                    """, unsafe_allow_html=True)

                    st.markdown("<br/>", unsafe_allow_html=True)
                    excel_stream = export.generate_client_excel(leads, batch)
                    filename = f"YAGHAR_Reactivation_{batch['client_name'].replace(' ', '_')}_{batch['batch_name'].replace(' ', '_')}.xlsx"

                    st.download_button(
                        label="📥 Download Client-Ready Excel Sheet",
                        data=excel_stream,
                        file_name=filename,
                        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        type="primary",
                        use_container_width=True
                    )

                with col_e2:
                    st.caption("Live Preview of Calling Deliverable:")
                    df_preview = pd.DataFrame([{
                        "Name": l["name"],
                        "Phone": l["phone"],
                        "Score": l["score"],
                        "Tier": l["tier"],
                        "Call Status": l["call_status"],
                        "Assigned Script": l["assigned_script"][:55] + "..." if l["assigned_script"] else ""
                    } for l in leads])
                    st.dataframe(df_preview.head(5), use_container_width=True, hide_index=True)

            with tab_call_console:
                st.subheader("In-App Telecalling Console")
                st.caption("Log call outcomes live if providing the Hot-Tier calling service add-on directly to the client:")

                tier_filter = st.selectbox("Filter Tier", ["All", "Hot", "Warm", "Cold"], index=1)
                status_filter = st.selectbox("Filter Call Status", ["All", "Not Called", "Connected", "No Answer", "Converted", "Not Interested"], index=0)

                filtered_leads = leads
                if tier_filter != "All":
                    filtered_leads = [l for l in filtered_leads if l.get("tier") == tier_filter]
                if status_filter != "All":
                    filtered_leads = [l for l in filtered_leads if l.get("call_status") == status_filter]

                st.write(f"Showing **{len(filtered_leads)}** leads matching filters:")

                for lead in filtered_leads:
                    with st.expander(f"{lead['name']} ({lead['phone']}) — Tier: {lead.get('tier')} | Status: {lead['call_status']}", expanded=(lead['call_status'] == "Not Called")):
                        c_lead1, c_lead2 = st.columns([1.2, 1])

                        with c_lead1:
                            clean_digits = "".join(ch for ch in str(lead['phone']) if ch.isdigit())
                            if len(clean_digits) == 10:
                                wa_num = f"91{clean_digits}"
                            else:
                                wa_num = clean_digits

                            st.markdown(f"""
                            <b>Contact:</b> <code>{lead['phone']}</code> &nbsp;•&nbsp; <b>Source:</b> {lead['source']} &nbsp;•&nbsp; <b>Date:</b> {lead['enquiry_date']}<br/>
                            <b>Original Notes:</b> <i>{lead['raw_notes']}</i>
                            """, unsafe_allow_html=True)

                            st.markdown(f"<div class='script-box'><b>Pitch Script:</b><br/>{lead['assigned_script']}</div>", unsafe_allow_html=True)

                            # Quick Dial / WhatsApp links
                            st.markdown(f"""
                            <div style="margin-top: 6px;">
                                <a href="https://wa.me/{wa_num}?text={lead['assigned_script']}" target="_blank" style="background:#25D366; color:white; padding:4px 12px; border-radius:4px; text-decoration:none; font-weight:600; font-size:0.8rem; margin-right:8px;">
                                    💬 Open WhatsApp Web
                                </a>
                                <a href="tel:+91{clean_digits}" style="background:#0F172A; color:white; padding:4px 12px; border-radius:4px; text-decoration:none; font-weight:600; font-size:0.8rem;">
                                    📞 Call Number
                                </a>
                            </div>
                            """, unsafe_allow_html=True)

                        with c_lead2:
                            with st.form(f"call_form_{lead['id']}"):
                                status_opts = ["Not Called", "Connected", "No Answer", "Converted", "Not Interested"]
                                current_idx = status_opts.index(lead['call_status']) if lead['call_status'] in status_opts else 0
                                new_status = st.selectbox("Call Outcome", status_opts, index=current_idx)
                                new_notes = st.text_input("Call Notes / Next Visit Date", value=lead.get("call_notes") or "")

                                if st.form_submit_button("Update Outcome"):
                                    db.update_lead_call_outcome(lead['id'], new_status, new_notes)
                                    st.success("Call outcome logged!")
                                    st.rerun()

# =======================================================================================
# PAGE 6: NON-GST INVOICING
# =======================================================================================
elif nav_option == "🧾 6. Non-GST Invoicing":
    render_context_banner()
    st.markdown("""
    <div class="brand-banner">
        <h1 class="brand-title"><span>🧾</span> Non-GST Invoicing & Billing</h1>
        <div class="brand-subtitle">
            Generate compliant Non-GST Bill of Supply PDF invoices for brokerage clients and track payment status.
        </div>
    </div>
    """, unsafe_allow_html=True)

    if not st.session_state.active_batch_id or not st.session_state.active_client_id:
        st.warning("Please select a client and batch first.")
    else:
        batch = db.get_batch_by_id(st.session_state.active_batch_id)
        client = db.get_client_by_id(st.session_state.active_client_id)

        col_inv1, col_inv2 = st.columns([1, 1.2])

        with col_inv1:
            st.subheader("Invoice Parameters")

            # Check or generate invoice number
            current_inv_num = batch.get("invoice_number")
            if not current_inv_num:
                current_inv_num = f"INV-{datetime.now().year}-{batch['id']+1000}"

            inv_number_val = st.text_input("Invoice Number", value=current_inv_num)
            inv_date_val = st.date_input("Invoice Date", value=date.today())
            inv_fee_val = st.number_input("Flat Fee Amount (INR ₹)", min_value=0.0, value=float(batch["flat_fee_amount"]), step=1000.0)

            payment_status_val = st.radio("Payment Status", ["Unpaid", "Paid"], index=0 if batch["payment_status"] != "Paid" else 1, horizontal=True)

            if st.button("💾 Save Payment Status & Reference"):
                db.update_batch_payment_status(batch["id"], payment_status_val, inv_number_val)
                st.success("Invoice and payment status updated in batch record!")
                st.rerun()

        with col_inv2:
            st.subheader("PDF Bill of Supply Generator")
            st.caption("Generates an executive, branded PDF with statutory Non-GST exemption clause under CGST Act Section 22.")

            pdf_stream = invoicing.generate_pdf_invoice(
                batch_info=batch,
                client_info=client,
                invoice_number=inv_number_val,
                invoice_date=inv_date_val.strftime("%d %b %Y"),
                flat_fee=float(inv_fee_val),
                payment_status=payment_status_val
            )

            inv_filename = f"{inv_number_val}_{client['name'].replace(' ', '_')}.pdf"

            st.download_button(
                label=f"📄 Download PDF Invoice ({inv_number_val})",
                data=pdf_stream,
                file_name=inv_filename,
                mime="application/pdf",
                type="primary",
                use_container_width=True
            )

            st.markdown(f"""
            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin-top: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <b style="color: #0F172A; font-size: 1.1rem;">Invoice Preview</b>
                    <span class="{'badge-paid' if payment_status_val=='Paid' else 'badge-unpaid'}">{payment_status_val.upper()}</span>
                </div>
                <hr style="margin: 8px 0; border: none; border-top: 1px solid #E2E8F0;"/>
                <b>Billed To:</b> {client['name']}<br/>
                <b>Corridor:</b> {client['corridor']}<br/>
                <b>Batch Reference:</b> {batch['batch_name']}<br/>
                <b>Total Fee:</b> <span style="color: #D97706; font-weight: 700; font-size: 1.1rem;">₹ {inv_fee_val:,.2f}</span><br/>
                <span style="font-size: 0.8rem; color: #64748B;">Turnover exempt from GST under CGST Act Section 22</span>
            </div>
            """, unsafe_allow_html=True)
