#!/usr/bin/env python3
"""Generate blog pages and listing from data/blog.json."""

import json
from datetime import datetime
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "blog.json"
TEMPLATE_PATH = ROOT / "templates" / "blog" / "template.html"
CONTENT_DIR = ROOT / "blog"
LISTING_TEMPLATE_PATH = ROOT / "templates" / "blog" / "index.template.html"
LISTING_OUTPUT_PATH = ROOT / "blog" / "index.html"
SITE_URL = "https://primeasure.com"


def load_posts():
    with DATA_PATH.open() as f:
        data = json.load(f)
    return sorted(data["posts"], key=lambda p: p["publishDate"], reverse=True)


def format_topic_label(topic):
    mapping = {
        "test-measurement": "Test & Measurement",
        "memory": "Memory",
        "broadcast": "Broadcast",
        "automotive": "Automotive",
    }
    normalized = (topic or "").lower()
    if normalized in mapping:
        return mapping[normalized]
    words = normalized.replace("-", " ").split()
    return " ".join(word.capitalize() for word in words) if words else "Insights"


def build_topic_chips(topics):
    if not topics:
        return f'<span class="article-topic-chip">{escape("Primeasure Insights")}</span>'
    return "".join(
        f'<span class="article-topic-chip">{escape(format_topic_label(topic))}</span>'
        for topic in topics
    )


def resolve_hero_paths(path):
    if not path:
        return ("../../images/blog/hero.png", f"{SITE_URL}/images/blog/hero.png")
    if path.startswith("http://") or path.startswith("https://"):
        return path, path
    trimmed = path
    while trimmed.startswith("../"):
        trimmed = trimmed[3:]
    trimmed = trimmed.lstrip("./")
    if trimmed.startswith("/"):
        trimmed = trimmed.lstrip("/")
    relative = f"../../{trimmed}"
    absolute = f"{SITE_URL}/{trimmed}"
    return relative, absolute


def format_display_date(date_string):
    try:
        date_obj = datetime.fromisoformat(date_string)
    except ValueError:
        return date_string
    month_year = date_obj.strftime("%B %Y")
    return f"{date_obj.day} {month_year}"


def indent_json(json_string, spaces=4):
    indent = " " * spaces
    return "\n".join(f"{indent}{line}" for line in json_string.splitlines())


def render_article(post, template):
    slug = post["slug"]
    content_file = CONTENT_DIR / slug / "content.html"
    if not content_file.exists():
        raise FileNotFoundError(f"Missing content for {slug}: {content_file}")
    body_html = content_file.read_text().strip()

    meta_description = post.get("metaDescription") or post.get("excerpt", "")
    hero_relative, hero_absolute = resolve_hero_paths(post.get("heroImage", ""))
    structured_data = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.get("title", ""),
        "description": meta_description,
        "image": hero_absolute,
        "author": {"@type": "Organization", "name": post.get("author", "Primeasure Team")},
        "publisher": {
            "@type": "Organization",
            "name": "Primeasure",
            "logo": {"@type": "ImageObject", "url": f"{SITE_URL}/images/logo.png"},
        },
        "datePublished": post.get("publishDate", ""),
        "dateModified": post.get("publishDate", ""),
        "mainEntityOfPage": f"{SITE_URL}/blog/{slug}",
    }

    def html_escape(value):
        return escape(str(value), quote=True)

    replacements = {
        "TITLE": html_escape(post.get("title", "")),
        "META_DESCRIPTION": html_escape(meta_description),
        "CANONICAL_URL": html_escape(f"{SITE_URL}/blog/{slug}"),
        "HERO_IMAGE_RELATIVE": html_escape(hero_relative),
        "HERO_IMAGE_ABSOLUTE": html_escape(hero_absolute),
        "HERO_IMAGE_ALT": html_escape(post.get("heroAlt", post.get("title", ""))),
        "AUTHOR": html_escape(post.get("author", "Primeasure Team")),
        "PUBLISH_DATE": html_escape(post.get("publishDate", "")),
        "MODIFIED_DATE": html_escape(post.get("publishDate", "")),
        "DISPLAY_DATE": html_escape(format_display_date(post.get("publishDate", ""))),
        "READING_TIME_LABEL": html_escape(f"{post.get('readingTime', '')} min read"),
        "TOPIC_CHIPS": build_topic_chips(post.get("topics", [])),
        "BODY": body_html,
        "STRUCTURED_DATA": indent_json(json.dumps(structured_data, ensure_ascii=False, indent=2)),
    }

    html = template
    for key, value in replacements.items():
        html = html.replace(f"{{{{{key}}}}}", str(value))

    output_path = CONTENT_DIR / slug / "index.html"
    output_path.write_text(html)
    print(f"Rendered {output_path.relative_to(ROOT)}")


def format_topics_for_card(topics):
    return "".join(
        f'<span class="topic-chip" data-topic="{escape(topic)}">'
        f"{escape(format_topic_label(topic))}</span>"
        for topic in topics
    )


def build_cards(posts):
    card_template = """
        <article class=\"blog-card\">
            <a href=\"{slug}\" class=\"blog-card__image-link\">
                <img src=\"{heroImage}\" alt=\"{heroAlt}\">
            </a>
            <div class=\"blog-card__content\">
                <div class=\"blog-card__meta\">
                    <span class=\"blog-card__date\">{date}</span>
                    <span class=\"blog-card__reading-time\">{readingTime} min read</span>
                </div>
                <h3 class=\"blog-card__title\"><a href=\"{slug}\">{title}</a></h3>
                <p class=\"blog-card__excerpt\">{excerpt}</p>
                <div class=\"blog-card__topics\">
                    {topics}
                </div>
                <a href=\"{slug}\" class=\"blog-card__cta\">Read Article <i class=\"fas fa-arrow-right\"></i></a>
            </div>
        </article>
    """

    cards = []
    for post in posts:
        topics = format_topics_for_card(post.get("topics", []))
        cards.append(
            card_template.format(
                slug=escape(post["slug"]),
                heroImage=escape(post["heroImage"]),
                heroAlt=escape(post.get("heroAlt", post["title"])),
                date=escape(format_display_date(post["publishDate"])),
                readingTime=post["readingTime"],
                title=escape(post["title"]),
                excerpt=escape(post["excerpt"]),
                topics=topics,
            )
        )
    return "\n".join(cards)


def render_listing(posts, cards_html):
    template = LISTING_TEMPLATE_PATH.read_text()
    data_json = json.dumps({"posts": posts}, ensure_ascii=False, indent=2)
    html = template.replace("{{BLOG_CARDS}}", cards_html)
    html = html.replace("{{BLOG_JSON}}", indent_json(data_json))
    LISTING_OUTPUT_PATH.write_text(html)
    print(f"Rendered {LISTING_OUTPUT_PATH.relative_to(ROOT)}")


def main():
    posts = load_posts()
    article_template = TEMPLATE_PATH.read_text()
    for post in posts:
        render_article(post, article_template)
    cards_html = build_cards(posts)
    render_listing(posts, cards_html)


if __name__ == "__main__":
    main()
