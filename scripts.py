"""
scripts.py - Segmentation and Hinglish call script generation.
Assigns Hot / Warm / Cold tiers and fills dynamic placeholders in call scripts.
"""

import pandas as pd
from typing import Dict, Any, Tuple

DEFAULT_SCRIPTS = {
    "Hot": (
        "Namaste {name} ji, main {corridor} property desk se call kar raha hoon. "
        "Aapne pehle {corridor} me property search ke liye enquiry ki thi. "
        "Abhi ek bahut exclusive ready-to-move / pre-launch inventory aayi hai special pricing ke sath. "
        "Kya aap abhi bhi active dekh rahe hain? 2 minute baat ho sakti hai?"
    ),
    "Warm": (
        "Hello {name} ji, hope you are doing well! "
        "Humne dekha aapka pehle {source} ke through requirement register hua tha. "
        "Market me abhi naye options aur developer discounts aaye hain aapke budget corridor me. "
        "Kya aapka plan abhi on hai ya thoda postpone ho gaya hai?"
    ),
    "Cold": (
        "Namaste {name} ji, YAGHAR Advisory team se ek quick courtesy follow-up tha. "
        "Aapne pehle {corridor} me explore kiya tha. "
        "Bas check karna tha ki aapka flat finalize ho gaya hai ya still open to good deals? "
        "Agar plan drop hua ho to batayein, hum record close kar denge."
    )
}

def clean_salutation_name(full_name: Any) -> str:
    """Extracts a clean first name or respectful name for Indian salutation."""
    if pd.isna(full_name) or not str(full_name).strip():
        return "Sir/Madam"
    
    clean = str(full_name).strip()
    # Strip common prefixes like Mr, Mrs, Dr, Shri
    tokens = clean.split()
    if tokens[0].lower().rstrip(".") in ["mr", "mrs", "ms", "dr", "shri", "smt"]:
        tokens = tokens[1:]
    
    if tokens:
        first = tokens[0].capitalize()
        # If single letter or junk, fallback to Sir/Madam
        if len(first) > 1 and first.isalpha():
            return first
    return clean

def fill_script_template(template: str, 
                         lead_name: str, 
                         corridor: str = "", 
                         source: str = "", 
                         enquiry_date: str = "") -> str:
    """Fills script template with personalized lead variables."""
    first_name = clean_salutation_name(lead_name)
    corridor_str = corridor.strip() if corridor else "Central Mumbai"
    source_str = source.strip() if source and source != "Unknown" else "portal"

    script = template.replace("{name}", first_name)
    script = script.replace("{corridor}", corridor_str)
    script = script.replace("{source}", source_str)
    script = script.replace("{date}", str(enquiry_date).strip() if enquiry_date else "kuch samay pehle")
    return script

def segment_and_assign_scripts(df: pd.DataFrame,
                               hot_threshold: float,
                               warm_threshold: float,
                               script_templates: Dict[str, str],
                               corridor: str = "") -> pd.DataFrame:
    """
    Assigns Tier (Hot/Warm/Cold) and personalized assigned_script to each row in df.
    """
    result_df = df.copy()
    tiers = []
    scripts = []

    script_hot = script_templates.get("Hot", DEFAULT_SCRIPTS["Hot"])
    script_warm = script_templates.get("Warm", DEFAULT_SCRIPTS["Warm"])
    script_cold = script_templates.get("Cold", DEFAULT_SCRIPTS["Cold"])

    for _, row in result_df.iterrows():
        score = row.get("score")
        if pd.isna(score) or score is None:
            score = 0.0
        score = float(score)

        if score >= hot_threshold:
            tier = "Hot"
            template = script_hot
        elif score >= warm_threshold:
            tier = "Warm"
            template = script_warm
        else:
            tier = "Cold"
            template = script_cold

        assigned_text = fill_script_template(
            template=template,
            lead_name=row.get("name", ""),
            corridor=corridor,
            source=row.get("source", ""),
            enquiry_date=row.get("enquiry_date", "")
        )

        tiers.append(tier)
        scripts.append(assigned_text)

    result_df["tier"] = tiers
    result_df["assigned_script"] = scripts
    return result_df
