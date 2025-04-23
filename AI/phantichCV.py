import spacy
from spacy.matcher import PhraseMatcher, Matcher
import re
import fitz  # PyMuPDF
from docx import Document
import os
from collections import Counter
import json
try:
    nlp = spacy.load('en_core_web_sm')
    print("Loaded spaCy model.")
except OSError:
    print("spaCy model not found. Please download: python -m spacy download en_core_web_sm (or en_core_web_md)")
    exit()

# DANH SÁCH KỸ NĂNG CẦN TÌM (CẦN RẤT CHI TIẾT VÀ ĐẦY ĐỦ)
IT_SKILLS = [
    # Programming Languages
    "python", "java", "c++", "c#", ".net", "javascript", "typescript", "php", "ruby", "go", "swift", "kotlin", "scala", "rust",
    # Frontend Frameworks/Libraries
    "react", "angular", "vue", "vue.js", "jquery", "svelte", "next.js", "nuxt.js",
    # Backend Frameworks/Libraries
    "node.js", "express.js", "django", "flask", "spring", "spring boot", "ruby on rails", "laravel", "asp.net",
    # Web Technologies
    "html", "html5", "css", "css3", "sass", "less", "bootstrap", "tailwind",
    # Databases
    "sql", "nosql", "mysql", "postgresql", "sqlite", "microsoft sql server", "oracle", "mongodb", "redis", "cassandra", "elasticsearch", "dynamodb",
    # Cloud Platforms
    "aws", "amazon web services", "azure", "microsoft azure", "gcp", "google cloud platform", "heroku", "digitalocean", "oracle cloud", "ibm cloud",
    # Cloud Services (examples)
    "ec2", "s3", "lambda", "rds", "ecs", "eks", "vpc", "azure vm", "azure functions", "app service", "cosmos db", "gce", "gke", "cloud functions", "cloud sql",
    # DevOps & Infrastructure
    "docker", "kubernetes", "k8s", "terraform", "ansible", "jenkins", "gitlab ci", "github actions", "circleci", "prometheus", "grafana", "datadog", "nginx", "apache", "linux", "unix", "bash", "powershell",
    # Version Control
    "git", "github", "gitlab", "bitbucket", "svn",
    # Methodologies & Tools
    "agile", "scrum", "kanban", "jira", "confluence", "trello",
    # Data Science & ML/AI
    "machine learning", "deep learning", "artificial intelligence", "ai", "data analysis", "data science", "data engineering", "pandas", "numpy", "scipy", "scikit-learn", "tensorflow", "keras", "pytorch", "spark", "hadoop", "kafka", "data warehouse", "etl", "power bi", "tableau",
    # Testing
    "unit testing", "integration testing", "e2e testing", "jest", "mocha", "chai", "selenium", "cypress", "junit", "pytest",
    # Security
    "cybersecurity", "network security", "penetration testing", "owasp", "encryption", "authentication", "authorization",
    # API & Microservices
    "api", "rest", "restful", "graphql", "soap", "microservices", "message queue", "rabbitmq", "kafka",
    # Mobile
    "android", "ios", "react native", "flutter", "swiftui", "jetpack compose",
    # Others
    "oop", "design patterns", "data structures", "algorithms", "system design"
]# Setup PhraseMatcher cho Skills
skill_patterns = [nlp.make_doc(skill.lower()) for skill in IT_SKILLS]
skill_matcher = PhraseMatcher(nlp.vocab, attr='LOWER')
skill_matcher.add("IT_SKILLS", skill_patterns)

JOB_ROLES_DB_FILE = 'job_roles_db.json'

DEFAULT_JOB_ROLES_DB = [
    {
        "role_name": "Backend Developer",
        "required_skills": ["python", "java", "c#", ".net", "php", "ruby", "go", "sql", "api", "rest", "git", "docker"], # Dùng OR logic ở đây (ít nhất 1)
        "preferred_skills": ["nosql", "microservices", "message queue", "cloud", "kubernetes", "linux"],
        "keywords": ["server-side", "database", "scalability", "performance", "logic", "api development"],
        "experience_keywords": ["backend", "server", "api developer"], # Từ khóa trong kinh nghiệm làm việc
        "min_experience_years": 1
    },
    {
        "role_name": "Frontend Developer",
        "required_skills": ["html", "css", "javascript", "react", "angular", "vue", "git", "api"],
        "preferred_skills": ["typescript", "sass", "less", "webpack", "jest", "ui/ux", "responsive design"],
        "keywords": ["user interface", "ui", "ux", "client-side", "web application", "component"],
         "experience_keywords": ["frontend", "ui developer", "web developer", "javascript developer"],
        "min_experience_years": 1
    },
    {
        "role_name": "Data Scientist",
        "required_skills": ["python", "r", "sql", "machine learning", "statistics", "data analysis", "pandas", "numpy", "scikit-learn"],
        "preferred_skills": ["deep learning", "tensorflow", "pytorch", "spark", "hadoop", "cloud", "data visualization", "tableau", "power bi"],
        "keywords": ["modeling", "prediction", "algorithms", "statistical analysis", "a/b testing", "insights"],
        "experience_keywords": ["data scientist", "machine learning engineer", "researcher"],
        "min_experience_years": 2 # Thường yêu cầu kinh nghiệm hơn
    },
    {
         "role_name": "DevOps Engineer",
         "required_skills": ["linux", "bash", "powershell", "git", "docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "jenkins", "gitlab ci", "terraform", "ansible"],
         "preferred_skills": ["python", "go", "monitoring", "prometheus", "grafana", "networking", "security"],
         "keywords": ["infrastructure", "automation", "deployment", "ci/cd pipeline", "cloud infrastructure", "scalability", "reliability"],
         "experience_keywords": ["devops", "sre", "site reliability", "infrastructure engineer", "cloud engineer"],
         "min_experience_years": 2
    },
    # === THÊM NHIỀU VỊ TRÍ KHÁC VÀO ĐÂY ===
    # (Fullstack, QA, Cloud Architect, Data Engineer, Mobile Dev, etc.)
]

def load_job_roles_db(filepath=JOB_ROLES_DB_FILE):
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading job roles DB from {filepath}: {e}")
    print("Job roles DB file not found or invalid. Using default.")
    return DEFAULT_JOB_ROLES_DB

JOB_ROLES_DB = load_job_roles_db()

# --- 3. CV Parsing Functions ---
def extract_text(file_path):
    # (Giống code trước: extract_text_from_pdf, docx, txt)
    _, extension = os.path.splitext(file_path.lower())
    if extension == ".pdf":
        # ... (code đọc pdf) ...
        try:
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        except Exception as e:
            print(f"Error reading PDF {file_path}: {e}")
            return None
    elif extension == ".docx":
         # ... (code đọc docx) ...
        try:
            doc = Document(file_path)
            text = "\n".join([para.text for para in doc.paragraphs])
            return text
        except Exception as e:
            print(f"Error reading DOCX {file_path}: {e}")
            return None
    elif extension == ".txt":
         # ... (code đọc txt) ...
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Error reading TXT {file_path}: {e}")
            return None
    else:
        print(f"Unsupported file type: {extension}")
        return None

def extract_skills_from_doc(doc):
    """Trích xuất kỹ năng dùng PhraseMatcher."""
    matches = skill_matcher(doc)
    found_skills = set()
    # Sử dụng Counter để đếm tần suất, có thể dùng để trọng số sau này
    skill_counts = Counter()
    for match_id, start, end in matches:
        skill = doc[start:end].text.lower()
        found_skills.add(skill)
        skill_counts[skill] += 1
    return list(found_skills), skill_counts

def estimate_experience_years(text):
    """Ước tính (rất) thô số năm kinh nghiệm dựa trên các năm được đề cập."""
    # Tìm các năm dạng YYYY
    years = re.findall(r'\b(19[89]\d|20[012]\d)\b', text)
    if not years:
        return 0
    # Chuyển sang số nguyên
    numeric_years = sorted([int(y) for y in years])
    # Ước tính dựa trên khoảng cách giữa năm sớm nhất và muộn nhất
    # Giả định năm muộn nhất là gần đây nhất
    if len(numeric_years) >= 2:
         # Cộng 1 vì khoảng thời gian từ 2020-2022 là 3 năm (2020, 2021, 2022)
        return numeric_years[-1] - numeric_years[0] + 1
    elif len(numeric_years) == 1:
        # Nếu chỉ có 1 năm, giả sử ít nhất 1 năm kinh nghiệm
        # Hoặc có thể so sánh với năm hiện tại (cần import datetime)
        from datetime import datetime
        current_year = datetime.now().year
        if numeric_years[0] <= current_year:
            return max(1, current_year - numeric_years[0] + 1)
        else:
             return 1 # Năm trong tương lai? Cho 1 năm
    return 0

# --- 4. Matching Logic ---
def calculate_job_match_score(cv_data, job_role):
    """Tính điểm phù hợp giữa CV và một Job Role."""
    score = 0
    max_score = 0 # Để chuẩn hóa (tùy chọn)

    cv_skills = set(cv_data['skills'])
    cv_text_lower = cv_data['full_text'].lower()
    cv_experience_years = cv_data['estimated_years_experience']

    # --- a. Skill Matching ---
    required_skills_role = set(job_role.get('required_skills', []))
    preferred_skills_role = set(job_role.get('preferred_skills', []))

    # Có thể có nhiều cách định nghĩa required: cần TẤT CẢ hay chỉ MỘT SỐ?
    # Ví dụ: Cần ít nhất 1 kỹ năng trong danh sách required chính
    # Hoặc tính % kỹ năng required có trong CV
    required_match_count = len(cv_skills.intersection(required_skills_role))
    preferred_match_count = len(cv_skills.intersection(preferred_skills_role))

    # Trọng số: required quan trọng hơn preferred
    skill_score = (required_match_count * 3) + (preferred_match_count * 1)
    max_skill_score = (len(required_skills_role) * 3) + (len(preferred_skills_role) * 1)
    score += skill_score
    max_score += max_skill_score

    # --- b. Keyword Matching (trong toàn bộ text) ---
    keyword_score = 0
    role_keywords = job_role.get('keywords', [])
    max_keyword_score = len(role_keywords) * 1 # Mỗi keyword 1 điểm
    for keyword in role_keywords:
        if keyword.lower() in cv_text_lower:
            keyword_score += 1
    score += keyword_score
    max_score += max_keyword_score

    # --- c. Experience Matching ---
    # i. Số năm kinh nghiệm
    exp_year_score = 0
    min_exp = job_role.get('min_experience_years', 0)
    max_exp_year_score = 10 # Điểm tối đa cho kinh nghiệm năm
    if cv_experience_years >= min_exp:
        # Cho điểm nếu đạt yêu cầu tối thiểu
        # Có thể cho thêm điểm nếu vượt xa yêu cầu
        exp_year_score = 5 + min(5, cv_experience_years - min_exp) # Tối đa 10 điểm
    score += exp_year_score
    max_score += max_exp_year_score

    # ii. Từ khóa trong kinh nghiệm (nếu có thể tách section kinh nghiệm)
    # Đây là phần nâng cao, cần tách được phần mô tả kinh nghiệm
    # Tạm thời bỏ qua hoặc dùng keyword matching chung ở trên
    # exp_keyword_score = 0
    # max_exp_keyword_score = 0
    # experience_keywords_role = job_role.get('experience_keywords', [])
    # # Giả sử cv_data['experience_text'] chứa text phần kinh nghiệm
    # if 'experience_text' in cv_data:
    #     #... match keywords in experience_text ...
    # score += exp_keyword_score
    # max_score += max_exp_keyword_score


    # --- d. Chuẩn hóa điểm (tùy chọn) ---
    # final_score = (score / max_score) * 100 if max_score > 0 else 0
    # Hoặc trả về điểm thô
    final_score = score

    return final_score


# --- 5. Main Analysis Function ---
def suggest_jobs_from_cv(file_path):
    """Phân tích CV và đề xuất các vị trí công việc."""
    print(f"\n--- Analyzing CV for Job Suggestions: {file_path} ---")
    text = extract_text(file_path)
    if not text:
        print("Could not extract text from file.")
        return None

    doc = nlp(text)

    # Trích xuất thông tin cần thiết từ CV
    skills, skill_counts = extract_skills_from_doc(doc)
    estimated_years = estimate_experience_years(text)
    # (Có thể thêm trích xuất học vấn, chứng chỉ ở đây)

    cv_data = {
        'skills': skills,
        'skill_counts': dict(skill_counts), # Chuyển Counter thành dict để dễ serialize
        'estimated_years_experience': estimated_years,
        'full_text': text,
        # 'experience_text': extract_experience_section(doc) # Nâng cao
        # 'education_info': extract_education(doc) # Nâng cao
    }

    # Tính điểm cho từng vai trò trong DB
    job_scores = []
    for role in JOB_ROLES_DB:
        match_score = calculate_job_match_score(cv_data, role)
        if match_score > 0: # Chỉ xem xét các vai trò có điểm > 0
            job_scores.append({
                "role_name": role["role_name"],
                "score": match_score,
                # Có thể thêm thông tin chi tiết về việc match (ví dụ: skills nào khớp)
            })

    # Sắp xếp theo điểm giảm dần
    job_scores.sort(key=lambda x: x["score"], reverse=True)

    # Chuẩn bị kết quả cuối cùng
    analysis_result = {
        "file_path": file_path,
        "extracted_skills": sorted(skills),
        "skill_frequency": dict(skill_counts.most_common(10)), # Top 10 kỹ năng phổ biến
        "estimated_experience_years": estimated_years,
        "suggested_roles": job_scores[:5] # Lấy top 5 đề xuất
    }

    return analysis_result

# --- 6. Example Usage ---
if __name__ == "__main__":
    # Thay đổi đường dẫn này tới file CV bạn muốn phân tích
    cv_file_path = "path/to/your/it_cv.pdf" # Hoặc .docx, .txt

    if not os.path.exists(cv_file_path):
        print(f"Error: File not found at {cv_file_path}")
        print("Please update the 'cv_file_path' variable.")
    else:
        suggestions = suggest_jobs_from_cv(cv_file_path)

        if suggestions:
            print("\n--- Job Suggestion Result ---")
            print(f"Analyzed CV: {suggestions['file_path']}")
            print(f"Estimated Experience: {suggestions['estimated_experience_years']} years")
            print(f"Top Skills Detected: {suggestions['skill_frequency']}")
            # print(f"All Skills Detected: {suggestions['extracted_skills']}")

            print("\n--- Top Job Suggestions ---")
            if suggestions['suggested_roles']:
                for i, item in enumerate(suggestions['suggested_roles']):
                    print(f"{i+1}. {item['role_name']} (Score: {item['score']:.2f})")
            else:
                print("No suitable job roles found based on the current criteria.")

            # Lưu kết quả vào JSON (tùy chọn)
            # output_file = os.path.splitext(cv_file_path)[0] + '_analysis.json'
            # with open(output_file, 'w', encoding='utf-8') as f:
            #     json.dump(suggestions, f, indent=4, ensure_ascii=False)
            # print(f"\nAnalysis saved to: {output_file}")