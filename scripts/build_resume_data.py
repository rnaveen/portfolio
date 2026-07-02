#!/usr/bin/env python3
"""Build resume_dashboard.json from source data and resume-overrides.md."""

from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCHEMA_PATH = ROOT / "data" / "resume_schema.json"
HOBBIES_PATH = ROOT / "data" / "hobbies.json"
OVERRIDES_PATH = ROOT / "resume-overrides.md"
OUTPUT_PATH = ROOT / "data" / "resume_dashboard.json"

DOMAIN_COLORS = {
    "purple": "#a78bfa",
    "teal": "#00e5b0",
    "coral": "#fb7185",
    "pink": "#f472b6",
}

CATEGORY_COLORS = [
    "#60a5fa",
    "#00e5b0",
    "#a78bfa",
    "#fbbf24",
    "#f472b6",
    "#fb7185",
]

CLIENT_COUNTRIES = {
    "telstra": "Australia",
    "goldman": "UK",
    "ciena": "US",
    "capital one": "US",
}

INTERMEDIARIES = {"infosys"}

HOBBY_ICONS = {
    "books": "ti-book",
    "coffee": "ti-coffee",
    "fitness": "ti-barbell",
    "running": "ti-run",
    "cycling": "ti-bike",
    "volunteering": "ti-heart-handshake",
}

HOBBY_PLACEHOLDERS = {
    "Books": "A steady rotation of non-fiction and long-form reads — draft description.",
    "Coffee & Protein Experimentation": "Exploring brew methods and protein-forward recipes — draft description.",
    "Fitness": "Regular strength and cardio routines to stay balanced — draft description.",
    "Running": "Regular runner, working toward longer distances.",
    "Cycling": "Rides for fitness and exploring local routes.",
    "Volunteering": "Active in farmer welfare and rural advocacy work.",
}

DOMAIN_RULES = [
    {
        "id": "banking",
        "title": "Banking and finance",
        "icon": "ti-building-bank",
        "color": "purple",
        "match": lambda org, industry: any(
            x in org.lower() for x in ("goldman", "capital one")
        )
        or "banking" in industry.lower()
        or "investment" in industry.lower(),
        "clients": [],
        "role_years": 0.0,
        "role_ids": [],
    },
    {
        "id": "telecom",
        "title": "Telecom",
        "icon": "ti-antenna-bars-5",
        "color": "teal",
        "match": lambda org, industry: "telstra" in org.lower()
        or "ciena" in org.lower()
        or "telecom" in industry.lower(),
        "clients": [],
        "role_years": 0.0,
        "role_ids": [],
    },
    {
        "id": "manufacturing",
        "title": "Manufacturing / electronics",
        "icon": "ti-cpu",
        "color": "coral",
        "match": lambda org, industry: "toshiba" in org.lower()
        or "manufacturing" in industry.lower()
        or "electronics" in industry.lower(),
        "clients": [],
        "role_years": 0.0,
        "role_ids": [],
    },
    {
        "id": "agricultural_policy",
        "title": "Agricultural policy",
        "icon": "ti-plant-2",
        "color": "pink",
        "match": lambda org, industry: "agricultur" in industry.lower()
        or "policy" in industry.lower()
        or "farmer" in org.lower(),
        "clients": [],
        "role_years": 0.0,
        "role_ids": [],
    },
]

TAG_LABELS = {
    "impact": "Impact",
    "learning": "Learning",
    "planned": "Planned",
}


def load_json(path: Path) -> dict:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def parse_date(value: str | None) -> date | None:
    if not value:
        return None
    year, month = value.split("-")
    return date(int(year), int(month), 1)


def role_end(role: dict) -> date:
    if role.get("end_date"):
        return parse_date(role["end_date"])  # type: ignore[return-value]
    return date.today()


def role_years(role: dict) -> float:
    start = parse_date(role["start_date"])
    end = role_end(role)
    if not start:
        return 0.0
    months = (end.year - start.year) * 12 + (end.month - start.month) + 1
    return round(max(months, 1) / 12, 1)


def format_period(role: dict) -> str:
    start = parse_date(role["start_date"])
    if not start:
        return ""
    start_year = start.year
    if role.get("end_date"):
        end = parse_date(role["end_date"])
        return f"{start_year} — {end.year}" if end else f"{start_year} — present"
    return f"{start_year} — present"


def client_country(role: dict) -> str | None:
    org = role.get("organization", "").lower()
    for key, country in CLIENT_COUNTRIES.items():
        if key in org:
            return country
    if role.get("location", "").upper().endswith("US") or ", us" in role.get("location", "").lower():
        return "US"
    return None


def is_end_client(role: dict) -> bool:
    org = role.get("organization", "").lower()
    return not any(i in org for i in INTERMEDIARIES)


def domain_detail(roles: list[dict]) -> str:
    parts = []
    for role in roles[:2]:
        desc = role.get("description", "").strip()
        if desc:
            parts.append(desc.rstrip("."))
    text = ". ".join(parts)
    if text and not text.endswith("."):
        text += "."
    return text


def build_domains(roles: list[dict]) -> list[dict]:
    domains = [
        {
            "id": d["id"],
            "title": d["title"],
            "icon": d["icon"],
            "color": d["color"],
            "match": d["match"],
            "clients": [],
            "role_years": 0.0,
            "role_ids": [],
            "matched_roles": [],
        }
        for d in DOMAIN_RULES
    ]
    extra_domains: list[dict] = []

    for role in roles:
        org = role.get("organization", "")
        industry = role.get("client_industry", "")
        years = role_years(role)
        role_id = role.get("id", "")
        matched_any = False

        for domain in domains:
            if domain["match"](org, industry):
                if org not in domain["clients"]:
                    domain["clients"].append(org)
                domain["role_years"] = round(domain["role_years"] + years, 1)
                if role_id and role_id not in domain["role_ids"]:
                    domain["role_ids"].append(role_id)
                    domain["matched_roles"].append(role)
                matched_any = True

        if not matched_any and role.get("track") == "tech":
            slug = re.sub(r"[^a-z0-9]+", "_", (industry or org).lower()).strip("_") or "other"
            extra_domains.append(
                {
                    "id": slug,
                    "title": industry or "Other",
                    "icon": "ti-briefcase",
                    "color": "purple",
                    "clients": [org],
                    "role_years": years,
                    "role_ids": [role_id] if role_id else [],
                    "matched_roles": [role],
                }
            )

    result = []
    for domain in domains:
        if not domain["clients"]:
            continue
        color_name = domain["color"]
        yrs = domain["role_years"]
        matched = domain["matched_roles"]
        result.append(
            {
                "id": domain["id"],
                "icon": domain["icon"],
                "title": domain["title"],
                "subtitle": ", ".join(domain["clients"]),
                "color": color_name,
                "color_hex": DOMAIN_COLORS.get(color_name, DOMAIN_COLORS["purple"]),
                "years": yrs,
                "detail": domain_detail(matched),
                "timeline_links": [
                    {"id": r["id"], "label": r.get("organization", "")}
                    for r in matched
                    if r.get("id")
                ],
            }
        )

    for domain in extra_domains:
        color_name = domain["color"]
        matched = domain["matched_roles"]
        result.append(
            {
                "id": domain["id"],
                "icon": domain["icon"],
                "title": domain["title"],
                "subtitle": ", ".join(domain["clients"]),
                "color": color_name,
                "color_hex": DOMAIN_COLORS.get(color_name, DOMAIN_COLORS["purple"]),
                "years": domain["role_years"],
                "detail": domain_detail(matched),
                "timeline_links": [
                    {"id": r["id"], "label": r.get("organization", "")}
                    for r in matched
                    if r.get("id")
                ],
            }
        )

    result.sort(key=lambda d: d["years"], reverse=True)

    for domain in result:
        if domain["title"] == "Banking and finance":
            domain["subtitle"] = (
                "Goldman Sachs, Capital One — Chordiant/J2EE case management"
            )
            break

    return result


def compute_skill_years(schema: dict) -> dict[str, float]:
    roles = schema.get("roles", [])
    skills = [s for s in schema.get("skills", []) if "tibco" not in s["name"].lower()]
    skill_years: dict[str, float] = {}
    for skill in skills:
        name = skill["name"]
        total = 0.0
        for role in roles:
            if role.get("track") != "tech":
                continue
            used = role.get("skills_used", [])
            if name in used:
                total += role_years(role)
        skill_years[name] = round(total, 1)
    return skill_years


def build_core_competencies(schema: dict) -> dict:
    skill_years = compute_skill_years(schema)
    skill_status: dict[str, str] = {
        s["name"]: s.get("status", "dormant")
        for s in schema.get("skills", [])
        if "tibco" not in s["name"].lower()
    }

    categories = []
    for cat in schema.get("core_competencies", []):
        items = []
        for item in cat.get("items", []):
            skill_key = item.get("skill_key")
            years = 0.0
            status = "dormant"
            if skill_key:
                years = skill_years.get(skill_key, 0.0)
                status = skill_status.get(skill_key, "dormant")
            items.append(
                {
                    "label": item["label"],
                    "skill_key": skill_key,
                    "highlight": item.get("highlight", False),
                    "years": years,
                    "status": status,
                }
            )
        categories.append(
            {
                "id": cat["id"],
                "title": cat["title"],
                "summary": cat["summary"],
                "items": items,
            }
        )

    return {"heading": "CORE COMPETENCIES", "categories": categories}


def build_projects(schema: dict) -> list[dict]:
    result = []
    for project in schema.get("projects", []):
        tag = project.get("tag", "learning")
        result.append(
            {
                **project,
                "tag": tag,
                "tag_label": TAG_LABELS.get(tag, tag.title()),
            }
        )
    return result


def summarize_bullets(role: dict) -> str:
    bullets = role.get("bullets", [])
    if not bullets:
        return role.get("description", "")
    lead = bullets[0].rstrip(".")
    middle = bullets[1].rstrip(".") if len(bullets) > 1 else ""
    tail = bullets[2].rstrip(".") if len(bullets) > 2 else ""
    parts = [lead]
    if middle:
        parts.append(middle[0].lower() + middle[1:] if middle else middle)
    if tail:
        parts.append(tail[0].lower() + tail[1:] if tail else tail)
    text = ". ".join(parts)
    if not text.endswith("."):
        text += "."
    return text


def org_color_map(roles: list[dict]) -> dict[str, str]:
    palette = list(DOMAIN_COLORS.values())
    mapping: dict[str, str] = {}
    idx = 0
    for role in sorted(roles, key=lambda r: r.get("start_date", "")):
        org = role.get("organization", "")
        if org not in mapping:
            mapping[org] = palette[idx % len(palette)]
            idx += 1
    return mapping


def build_timeline(roles: list[dict]) -> list[dict]:
    colors = org_color_map(roles)
    sorted_roles = sorted(
        roles,
        key=lambda r: r.get("start_date", ""),
        reverse=True,
    )
    most_recent_id = sorted_roles[0]["id"] if sorted_roles else None
    current_id = next((r["id"] for r in sorted_roles if r.get("is_current")), most_recent_id)

    entries = []
    for role in sorted_roles:
        org = role.get("organization", "")
        loc = role.get("location", "")
        org_display = f"{org} · {loc}" if loc else org
        entries.append(
            {
                "id": role["id"],
                "track": role.get("track"),
                "period": format_period(role),
                "role": role.get("title", ""),
                "org": org_display,
                "detail": summarize_bullets(role),
                "bullets": role.get("bullets", []),
                "skills_used": role.get("skills_used", []),
                "color": colors.get(org, DOMAIN_COLORS["purple"]),
                "openByDefault": role["id"] == current_id,
            }
        )
    return entries


def build_education(education: list[dict]) -> list[dict]:
    sorted_edu = sorted(education, key=lambda e: e.get("year", 0), reverse=True)
    return [
        {
            "degree": e["degree"],
            "school": e.get("school") or e.get("institution", ""),
            "year": e["year"],
        }
        for e in sorted_edu
    ]


def hobby_icon(title: str) -> str:
    lower = title.lower()
    for key, icon in HOBBY_ICONS.items():
        if key in lower:
            return icon
    return "ti-heart"


def build_interests(hobbies_data: dict) -> list[dict]:
    interests = []
    for hobby in hobbies_data.get("hobbies", []):
        title = hobby["title"]
        desc = hobby.get("description", "").strip()
        if not desc:
            desc = HOBBY_PLACEHOLDERS.get(title, f"Personal interest — {title}.")
        slug = re.sub(r"[^a-z0-9]+", "_", title.lower()).strip("_")
        interests.append(
            {
                "id": slug,
                "title": title,
                "description": desc,
                "icon": hobby_icon(title),
            }
        )
    return interests


def parse_overrides(path: Path) -> dict[str, object]:
    if not path.exists():
        return {}

    text = path.read_text(encoding="utf-8")
    sections: dict[str, object] = {}
    current: str | None = None
    buffer: list[str] = []

    placeholder_re = re.compile(r"^\(none yet", re.I)

    def flush() -> None:
        nonlocal current, buffer
        if current is None:
            return
        body = "\n".join(buffer).strip()
        if body and not placeholder_re.match(body):
            try:
                sections[current] = json.loads(body)
            except json.JSONDecodeError:
                pass
        current = None
        buffer = []

    for line in text.splitlines():
        if line.startswith("## "):
            flush()
            current = line[3:].strip()
            continue
        if current is not None:
            buffer.append(line)

    flush()
    return sections


def build_dashboard() -> dict:
    schema = load_json(SCHEMA_PATH)
    hobbies = load_json(HOBBIES_PATH)
    overrides = parse_overrides(OVERRIDES_PATH)
    roles = schema.get("roles", [])

    domains = build_domains(roles)
    core_competencies = build_core_competencies(schema)
    timeline = build_timeline(roles)
    education = build_education(schema.get("education", []))
    interests = build_interests(hobbies)
    projects = build_projects(schema)

    profile = dict(schema.get("profile", {}))

    dashboard = {
        "profile": profile,
        "domain_expertise": domains,
        "core_competencies": core_competencies,
        "timeline": timeline,
        "education": education,
        "interests": interests,
        "projects": projects,
        "generated_at": date.today().isoformat(),
    }

    section_map = {
        "Domain expertise": "domain_expertise",
        "Core competencies": "core_competencies",
        "Timeline": "timeline",
        "Interests": "interests",
        "Projects": "projects",
    }
    for heading, key in section_map.items():
        if heading in overrides:
            dashboard[key] = overrides[heading]

    return dashboard


def main() -> None:
    dashboard = build_dashboard()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(dashboard, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
