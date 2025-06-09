import json

with open('db.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('db.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)
    

