"""
Safely write news.json from an intermediate JSON file.

Usage:
    1. Cron writes raw news items to /tmp/news_items.json (just the items array)
    2. Run: python3 write_news.py
    3. This script wraps the items with lastUpdated and writes to data/news.json
    4. Validates the final output

This avoids issues with passing huge JSON blobs through tool calls.
"""
import json
import sys
from datetime import datetime, timezone

ITEMS_PATH = '/tmp/news_items.json'
OUTPUT_PATH = '/home/user/workspace/benefits-screener/data/news.json'

with open(ITEMS_PATH) as f:
    items = json.load(f)

if not isinstance(items, list):
    print(f'ERROR: {ITEMS_PATH} must contain a JSON array of items', file=sys.stderr)
    sys.exit(1)

if len(items) < 5:
    print(f'ERROR: Only {len(items)} items, need at least 5', file=sys.stderr)
    sys.exit(1)

# Validate each item has required fields
required_fields = ['id', 'title', 'summary', 'category', 'date', 'source', 'sourceUrl', 'programs']
for i, item in enumerate(items):
    for field in required_fields:
        if field not in item:
            print(f'ERROR: Item {i} missing required field: {field}', file=sys.stderr)
            sys.exit(1)

data = {
    'lastUpdated': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
    'items': items
}

with open(OUTPUT_PATH, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

# Re-validate
with open(OUTPUT_PATH) as f:
    final = json.load(f)
print(f'SUCCESS: Wrote {len(final["items"])} items to {OUTPUT_PATH}')
