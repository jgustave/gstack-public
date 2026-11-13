"""Two avoidable copies introduced in the same change, absent from the baseline."""


def invoice_total(amounts: list[int], discount: int) -> int:
    """Sum nonnegative amounts and subtract a bounded nonnegative discount."""
    # amounts are minor currency units; discount is in the same units.
    if discount < 0:
        raise ValueError("discount must be nonnegative")
    subtotal = 0
    for amount in amounts:
        if amount < 0:
            raise ValueError("amounts must be nonnegative")
        subtotal += amount
    reduction = min(subtotal, discount)
    return subtotal - reduction


def order_total(prices: list[int], rebate: int) -> int:
    """Sum nonnegative prices and subtract a bounded nonnegative rebate."""
    # prices are minor currency units; rebate is in the same units.
    if rebate < 0:
        raise ValueError("rebate must be nonnegative")
    total = 0
    for price in prices:
        if price < 0:
            raise ValueError("prices must be nonnegative")
        total += price
    deduction = min(total, rebate)
    return total - deduction
