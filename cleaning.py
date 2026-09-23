"""
cleaning.py - Data cleaning, phone normalization, deduplication, and junk detection.
"""

import re
import pandas as pd
from typing import Tuple, Dict, Any, List

# Common test names or dummy patterns
JUNK_NAME_PATTERNS = [
    r"^test\b", r"\btest\b", r"\btesting\b", r"^dummy\b", r"^fake\b",
    r"^demo\b", r"^asdf\b", r"^qwerty\b", r"^sample\b", r"^abc\b",
    r"^xyz\b", r"^none\b", r"^n/a\b", r"^na\b", r"^null\b", r"^unknown\b"
]

# Obvious dummy phone patterns
DUMMY_PHONES = {
    "9999999999", "8888888888", "7777777777", "6666666666", "0000000000",
    "1234567890", "9876543210", "0123456789", "1111111111", "2222222222"
}

def normalize_phone(phone_val: Any) -> Tuple[str, bool, str]:
    """
    Normalizes a phone number to standard 10-digit Indian format.
    Returns (cleaned_phone, is_valid, reason)
    """
    if pd.isna(phone_val) or phone_val is None:
        return "", False, "Missing phone number"

    # Convert to string and strip decimals if read as float (e.g. 9820012345.0)
    raw_str = str(phone_val).strip()
    if raw_str.endswith(".0"):
        raw_str = raw_str[:-2]

    # Extract all digits
    digits = re.sub(r"\D", "", raw_str)

    if not digits:
        return "", False, "Missing phone number"

    # Handle common prefixes:
    # 0 prefix (e.g. 09820012345 -> 11 digits)
    if len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    # 91 prefix (e.g. 919820012345 -> 12 digits)
    elif len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    # 0091 prefix (e.g. 00919820012345 -> 14 digits)
    elif len(digits) == 14 and digits.startswith("0091"):
        digits = digits[4:]

    # Validate 10-digit mobile number
    if len(digits) != 10:
        return digits, False, f"Invalid length ({len(digits)} digits, expected 10)"

    if digits[0] not in ("6", "7", "8", "9"):
        return digits, False, f"Invalid mobile starting digit ('{digits[0]}', expected 6, 7, 8, or 9)"

    if digits in DUMMY_PHONES:
        return digits, False, "Dummy/Fake phone number sequence"

    return digits, True, ""

def is_test_lead(name_val: Any, notes_val: Any = "") -> Tuple[bool, str]:
    """Checks whether the lead name or notes suggest a test/junk entry."""
    name_str = str(name_val).strip().lower() if pd.notna(name_val) else ""
    notes_str = str(notes_val).strip().lower() if pd.notna(notes_val) else ""

    if not name_str or len(name_str) <= 1:
        return True, "Missing or single-letter name"

    if re.fullmatch(r"[\d\W]+", name_str):
        return True, "Name contains only digits or symbols"

    for pattern in JUNK_NAME_PATTERNS:
        if re.search(pattern, name_str):
            return True, f"Name matches test pattern ('{name_str}')"

    if "test lead" in notes_str or "dummy" in notes_str:
        return True, "Notes indicate test lead"

    return False, ""

def clean_and_standardize_leads(df: pd.DataFrame, 
                                col_name: str, 
                                col_phone: str, 
                                col_date: str, 
                                col_source: str, 
                                col_notes: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Processes the raw DataFrame:
    - Normalizes phone numbers
    - Identifies test/junk entries
    - Detects and flags duplicate phone numbers
    - Returns processed DataFrame and a summary metrics dict
    """
    processed_rows = []
    seen_phones = set()
    
    total_raw = len(df)
    duplicates_count = 0
    invalid_phone_count = 0
    test_junk_count = 0

    for idx, row in df.iterrows():
        raw_name = str(row.get(col_name, "")).strip() if pd.notna(row.get(col_name, "")) else "Unknown"
        raw_phone = str(row.get(col_phone, "")).strip() if pd.notna(row.get(col_phone, "")) else ""
        raw_date = str(row.get(col_date, "")).strip() if pd.notna(row.get(col_date, "")) else ""
        raw_source = str(row.get(col_source, "")).strip() if pd.notna(row.get(col_source, "")) else "Direct"
        raw_notes = str(row.get(col_notes, "")).strip() if pd.notna(row.get(col_notes, "")) else ""

        # Normalize phone
        clean_phone, phone_valid, phone_reason = normalize_phone(raw_phone)

        # Check junk name
        is_junk, junk_reason = is_test_lead(raw_name, raw_notes)

        # Cleaned flag defaults to 1 (valid)
        cleaned_flag = 1
        flag_reason = ""

        if is_junk:
            cleaned_flag = 0
            flag_reason = junk_reason
            test_junk_count += 1
        elif not phone_valid:
            cleaned_flag = 0
            flag_reason = phone_reason
            invalid_phone_count += 1
        elif clean_phone in seen_phones:
            cleaned_flag = 0
            flag_reason = "Duplicate phone number in this batch"
            duplicates_count += 1
        else:
            seen_phones.add(clean_phone)

        processed_rows.append({
            "name": raw_name,
            "phone": clean_phone,
            "raw_phone": raw_phone,
            "source": raw_source,
            "enquiry_date": raw_date,
            "raw_notes": raw_notes,
            "cleaned_flag": cleaned_flag,
            "flag_reason": flag_reason,
            "call_status": "Not Called",
            "score": None,
            "tier": None,
            "assigned_script": None
        })

    cleaned_df = pd.DataFrame(processed_rows)
    valid_count = int(cleaned_df["cleaned_flag"].sum())

    summary = {
        "total_raw": total_raw,
        "valid_count": valid_count,
        "duplicates_count": duplicates_count,
        "invalid_phone_count": invalid_phone_count,
        "test_junk_count": test_junk_count,
        "flagged_total": total_raw - valid_count
    }

    return cleaned_df, summary
