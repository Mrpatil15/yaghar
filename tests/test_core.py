"""
tests/test_core.py - Verification suite for core modules
"""

import os
import unittest
import pandas as pd
from database import (
    init_db, create_client, get_all_clients, create_batch, get_batch_by_id,
    insert_leads_bulk, get_leads_by_batch, get_client_config, update_client_config,
    get_next_invoice_number, update_batch_payment_status, DB_PATH
)
from cleaning import normalize_phone, is_test_lead, clean_and_standardize_leads
from scoring import calculate_recency_score, calculate_source_score, calculate_fit_score, compute_composite_scores
from scripts import fill_script_template, segment_and_assign_scripts, DEFAULT_SCRIPTS
from export import generate_client_excel
from invoicing import generate_pdf_invoice

class TestDeadLeadReactivation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()

    def test_phone_normalization(self):
        # Standard 10-digit
        p, valid, reason = normalize_phone("9820012345")
        self.assertTrue(valid)
        self.assertEqual(p, "9820012345")

        # +91 prefix with spaces
        p, valid, reason = normalize_phone("+91 98200 12345")
        self.assertTrue(valid)
        self.assertEqual(p, "9820012345")

        # 0 prefix
        p, valid, reason = normalize_phone("09820012345")
        self.assertTrue(valid)
        self.assertEqual(p, "9820012345")

        # Hyphens
        p, valid, reason = normalize_phone("98200-12345")
        self.assertTrue(valid)
        self.assertEqual(p, "9820012345")

        # Invalid length
        p, valid, reason = normalize_phone("12345")
        self.assertFalse(valid)

        # Invalid starting digit
        p, valid, reason = normalize_phone("1820012345")
        self.assertFalse(valid)

        # Dummy number
        p, valid, reason = normalize_phone("9999999999")
        self.assertFalse(valid)
        self.assertIn("Dummy", reason)

    def test_junk_detection(self):
        is_junk, reason = is_test_lead("Test Lead", "Some notes")
        self.assertTrue(is_junk)

        is_junk, reason = is_test_lead("Vikram Malhotra", "Looking for 2BHK")
        self.assertFalse(is_junk)

    def test_cleaning_and_deduplication(self):
        df_raw = pd.DataFrame([
            {"Name": "Vikram", "Phone": "+91 98200 12345", "Date": "2026-08-01", "Source": "99acres", "Notes": "2BHK"},
            {"Name": "Vikram Dup", "Phone": "9820012345", "Date": "2026-08-02", "Source": "MagicBricks", "Notes": "Dup"},
            {"Name": "Test Lead", "Phone": "9820099999", "Date": "2026-08-03", "Source": "Ads", "Notes": "Test"},
            {"Name": "No Phone", "Phone": "", "Date": "2026-08-04", "Source": "Direct", "Notes": "Blank phone"},
        ])
        cleaned_df, summary = clean_and_standardize_leads(df_raw, "Name", "Phone", "Date", "Source", "Notes")
        self.assertEqual(summary["total_raw"], 4)
        self.assertEqual(summary["valid_count"], 1)
        self.assertEqual(summary["duplicates_count"], 1)
        self.assertEqual(summary["invalid_phone_count"], 1)
        self.assertEqual(summary["test_junk_count"], 1)

    def test_scoring_engine(self):
        # Recency score
        score_rec, _ = calculate_recency_score("2026-08-15")
        self.assertGreaterEqual(score_rec, 40.0)

        # Source score
        self.assertEqual(calculate_source_score("99acres"), 85.0)
        self.assertEqual(calculate_source_score("Referral"), 100.0)

        # Fit score
        fit_score = calculate_fit_score("Looking for 2 BHK ready to move in Chembur", corridor="Central Mumbai")
        self.assertGreaterEqual(fit_score, 70.0)

    def test_script_interpolation(self):
        script = fill_script_template(DEFAULT_SCRIPTS["Hot"], "Rahul Sharma", "Chembur", "99acres", "2026-08-01")
        self.assertIn("Rahul", script)
        self.assertIn("Chembur", script)

    def test_excel_export(self):
        leads = [
            {"name": "Rahul", "phone": "9820012345", "score": 85.0, "tier": "Hot", "assigned_script": "Namaste Rahul", "call_status": "Not Called", "call_notes": "", "source": "99acres", "enquiry_date": "2026-08-01"}
        ]
        batch_info = {"client_name": "Test Realty", "batch_name": "Batch 1", "corridor": "Chembur"}
        excel_bytes = generate_client_excel(leads, batch_info)
        self.assertGreater(excel_bytes.getbuffer().nbytes, 1000)

    def test_pdf_invoice_generation(self):
        batch_info = {"batch_name": "Batch Chembur 01"}
        client_info = {"name": "Ace Realty", "contact": "9820011111", "corridor": "Central Mumbai"}
        pdf_bytes = generate_pdf_invoice(batch_info, client_info, "INV-2026-1001", "23 Sep 2026", 15000.0, "Unpaid")
        self.assertGreater(pdf_bytes.getbuffer().nbytes, 1000)

    def test_database_crud(self):
        client_id = create_client("Apex Realtors", "apex@realty.com", "Thane West", "2026-09-01", "Referred by Kunal")
        self.assertIsInstance(client_id, int)

        batch_id = create_batch(client_id, "Apex August Batch", "2026-09-23", "leads.csv", 20000.0)
        batch = get_batch_by_id(batch_id)
        self.assertEqual(batch["client_name"], "Apex Realtors")

        inv_num = get_next_invoice_number(client_id)
        self.assertTrue(inv_num.startswith("INV-"))

        update_batch_payment_status(batch_id, "Paid", inv_num)
        batch_updated = get_batch_by_id(batch_id)
        self.assertEqual(batch_updated["payment_status"], "Paid")

if __name__ == "__main__":
    unittest.main()
