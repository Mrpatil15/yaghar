"""
workability.py - Response-based Lead Workability Ranking Engine.
Dynamically calculates workability scores, ranks workable leads, and provides real-time prioritization.
"""

import pandas as pd
from typing import Dict, Any, List, Tuple

# Weights for call outcomes in Indian real estate reactivation
RESPONSE_SCORES = {
    "Site Visit Booked": 100.0,
    "High Interest / Callback": 88.0,
    "Connected - Exploring": 72.0,
    "Call Busy / Later": 55.0,
    "Ringing / No Answer": 42.0,
    "Not Called": None, # Will use initial reactivation score
    "Pending Call": None,
    "Not Interested": 10.0,
    "Wrong Number / Invalid": 0.0
}

WORKABLE_TIER_BADGES = {
    "Ultra Hot": ("🥇 Rank 1 • Site Visit / Ready", "#DCFCE7", "#15803D"),
    "High Workable": ("🔥 Priority Callback", "#FEF3C7", "#B45309"),
    "Active Pipeline": ("📞 Active Lead", "#E0F2FE", "#0369A1"),
    "Retry Queue": ("🔄 Retry / Follow-up", "#F1F5F9", "#475569"),
    "Unworkable": ("❌ Dropped / Lost", "#FEE2E2", "#991B1B")
}

def calculate_workability(base_score: float, call_status: str) -> Tuple[float, str, bool]:
    """
    Returns (workability_score, workable_tier, is_workable_flag).
    """
    status_clean = str(call_status).strip() if call_status else "Not Called"
    base = float(base_score) if base_score is not None else 50.0

    resp_score = RESPONSE_SCORES.get(status_clean)
    
    if resp_score is None:
        # Not called yet - rank by initial reactivation score
        w_score = base
    else:
        # 65% response outcome weight + 35% initial lead quality
        w_score = (resp_score * 0.65) + (base * 0.35)

    w_score = round(max(0.0, min(100.0, w_score)), 1)

    # Classify tier
    if status_clean in ("Site Visit Booked", "Converted"):
        tier = "Ultra Hot"
        is_workable = True
    elif status_clean in ("High Interest / Callback",) or (status_clean in ("Not Called", "Pending Call") and base >= 75):
        tier = "High Workable"
        is_workable = True
    elif status_clean in ("Connected - Exploring", "Connected") or (status_clean in ("Not Called", "Pending Call") and base >= 50):
        tier = "Active Pipeline"
        is_workable = True
    elif status_clean in ("Ringing / No Answer", "Call Busy / Later"):
        tier = "Retry Queue"
        is_workable = True
    elif status_clean in ("Not Interested", "Wrong Number / Invalid") or w_score < 35:
        tier = "Unworkable"
        is_workable = False
    else:
        tier = "Active Pipeline"
        is_workable = True

    return w_score, tier, is_workable

def rank_leads_by_workability(leads: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Sorts and assigns 1-based workable ranks to all leads in a batch.
    """
    if not leads:
        return []

    processed = []
    for lead in leads:
        lead_dict = dict(lead)
        base = lead_dict.get("score") or 50.0
        status = lead_dict.get("call_status") or "Not Called"
        w_score, w_tier, is_workable = calculate_workability(base, status)
        
        lead_dict["workable_score"] = w_score
        lead_dict["workable_tier"] = w_tier
        lead_dict["is_workable"] = is_workable
        processed.append(lead_dict)

    # Sort descending by workable_score, then by base score
    processed.sort(key=lambda x: (x["is_workable"], x["workable_score"], x.get("score") or 0), reverse=True)

    # Assign sequential ranks (workable first)
    for rank_idx, item in enumerate(processed, start=1):
        item["workable_rank"] = rank_idx

    return processed
