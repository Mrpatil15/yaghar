import os
import sys
import io

# Ensure root directory is on python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import database as db
import cleaning
import scoring
import scripts
import export
import invoicing

def run_integration_pipeline():
    print("Step 1: Initializing Database...")
    db.init_db()

    print("Step 2: Creating Client...")
    client_id = db.create_client(
        name="Godrej Channel Desk",
        contact="+91 98200 88888",
        corridor="Central Mumbai (Chembur & Wadala)",
        date_onboarded="2026-09-01",
        referral_notes="Key account for Central Mumbai high-rise projects."
    )
    print(f"Created Client ID: {client_id}")

    print("Step 3: Creating Batch & Ingesting Leads...")
    csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sample_data", "sample_dead_leads.csv")
    df_raw = pd.read_csv(csv_path)

    batch_id = db.create_batch(
        client_id=client_id,
        batch_name="Godrej Central Mumbai Dead Leads",
        upload_date="2026-09-10",
        source_file="sample_dead_leads.csv",
        flat_fee_amount=25000.0
    )
    db.update_batch_delivery(batch_id, "2026-09-12") # 11 days ago -> follow-up due

    print("Step 4: Cleaning & Standardizing Leads...")
    cleaned_df, summary = cleaning.clean_and_standardize_leads(
        df=df_raw,
        col_name="Full Name",
        col_phone="Contact Number",
        col_date="Enquiry Date",
        col_source="Lead Source",
        col_notes="Customer Requirement & Notes"
    )
    print(f"Cleaning Summary: {summary}")
    assert summary["total_raw"] == 18
    assert summary["valid_count"] == 14
    assert summary["duplicates_count"] == 1
    assert summary["invalid_phone_count"] == 1
    assert summary["test_junk_count"] == 2
    assert summary["flagged_total"] == 4

    # Bulk insert
    leads_to_insert = []
    for _, r in cleaned_df.iterrows():
        leads_to_insert.append({
            "batch_id": batch_id,
            "name": r["name"],
            "phone": r["phone"],
            "raw_phone": r["raw_phone"],
            "source": r["source"],
            "enquiry_date": r["enquiry_date"],
            "raw_notes": r["raw_notes"],
            "cleaned_flag": r["cleaned_flag"],
            "flag_reason": r["flag_reason"]
        })
    inserted_count = db.insert_leads_bulk(leads_to_insert)
    print(f"Inserted {inserted_count} raw leads into DB.")

    print("Step 5: Scoring Valid Leads...")
    clean_leads = db.get_leads_by_batch(batch_id, cleaned_only=True)
    df_clean = pd.DataFrame(clean_leads)
    
    scored_df = scoring.compute_composite_scores(
        df_clean,
        weight_recency=40.0,
        weight_source=30.0,
        weight_fit=30.0,
        corridor="Central Mumbai (Chembur & Wadala)"
    )
    print(f"Mean Score: {scored_df['score'].mean():.1f}")

    print("Step 6: Segmenting & Assigning Hinglish Scripts...")
    cfg = db.get_client_config(client_id)
    segmented_df = scripts.segment_and_assign_scripts(
        scored_df,
        hot_threshold=70.0,
        warm_threshold=40.0,
        script_templates={"Hot": cfg["script_hot"], "Warm": cfg["script_warm"], "Cold": cfg["script_cold"]},
        corridor="Central Mumbai"
    )
    
    # Save updates to DB
    score_updates = []
    for _, r in segmented_df.iterrows():
        score_updates.append({
            "id": r["id"],
            "batch_id": batch_id,
            "score": r["score"],
            "tier": r["tier"],
            "assigned_script": r["assigned_script"]
        })
    db.update_lead_scores(batch_id, score_updates)
    print(f"Tier Breakdown: {segmented_df['tier'].value_counts().to_dict()}")

    print("Step 7: Generating Client Excel Sheet...")
    db_leads = db.get_leads_by_batch(batch_id, cleaned_only=True)
    batch_info = db.get_batch_by_id(batch_id)
    excel_stream = export.generate_client_excel(db_leads, batch_info)
    excel_bytes = excel_stream.getvalue()
    print(f"Excel Sheet generated: {len(excel_bytes)} bytes.")
    assert len(excel_bytes) > 2000

    print("Step 8: Simulating Client Feedback Re-import...")
    # Simulate client returning sheet with filled statuses
    returned_df = pd.DataFrame([
        {"Phone Number": db_leads[0]["phone"], "Call Status": "Converted", "Remarks": "Booked site visit for Saturday"},
        {"Phone Number": db_leads[1]["phone"], "Call Status": "Connected", "Remarks": "Follow up next Tuesday"},
        {"Phone Number": db_leads[2]["phone"], "Call Status": "Not Interested", "Remarks": "Bought in Thane already"},
    ])
    returned_stream = io.BytesIO()
    returned_df.to_excel(returned_stream, index=False)
    returned_stream.seek(0)

    reimport_res = export.reimport_client_status_sheet(batch_id, returned_stream)
    print(f"Re-import Result: {reimport_res}")
    assert reimport_res["success"] == True
    assert reimport_res["updated_count"] == 3

    print("Step 9: Generating Non-GST PDF Invoice...")
    client_info = db.get_client_by_id(client_id)
    pdf_stream = invoicing.generate_pdf_invoice(
        batch_info=batch_info,
        client_info=client_info,
        invoice_number="INV-2026-1002",
        invoice_date="23 Sep 2026",
        flat_fee=25000.0,
        payment_status="Paid"
    )
    pdf_bytes = pdf_stream.getvalue()
    print(f"PDF Invoice generated: {len(pdf_bytes)} bytes.")
    assert len(pdf_bytes) > 2000

    print("\nALL INTEGRATION CHECKS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_integration_pipeline()
