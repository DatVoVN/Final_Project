import json
import faiss
import gradio as gr
from sentence_transformers import SentenceTransformer
import numpy as np

# Load model để embed text
model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

# === BƯỚC 1: Load và chuẩn hóa data ===
with open("jobs_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Chuyển thông tin từng job thành văn bản mô tả dễ hiểu cho LLM
job_texts = []
job_infos = []

for company in data:
    for job in company["jobs"]:
        job_text = f"{company['company_name']} tuyển {job['title']} tại {job['location']}.\nMức lương: {job['salary_range']}.\nMô tả công việc: {job['description']}"
        job_texts.append(job_text)
        job_infos.append({
            "company": company["company_name"],
            "job_title": job["title"],
            "location": job["location"],
            "salary": job["salary_range"],
            "description": job["description"],
            "url": company["website"]
        })

# === BƯỚC 2: Encode job_texts thành vector ===
embeddings = model.encode(job_texts, convert_to_numpy=True)
# === BƯỚC 3: Tạo FAISS index ===
dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(embeddings)
# === BƯỚC 4: Định nghĩa hàm trả lời chatbot ===
def chatbot_answer(user_query):
    query_vec = model.encode([user_query], convert_to_numpy=True)
    D, I = index.search(query_vec, k=5)  # Top 5 job gần nhất

    results = []
    for i in I[0]:
        info = job_infos[i]

        # Kiểm tra nếu có công ty trong kết quả tìm kiếm
        if any(company_name.lower() in user_query.lower() for company_name in [info['company'], info['location']]):
            results.append(f"🔹 **Công ty**: {info['company']}\n**Vị trí**: {info['job_title']} tại {info['location']}\n💰 **Mức lương**: {info['salary']}\n📄 **Mô tả công việc**: {info['description']}\n🌐 **Website công ty**: {info['url']}\n")

    # Nếu không có kết quả phù hợp, trả về thông báo lỗi
    if not results:
        return "Không tìm thấy công việc hoặc công ty phù hợp với yêu cầu của bạn."

    return "\n\n".join(results)

# === BƯỚC 5: Tạo giao diện Gradio ===
demo = gr.Interface(fn=chatbot_answer,
                    inputs=gr.Textbox(lines=2, placeholder="Bạn muốn tìm việc gì?"),
                    outputs="markdown",
                    title="🤖 Chatbot Tư vấn Việc làm",
                    description="Nhập yêu cầu của bạn để xem công việc phù hợp. Ví dụ: 'Công việc lập trình ở Hà Nội' hoặc 'Công ty XYZ'.")

demo.launch()
