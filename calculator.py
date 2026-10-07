"""Return Lab: end-of-month contributions, effective annual returns."""
import argparse
import csv
import math


def project(initial=1000, monthly=300, years=20, rate=7, inflation=2.5):
    """Return annual snapshots. Rates are percentages, not decimal fractions."""
    if not all(math.isfinite(v) for v in (initial, monthly, years, rate, inflation)):
        raise ValueError('All inputs must be finite')
    if initial < 0 or monthly < 0 or not 1 <= years <= 60 or int(years) != years or rate <= -100 or inflation <= -100:
        raise ValueError('Invalid scenario')
    balance = initial
    monthly_rate = (1 + rate / 100) ** (1 / 12) - 1
    rows = [{'year': 0, 'contributions': initial, 'nominal': initial, 'real': initial}]
    for month in range(1, int(years) * 12 + 1):
        balance = balance * (1 + monthly_rate) + monthly
        if month % 12 == 0:
            year = month // 12
            rows.append({'year': year, 'contributions': initial + monthly * month,
                         'nominal': balance, 'real': balance / (1 + inflation / 100) ** year})
    return rows


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--initial', type=float, default=1000)
    parser.add_argument('--monthly', type=float, default=300)
    parser.add_argument('--years', type=int, default=20)
    parser.add_argument('--rate', type=float, default=7)
    parser.add_argument('--inflation', type=float, default=2.5)
    parser.add_argument('--csv', help='Optional output CSV path')
    args = parser.parse_args()
    try:
        rows = project(args.initial, args.monthly, args.years, args.rate, args.inflation)
    except ValueError as error:
        parser.error(str(error))
    last = rows[-1]
    print(f"Projected balance: ${last['nominal']:,.2f}")
    print(f"Contributed: ${last['contributions']:,.2f}")
    print(f"In today's dollars: ${last['real']:,.2f}")
    if args.csv:
        with open(args.csv, 'w', newline='') as handle:
            writer = csv.DictWriter(handle, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(rows)
