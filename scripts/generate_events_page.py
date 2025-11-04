#!/usr/bin/env python3
"""Generate events listing page from data/events.json."""

import json
from datetime import datetime
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "events.json"
TEMPLATE_PATH = ROOT / "templates" / "events" / "index.template.html"
OUTPUT_PATH = ROOT / "events" / "index.html"
SITE_URL = "https://primeasure.com"


def load_events():
    with DATA_PATH.open() as f:
        data = json.load(f)
    return data.get("events", [])


def parse_date_for_sort(date_str):
    if not date_str or date_str.upper() == "TBD":
        return datetime.max
    try:
        return datetime.fromisoformat(date_str)
    except ValueError:
        return datetime.max


def resolve_image_url(path):
    default_rel = "../images/events/bi2025.png"
    default_abs = f"{SITE_URL}/images/events/bi2025.png"
    if not path:
        return default_rel, default_abs
    if path.startswith("http://") or path.startswith("https://"):
        return path, path
    rel = path
    cleaned = path
    while cleaned.startswith("../"):
        cleaned = cleaned[3:]
    cleaned = cleaned.lstrip("./")
    abs_url = f"{SITE_URL.rstrip('/')}/{cleaned}"
    return rel, abs_url


def format_event_date(event):
    date_value = event.get("date", "TBD")
    if date_value.upper() == "TBD":
        return {
            "weekday": "TBD",
            "month": "TBD",
            "day": "TBD",
            "year": event.get("dateEnd", "")[:4] or "TBD",
            "time": event.get("time", "TBD"),
            "display": "TBD",
        }

    start = datetime.fromisoformat(f"{date_value}T12:00:00")
    end_value = event.get("dateEnd")
    end = (
        datetime.fromisoformat(f"{end_value}T12:00:00")
        if end_value and end_value != date_value
        else None
    )

    weekday = start.strftime("%A").upper()
    month = start.strftime("%b").upper()
    year = str(start.year)

    if end:
        day = f"{start.day}-{end.day}"
        display = f"{month} {start.day}-{end.day}, {year}"
    else:
        day = f"{start.day:02d}"
        display = start.strftime("%B %d, %Y")

    return {
        "weekday": weekday,
        "month": month,
        "day": day,
        "year": year,
        "time": event.get("time", "TBD"),
        "display": display,
    }


def normalize_status(event):
    if isinstance(event, dict):
        value = event.get("status", "")
    else:
        value = event or ""
    value = str(value).strip().lower()
    return value or "upcoming"


def split_events(events):
    upcoming = [evt for evt in events if normalize_status(evt) != "completed"]
    completed = [evt for evt in events if normalize_status(evt) == "completed"]
    return (
        sort_events(upcoming, reverse=False),
        sort_events(completed, reverse=True),
    )


def sort_events(events, reverse=False):
    return sorted(
        events,
        key=lambda evt: parse_date_for_sort(evt.get("date")),
        reverse=reverse,
    )


def get_next_upcoming_event(events):
    for event in sort_events(events):
        if normalize_status(event) != "completed":
            return event
    return None


def build_status_tag(event):
    status = normalize_status(event)
    if status == "completed":
        return '<span class="event-status-tag event-status-tag--completed">Event Completed</span>'
    return ""


def build_action_button(event):
    status = normalize_status(event)
    recap_url = (
        event.get("recapUrl")
        or event.get("recordingUrl")
        or event.get("slidesUrl")
    )
    recap_label = event.get("recapLabel") or "View Recap"

    if status == "completed":
        if recap_url:
            return (
                f'<a href="{escape(recap_url)}" target="_blank" '
                'rel="noopener noreferrer" class="info-button recap-button">'
                f"{escape(recap_label)}</a>"
            )
        return '<span class="event-status-note">Thanks for joining</span>'

    if event.get("registrationEnabled"):
        return (
            f'<a href="../register#{escape(event.get("slug", ""))}" '
            'class="register-button">Register Now</a>'
        )
    if event.get("externalUrl"):
        return (
            f'<a href="{escape(event["externalUrl"])}" target="_blank" '
            'rel="noopener noreferrer" class="info-button">Learn More</a>'
        )
    return ""


def build_event_card(event):
    date_info = format_event_date(event)
    status_tag = build_status_tag(event)
    action = build_action_button(event)
    return f"""
            <div class="event-card">
                <div class="event-date-badge">
                    <span class="weekday">{escape(date_info["weekday"])}</span>
                    <span class="month">{escape(date_info["month"])}</span>
                    <span class="day">{escape(date_info["day"])}</span>
                    <span class="year">{escape(date_info["year"])}</span>
                    <span class="time">{escape(date_info["time"])}</span>
                </div>
                <div class="event-main">
                    <div class="event-main__header">
                        <h3>{escape(event.get("title", ""))}</h3>
                        {status_tag}
                    </div>
                    <div class="event-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>{escape(event.get("location", ""))}</span>
                    </div>
                    <p>{escape(event.get("description", ""))}</p>
                    <div class="event-actions">
                        {action}
                    </div>
                </div>
                <div class="event-logo">
                    <img src="{escape(event.get("image", ""))}" alt="{escape(event.get("imageAlt", ""))}">
                </div>
            </div>
    """


def build_cards(events):
    return "\n".join(build_event_card(event) for event in events)


def indent_json(text, spaces=4):
    indent = " " * spaces
    return "\n".join(f"{indent}{line}" for line in text.splitlines())


def build_completed_section(events):
    if not events:
        return ""
    cards = build_cards(events)
    return f"""
<section class="events-section events-section--completed">
    <div class="container">
        <h2>Completed Events</h2>
        <div class="events-grid" id="events-completed">
{cards}
        </div>
    </div>
</section>
"""


def build_page_meta(featured_event, completed_events):
    default_description = (
        "Join Primeasure at upcoming industry events to explore broadcast, "
        "test & measurement, and automation solutions tailored for India."
    )
    default_page_title = "Events - Primeasure Technology"
    default_og_title = "Industry Events & Exhibitions - Primeasure Technology"
    _, default_og_image = resolve_image_url("../images/events/bi2025.png")

    if featured_event:
        date_info = format_event_date(featured_event)
        location = featured_event.get("location", "India")
        description = (
            f"Next up: {featured_event.get('title', 'Primeasure Event')} in "
            f"{location} on {date_info['display']}. Book a meeting for live demos."
        )
        rel, og_image = resolve_image_url(featured_event.get("image"))
        page_title = f"{featured_event.get('title', 'Primeasure Event')} | Primeasure Events"
        og_title = f"Primeasure at {featured_event.get('title', 'Upcoming Event')}"
        return {
            "page_title": page_title,
            "description": description,
            "og_title": og_title,
            "og_image": og_image,
        }

    fallback_event = completed_events[0] if completed_events else None
    if fallback_event:
        date_info = format_event_date(fallback_event)
        description = (
            f"Recently completed: {fallback_event.get('title', 'Primeasure Event')} "
            f"in {fallback_event.get('location', 'India')} ({date_info['display']}). "
            "Contact us to access the recap."
        )
        _, og_image = resolve_image_url(fallback_event.get("image"))
        page_title = default_page_title
        og_title = default_og_title
        return {
            "page_title": page_title,
            "description": description,
            "og_title": og_title,
            "og_image": og_image,
        }

    return {
        "page_title": default_page_title,
        "description": default_description,
        "og_title": default_og_title,
        "og_image": default_og_image,
    }


def render_page(events):
    template = TEMPLATE_PATH.read_text()
    upcoming_events, completed_events = split_events(events)
    featured_event = get_next_upcoming_event(events)

    upcoming_cards = build_cards(upcoming_events).strip()
    if upcoming_cards:
        upcoming_html = upcoming_cards
    else:
        upcoming_html = '<div class="events-empty-state">New events will be announced soon. Stay tuned!</div>'

    completed_section = build_completed_section(completed_events)

    meta = build_page_meta(featured_event, completed_events)

    data_json = json.dumps({"events": events}, ensure_ascii=False, indent=2)
    html = template.replace("{{UPCOMING_CARDS}}", upcoming_html)
    html = html.replace("{{COMPLETED_SECTION}}", completed_section)
    html = html.replace("{{PAGE_TITLE}}", meta["page_title"])
    html = html.replace("{{META_DESCRIPTION}}", meta["description"])
    html = html.replace("{{OG_TITLE}}", meta["og_title"])
    html = html.replace("{{OG_IMAGE}}", meta["og_image"])
    html = html.replace("{{EVENTS_JSON}}", indent_json(data_json))
    OUTPUT_PATH.write_text(html)
    print(f"Rendered {OUTPUT_PATH.relative_to(ROOT)}")


def main():
    events = load_events()
    render_page(events)


if __name__ == "__main__":
    main()
