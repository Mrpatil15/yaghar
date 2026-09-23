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
    """Retrieves Supabase URL and anon/service key from secrets or environment."""
    url = ""
    key = ""

    # 1. Try Streamlit secrets
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

def fetch_supabase_leads(workspace_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetches all leads live from Supabase, parsing score/tier transparently."""
    client = get_supabase_client()
    if not client:
        return []

    ws_id = workspace_id or get_active_workspace_id()
    try:
        res = client.table("leads").select("*").eq("workspace_id", ws_id).order("created_at", desc=True).execute()
        rows = res.data or []
        
        # Transparently parse score and tier from explicit columns or tags
        for r in rows:
            tags = r.get("tags") or []
            if r.get("score") is None:
                # Look in tags
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

        return rows
    except Exception as e:
        print(f"[Supabase] fetch_supabase_leads error: {e}")
        return []


def insert_supabase_leads(leads_data: List[Dict[str, Any]], workspace_id: Optional[str] = None) -> int:
    """Inserts a batch of leads directly into Supabase."""
    client = get_supabase_client()
    if not client or not leads_data:
        return 0

    ws_id = workspace_id or get_active_workspace_id()
    records_to_insert = []

    for l in leads_data:
        score = l.get("score") or 50.0
        tier = l.get("tier") or ("Hot" if score >= 70 else ("Warm" if score >= 40 else "Cold"))
        call_status = l.get("call_status") or "Not Called"

        tags = list(l.get("tags") or [])
        tags.extend([f"tier:{tier}", f"score:{score}", f"call:{call_status}"])
        # Dedupe tags
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

        # Attempt to include explicit columns if supported
        if "score" in l:
            rec["score"] = score
        if "tier" in l:
            rec["tier"] = tier
        if "call_status" in l:
            rec["call_status"] = call_status

        records_to_insert.append(rec)

    # Insert in chunks of 100 for network efficiency
    chunk_size = 100
    inserted_count = 0

    for i in range(0, len(records_to_insert), chunk_size):
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

    return inserted_count


def update_supabase_lead_status(lead_id: str, new_status: str, call_status: Optional[str] = None, notes: Optional[str] = None):
    """Updates a lead's stage and call status live in Supabase."""
    client = get_supabase_client()
    if not client:
        return False

    update_payload: Dict[str, Any] = {"stage": new_status}
    if notes is not None:
        update_payload["notes"] = notes

    try:
        # Fetch current tags to update call tag
        curr = client.table("leads").select("tags").eq("id", lead_id).execute()
        if curr.data:
            existing_tags = curr.data[0].get("tags") or []
            updated_tags = [t for t in existing_tags if not str(t).startswith("call:")]
            if call_status:
                updated_tags.append(f"call:{call_status}")
            update_payload["tags"] = updated_tags

        if call_status:
            update_payload["call_status"] = call_status

        client.table("leads").update(update_payload).eq("id", lead_id).execute()
        return True
    except Exception as e:
        # Fallback without call_status column if not yet added
        if "call_status" in update_payload:
            del update_payload["call_status"]
            try:
                client.table("leads").update(update_payload).eq("id", lead_id).execute()
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
