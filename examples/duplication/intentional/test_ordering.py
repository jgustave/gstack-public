"""Similar independent expectations for distinct queue and stack operations."""

from collections import deque


def test_fifo_queue() -> None:
    """A queue returns values in insertion order."""
    items: deque[str] = deque()
    items.append("first")
    items.append("second")
    assert len(items) == 2
    assert items.popleft() == "first"
    assert len(items) == 1
    assert items.popleft() == "second"
    assert len(items) == 0


def test_lifo_stack() -> None:
    """A stack returns values in reverse insertion order."""
    items: deque[str] = deque()
    items.append("first")
    items.append("second")
    assert len(items) == 2
    assert items.pop() == "second"
    assert len(items) == 1
    assert items.pop() == "first"
    assert len(items) == 0
