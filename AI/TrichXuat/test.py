import os
import fitz
import numpy as np
from sentence_transformers import SentenceTransformer
def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with fitz.open(pdf_path) as doc:
            for page in doc:
                text += page.get_text()
    except Exception as e:
        print(f"Lỗi đọc PDF: {e}")
    return text

model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embedding(text):
    try:
        return model.encode(text)
    except Exception as e:
        print(f"Lỗi tạo embedding local: {e}")
        return None
test_jobs = [
    {
        "id": "job1",
        "title": "Frontend Developer",
        "description": """
        We are looking for a Frontend Developer with strong experience in HTML, CSS, and JavaScript.
        Must have experience with React.js and responsive design. Good understanding of UI/UX principles.
        """,
    },
    {
        "id": "job2",
        "title": "Backend Developer",
        "description": """
        Backend Developer needed with expertise in Node.js and Express framework.
        Familiarity with MongoDB, REST APIs, and authentication systems. Experience with cloud services is a plus.
        """,
    },
    {
        "id": "job3",
        "title": "Fullstack Developer",
        "description": """
        Hiring a Fullstack Developer experienced in both React and Node.js.
        Should be comfortable working across the stack and have good knowledge of database integration and deployment.
        """,
    }
]

def embed_jobs(jobs):
    embedded_jobs = []
    for job in jobs:
        embedding = get_embedding(job['description'])
        if embedding is not None:
            job['embedding'] = embedding
            embedded_jobs.append(job)
    return embedded_jobs
def cosine_similarity(vec_a, vec_b):
    a = np.array(vec_a)
    b = np.array(vec_b)
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def recommend_jobs(cv_vector, jobs, top_k=3):
    scored_jobs = []
    for job in jobs:
        score = cosine_similarity(cv_vector, job['embedding'])
        scored_jobs.append((job, score))
    scored_jobs.sort(key=lambda x: x[1], reverse=True)
    return scored_jobs[:top_k]
if __name__ == "__main__":
    path_to_cv = "test.pdf"
    print("🔍 Trích xuất nội dung từ CV...")
    cv_text = extract_text_from_pdf(path_to_cv)
    if not cv_text:
        print("❌ Không đọc được CV.")
        exit()

    print("🔗 Tạo embedding từ nội dung CV...")
    cv_vector = get_embedding(cv_text)
    if cv_vector is None:
        print("❌ Không tạo được embedding CV.")
        exit()

    print("🧠 Tạo embedding cho các job mẫu...")
    embedded_jobs = embed_jobs(test_jobs)

    print("\n✅ Top job phù hợp với CV:")
    recommendations = recommend_jobs(cv_vector, embedded_jobs, top_k=3)
    for job, score in recommendations:
        print(f"- {job['title']} (ID: {job['id']}) | Similarity: {score:.4f}")
