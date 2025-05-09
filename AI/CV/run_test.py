import os
import json
from job_matcher import find_top_matches
from jobs_data import jobs

# --- Cấu hình ---
cv_path = r"C:\Users\DAT VO\Desktop\DoAnTotNghiep\AI\CV\test1.pdf"
top_k = 3

# --- Kiểm tra file CV ---
print("📄 Đường dẫn CV:", os.path.abspath(cv_path))

if os.path.exists(cv_path):
    print("✅ File CV tồn tại.")
    try:
        top_jobs = find_top_matches(cv_path, jobs, top_k=top_k)

        print(f"\n🎯 TOP {top_k} công việc phù hợp nhất:")
        for i, job in enumerate(top_jobs, 1):
            print(f"\n--- Công việc #{i} ---")
            print(json.dumps(job, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f"❌ Đã xảy ra lỗi khi xử lý CV hoặc job: {e}")
else:
    print("❌ File CV không tồn tại. Vui lòng kiểm tra lại đường dẫn.")
