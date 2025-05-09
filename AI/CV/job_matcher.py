import pdfplumber
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict
import re
from heapq import nlargest

# --- Load multilingual model ---
model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')

# --- Clean text: loại bỏ ký tự thừa, khoảng trắng ---
def clean_text(text: str) -> str:
    text = re.sub(r'\s+', ' ', text)  # bỏ xuống dòng, tab, nhiều khoảng trắng
    text = re.sub(r'[^\w\s.,;:!?-]', '', text)  # bỏ ký tự đặc biệt
    return text.strip()

# --- Bước 1: Trích xuất văn bản từ CV PDF ---
def extract_text_from_pdf(file_path: str) -> str:
    with pdfplumber.open(file_path) as pdf:
        text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    return text

# --- Bước 2: Tạo embedding từ văn bản ---
def get_embedding(text: str) -> np.ndarray:
    return model.encode(text)

# --- Bước 3: Tính cosine similarity giữa 2 vector ---
def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    return float(np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2)))

# --- Bước 4: Ghép dữ liệu job thành văn bản mô tả ---
def job_to_text(job: Dict) -> str:
    return f"""
    {job['title']}. {job['description']} {job['requirements']}
    Skills: {', '.join(job.get('languages', []))}
    Type: {job.get('jobType')} | Level: {job.get('experienceLevel')} | Remote: {job.get('remote')}
    """

# --- Bước 5: Tìm top N công việc phù hợp nhất ---
def find_top_matches(cv_path: str, jobs: List[Dict], top_k: int = 3) -> List[Dict]:
    # 1. Đọc và làm sạch CV
    raw_cv_text = extract_text_from_pdf(cv_path)
    print("=== Nội dung CV đã trích xuất ===")
    print(raw_cv_text[:1000])  # In 1000 ký tự đầu tiên để kiểm tra

    cv_text = clean_text(raw_cv_text)
    cv_vector = get_embedding(cv_text)

    # 2. Tính điểm tương đồng giữa CV và từng job
    scored_jobs = []
    for job in jobs:
        job_text = clean_text(job_to_text(job))
        job_vector = get_embedding(job_text)
        score = cosine_similarity(cv_vector, job_vector)
        print(f"[{job['title']}] → Similarity: {score:.4f}")
        scored_jobs.append((score, job))

    # 3. Lấy top K job có similarity cao nhất
    top_matches = nlargest(top_k, scored_jobs, key=lambda x: x[0])
    return [job for _, job in top_matches]
