"""An existing implementation that a caller can reuse."""


def normalized_tags(values: list[str]) -> list[str]:
    """Return sorted, distinct, nonempty tags with normalized spelling."""
    # values contains user-supplied tags, including possible blanks and repeated spelling.
    tags: set[str] = set()
    for value in values:
        cleaned = value.strip().lower()
        if not cleaned:
            continue
        cleaned = cleaned.removeprefix("#")
        if cleaned:
            tags.add(cleaned)
    return sorted(tags)
