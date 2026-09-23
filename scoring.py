"""
scoring.py - Configurable multi-factor lead scoring engine for real estate dead leads.
Handles recency, source quality, and corridor/budget fit with graceful fallbacks.
"""

import re
from datetime import datetime, date
import pandas as pd
from dateutil import parser
from typing import Dict, Any, Tuple

# High-intent vs medium vs low intent source keywords
SOURCE_QUALITY_MAP = {
    "referral": 100,
    "walkin": 95,
    "walk-in": 95,
    "direct": 90,
    "website": 88,
    "99acres": 85,
    "magicbricks": 85,
    "housing": 82,
    "nobroker": 80,
    "google": 78,
    "meta": 70,
    "facebook": 68,
    "instagram": 68,
    "ad": 65,
    "campaign": 65,
    "cold": 45,
    "telecalling": 45,
    "database": 40,
    "sms": 40,
    "bulk": 35
}

# Positive intent keywords in notes
INTENT_KEYWORDS = [
    r"\bready\b", r"\brtm\b", r"\bimmediate\b", r"\burgent\b",
    r"\b2\s*bhk\b", r"\b3\s*bhk\b", r"\b1\s*bhk\b", r"\b4\s*bhk\b",
    r"\bcrore\b", r"\bcr\b", r"\blakh\b", r"\blac\b", r"\bbudget\b",
    r"\binvestor\b", r"\bloan\s*approved\b", r"\btoken\b", r"\bown\s*use\b"
]

def calculate_recency_score(date_str: Any, reference_date: date = None) -> Tuple[float, int]:
    """
    Calculates 0-100 score based on days since enquiry.
    Returns (score, days_elapsed).
    """
    if pd.isna(date_str) or not str(date_str).strip():
        return 50.0, -1  # Reasonable default for missing dates

    if reference_date is None:
        reference_date = date.today()

    try:
        # Parse flexibly (handle standard Indian DD/MM/YYYY or ISO)
        parsed_dt = parser.parse(str(date_str), dayfirst=True).date()
        days_elapsed = (reference_date - parsed_dt).days
        if days_elapsed < 0:
            days_elapsed = 0

        # Scoring curve for dead leads
        if days_elapsed <= 30:
            score = 100.0
        elif days_elapsed <= 90:
            score = 85.0
        elif days_elapsed <= 180:
            score = 65.0
        elif days_elapsed <= 365:
            score = 45.0
        else:
            # Over 1 year old
            score = max(20.0, 40.0 - (days_elapsed - 365) * 0.03)

        return round(score, 1), days_elapsed
    except Exception:
        return 50.0, -1

def calculate_source_score(source_str: Any) -> float:
    """Calculates 0-100 score based on acquisition source quality."""
    if pd.isna(source_str) or not str(source_str).strip():
        return 55.0  # Default for unknown source

    clean_src = str(source_str).strip().lower()

    for keyword, score_val in SOURCE_QUALITY_MAP.items():
        if keyword in clean_src:
            return float(score_val)

    return 60.0  # Generic default for unspecified source

# Major corridor micro-market clusters for Indian real estate
CORRIDOR_CLUSTERS = {
    "central mumbai": ["chembur", "wadala", "ghatkopar", "sion", "dadar", "parel", "kurla", "matunga", "vidyavihar", "kanjurmarg", "bhandup", "mulund", "vikhroli", "central"],
    "western suburbs": ["bandra", "khar", "santacruz", "vile parle", "andheri", "jogeshwari", "goregaon", "malad", "kandivali", "borivali", "dahisar", "western"],
    "thane": ["thane", "ghodbunder", "majiwada", "vartak nagar", "panchpakhadi", "naupada", "kolshet", "kasarvadavali"],
    "navi mumbai": ["vashi", "nerul", "belapur", "kharghar", "panvel", "airoli", "sanpada", "seawoods", "ulwe", "taloja"]
}

def calculate_fit_score(notes_str: Any, corridor: str = "") -> float:
    """
    Calculates 0-100 fit score based on corridor/micro-market match and requirement specifics in notes.
    """
    notes_clean = str(notes_str).strip().lower() if pd.notna(notes_str) else ""
    corridor_clean = str(corridor).strip().lower() if corridor else ""

    if not notes_clean:
        return 50.0  # Default for blank notes

    score = 50.0

    # 1. Location / Corridor Match (+25 pts)
    matched_loc = False
    if corridor_clean:
        # Check direct token match
        corridor_words = [w for w in re.split(r"[\s,/]+", corridor_clean) if len(w) > 3]
        if any(w in notes_clean for w in corridor_words) or corridor_clean in notes_clean:
            matched_loc = True
        else:
            # Check cluster aliases
            for cluster_key, sub_areas in CORRIDOR_CLUSTERS.items():
                if cluster_key in corridor_clean:
                    if any(area in notes_clean for area in sub_areas):
                        matched_loc = True
                        break

    if matched_loc:
        score += 25.0

    # 2. Intent specifics in notes (+10 pts per intent trigger, max +25)
    matched_intents = 0
    for pattern in INTENT_KEYWORDS:
        if re.search(pattern, notes_clean):
            matched_intents += 1

    score += min(25.0, matched_intents * 10.0)

    return min(100.0, round(score, 1))

def compute_composite_scores(df: pd.DataFrame,
                             weight_recency: float,
                             weight_source: float,
                             weight_fit: float,
                             corridor: str = "",
                             reference_date: date = None) -> pd.DataFrame:
    """
    Computes composite 0-100 score for all valid leads in df.
    Adds columns: score_recency, score_source, score_fit, and final score.
    """
    total_weight = (weight_recency + weight_source + weight_fit)
    if total_weight <= 0:
        total_weight = 100.0

    result_df = df.copy()

    recency_scores = []
    source_scores = []
    fit_scores = []
    final_scores = []

    for _, row in result_df.iterrows():
        # Only score clean leads or calculate preview for all
        r_score, _ = calculate_recency_score(row.get("enquiry_date"), reference_date)
        s_score = calculate_source_score(row.get("source"))
        f_score = calculate_fit_score(row.get("raw_notes"), corridor)

        weighted = (r_score * weight_recency + s_score * weight_source + f_score * weight_fit) / total_weight
        final_score = round(max(0.0, min(100.0, weighted)), 1)

        recency_scores.append(r_score)
        source_scores.append(s_score)
        fit_scores.append(f_score)
        final_scores.append(final_score)

    result_df["score_recency"] = recency_scores
    result_df["score_source"] = source_scores
    result_df["score_fit"] = fit_scores
    result_df["score"] = final_scores

    return result_df
