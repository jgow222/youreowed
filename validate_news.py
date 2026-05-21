import json, sys
with open('/home/user/workspace/benefits-screener/data/news.json') as f:
    data = json.load(f)
count = len(data['items'])
assert count >= 5, f'Only {count} items, need at least 5'
print(f'Valid JSON with {count} items')
