import os
import re
import json
import logging
import unicodedata
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings

# ******** CẤU HÌNH ********
MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_db_cosme_final_v4")
JOB_DATA_FILE = os.path.join(BASE_DIR, "job_data.json")
COSINE_THRESHOLD = 0.25

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(BASE_DIR, "chatbot.log"), encoding="utf-8"),
        logging.StreamHandler()
    ],
    encoding="utf-8"
)

# ******** TIỆN ÍCH XỬ LÝ TIẾNG VIỆT ********
def normalize_text(text: str) -> str:
    """Chuẩn hóa văn bản tiếng Việt"""
    if not text:
        return ""

    text = unicodedata.normalize("NFC", text)
    text = re.sub(r"\s+", " ", text).strip().lower()

    # Bảng đồ ký tự tiếng Việt
    char_map = {
        "à": "a", "á": "a", "ả": "a", "ã": "a", "ạ": "a",
        "ă": "a", "ằ": "a", "ắ": "a", "ẳ": "a", "ẵ": "a", "ặ": "a",
        "â": "a", "ầ": "a", "ấ": "a", "ẩ": "a", "ẫ": "a", "ậ": "a",
        "đ": "d",
        "è": "e", "é": "e", "ẻ": "e", "ẽ": "e", "ẹ": "e",
        "ê": "e", "ề": "e", "ế": "e", "ể": "e", "ễ": "e", "ệ": "e",
        "ì": "i", "í": "i", "ỉ": "i", "ĩ": "i", "ị": "i",
        "ò": "o", "ó": "o", "ỏ": "o", "õ": "o", "ọ": "o",
        "ô": "o", "ồ": "o", "ố": "o", "ổ": "o", "ỗ": "o", "ộ": "o",
        "ơ": "o", "ờ": "o", "ớ": "o", "ở": "o", "ỡ": "o", "ợ": "o",
        "ù": "u", "ú": "u", "ủ": "u", "ũ": "u", "ụ": "u",
        "ư": "u", "ừ": "u", "ứ": "u", "ử": "u", "ữ": "u", "ự": "u",
        "ỳ": "y", "ý": "y", "ỷ": "y", "ỹ": "y", "ỵ": "y",
    }

    return "".join(char_map.get(c, c) for c in text)

# ******** LỚP XỬ LÝ DỮ LIỆU ********
class JobProcessor:
    def __init__(self):
        self.embedder = SentenceTransformer(MODEL_NAME)
        self.client = chromadb.PersistentClient(
            path=CHROMA_DIR,
            settings=Settings(allow_reset=True, anonymized_telemetry=False)
        )
        self.collection = self.client.get_or_create_collection(
            name="jobs",
            metadata={"hnsw:space": "cosine"}
        )

    def _process_job(self, job: Dict) -> Dict:
        """Chuẩn hóa dữ liệu job"""
        company = job.get("company", {})
        skills = [s.replace(".", " ").strip() for s in job.get("languages", [])]

        return {
            "id": str(job["_id"]),
            "title": normalize_text(job.get("title", "")),
            "description": normalize_text(job.get("description", "")),
            "skills": normalize_text(" ".join(skills)),
            "city": normalize_text(company.get("city", "")),
            "job_type": normalize_text(job.get("jobType", "")),
            "experience": normalize_text(job.get("experienceLevel", "")),
            "salary": str(job.get("salary", "")),
            "full_text": normalize_text(
                f"{job.get('title', '')} "
                f"{job.get('description', '')} "
                f"{' '.join(skills)} "
                f"{company.get('name', '')}"
            )
        }

    def load_data(self):
        """Tải và index dữ liệu"""
        try:
            if not os.path.exists(JOB_DATA_FILE):
                raise FileNotFoundError(f"Không tìm thấy file dữ liệu: {JOB_DATA_FILE}")

            with open(JOB_DATA_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)["data"]

            processed = [self._process_job(job) for job in data]

            # Tạo embeddings
            embeddings = self.embedder.encode(
                [job["full_text"] for job in processed],
                show_progress_bar=True,
                batch_size=32
            )

            # Thêm vào ChromaDB
            self.collection.add(
                ids=[job["id"] for job in processed],
                embeddings=embeddings.tolist(),
                metadatas=[{k: v for k, v in job.items() if k != "full_text"} for job in processed]
            )

            logging.info(f"Đã index {len(processed)} công việc")
            return True
        except Exception as e:
            logging.error(f"Lỗi xử lý dữ liệu: {str(e)}")
            return False

# ******** LỚP CHATBOT ********
class JobChatbot:
    def __init__(self):
        self.processor = JobProcessor()
        self._init_system()

    def _init_system(self):
        """Khởi tạo hệ thống"""
        if not self.processor.load_data():
            raise RuntimeError("Không thể khởi tạo hệ thống")

    def _parse_query(self, query: str) -> Dict:
        """Phân tích truy vấn tự nhiên"""
        query = normalize_text(query)
        filters = {}

        # Phát hiện địa điểm
        location_map = {
            r"\b(ha no[iì]|hn)\b": "hà nội",
            r"\b(hcm|ho chi minh|tp hcm)\b": "hồ chí minh",
            r"\b(da nang|dn)\b": "đà nẵng"
        }

        for pattern, city in location_map.items():
            if re.search(pattern, query):
                filters["city"] = city
                query = re.sub(pattern, "", query)
                break

        # Phát hiện kinh nghiệm
        exp_map = {
            r"\bintern\b": "intern",
            r"\bfresher\b": "fresher",
            r"\bjunior\b": "junior",
            r"\bsenior\b": "senior"
        }

        for pattern, exp in exp_map.items():
            if re.search(pattern, query):
                filters["experience"] = exp
                query = re.sub(pattern, "", query)
                break

        return {"filters": filters, "clean_query": query.strip()}

    def search(self, query: str, n: int = 5) -> List[Dict]:
        """Tìm kiếm công việc"""
        try:
            parsed = self._parse_query(query)
            results = self.processor.collection.query(
                query_texts=[parsed["clean_query"]],
                n_results=n*3,
                where=parsed["filters"] or None
            )

            output = []
            for meta, dist in zip(results["metadatas"][0], results["distances"][0]):
                if dist <= COSINE_THRESHOLD:
                    output.append({
                        "id": meta["id"],
                        "title": meta["title"].title(),
                        "company": meta.get("company_name", "").title(),
                        "city": meta["city"].title(),
                        "skills": meta["skills"].title(),
                        "salary": meta["salary"],
                        "score": round(1 - dist, 2)
                    })

            return sorted(output[:n], key=lambda x: -x["score"])
        except Exception as e:
            logging.error(f"Lỗi tìm kiếm: {str(e)}")
            return []

# ******** GIAO DIỆN NGƯỜI DÙNG ********
def main():
    print("""
    ***************************************
    *   HỆ THỐNG TÌM KIẾM VIỆC LÀM THÔNG MINH   *
    ***************************************
    """)

    try:
        chatbot = JobChatbot()
        print("Hệ thống đã sẵn sàng! Nhập 'exit' để thoát.\n")

        while True:
            query = input("Nhập từ khóa tìm kiếm: ").strip()
            if query.lower() == "exit":
                break

            results = chatbot.search(query)

            if not results:
                print("\nKhông tìm thấy kết quả phù hợp")
                continue

            print(f"\nTìm thấy {len(results)} kết quả:")
            for idx, job in enumerate(results, 1):
                print(f"{idx}. {job['title']}")
                print(f"   Công ty: {job['company']}")
                print(f"   Địa điểm: {job['city']}")
                print(f"   Kỹ năng: {job['skills']}")
                print(f"   Mức lương: {job['salary']}")
                print(f"   Độ phù hợp: {job['score']}\n")

    except Exception as e:
        logging.error(f"Lỗi hệ thống: {str(e)}")
        print("Đã xảy ra lỗi nghiêm trọng! Vui lòng kiểm tra file log.")

if __name__ == "__main__":
    main()