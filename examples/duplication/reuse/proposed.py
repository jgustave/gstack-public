"""A proposed copy whose caller should reuse normalized_tags instead."""


def cleaned_labels(entries: list[str]) -> list[str]:
    """Return sorted, distinct, nonempty labels with normalized spelling."""
    # entries contains user-supplied labels under the same contract as the existing helper.
    labels: set[str] = set()
    for entry in entries:
        normalized = entry.strip().lower()
        if not normalized:
            continue
        normalized = normalized.removeprefix("#")
        if normalized:
            labels.add(normalized)
    return sorted(labels)
