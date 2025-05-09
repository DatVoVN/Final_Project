import json
import sys
import re
import io
import os
from fuzzywuzzy import fuzz, process # Import thư viện fuzzywuzzy

# Đảm bảo output hỗ trợ UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# --- Constants ---
DATA_FILE = "jobs_data.json"
COMPANY_QUERY_THRESHOLD = 75 # Ngưỡng nhận diện câu hỏi về công ty
FUZZY_JOB_MATCH_THRESHOLD = 70 # Ngưỡng fuzzy matching cho tiêu đề/yêu cầu job
MIN_JOB_SCORE_THRESHOLD = 45   # Điểm số tối thiểu để job được hiển thị

# --- Từ điển từ đồng nghĩa cho địa điểm (Tùy chọn nhưng hữu ích) ---
LOCATION_SYNONYMS = {
    "hcm": "tp. hồ chí minh", "ho chi minh city": "tp. hồ chí minh", "saigon": "tp. hồ chí minh", "sg": "tp. hồ chí minh",
    "hn": "hà nội", "hanoi": "hà nội",
    "dn": "đà nẵng", "danang": "đà nẵng",
    "remote": "remote", "từ xa": "remote",
    "bình dương": "bình dương", "bd": "bình dương"
}

# --- Hàm chuẩn hóa địa điểm ---
def normalize_location(location_str):
    if not isinstance(location_str, str): # Xử lý trường hợp location không phải string
        return ""
    location_lower = location_str.lower().strip()
    return LOCATION_SYNONYMS.get(location_lower, location_lower)

# --- Hàm tải dữ liệu ---
def load_companies_data(filename=DATA_FILE):
    """Tải dữ liệu công ty và jobs từ file JSON."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    filepath = os.path.join(current_dir, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"Đã tải thành công dữ liệu của {len(data)} công ty từ {filepath}")
        # Tạo danh sách tất cả địa điểm được biết đến để chuẩn hóa
        all_locations = set()
        for company in data:
            if isinstance(company.get('locations'), list):
                 all_locations.update(normalize_location(loc) for loc in company.get('locations', []))
            for job in company.get('jobs', []):
                all_locations.add(normalize_location(job.get('location','')))
        return data, all_locations # Trả về cả dữ liệu và tập hợp địa điểm
    except FileNotFoundError:
        print(f"Lỗi: Không tìm thấy file {filepath}")
        return None, set()
    except json.JSONDecodeError:
        print(f"Lỗi: File {filepath} không phải là định dạng JSON hợp lệ.")
        return None, set()
    except Exception as e:
        print(f"Lỗi không xác định khi tải {filepath}: {e}")
        return None, set()

# --- Hàm xử lý câu hỏi về một công ty cụ thể ---
def handle_company_query(query, companies_data):
    """Tìm công ty và trả lời câu hỏi về thông tin của công ty đó."""
    query_lower = query.lower()
    target_company = None
    best_score = 0

    # 1. Tìm công ty được đề cập trong query
    company_names = [c.get('company_name', '') for c in companies_data]
    company_match, score = process.extractOne(query_lower, company_names, scorer=fuzz.token_set_ratio)

    if score >= COMPANY_QUERY_THRESHOLD:
        # Tìm đối tượng company tương ứng
        for company in companies_data:
            if company.get('company_name', '') == company_match:
                target_company = company
                best_score = score
                break
    else:
         # Thử tìm theo company_id nếu có dạng Cxxx
         company_id_match = re.search(r'\b(C\d{3})\b', query, re.IGNORECASE)
         if company_id_match:
              specific_id = company_id_match.group(1).upper()
              for company in companies_data:
                   if company.get('company_id','').upper() == specific_id:
                        target_company = company
                        best_score = 100 # Khớp ID là chắc chắn nhất
                        break

    if not target_company:
        return None # Không tìm thấy công ty nào được đề cập rõ ràng

    # 2. Xác định người dùng hỏi về thông tin gì của công ty đó
    company_topics = {
        "giới thiệu": "company_description", "mô tả": "company_description", "về công ty": "company_description",
        "ngành": "industry", "lĩnh vực": "industry",
        "website": "website", "trang web": "website",
        "văn hóa": "culture", "môi trường làm việc": "culture",
        "phúc lợi": "benefits_summary", "chế độ": "benefits_summary", "đãi ngộ": "benefits_summary",
        "địa chỉ": "locations", "văn phòng": "locations", "chi nhánh": "locations",
        # Thêm các topic khác nếu cần
    }

    # Tìm topic khớp nhất trong phần còn lại của query (hoặc cả query nếu không có tên cty rõ ràng)
    best_topic_match, topic_score = process.extractOne(query_lower, company_topics.keys(), scorer=fuzz.partial_ratio)

    response = f"Thông tin về công ty **{target_company.get('company_name', 'N/A')}**:\n"

    # Ưu tiên trả lời theo topic nếu khớp đủ tốt
    if topic_score >= 70:
        topic_key = company_topics[best_topic_match]
        answer = target_company.get(topic_key)
        if answer:
            response += f"- {best_topic_match.capitalize()}: "
            if isinstance(answer, list):
                response += ", ".join(map(str, answer)) # Nối các phần tử list
            else:
                response += str(answer)
            return response
        else:
            return response + f"Xin lỗi, tôi chưa có thông tin về '{best_topic_match}' của công ty này."

    # Nếu không khớp topic nào rõ ràng, trả về mô tả chung nếu chỉ hỏi tên công ty
    elif best_score >= 85: # Nếu độ khớp tên công ty cao
         description = target_company.get("company_description")
         if description:
              return response + f"- Giới thiệu: {description}"

    # Nếu có vẻ hỏi về công ty nhưng không rõ hỏi gì cụ thể
    if best_score >= COMPANY_QUERY_THRESHOLD:
         return response + "Bạn muốn biết thông tin cụ thể gì về công ty này (ví dụ: văn hóa, phúc lợi, địa chỉ)?"

    return None # Không đủ chắc chắn là hỏi về công ty này

# --- Hàm tìm kiếm công việc (trong cấu trúc mới) ---
def find_jobs(query, companies_data, all_locations):
    """Tìm kiếm công việc trên tất cả các công ty."""
    query_lower = query.lower()
    matching_jobs = []

    # Kiểm tra xem query có đề cập đến công ty cụ thể không
    target_company_name = None
    company_names = [c.get('company_name', '') for c in companies_data]
    company_match, company_score = process.extractOne(query_lower, company_names, scorer=fuzz.token_set_ratio)
    if company_score >= COMPANY_QUERY_THRESHOLD:
        target_company_name = company_match
        print(f"(Searching within company: {target_company_name})") # Debugging info

    # Kiểm tra ID job cụ thể Jxxx
    job_id_match = re.search(r'\b(J\d{3})\b', query, re.IGNORECASE)
    specific_job_id = job_id_match.group(1).upper() if job_id_match else None

    # Xác định địa điểm trong query
    normalized_query_location = None
    query_keywords_for_loc = re.findall(r'\b\w+\b', query_lower)
    for word in query_keywords_for_loc:
        normalized = normalize_location(word)
        if normalized in all_locations: # Chỉ xem xét nếu là địa điểm đã biết
            normalized_query_location = normalized
            break

    # Duyệt qua từng công ty và từng job
    for company in companies_data:
        company_name = company.get('company_name', 'N/A')

        # Nếu đang tìm trong công ty cụ thể, bỏ qua các công ty khác
        if target_company_name and company_name != target_company_name:
            continue

        for job in company.get('jobs', []):
            job_id = job.get('job_id', '').upper()
            title = job.get('title', '')
            description = job.get('description', '')
            requirements_list = job.get('requirements', [])
            requirements_text = ' '.join(requirements_list)
            location = job.get('location', '')
            normalized_job_location = normalize_location(location)

            # Nếu tìm theo ID cụ thể, chỉ khớp ID đó
            if specific_job_id and job_id != specific_job_id:
                continue
            # Nếu tìm theo ID cụ thể và khớp, gán điểm rất cao
            if specific_job_id and job_id == specific_job_id:
                 job_score = 1000 # Điểm cao nhất để ưu tiên ID
            else:
                # Tính điểm fuzzy matching nếu không tìm theo ID
                job_score = 0
                # Điểm theo tiêu đề (quan trọng nhất)
                title_score = fuzz.token_set_ratio(query_lower, title.lower())
                if title_score > FUZZY_JOB_MATCH_THRESHOLD:
                    job_score += title_score * 2.0

                # Điểm theo yêu cầu
                req_score = fuzz.token_set_ratio(query_lower, requirements_text.lower())
                if req_score > FUZZY_JOB_MATCH_THRESHOLD - 10:
                    job_score += req_score * 1.5

                # Điểm theo mô tả
                desc_score = fuzz.partial_ratio(query_lower, description.lower())
                job_score += desc_score * 0.5

                # Cộng điểm nếu địa điểm khớp
                if normalized_query_location and normalized_job_location == normalized_query_location:
                    job_score += 50
                elif normalized_query_location and fuzz.ratio(normalized_query_location, normalized_job_location) > 85:
                     job_score += 30 # Gần giống

                # Cộng điểm nếu tên công ty khớp (trường hợp tìm chung nhưng query có tên cty)
                if not target_company_name and fuzz.partial_ratio(company_name.lower(), query_lower) > 80:
                     job_score += 20

            # Chỉ thêm job nếu điểm số đủ cao (hoặc khớp ID)
            if job_score >= MIN_JOB_SCORE_THRESHOLD:
                matching_jobs.append({
                    "job": job,
                    "company_name": company_name, # Thêm tên công ty vào kết quả
                    "score": job_score
                })
            # Nếu đã tìm thấy job theo ID cụ thể, dừng tìm kiếm
            if specific_job_id and job_id == specific_job_id:
                 break # Dừng vòng lặp job
        # Nếu đã tìm thấy job theo ID cụ thể, dừng tìm kiếm công ty
        if specific_job_id and any(j['job'].get('job_id','').upper() == specific_job_id for j in matching_jobs):
             break # Dừng vòng lặp company

    # Sắp xếp các job tìm được theo điểm số giảm dần
    matching_jobs.sort(key=lambda x: x["score"], reverse=True)
    return matching_jobs

# --- Hàm định dạng câu trả lời công việc ---
def format_job_response(jobs_found_with_scores, query):
    """Định dạng danh sách công việc tìm được thành câu trả lời."""
    if not jobs_found_with_scores:
        return "Xin lỗi, tôi không tìm thấy công việc nào có điểm phù hợp cao với yêu cầu của bạn. Bạn có thể thử lại với từ khóa khác."

    jobs_count = len(jobs_found_with_scores)
    response = f"Dựa trên '{query}', tôi tìm thấy {jobs_count} công việc có vẻ phù hợp nhất (sắp xếp theo độ liên quan):\n\n"
    query_lower = query.lower()

    # Xác định xem có nên hiển thị yêu cầu/lương dựa trên câu hỏi không
    show_requirements = jobs_count == 1 or any(k in query_lower for k in ["yêu cầu", "requirement", "cần gì", "kỹ năng", "kinh nghiệm", "chi tiết"])
    show_salary = any(k in query_lower for k in ["lương", "salary", "thu nhập", "range", "offer"])

    for i, item in enumerate(jobs_found_with_scores):
        job = item["job"]
        company_name = item["company_name"]
        score = item["score"]
        job_id = job.get('job_id', 'N/A')

        response += f"--- Vị trí {i+1} ---\n"
        response += f"Công ty: **{company_name}**\n" # Hiển thị tên công ty
        response += f"ID Job: {job_id}\n"
        # response += f"[Score: {score:.0f}]\n" # Bỏ comment nếu muốn xem điểm
        response += f"Chức danh: {job.get('title', 'N/A')}\n"
        response += f"Địa điểm: {job.get('location', 'N/A')}\n"
        response += f"Loại hình: {job.get('type', 'N/A')}\n"

        if show_salary or "lương" in job.get('title', '').lower():
             response += f"Mức lương: {job.get('salary_range', 'Thỏa thuận')}\n"

        # Hiển thị mô tả ngắn gọn nếu không hỏi chi tiết
        if not show_requirements:
            response += f"Mô tả: {job.get('description', 'N/A')[:100]}...\n" # Hiển thị 100 ký tự đầu

        # Hiển thị yêu cầu nếu hỏi chi tiết hoặc chỉ có 1 kết quả
        if show_requirements:
            response += f"Mô tả: {job.get('description', 'N/A')}\n"
            response += "Yêu cầu:\n"
            requirements = job.get('requirements', [])
            if requirements:
                for req in requirements:
                    response += f"- {req}\n"
            else:
                response += "- Chưa cập nhật yêu cầu chi tiết.\n"
        response += "\n"

        # Giới hạn số lượng hiển thị
        if i >= 4 and jobs_count > 5 :
            response += f"... và {jobs_count - 5} vị trí khác. Bạn có thể hỏi cụ thể hơn (ví dụ: 'chi tiết job {jobs_found_with_scores[0]['job'].get('job_id', '...')}')\n"
            break

    if jobs_count > 0:
        job_id_example = jobs_found_with_scores[0]['job'].get('job_id', '...')
        response += f"\nBạn muốn xem 'chi tiết job {job_id_example}' không?"
        if jobs_count > 1:
             job_id_example_2 = jobs_found_with_scores[1]['job'].get('job_id','...')
             if job_id_example_2 != '...':
                 response += f" Hoặc hỏi về job ID khác như {job_id_example_2}."

    return response

# --- Hàm chính chạy chatbot ---
def run_chatbot():
    """Khởi chạy vòng lặp chính của chatbot."""
    companies_data, all_locations = load_companies_data()

    if not companies_data:
        print("Lỗi: Không thể tải dữ liệu. Chatbot không thể khởi động.")
        return

    print("\n--- Chatbot Tuyển dụng Đa Công ty ---")
    print("Xin chào! Tôi có thể giúp gì cho bạn?")
    print("Bạn có thể hỏi về các công ty (vd: 'thông tin công ty ABC Solutions', 'phúc lợi MegaMart Online')")
    print("hoặc tìm kiếm việc làm (vd: 'tìm việc python', 'việc làm Reactjs ở HCM', 'job J007').")
    print("Gõ 'quit' hoặc 'exit' để thoát.")

    while True:
        try:
            user_input = input("> Bạn: ")
        except EOFError:
            print("\nChatbot: Tạm biệt!")
            break
        if user_input.lower() in ['quit', 'exit', 'thoát', 'nghỉ', 'bye', 'tam biet']:
            print("Chatbot: Tạm biệt! Hẹn gặp lại.")
            break
        if not user_input.strip():
             continue

        response = "Chatbot: "
        # 1. Ưu tiên kiểm tra câu hỏi về công ty cụ thể
        # (Kiểm tra các từ khóa thường gặp hoặc tên công ty)
        is_company_query = False
        company_keywords = ["công ty", "về", "thông tin", "phúc lợi", "văn hóa", "địa chỉ", "quy trình", "website"]
        if any(fuzz.partial_ratio(keyword, user_input.lower()) > 85 for keyword in company_keywords):
             is_company_query = True
        else:
             # Check if a known company name is mentioned clearly
             company_names = [c.get('company_name', '') for c in companies_data]
             match, score = process.extractOne(user_input.lower(), company_names, scorer=fuzz.partial_ratio)
             if score > 85: # Nếu tên công ty xuất hiện khá rõ ràng trong câu hỏi
                  is_company_query = True


        company_response = None
        if is_company_query:
            company_response = handle_company_query(user_input, companies_data)

        if company_response:
            response += company_response
        else:
            # 2. Nếu không phải hỏi về công ty (hoặc xử lý không thành công), thì tìm kiếm công việc
            found_jobs_with_scores = find_jobs(user_input, companies_data, all_locations)
            response += format_job_response(found_jobs_with_scores, user_input)

        print(response)

# --- Chạy chương trình ---
if __name__ == "__main__":
    run_chatbot()