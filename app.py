"""
app.py - YAGHAR Real Estate OS
All-in-one platform for Indian real estate consultants & brokerage firms.
Powered by Supabase (PostgreSQL, Live Cloud Persistence, Auth & RLS).
"""

import os
import sys
from datetime import datetime, date, timedelta
from io import BytesIO, StringIO
import re

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# Local modules
import supabase_client as sc
import cleaning
import scoring
import scripts
import export
import invoicing

# ----------------- Page Configuration -----------------
st.set_page_config(
    page_title="YAGHAR | Real Estate OS",
    page_icon="🏢",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ----------------- Custom Styling -----------------
CUSTOM_CSS = """
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', sans-serif;
    }
    
    /* Main Background & Structure */
    .main {
        background-color: #F8FAFC;
    }
    
    /* Executive Metric Card */
    .metric-card {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .metric-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .metric-label {
        font-size: 0.82rem;
        font-weight: 600;
        color: #64748B;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .metric-value {
        font-size: 1.85rem;
        font-weight: 800;
        color: #0F172A;
        margin-top: 4px;
        line-height: 1.1;
    }
    .metric-delta {
        font-size: 0.78rem;
        font-weight: 600;
        margin-top: 6px;
    }
    .metric-delta.positive { color: #16A34A; }
    .metric-delta.warning { color: #D97706; }
    
    /* Banner Header */
    .brand-banner {
        background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
        border-radius: 14px;
        padding: 24px 30px;
        color: #FFFFFF;
        margin-bottom: 24px;
        border-left: 5px solid #F59E0B;
    }
    .brand-title {
        font-size: 1.7rem;
        font-weight: 800;
        letter-spacing: -0.5px;
        margin: 0;
        color: #FFFFFF;
    }
    .brand-subtitle {
        color: #94A3B8;
        font-size: 0.95rem;
        margin-top: 6px;
    }
    
    /* Tier Badges */
    .badge-hot {
        background-color: #FEE2E2;
        color: #DC2626;
        padding: 4px 10px;
        border-radius: 9999px;
        font-weight: 700;
        font-size: 0.75rem;
        border: 1px solid #FECACA;
        display: inline-block;
    }
    .badge-warm {
        background-color: #FEF3C7;
        color: #D97706;
        padding: 4px 10px;
        border-radius: 9999px;
        font-weight: 700;
        font-size: 0.75rem;
        border: 1px solid #FDE68A;
        display: inline-block;
    }
    .badge-cold {
        background-color: #F1F5F9;
        color: #475569;
        padding: 4px 10px;
        border-radius: 9999px;
        font-weight: 700;
        font-size: 0.75rem;
        border: 1px solid #CBD5E1;
        display: inline-block;
    }

    /* Stage Badges */
    .badge-stage {
        padding: 4px 10px;
        border-radius: 6px;
        font-weight: 700;
        font-size: 0.75rem;
        display: inline-block;
        text-transform: capitalize;
    }
    .stage-new { background-color: #E0E7FF; color: #4338CA; }
    .stage-contacted { background-color: #E0F2FE; color: #0369A1; }
    .stage-site_visit { background-color: #FEF3C7; color: #B45309; }
    .stage-converted { background-color: #DCFCE7; color: #15803D; }
    .stage-lost { background-color: #FEE2E2; color: #B91C1C; }

    /* Cloud Sync Pill */
    .cloud-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #064E3B;
        color: #6EE7B7;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.3px;
        border: 1px solid #059669;
    }

    /* Custom Sidebar styling */
    [data-testid="stSidebar"] {
        background-color: #0F172A;
    }
    [data-testid="stSidebar"] * {
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

# ----------------- Navigation Pages & Safe Router -----------------
NAV_PAGES = [
    "🏠 Dashboard",
    "📥 Upload Data",
    "👥 Leads & CRM Pipeline",
    "🏢 Property Inventory",
    "📅 Tasks & Follow-ups",
    "🎯 Lead Scoring & Settings",
    "📦 Export & Telecalling",
    "🧾 Invoicing & Billing"
]

def navigate_to(page_name: str):
    """Safely navigate to another page on the next rerun without widget state conflicts."""
    st.session_state.target_page = page_name
    st.rerun()

# Check for pending page navigation BEFORE the nav_radio widget is instantiated
if "target_page" in st.session_state and st.session_state.target_page:
    target = st.session_state.pop("target_page")
    if target in NAV_PAGES:
        st.session_state.nav_radio = target

if "nav_radio" not in st.session_state:
    st.session_state.nav_radio = "🏠 Dashboard"

# Workspace & User Initialization
is_supabase = sc.is_supabase_configured()
active_workspace_id = sc.get_active_workspace_id()

# ----------------- Sidebar Navigation -----------------
with st.sidebar:
    st.markdown("""
    <div style="padding: 10px 0 16px 0; text-align: center;">
        <span style="font-size: 2.2rem;">🏢</span>
        <h2 style="color: #F8FAFC; margin: 4px 0 0 0; font-size: 1.35rem; font-weight: 800; letter-spacing: -0.5px;">YAGHAR</h2>
        <div style="color: #F59E0B; font-size: 0.72rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
            Real Estate OS
        </div>
    </div>
    """, unsafe_allow_html=True)

    if is_supabase:
        ws_name = st.session_state.get("active_workspace_name", "Shree Ganesh Realty")
        st.markdown(f"""
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #059669; border-radius: 8px; padding: 8px 12px; margin-bottom: 16px; text-align: center;">
            <div style="color: #34D399; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">🟢 Supabase Cloud: Live</div>
            <div style="color: #FFFFFF; font-size: 0.85rem; font-weight: 600; margin-top: 2px;">{ws_name}</div>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown("""
        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid #D97706; border-radius: 8px; padding: 8px 12px; margin-bottom: 16px; text-align: center;">
            <div style="color: #FBBF24; font-size: 0.75rem; font-weight: 700;">🟡 Standalone Mode</div>
            <div style="color: #CBD5E1; font-size: 0.82rem; margin-top: 2px;">Set secrets to connect Supabase</div>
        </div>
        """, unsafe_allow_html=True)

    nav_option = st.radio(
        "Navigation",
        NAV_PAGES,
        key="nav_radio",
        label_visibility="collapsed"
    )

    st.markdown("---")
    st.caption("Central Mumbai Real Estate Advisory Platform")


# =======================================================================================
# PAGE 1: 🏠 DASHBOARD
# =======================================================================================
if nav_option == "🏠 Dashboard":
    st.markdown("""
    <div class="brand-banner">
        <h1 class="brand-title"><span>🏠</span> Executive Brokerage Dashboard</h1>
        <div class="brand-subtitle">
            Live metrics, pipeline conversion velocity, and upcoming client follow-ups powered by Supabase.
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Live Supabase queries
    leads = sc.fetch_supabase_leads()
    properties = sc.fetch_supabase_properties()
    follow_ups = sc.fetch_supabase_follow_ups()

    total_leads = len(leads)
    converted_leads = sum(1 for l in leads if str(l.get("stage")).lower() in ["converted", "site_visit", "booked"])
    conv_rate = round((converted_leads / total_leads * 100), 1) if total_leads > 0 else 0.0
    hot_leads = sum(1 for l in leads if str(l.get("tier")).lower() == "hot")
    pending_tasks = sum(1 for f in follow_ups if f.get("status") == "pending")

    # Top Metric KPI Cards
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Total Leads (Cloud)</div>
            <div class="metric-value">{total_leads:,}</div>
            <div class="metric-delta positive">Persistent in Supabase</div>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Conversion Rate</div>
            <div class="metric-value">{conv_rate}%</div>
            <div class="metric-delta positive">{converted_leads} active/converted</div>
        </div>
        """, unsafe_allow_html=True)

    with col3:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">🔥 Hot Priority Leads</div>
            <div class="metric-value">{hot_leads}</div>
            <div class="metric-delta warning">High intent buyers</div>
        </div>
        """, unsafe_allow_html=True)

    with col4:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">📅 Tasks & Follow-ups</div>
            <div class="metric-value">{pending_tasks}</div>
            <div class="metric-delta warning">Pending reminders</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<br/>", unsafe_allow_html=True)

    # Follow-up Alerts Banner
    today_str = date.today().isoformat()
    due_today_tasks = [f for f in follow_ups if f.get("status") == "pending" and str(f.get("due_date", "")).startswith(today_str)]
    if due_today_tasks:
        st.warning(f"🚨 **Action Required**: You have **{len(due_today_tasks)}** follow-up task(s) scheduled for today!")

    # Live Charts Section
    c_chart1, c_chart2 = st.columns([1.2, 1])
    with c_chart1:
        st.subheader("📊 Leads by Pipeline Stage")
        if leads:
            stage_counts = pd.Series([l.get("stage", "new") for l in leads]).value_counts().reset_index()
            stage_counts.columns = ["Stage", "Count"]
            fig_stage = px.bar(
                stage_counts,
                x="Stage",
                y="Count",
                color="Stage",
                color_discrete_map={
                    "new": "#818CF8",
                    "contacted": "#38BDF8",
                    "site_visit": "#F59E0B",
                    "converted": "#10B981",
                    "lost": "#EF4444"
                }
            )
            fig_stage.update_layout(height=280, margin=dict(l=20, r=20, t=20, b=20), showlegend=False)
            st.plotly_chart(fig_stage, use_container_width=True)
        else:
            st.info("No leads found yet. Upload leads to view stage analytics.")

    with c_chart2:
        st.subheader("🎯 Leads by Intent Tier")
        if leads:
            tier_counts = pd.Series([l.get("tier", "Warm") for l in leads]).value_counts().reset_index()
            tier_counts.columns = ["Tier", "Count"]
            fig_tier = px.pie(
                tier_counts,
                names="Tier",
                values="Count",
                color="Tier",
                color_discrete_map={"Hot": "#DC2626", "Warm": "#D97706", "Cold": "#64748B"},
                hole=0.5
            )
            fig_tier.update_layout(height=280, margin=dict(l=20, r=20, t=20, b=20))
            st.plotly_chart(fig_tier, use_container_width=True)
        else:
            st.info("No leads available for tier breakdown.")

    # Quick Action CTAs
    st.markdown("---")
    cta_col1, cta_col2, cta_col3 = st.columns(3)
    with cta_col1:
        if st.button("📥 Upload New Leads (CSV / Excel) →", use_container_width=True, type="primary"):
            navigate_to("📥 Upload Data")
    with cta_col2:
        if st.button("👥 Open Leads & CRM Pipeline →", use_container_width=True):
            navigate_to("👥 Leads & CRM Pipeline")
    with cta_col3:
        if st.button("🏢 View Property Inventory →", use_container_width=True):
            navigate_to("🏢 Property Inventory")


# =======================================================================================
# PAGE 2: 📥 UNIFIED DATA UPLOAD
# =======================================================================================
elif nav_option == "📥 Upload Data":
    st.markdown("""
    <div class="brand-banner">
        <h1 class="brand-title"><span>📥</span> Unified Data Upload Pipeline</h1>
        <div class="brand-subtitle">
            Upload CSV/Excel spreadsheets (like <b>data_heawen.xlsx</b>) or paste leads directly. Cleans, scores, and saves live to Supabase.
        </div>
    </div>
    """, unsafe_allow_html=True)

    col_u1, col_u2 = st.columns([1, 1.4])
    with col_u1:
        batch_name_input = st.text_input("Batch Reference Name *", value=f"Dead Leads Batch — {datetime.now().strftime('%b %Y')}")
        intake_method = st.radio("Choose Intake Method:", ["📁 Upload File (.xlsx / .csv)", "📋 Paste Leads Directly (Ctrl+V)"], horizontal=True)

        if intake_method == "📁 Upload File (.xlsx / .csv)":
            uploaded_file = st.file_uploader("Upload Lead List (.xlsx, .csv, .xls)", type=["csv", "xlsx", "xls"])
            pasted_text = None
        else:
            uploaded_file = None
            pasted_text = st.text_area(
                "Paste Lead Rows (from Excel / Google Sheets)",
                height=180,
                placeholder="Copy rows in Excel and paste here...\nExample:\nS N Pandey\t8840991735\tRunwal Forests\tLooking for 2bhk\nSanjay\t9224491174\tRunwal Greens\tBroker"
            )

    with col_u2:
        is_pasted = (intake_method != "📁 Upload File (.xlsx / .csv)")
        has_source = (pasted_text is not None and len(pasted_text.strip()) > 0) if is_pasted else (uploaded_file is not None)

        if has_source:
            source_obj = pasted_text if is_pasted else uploaded_file
            source_label = "Pasted Leads Data" if is_pasted else uploaded_file.name

            df_initial, auto_mapping, detected_no_header, load_msg = cleaning.load_and_classify_leads(source_obj, is_pasted=is_pasted)

            if df_initial is None:
                st.error(f"Error parsing data: {load_msg}")
            else:
                c_hdr1, c_hdr2 = st.columns([1.2, 1])
                with c_hdr1:
                    force_no_header = st.checkbox(
                        "First row contains lead data (no header in file)",
                        value=detected_no_header,
                        help="Check this if the very first row is lead data and not column headers (e.g. data_heawen.xlsx).",
                        key="intake_force_no_hdr"
                    )
                with c_hdr2:
                    if force_no_header:
                        st.info("ℹ️ Preserving Row 1 as lead data")

                if force_no_header != detected_no_header:
                    df_raw, mapping, _, _ = cleaning.load_and_classify_leads(source_obj, is_pasted=is_pasted, force_no_header=force_no_header)
                else:
                    df_raw, mapping = df_initial, auto_mapping

                st.success(f"Loaded **{len(df_raw)}** rows from `{source_label}`")
                st.dataframe(df_raw.head(3), use_container_width=True)

                st.markdown("#### 🔗 Column Mapping (Auto-Detected)")
                cols = [str(c) for c in df_raw.columns]
                cols_with_none = ["-- Select --"] + cols

                m_c1, m_c2 = st.columns(2)
                with m_c1:
                    col_name = st.selectbox("1. Lead Full Name *", cols, index=cols.index(mapping.get("name")) if mapping.get("name") in cols else 0)
                    col_phone = st.selectbox("2. Phone Number *", cols, index=cols.index(mapping.get("phone")) if mapping.get("phone") in cols else 0)
                    col_date = st.selectbox("3. Enquiry Date", cols_with_none, index=cols_with_none.index(mapping.get("date")) if mapping.get("date") in cols_with_none else 0)

                with m_c2:
                    col_source = st.selectbox("4. Lead Source", cols_with_none, index=cols_with_none.index(mapping.get("source")) if mapping.get("source") in cols_with_none else 0)
                    col_notes = st.selectbox("5. Notes / Requirements", cols_with_none, index=cols_with_none.index(mapping.get("notes")) if mapping.get("notes") in cols_with_none else 0)

                st.markdown("""
                <div style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); border: 1.5px solid #F59E0B; border-radius: 10px; padding: 16px 20px; margin: 16px 0 10px 0;">
                    <div style="color: #F59E0B; font-weight: 800; font-size: 0.8rem; text-transform: uppercase;">⭐ Recommended Instant Ingestion</div>
                    <div style="color: #FFFFFF; font-size: 1.15rem; font-weight: 700; margin: 4px 0;">⚡ 1-Click Auto-Pilot: Clean, Score & Write Directly to Supabase</div>
                    <div style="color: #CBD5E1; font-size: 0.88rem;">Normalizes phone numbers (+91), dedupes, calculates multi-factor lead scores, and saves to the live Supabase cloud database immediately.</div>
                </div>
                """, unsafe_allow_html=True)

                if st.button("🚀 Process & Ingest Directly into Supabase Leads Table →", type="primary", use_container_width=True):
                    with st.spinner("Processing leads, cleaning phone numbers, and scoring..."):
                        # 1. Clean & Deduplicate
                        cleaned_df, summary = cleaning.clean_and_standardize_leads(
                            df=df_raw,
                            col_name=col_name,
                            col_phone=col_phone,
                            col_date=col_date if col_date != "-- Select --" else "",
                            col_source=col_source if col_source != "-- Select --" else "",
                            col_notes=col_notes if col_notes != "-- Select --" else ""
                        )

                        # 2. Compute composite scores
                        scored_df = scoring.compute_composite_scores(
                            cleaned_df,
                            weight_recency=40.0,
                            weight_source=30.0,
                            weight_fit=30.0
                        )

                        # 3. Assign scripts & tiers
                        segmented_df = scripts.segment_and_assign_scripts(
                            scored_df,
                            hot_threshold=70.0,
                            warm_threshold=40.0
                        )

                        # 4. Prepare leads for Supabase insertion
                        supabase_records = []
                        for _, r in segmented_df.iterrows():
                            supabase_records.append({
                                "name": r["name"],
                                "phone": r["phone"],
                                "raw_phone": r["raw_phone"],
                                "source": r["source"],
                                "stage": "new",
                                "score": float(r["score"]),
                                "tier": r["tier"],
                                "call_status": "Not Called",
                                "notes": r["raw_notes"],
                                "assigned_script": r["assigned_script"],
                                "is_dead": (r["cleaned_flag"] == 0)
                            })

                        # 5. Insert directly to Supabase
                        inserted = sc.insert_supabase_leads(supabase_records)
                        st.success(f"🎉 Successfully ingested **{inserted}** leads directly into Supabase! (Duplicates filtered: {summary['duplicates_count']})")
                        navigate_to("👥 Leads & CRM Pipeline")
        else:
            st.info("Select a spreadsheet file or paste lead rows to begin.")


# =======================================================================================
# PAGE 3: 👥 LEADS & CRM PIPELINE
# =======================================================================================
elif nav_option == "👥 Leads & CRM Pipeline":
    st.markdown("""
    <div class="brand-banner">
        <h1 class="brand-title"><span>👥</span> Leads & CRM Pipeline</h1>
        <div class="brand-subtitle">
            Live database records from Supabase. Search, filter, execute 1-tap call status updates, and trigger WhatsApp outreach.
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Live Supabase leads
    leads = sc.fetch_supabase_leads()

    if not leads:
        st.info("No leads found in Supabase yet. Go to **📥 Upload Data** to import your first batch!")
        if st.button("Go to Upload Data →", type="primary"):
            navigate_to("📥 Upload Data")
    else:
        # Search & Filters
        f_c1, f_c2, f_c3, f_c4 = st.columns([1.5, 1, 1, 1])
        with f_c1:
            search_query = st.text_input("🔍 Search Name or Phone", placeholder="Type name or phone...")
        with f_c2:
            tier_filter = st.selectbox("Filter Tier", ["All", "Hot", "Warm", "Cold"])
        with f_c3:
            stage_filter = st.selectbox("Filter Stage", ["All", "new", "contacted", "site_visit", "converted", "lost"])
        with f_c4:
            sources = sorted(list(set(str(l.get("source", "Direct")) for l in leads)))
            source_filter = st.selectbox("Filter Source", ["All"] + sources)

        # Apply Filters
        filtered_leads = leads
        if search_query:
            sq = search_query.lower()
            filtered_leads = [l for l in filtered_leads if sq in str(l.get("name", "")).lower() or sq in str(l.get("phone", ""))]
        if tier_filter != "All":
            filtered_leads = [l for l in filtered_leads if str(l.get("tier", "")).lower() == tier_filter.lower()]
        if stage_filter != "All":
            filtered_leads = [l for l in filtered_leads if str(l.get("stage", "")).lower() == stage_filter.lower()]
        if source_filter != "All":
            filtered_leads = [l for l in filtered_leads if str(l.get("source", "")) == source_filter]

        st.caption(f"Showing **{len(filtered_leads)}** of **{len(leads)}** leads from Supabase")

        # Table & Card display
        for lead in filtered_leads[:50]:  # Paginate top 50 for speed
            lid = lead["id"]
            name = lead.get("name", "Unknown")
            phone = lead.get("phone", "—")
            score = lead.get("score", 50.0)
            tier = lead.get("tier", "Warm")
            stage = lead.get("stage", "new")
            call_status = lead.get("call_status", "Not Called")
            source = lead.get("source", "—")
            notes = lead.get("notes") or lead.get("raw_notes") or "No notes"

            tier_badge = f'<span class="badge-hot">🔥 Hot ({score:.1f})</span>' if tier == "Hot" else (f'<span class="badge-warm">⚡ Warm ({score:.1f})</span>' if tier == "Warm" else f'<span class="badge-cold">❄️ Cold ({score:.1f})</span>')
            stage_badge = f'<span class="badge-stage stage-{stage}">{stage.replace("_", " ")}</span>'

            with st.container():
                st.markdown(f"""
                <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px 18px; margin-bottom: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="font-size: 1.1rem; font-weight: 700; color: #0F172A;">{name}</span>
                            <span style="margin-left: 10px; color: #64748B; font-size: 0.9rem; font-family: monospace;">📞 {phone}</span>
                            <span style="margin-left: 10px;">{tier_badge}</span>
                            <span style="margin-left: 6px;">{stage_badge}</span>
                        </div>
                        <div style="font-size: 0.8rem; color: #64748B;">
                            Source: <b>{source}</b> | Call Status: <b>{call_status}</b>
                        </div>
                    </div>
                    <div style="color: #475569; font-size: 0.88rem; margin: 8px 0;">
                        📝 <i>{notes}</i>
                    </div>
                </div>
                """, unsafe_allow_html=True)

                # 1-Tap Action Buttons
                b_c1, b_c2, b_c3, b_c4, b_c5, b_c6 = st.columns([1, 1, 1, 1, 1, 1.2])
                with b_c1:
                    if st.button("📅 Site Visit", key=f"sv_{lid}"):
                        sc.update_supabase_lead_status(lid, "site_visit", "Site Visit Booked")
                        st.toast(f"Marked {name} for Site Visit!")
                        st.rerun()
                with b_c2:
                    if st.button("📞 Contacted", key=f"cnt_{lid}"):
                        sc.update_supabase_lead_status(lid, "contacted", "Connected")
                        st.toast(f"Updated {name} to Contacted!")
                        st.rerun()
                with b_c3:
                    if st.button("🎉 Converted", key=f"cnv_{lid}"):
                        sc.update_supabase_lead_status(lid, "converted", "Converted")
                        st.toast(f"Congratulations! {name} converted!")
                        st.rerun()
                with b_c4:
                    if st.button("❌ Lost", key=f"lost_{lid}"):
                        sc.update_supabase_lead_status(lid, "lost", "Not Interested")
                        st.toast(f"Marked {name} as Lost.")
                        st.rerun()
                with b_c5:
                    clean_phone = re.sub(r'\D', '', str(phone))
                    wa_url = f"https://wa.me/91{clean_phone[-10:]}?text=Namaste%20{name}%2C%20following%20up%20regarding%20your%20property%20enquiry."
                    st.link_button("💬 WhatsApp", wa_url)
                with b_c6:
                    with st.popover("➕ Add Task"):
                        t_date = st.date_input("Due Date", min_value=date.today(), key=f"t_d_{lid}")
                        t_note = st.text_input("Task Note", value="Follow-up call on site visit", key=f"t_n_{lid}")
                        if st.button("Save Task", key=f"save_t_{lid}"):
                            sc.insert_supabase_follow_up(lid, t_date.isoformat(), t_note)
                            st.success("Task scheduled in Supabase!")
                            st.rerun()


# =======================================================================================
# PAGE 4: 🏢 PROPERTY INVENTORY
# =======================================================================================
elif nav_option == "🏢 Property Inventory":
    st.markdown("""
    <div class="brand-banner">
        <h1 class="brand-title"><span>🏢</span> Property Listings & Inventory</h1>
        <div class="brand-subtitle">
            Manage your real estate listings, pricing, and matching buyer requirements stored live in Supabase.
        </div>
    </div>
    """, unsafe_allow_html=True)

    tab_p1, tab_p2 = st.tabs(["📋 View Inventory", "➕ Add New Listing"])

    with tab_p1:
        properties = sc.fetch_supabase_properties()
        if not properties:
            st.info("No properties found in your inventory yet.")
        else:
            for p in properties:
                pid = p.get("id")
                title = p.get("title", "Property Listing")
                locality = p.get("locality", "Mumbai")
                bhk = p.get("bhk", "2 BHK")
                carpet = p.get("carpet_area", "—")
                price = p.get("price", 0)
                status = p.get("status", "available")
                desc = p.get("description", "No description provided.")

                price_formatted = f"₹{price/10000000:.2f} Cr" if price >= 10000000 else f"₹{price/100000:.1f} Lakhs"

                st.markdown(f"""
                <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px; margin-bottom: 14px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 1.2rem; font-weight: 800; color: #0F172A;">{title}</span>
                        <span style="font-size: 1.25rem; font-weight: 800; color: #16A34A;">{price_formatted}</span>
                    </div>
                    <div style="color: #64748B; font-size: 0.9rem; margin-top: 4px;">
                        📍 <b>{locality}</b> | 📐 <b>{bhk}</b> ({carpet} sq.ft.) | Status: <b style="text-transform: capitalize;">{status}</b>
                    </div>
                    <div style="color: #475569; font-size: 0.88rem; margin-top: 8px;">
                        {desc}
                    </div>
                </div>
                """, unsafe_allow_html=True)

    with tab_p2:
        st.subheader("Add New Property to Supabase")
        with st.form("new_property_form"):
            p_title = st.text_input("Property Title *", placeholder="e.g. Runwal Forests — Premium 2 BHK")
            p_c1, p_c2, p_c3 = st.columns(3)
            with p_c1:
                p_bhk = st.selectbox("Configuration", ["1 BHK", "1.5 BHK", "2 BHK", "2.5 BHK", "3 BHK", "4+ BHK", "Penthouse"])
                p_type = st.selectbox("Property Type", ["apartment", "villa", "plot", "commercial"])
            with p_c2:
                p_locality = st.text_input("Locality / Micro-market *", value="Kanjurmarg West")
                p_carpet = st.number_input("Carpet Area (sq ft)", value=750, step=50)
            with p_c3:
                p_price = st.number_input("Quoted Price (INR ₹)", value=17500000, step=500000)
                p_status = st.selectbox("Status", ["available", "under_offer", "sold", "rented"])

            p_desc = st.text_area("Listing Notes & Amenities", placeholder="Higher floor, unobstructed hill view, ready possession...")
            submit_btn = st.form_submit_button("💾 Save Property Listing to Supabase", type="primary")

            if submit_btn and p_title:
                prop_payload = {
                    "title": p_title,
                    "bhk": p_bhk,
                    "property_type": p_type,
                    "locality": p_locality,
                    "city": "Mumbai",
                    "carpet_area": p_carpet,
                    "price": p_price,
                    "status": p_status,
                    "description": p_desc
                }
                res = sc.insert_supabase_property(prop_payload)
                if res:
                    st.success(f"Property '{p_title}' added to Supabase!")
                    st.rerun()


# =======================================================================================
# PAGE 5: 📅 TASKS & FOLLOW-UPS
# =======================================================================================
elif nav_option == "📅 Tasks & Follow-ups":
    st.markdown("""
    <div class="brand-banner">
        <h1 class="brand-title"><span>📅</span> Tasks & Client Follow-up Tracker</h1>
        <div class="brand-subtitle">
            Never lose track of a prospective buyer. Scheduled follow-ups and due date alerts linked to leads.
        </div>
    </div>
    """, unsafe_allow_html=True)

    follow_ups = sc.fetch_supabase_follow_ups()

    pending_f = [f for f in follow_ups if f.get("status") == "pending"]
    completed_f = [f for f in follow_ups if f.get("status") == "completed"]

    st.subheader(f"Pending Follow-ups ({len(pending_f)})")
    if not pending_f:
        st.info("No pending follow-ups right now. You are all caught up!")
    else:
        today_str = date.today().isoformat()
        for t in pending_f:
            tid = t.get("id")
            due_date = str(t.get("due_date", ""))[:10]
            notes = t.get("notes", "Follow-up")
            lead_info = t.get("leads") or {}
            lead_name = lead_info.get("name", "Client")
            lead_phone = lead_info.get("phone", "")

            is_overdue = due_date < today_str
            is_today = due_date == today_str
            date_badge = f'<span style="color: #DC2626; font-weight: 800;">🚨 OVERDUE ({due_date})</span>' if is_overdue else (f'<span style="color: #D97706; font-weight: 800;">📅 DUE TODAY</span>' if is_today else f'<span style="color: #64748B;">{due_date}</span>')

            t_col1, t_col2 = st.columns([4, 1])
            with t_col1:
                st.markdown(f"""
                <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px;">
                    <div>{date_badge} — <b>{lead_name}</b> (📞 {lead_phone})</div>
                    <div style="color: #475569; font-size: 0.88rem; margin-top: 4px;">📌 {notes}</div>
                </div>
                """, unsafe_allow_html=True)
            with t_col2:
                if st.button("✅ Complete", key=f"comp_{tid}"):
                    sc.complete_supabase_follow_up(tid)
                    st.toast("Task completed!")
                    st.rerun()

    if completed_f:
        with st.expander(f"Completed Tasks ({len(completed_f)})"):
            for cf in completed_f:
                st.caption(f"✓ {cf.get('notes')} (Completed)")


# =======================================================================================
# PAGE 6: 🎯 LEAD SCORING & SETTINGS
# =======================================================================================
elif nav_option == "🎯 Lead Scoring & Settings":
    st.markdown("""
    <div class="brand-banner">
        <h1 class="brand-title"><span>🎯</span> Lead Scoring Engine & Settings</h1>
        <div class="brand-subtitle">
            Configure dynamic weighting for buyer recency, source quality, and budget/location fit. Recalculate all Supabase leads live.
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.subheader("1. Multi-Factor Scoring Weights")
    st.caption("Adjust relative importance of each signal (must total 100%):")

    sc_col1, sc_col2, sc_col3 = st.columns(3)
    with sc_col1:
        w_rec = st.slider("Enquiry Recency Weight (%)", 0, 100, 40, 5)
    with sc_col2:
        w_src = st.slider("Lead Source Quality Weight (%)", 0, 100, 30, 5)
    with sc_col3:
        w_fit = st.slider("Corridor / Budget Fit Weight (%)", 0, 100, 30, 5)

    total_w = w_rec + w_src + w_fit
    if total_w != 100:
        st.warning(f"⚠️ Total weight is currently {total_w}%. Normalizing to 100% on calculation.")

    st.subheader("2. Segmentation Thresholds")
    th_col1, th_col2 = st.columns(2)
    with th_col1:
        hot_th = st.slider("🔥 Hot Tier Minimum Score", 50, 95, 70, 5)
    with th_col2:
        warm_th = st.slider("⚡ Warm Tier Minimum Score", 20, 65, 40, 5)

    st.markdown("---")
    st.subheader("3. Live Supabase Lead Recalculation")
    st.caption("Apply these scoring weights across all live leads in Supabase and update tiers instantly:")

    if st.button("⚡ Recalculate All Leads Live in Supabase", type="primary", use_container_width=True):
        with st.spinner("Recalculating scores and updating Supabase..."):
            leads = sc.fetch_supabase_leads()
            updated_count = 0
            for l in leads:
                lid = l["id"]
                rec_score, _ = scoring.calculate_recency_score(str(l.get("created_at") or l.get("enquiry_date") or ""))
                src_score = scoring.calculate_source_score(str(l.get("source") or ""))
                fit_score = scoring.calculate_fit_score(str(l.get("notes") or ""))

                comp_score = (w_rec / 100.0) * rec_score + (w_src / 100.0) * src_score + (w_fit / 100.0) * fit_score
                new_tier = "Hot" if comp_score >= hot_th else ("Warm" if comp_score >= warm_th else "Cold")

                tags = [t for t in (l.get("tags") or []) if not str(t).startswith("score:") and not str(t).startswith("tier:")]
                tags.extend([f"score:{comp_score:.1f}", f"tier:{new_tier}"])

                client = sc.get_supabase_client()
                if client:
                    try:
                        client.table("leads").update({
                            "tags": tags,
                            "score": round(comp_score, 1),
                            "tier": new_tier
                        }).eq("id", lid).execute()
                    except Exception:
                        client.table("leads").update({"tags": tags}).eq("id", lid).execute()
                updated_count += 1

            st.success(f"Successfully recalculated {updated_count} leads in Supabase!")
            st.rerun()


# =======================================================================================
# PAGE 7: 📦 EXPORT & TELECALLING
# =======================================================================================
elif nav_option == "📦 Export & Telecalling":
    st.markdown("""
    <div class="brand-banner">
        <h1 class="brand-title"><span>📦</span> Client Delivery Export & Telecalling</h1>
        <div class="brand-subtitle">
            Generate client-ready spreadsheets formatted with color-coded tiers and pitch scripts, or run fast in-app telecalling.
        </div>
    </div>
    """, unsafe_allow_html=True)

    leads = sc.fetch_supabase_leads()
    if not leads:
        st.info("No leads available to export. Import leads in **📥 Upload Data**.")
    else:
        st.subheader("1. Download Delivery Excel")
        st.caption("Generates a styled OpenPyXL workbook with formatted tiers, wrapped scripts, and blank outcome columns for callers.")

        batch_meta = {
            "client_name": st.session_state.get("active_workspace_name", "Shree Ganesh Realty"),
            "batch_name": "Active Reactivation Run",
            "corridor": "Central Mumbai"
        }
        excel_bytes = export.generate_client_excel(leads, batch_meta)

        st.download_button(
            "📥 Download Client-Ready Excel Sheet (.xlsx)",
            data=excel_bytes.getvalue(),
            file_name=f"Yaghar_Reactivation_Leads_{datetime.now().strftime('%Y%m%d')}.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            type="primary"
        )


# =======================================================================================
# PAGE 8: 🧾 INVOICING & BILLING
# =======================================================================================
elif nav_option == "🧾 Invoicing & Billing":
    st.markdown("""
    <div class="brand-banner">
        <h1 class="brand-title"><span>🧾</span> Non-GST Invoicing & Billing</h1>
        <div class="brand-subtitle">
            Generate statutory Non-GST Bills of Supply citing Section 22 CGST Act exemption, with auto-incrementing invoice numbers.
        </div>
    </div>
    """, unsafe_allow_html=True)

    inv_col1, inv_col2 = st.columns([1, 1.2])
    with inv_col1:
        client_name = st.text_input("Client Firm Name *", value=st.session_state.get("active_workspace_name", "Shree Ganesh Realty"))
        client_contact = st.text_input("Client Phone / Email *", value="+91 98201 23456")
        inv_number = st.text_input("Invoice Number", value=f"INV-{datetime.now().strftime('%Y')}-1001")
        inv_date = st.date_input("Invoice Date", value=date.today())
        fee_amount = st.number_input("Flat Service Fee (INR ₹)", value=15000.0, step=2500.0)
        pay_status = st.selectbox("Payment Status", ["Unpaid", "Paid"])

    with inv_col2:
        st.subheader("PDF Bill of Supply Preview")
        batch_info = {"batch_name": "Dead-Lead Reactivation Service Run"}
        client_info = {"name": client_name, "contact": client_contact, "corridor": "Central Mumbai"}

        pdf_bytes = invoicing.generate_pdf_invoice(
            batch_info=batch_info,
            client_info=client_info,
            invoice_number=inv_number,
            invoice_date=inv_date.strftime("%d %b %Y"),
            flat_fee=fee_amount,
            payment_status=pay_status
        )

        st.download_button(
            label="📄 Download Official PDF Bill of Supply",
            data=pdf_bytes.getvalue(),
            file_name=f"Invoice_{inv_number}.pdf",
            mime="application/pdf",
            type="primary",
            use_container_width=True
        )
        st.success("Statutory non-GST declaration under Section 22 of the CGST Act automatically included.")
