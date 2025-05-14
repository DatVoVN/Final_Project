import os
import logging
from sentence_transformers import SentenceTransformer
import chromadb
import json
from tqdm import tqdm
import re
import unicodedata

# --- CONFIGURATION ---
MODEL_NAME = os.getenv('EMBEDDING_MODEL_NAME', 'paraphrase-multilingual-MiniLM-L12-v2')
CURRENT_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# ĐỔI TÊN THƯ MỤC DB VÀ COLLECTION ĐỂ BUỘC RE-INDEX KHI THAY ĐỔI HNSW:SPACE
CHROMA_PERSIST_DIR = os.path.join(CURRENT_SCRIPT_DIR, "chroma_db_cosine_final_v3")
COLLECTION_NAME = os.getenv('CHROMA_COLLECTION_NAME', "job_postings_collection_cosine_v3")
JOB_DATA_FILE = os.path.join(CURRENT_SCRIPT_DIR, 'job_data.json')
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
embedding_model = None
collection = None
chroma_client = None
original_job_data_list = []

# Ngưỡng cho Cosine Distance (0: giống hệt, 2: khác biệt hoàn toàn).
# Distance < THRESHOLD là chấp nhận được.job
# Ví dụ: 0.7 nghĩa là cosine similarity > 0.3 ((1-0.7)=0.3)
# Nếu muốn similarity > 0.5 (khá liên quan), thì distance < 0.5.
# Nếu muốn similarity > 0.7 (rất liên quan), thì distance < 0.3.
# Bắt đầu với một giá trị tương đối lỏng lẻo, ví dụ 1.0 (similarity > 0).
COSINE_DISTANCE_THRESHOLD = float(os.getenv('COSINE_DISTANCE_THRESHOLD', '0.5')) # << THỬ NGHIỆM GIÁ TRỊ NÀY

# --- HÀM CHUẨN HÓA TÊN THÀNH PHỐ (Giữ nguyên) ---
def remove_vietnamese_diacritics(text):
    if not text or not isinstance(text, str): return ""
    nfkd_form = unicodedata.normalize('NFD', text)
    return "".join([c for c in nfkd_form if not unicodedata.combining(c)])

def normalize_city_name(city_name_raw):
    if not city_name_raw or not isinstance(city_name_raw, str): return ""
    name_no_diacritics = remove_vietnamese_diacritics(city_name_raw.lower().strip())
    if name_no_diacritics in ["ha noi", "hn"]: return "Hanoi"
    if name_no_diacritics in ["ho chi minh", "hcm", "tp hcm", "sai gon", "tp ho chi minh"]: return "Ho Chi Minh City"
    if name_no_diacritics in ["da nang", "dn"]: return "Da Nang"
    return name_no_diacritics.title()

# --- KHỞI TẠO TÀI NGUYÊN ---
def init_chatbot_resources(force_reindex=False):
    global embedding_model, collection, chroma_client
    if embedding_model and collection and chroma_client and not force_reindex:
        logger.info("Chatbot resources already initialized.")
        return True
    logger.info("Initializing chatbot resources...")
    try:
        logger.info(f"Loading SentenceTransformer model: {MODEL_NAME}")
        embedding_model = SentenceTransformer(MODEL_NAME)
        logger.info("SentenceTransformer model loaded successfully.")
        logger.info(f"Initializing ChromaDB client. Persistent path: {CHROMA_PERSIST_DIR}")
        os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
        chroma_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        if force_reindex:
            logger.info(f"Force re-index requested. Deleting existing collection: {COLLECTION_NAME} if it exists.")
            try:
                chroma_client.delete_collection(name=COLLECTION_NAME)
                logger.info(f"Collection '{COLLECTION_NAME}' deleted.")
            except Exception as e:
                logger.info(f"Collection '{COLLECTION_NAME}' not found or could not be deleted: {e}")

        logger.info(f"Getting or creating ChromaDB collection: {COLLECTION_NAME} with hnsw:space=cosine")
        # QUAN TRỌNG: Đặt hnsw:space là cosine
        collection = chroma_client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"} # Sử dụng cosine distance
        )
        logger.info(f"ChromaDB collection '{COLLECTION_NAME}' ready. Record count: {collection.count()}. hnsw:space is cosine.")

        if collection.count() == 0 or force_reindex:
            logger.info("Collection is empty or re-index forced. Attempting to index data...")
            _load_and_index_data_from_json()
        else:
            _load_original_data_for_details()
            logger.info(f"Collection already contains {collection.count()} items. Skipping initial indexing.")
        return True
    except Exception as e:
        logger.error(f"Error initializing chatbot resources: {e}", exc_info=True)
        embedding_model = None; collection = None; chroma_client = None
        return False

# --- TRÍCH XUẤT VÀ XỬ LÝ DỮ LIỆU (Giữ nguyên logic chuẩn hóa city) ---
def _extract_job_info(job_item):
    # (Giữ nguyên như phiên bản trước, đảm bảo company_city được chuẩn hóa bằng normalize_city_name)
    company_info = job_item.get('company', {})
    job_skills_list = job_item.get('languages', [])
    job_skills_str = ", ".join(job_skills_list) if isinstance(job_skills_list, list) else ""
    job_benefits_list = job_item.get('benefits', [])
    job_benefits_str = ", ".join(job_benefits_list) if isinstance(job_benefits_list, list) else ""
    company_city_raw = company_info.get('city', '')
    company_city_normalized = normalize_city_name(company_city_raw)
    extracted = {
        'id': str(job_item.get('_id')), 'title': job_item.get('title', ''),
        'description': job_item.get('description', ''), 'requirements': job_item.get('requirements', ''),
        'salary': str(job_item.get('salary', 'N/A')), 'jobType': job_item.get('jobType', ''),
        'experienceLevel': job_item.get('experienceLevel', ''), 'locationType': job_item.get('locationType', ''),
        'skills': job_skills_str, 'benefits': job_benefits_str,
        'deadline': job_item.get('deadline', ''), 'postedDate': job_item.get('postedDate', ''),
        'vacancies': job_item.get('vacancies', 0), 'company_name': company_info.get('name', ''),
        'company_city': company_city_normalized, 'company_address': company_info.get('address', ''),
        'company_description': company_info.get('description', ''), 'company_overview': company_info.get('overview', '')
    }
    return extracted

def _load_original_data_for_details():
    # (Giữ nguyên)
    global original_job_data_list
    original_job_data_list = []
    try:
        with open(JOB_DATA_FILE, 'r', encoding='utf-8') as f: raw_data = json.load(f)
        job_list_raw = raw_data.get('data', [])
        if job_list_raw:
            original_job_data_list = job_list_raw
            logger.info(f"Loaded {len(original_job_data_list)} original job items for detailed queries.")
        else: logger.warning("No job items found in 'data' array when loading original data.")
    except Exception as e: logger.error(f"Error loading original job data: {e}", exc_info=True)

def _load_and_index_data_from_json():
    # (Giữ nguyên logic, đảm bảo logger.debug cho metadata['company_city'])
    global collection, embedding_model, original_job_data_list
    original_job_data_list = []
    if not embedding_model or not collection: logger.error("Cannot index data: Resources not initialized."); return
    try:
        logger.info(f"Loading job data from: {JOB_DATA_FILE}")
        if not os.path.exists(JOB_DATA_FILE):
            logger.error(f"Job data file '{JOB_DATA_FILE}' not found. Creating sample data.")
            sample_json_data = { "data": [
                { "_id": "681eab6894ab668a41cf514b", "title": "Lập trình viên tự chọn", "description": "Rứa thui", "requirements": "KJA", "salary": 12312, "company": { "name": "Công ty ABCDR", "city": "Hà Nội", "description": "This is description 1", "overview": "This í overview" }, "languages": ["Node.Js"], "benefits": ["Linh hoạt"], "experienceLevel": "Intern", "jobType": "Part-time", "locationType": "Hybrid"},
                { "_id": "681ef440d6f68beac8a9bc92", "title": "tuyển dụng AI", "description": "12121", "requirements": "2eawsa", "salary": 12, "company": { "name": "Công ty TNHH XYZ", "city": "TP Hồ Chí Minh", "description": "This is description 2", "overview": "This is overview 2" }, "languages": ["Python"], "benefits": ["Thưởng"], "experienceLevel": "Fresher", "jobType": "Full-time", "locationType": "Remote" }
            ]}
            with open(JOB_DATA_FILE, 'w', encoding='utf-8') as f: json.dump(sample_json_data, f, ensure_ascii=False, indent=4)
            raw_data = sample_json_data
        else:
            with open(JOB_DATA_FILE, 'r', encoding='utf-8') as f: raw_data = json.load(f)
        job_list_raw = raw_data.get('data', [])
        original_job_data_list = job_list_raw
        if not job_list_raw: logger.info("No job items in JSON 'data' array."); return
        processed_jobs = []; seen_ids = set()
        for item in job_list_raw:
            job_info = _extract_job_info(item)
            if job_info['id'] not in seen_ids: processed_jobs.append(job_info); seen_ids.add(job_info['id'])
            else: logger.warning(f"Duplicate job ID skipped: {job_info['id']}")
        if not processed_jobs: logger.info("No processable jobs. Nothing to index."); return
        documents_to_add = []; metadatas_to_add = []; ids_to_add = []
        for job in processed_jobs:
            combined_text = (
                f"Chức danh: {job['title']}. Mô tả: {job['description']}. Yêu cầu: {job['requirements']}. "
                f"Kỹ năng: {job['skills']}. Phúc lợi: {job['benefits']}. Loại hình: {job['jobType']}. "
                f"Cấp bậc: {job['experienceLevel']}. Hình thức: {job['locationType']}. "
                f"Công ty: {job['company_name']}. Thành phố: {job['company_city']}. "
                f"Địa chỉ: {job['company_address']}. Mô tả công ty: {job['company_description']}. "
                f"Tổng quan công ty: {job['company_overview']}."
            )
            documents_to_add.append(combined_text)
            metadata = {
                'job_id': job['id'], 'title': job['title'], 'salary': str(job['salary']),
                'jobType': job['jobType'], 'experienceLevel': job['experienceLevel'],
                'skills': job['skills'], 'company_name': job['company_name'],
                'company_city': job['company_city'], 'locationType': job['locationType']
            }
            logger.debug(f"Indexing job {job['id']} with metadata_company_city: '{job['company_city']}'")
            metadatas_to_add.append(metadata); ids_to_add.append(job['id'])
        logger.info(f"Starting indexing of {len(processed_jobs)} job postings...")
        if not documents_to_add: logger.info("No documents for embeddings."); return
        logger.info(f"Generating embeddings for {len(documents_to_add)} documents...")
        try:
            embeddings_to_add = []
            embedding_batch_size = 64
            for i in tqdm(range(0, len(documents_to_add), embedding_batch_size), desc="Generating Embeddings"):
                batch_docs = documents_to_add[i:i+embedding_batch_size]
                batch_embeddings = embedding_model.encode(batch_docs).tolist()
                embeddings_to_add.extend(batch_embeddings)
            logger.info("Embeddings generated successfully.")
        except Exception as e: logger.error(f"Error generating embeddings: {e}", exc_info=True); return
        add_batch_size = 100
        num_batches = (len(ids_to_add) + add_batch_size - 1) // add_batch_size
        logger.info(f"Adding {len(ids_to_add)} items to ChromaDB in {num_batches} batches...")
        for i in tqdm(range(0, len(ids_to_add), add_batch_size), desc="Indexing to ChromaDB"):
            try:
                collection.add(
                    ids=ids_to_add[i:i+add_batch_size],
                    embeddings=embeddings_to_add[i:i+add_batch_size],
                    metadatas=metadatas_to_add[i:i+add_batch_size],
                    documents=documents_to_add[i:i+add_batch_size]
                )
            except Exception as e: logger.error(f"Error adding batch {i//add_batch_size + 1} to ChromaDB: {e}", exc_info=True)
        logger.info(f"Indexing complete. Total records in collection: {collection.count()}")
    except FileNotFoundError: logger.error(f"FATAL: Job data file '{JOB_DATA_FILE}' not found.")
    except json.JSONDecodeError: logger.error(f"FATAL: Error decoding JSON from '{JOB_DATA_FILE}'. Check format.")
    except Exception as e: logger.error(f"Unexpected error during data loading/indexing: {e}", exc_info=True)

# --- TRÍCH XUẤT BỘ LỌC TỪ CÂU HỎI (Giữ nguyên logic chuẩn hóa query) ---
def extract_filters_from_query(query):
    # (Giữ nguyên như phiên bản trước, đảm bảo location_found_in_query được chuẩn hóa bằng normalize_city_name nếu cần,
    # hoặc map trực tiếp về dạng chuẩn "Hanoi", "Ho Chi Minh City")
    filters = {}; query_remaining = query.lower()
    location_patterns_map = {
        r"\b(?:(?:ở|tại|khu vực)\s+)?(h[aà] n[oộ]i|hn)\b": "Hanoi",
        r"\b(?:(?:ở|tại|khu vực)\s+)?(h[oồ] ch[ií] minh|hcm|tp\s*hcm|s[aà]i g[oò]n)\b": "Ho Chi Minh City",
        r"\b(?:(?:ở|tại|khu vực)\s+)?([đđ][aà] n[aăẵ]ng|[đđ]n)\b": "Da Nang"
    }
    for pattern, city_standard_name in location_patterns_map.items():
        match = re.search(pattern, query_remaining, re.IGNORECASE)
        if match:
            filters['company_city'] = {"$eq": city_standard_name}
            query_remaining = query_remaining.replace(match.group(0), "").strip()
            logger.info(f"Extracted location filter: {filters['company_city']}")
            break
    experience_map_regex = {
        r"\bintern\b|\bthực tập sinh\b": "Intern", r"\bfresher\b|\bmới tốt nghiệp\b": "Fresher",
        r"\bjunior\b": "Junior", r"\bsenior\b": "Senior",
        r"\blead\b|\btrưởng nhóm\b": "Lead", r"\bmanager\b|\bquản lý\b": "Manager"
    }
    for exp_regex, exp_standard in experience_map_regex.items():
        match = re.search(exp_regex, query_remaining, re.IGNORECASE)
        if match:
            filters['experienceLevel'] = {"$eq": exp_standard}
            query_remaining = query_remaining.replace(match.group(0), "").strip()
            logger.info(f"Extracted experience level filter: {filters['experienceLevel']}")
            break
    job_type_map_regex = {
        r"\bpart-?time\b|\bbán thời gian\b": "Part-time",
        r"\bfull-?time\b|\btoàn thời gian\b": "Full-time"
    }
    for jt_regex, jt_standard in job_type_map_regex.items():
        match = re.search(jt_regex, query_remaining, re.IGNORECASE)
        if match:
            filters['jobType'] = {"$eq": jt_standard}
            query_remaining = query_remaining.replace(match.group(0), "").strip()
            logger.info(f"Extracted job type filter: {filters['jobType']}")
            break
    location_type_map_regex = {
        r"\bremote\b|\btừ xa\b": "Remote", r"\bon-?site\b|\btại văn phòng\b|\btại chỗ\b": "On-site",
        r"\bhybrid\b": "Hybrid"
    }
    for lt_regex, lt_standard in location_type_map_regex.items():
        match = re.search(lt_regex, query_remaining, re.IGNORECASE)
        if match:
            filters['locationType'] = {"$eq": lt_standard}
            query_remaining = query_remaining.replace(match.group(0), "").strip()
            logger.info(f"Extracted location type filter: {filters['locationType']}")
            break
    query_for_embedding = query_remaining.strip() if query_remaining.strip() else query
    if not query_for_embedding.strip() and filters: query_for_embedding = "việc làm"
    logger.info(f"Final query for embedding: '{query_for_embedding}'")
    logger.info(f"Final filters for ChromaDB: {filters}")
    return filters, query_for_embedding

# --- TÌM KIẾM VÀ HIỂN THỊ ---
def search_jobs(user_query, n_results=5):
    if not embedding_model or not collection:
        logger.error("Chatbot resources not ready for search. Please initialize first.")
        return []
    chroma_filters, query_for_embedding = extract_filters_from_query(user_query)
    logger.debug(f"Searching with query_for_embedding: '{query_for_embedding}', filters: {chroma_filters}, n_results: {n_results}")
    try:
        query_embedding = embedding_model.encode(query_for_embedding).tolist()
    except Exception as e: logger.error(f"Error encoding query '{query_for_embedding}': {e}", exc_info=True); return []

    where_clause = None
    if chroma_filters:
        if len(chroma_filters) == 1:
            key, value_dict = list(chroma_filters.items())[0]
            where_clause = {key: value_dict}
        elif len(chroma_filters) > 1:
            where_clause = {"$and": [{k: v} for k, v in chroma_filters.items()]}
    try:
        # Lấy nhiều hơn một chút để có chỗ cho việc lọc ngưỡng
        # Ví dụ: nếu người dùng muốn 5, ta lấy 10-15 rồi lọc
        fetch_n_results = int(n_results) * 3 if where_clause else int(n_results) * 2 # Lấy nhiều hơn nếu có filter hoặc ko
        fetch_n_results = max(fetch_n_results, 10) # Lấy ít nhất 10 để có cơ hội lọc

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=fetch_n_results, # Lấy nhiều hơn để lọc ngưỡng
            where=where_clause,
            include=['metadatas', 'distances']
        )
    except Exception as e:
        logger.error(f"Error querying ChromaDB: {e}", exc_info=True)
        # Thử lại không filter nếu có lỗi
        if where_clause:
            logger.warning("Querying again without filters due to previous error.")
            try: results = collection.query(query_embeddings=[query_embedding], n_results=fetch_n_results, include=['metadatas', 'distances'])
            except Exception as e_no_filter: logger.error(f"Error (no filter attempt): {e_no_filter}", exc_info=True); return []
        else: return []

    if not results or not results.get('ids') or not results['ids'][0]:
        logger.debug(f"No raw results found for query: '{user_query}' with applied filters.")
        return []

    output_jobs = []
    num_raw_results = len(results['ids'][0])
    logger.debug(f"Found {num_raw_results} raw results. Applying distance threshold {COSINE_DISTANCE_THRESHOLD}...")

    for i in range(num_raw_results):
        meta = results['metadatas'][0][i]
        dist = results['distances'][0][i] # Đây là Cosine Distance (0=giống, 2=khác)

        if dist is not None and dist >= COSINE_DISTANCE_THRESHOLD: # dist LỚN HƠN hoặc bằng ngưỡng thì BỎ QUA
            logger.debug(f"Job ID {meta.get('job_id', 'N/A')} (dist: {dist:.4f}) skipped, above threshold {COSINE_DISTANCE_THRESHOLD}.")
            continue

        relevance_score_display = round(1 - dist, 4) # Similarity = 1 - Cosine Distance

        job_info = {
            'id': meta.get('job_id', 'N/A'), 'title': meta.get('title', 'N/A'),
            'company_name': meta.get('company_name', 'N/A'), 'company_city': meta.get('company_city', 'N/A'),
            'salary': meta.get('salary', 'N/A'), 'skills': meta.get('skills', 'N/A'),
            'jobType': meta.get('jobType', 'N/A'), 'experienceLevel': meta.get('experienceLevel', 'N/A'),
            'locationType': meta.get('locationType', 'N/A'),
            'relevance_score': relevance_score_display, # Similarity score
            '_distance': round(dist, 4) # Cosine distance gốc
        }
        output_jobs.append(job_info)
        if len(output_jobs) >= int(n_results): # Dừng nếu đã đủ số lượng kết quả mong muốn
            break

    logger.info(f"Returning {len(output_jobs)} jobs after applying distance threshold.")
    return output_jobs


def display_jobs(jobs):
    # (Giữ nguyên, thêm hiển thị _distance)
    if not jobs:
        print("\n>> Rất tiếc, không tìm thấy công việc nào phù hợp với yêu cầu của bạn (sau khi lọc theo độ liên quan).")
        return
    print(f"\n>> Đã tìm thấy {len(jobs)} công việc phù hợp:")
    for i, job in enumerate(jobs):
        print("-" * 40)
        print(f"  {i+1}. Chức danh: {job['title']}")
        print(f"     Công ty: {job['company_name']} ({job['company_city']})")
        print(f"     Lương: {job['salary']}")
        print(f"     Kỹ năng: {job['skills']}")
        print(f"     Loại hình: {job['jobType']} - Cấp bậc: {job['experienceLevel']}")
        print(f"     Hình thức: {job['locationType']}")
        print(f"     ID Job: {job['id']}")
        print(f"     Độ phù hợp: {job['relevance_score']} (Distance: {job.get('_distance', 'N/A')})") # Hiển thị cả distance
    print("-" * 40)

def find_job_by_id_in_original_data(job_id):
    # (Giữ nguyên)
    global original_job_data_list
    if not original_job_data_list: _load_original_data_for_details()
    for job_item in original_job_data_list:
        if str(job_item.get('_id')) == str(job_id): return job_item
    return None

def display_detailed_job_info(job_item_original):
    # (Giữ nguyên)
    if not job_item_original: print("Không tìm thấy thông tin chi tiết cho job này."); return
    job_display_info = _extract_job_info(job_item_original)
    print("\n--- Chi Tiết Công Việc ---")
    print(f"ID: {job_display_info['id']}")
    print(f"Chức danh: {job_display_info['title']}")
    print(f"Mô tả: {job_display_info['description']}")
    print(f"Yêu cầu: {job_display_info['requirements']}")
    print(f"Mức lương: {job_display_info['salary']}")
    deadline_str = job_display_info.get('deadline', 'N/A')
    print(f"Hạn nộp: {deadline_str.split('T')[0] if deadline_str and 'T' in deadline_str else deadline_str}")
    posted_date_str = job_display_info.get('postedDate', 'N/A')
    print(f"Ngày đăng: {posted_date_str.split('T')[0] if posted_date_str and 'T' in posted_date_str else posted_date_str}")
    print(f"Loại hình: {job_display_info['jobType']} - Cấp bậc: {job_display_info['experienceLevel']}")
    print(f"Hình thức làm việc: {job_display_info['locationType']}")
    print(f"Kỹ năng: {job_display_info['skills']}")
    print(f"Phúc lợi: {job_display_info['benefits']}")
    print(f"Số lượng tuyển: {job_display_info.get('vacancies', 'N/A')}")
    company_info = job_item_original.get('company', {})
    print("\n--- Thông Tin Công Ty ---")
    print(f"Tên công ty: {company_info.get('name')}")
    print(f"Thành phố: {job_display_info['company_city']}")
    print(f"Địa chỉ: {company_info.get('address')}")
    print(f"Mô tả công ty: {company_info.get('description')}")
    print(f"Email công ty: {company_info.get('email', 'N/A')}")
    print(f"Quy mô: {company_info.get('companySize', 'N/A')}")
    if company_info.get('workingDays'): print(f"Ngày làm việc: Từ {company_info['workingDays'].get('from')} đến {company_info['workingDays'].get('to')}")
    print(f"Chính sách OT: {company_info.get('overtimePolicy', 'N/A')}")
    print("-" * 25)

# --- VÒNG LẶP CHATBOT CHÍNH (Giữ nguyên) ---
def chatbot_cli():
    # (Giữ nguyên)
    print(f"--- Job Chatbot CLI (Cosine Distance, Threshold: {COSINE_DISTANCE_THRESHOLD}) ---")
    print("Đang khởi tạo tài nguyên, vui lòng chờ...")
    force_reindex_on_start = False
    if not init_chatbot_resources(force_reindex=force_reindex_on_start):
        print("Lỗi nghiêm trọng: Không thể khởi tạo chatbot. Vui lòng kiểm tra log.")
        return
    print("\nJob Chatbot đã sẵn sàng!")
    print("Gõ 'exit' để thoát, 'reindex' để làm mới dữ liệu.")
    print("Ví dụ: 'việc làm python ở hà nội cho fresher', 'tìm job intern remote', 'chi tiết job <ID>'")
    while True:
        try:
            user_input = input("\nBạn muốn hỏi gì? > ").strip()
            if not user_input: continue
            if user_input.lower() == 'exit': print("Cảm ơn bạn đã sử dụng chatbot. Tạm biệt!"); break
            if user_input.lower() == 'reindex':
                confirm_reindex = input("Bạn chắc chắn muốn xóa và index lại toàn bộ dữ liệu không? (yes/no): ").lower().strip()
                if confirm_reindex == 'yes':
                    print("Đang thực hiện re-index...")
                    if init_chatbot_resources(force_reindex=True): print("Re-index hoàn tất!")
                    else: print("Re-index thất bại. Vui lòng kiểm tra log.")
                else: print("Hủy bỏ re-index.")
                continue
            id_match = re.search(r"(?:chi tiết|thông tin)\s+(?:job|công việc|cv)\s*(?:id)?\s*([0-9a-fA-F]{24})", user_input, re.IGNORECASE)
            if id_match:
                job_id_to_find = id_match.group(1)
                print(f"Đang tìm thông tin chi tiết cho Job ID: {job_id_to_find}")
                detailed_job = find_job_by_id_in_original_data(job_id_to_find)
                display_detailed_job_info(detailed_job)
                continue
            num_results = 5
            found_jobs = search_jobs(user_input, n_results=num_results)
            display_jobs(found_jobs)
        except KeyboardInterrupt: print("\nĐã nhận tín hiệu thoát. Tạm biệt!"); break
        except Exception as e:
            logger.error(f"Lỗi không xác định trong vòng lặp chatbot: {e}", exc_info=True)
            print(f"Đã xảy ra lỗi: {e}. Vui lòng thử lại hoặc kiểm tra log.")

if __name__ == "__main__":
    # Bật logger.DEBUG để xem chi tiết quá trình index và filter
    # logger.setLevel(logging.DEBUG)
    # logging.getLogger("chromadb").setLevel(logging.WARNING) # Tắt bớt log của chromadb nếu quá nhiều
    # logging.getLogger("sentence_transformers").setLevel(logging.WARNING)

    chatbot_cli()