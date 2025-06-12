from pymongo import MongoClient
import json

client = MongoClient("mongodb://localhost:27017")
db = client['your_database']
collection = db['jobpostings']
jobs = list(collection.find({"isActive": True}, {"_id": 0}))
with open("jobs.json", "w", encoding="utf-8") as f:
    json.dump(jobs, f, indent=2, ensure_ascii=False)
print(f"Đã lưu {len(jobs)} job vào file jobs.json")