import os
import json
import re
from io import StringIO
from pdfminer.converter import TextConverter
from pdfminer.layout import LAParams
from pdfminer.pdfdocument import PDFDocument
from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
from pdfminer.pdfpage import PDFPage
from pdfminer.pdfparser import PDFParser

# --- OpenAI Client Setup ---
try:
    from openai import OpenAI
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("Lỗi: Biến môi trường OPENAI_API_KEY chưa được đặt.")
    client = OpenAI(api_key=api_key)
    print("Khởi tạo OpenAI client thành công.")
except ImportError:
    print("Lỗi: Vui lòng cài đặt thư viện OpenAI mới nhất: pip install --upgrade openai")
    exit()
except Exception as e:
    print(f"Lỗi khi khởi tạo OpenAI client: {e}")
    exit()

# --- CONFIGURATION ---
CV_PDF_PATH = "test.pdf"  # !!! THAY THẾ ĐƯỜNG DẪN NÀY !!!
OPENAI_MODEL = "gpt-3.5-turbo" # Sử dụng model GPT-3.5 Turbo
# GPT-3.5 Turbo thường có context window lớn hơn các model cũ, nhưng vẫn nên giới hạn
MAX_INPUT_CHARS = 15000 # Giới hạn số ký tự gửi đi để tránh lỗi token limit và tiết kiệm chi phí

# --- PDF Text Extraction Function (Giống như trước) ---
def extract_text_from_pdf(pdf_path):
    output_string = StringIO()
    try:
        with open(pdf_path, 'rb') as in_file:
            parser = PDFParser(in_file)
            doc = PDFDocument(parser)
            rsrcmgr = PDFResourceManager()
            laparams = LAParams(line_margin=0.4, word_margin=0.1, char_margin=2.0, boxes_flow=0.5)
            device = TextConverter(rsrcmgr, output_string, laparams=laparams)
            interpreter = PDFPageInterpreter(rsrcmgr, device)
            print(f"Đang đọc file PDF: {os.path.basename(pdf_path)}...")
            page_count = 0
            for page in PDFPage.create_pages(doc):
                interpreter.process_page(page)
                page_count += 1
            print(f"Đã đọc {page_count} trang.")
        extracted = output_string.getvalue()
        cleaned_text = extracted.replace('\x00', '') # Loại bỏ ký tự null
        return cleaned_text
    except FileNotFoundError:
        print(f"Lỗi: Không tìm thấy file PDF tại '{pdf_path}'")
        return None
    except Exception as e:
        print(f"Lỗi nghiêm trọng khi đọc PDF {pdf_path}: {e}")
        return None

# --- Function to call OpenAI API ---
def get_structured_cv_data_from_gpt35(cv_text_content):
    if not cv_text_content or not cv_text_content.strip():
        print("Lỗi: Nội dung CV rỗng.")
        return None

    if len(cv_text_content) > MAX_INPUT_CHARS:
        print(f"Cảnh báo: Nội dung CV dài ({len(cv_text_content)} chars). Cắt bớt còn {MAX_INPUT_CHARS} chars.")
        cv_text_content = cv_text_content[:MAX_INPUT_CHARS]

    # Prompt chi tiết, tương tự như ví dụ trước, nhưng có thể cần điều chỉnh nhẹ cho GPT-3.5
    # nếu thấy kết quả chưa tốt.
    prompt = f"""
    Phân tích kỹ nội dung CV của ứng viên IT dưới đây. Trích xuất các thông tin quan trọng và cấu trúc hóa chúng thành một đối tượng JSON hợp lệ.

    **Schema JSON mong muốn:**
    {{
      "name": "String | null",
      "contact": {{
        "email": "String | null",
        "phone": "String | null",
        "linkedin": "String | null",
        "github": "String | null",
        "portfolio": "String | null",
        "address": "String | null"
      }},
      "summary": "String | null",
      "skills": {{
        "programming_languages": ["String", ...],
        "frameworks_libraries": ["String", ...],
        "databases": ["String", ...],
        "cloud_platforms": ["String", ...],
        "tools_devops": ["String", ...],
        "methodologies": ["String", ...],
        "others": ["String", ...]
      }},
      "experience": [
        {{
          "job_title": "String",
          "company": "String",
          "location": "String | null",
          "start_date": "String (YYYY-MM hoặc YYYY) | null",
          "end_date": "String (YYYY-MM, YYYY, hoặc 'Present') | null",
          "description": "String"
        }},
        ...
      ],
      "education": [
        {{
          "institution": "String",
          "degree": "String",
          "major": "String | null",
          "start_date": "String (YYYY-MM hoặc YYYY) | null",
          "end_date": "String (YYYY-MM hoặc YYYY) | null",
          "gpa": "String | Number | null"
        }},
        ...
      ],
      "projects": [
        {{
          "name": "String",
          "description": "String",
          "technologies": ["String", ...],
          "url": "String | null"
        }},
        ...
      ],
      "certifications": ["String", ...]
    }}

    **Yêu cầu khi trích xuất:**
    - `name`: Tên đầy đủ.
    - `contact.phone`: Chuẩn hóa số điện thoại nếu có thể.
    - `skills`: Nhóm các kỹ năng vào các danh mục phù hợp. Chuẩn hóa tên kỹ năng (ví dụ: "ReactJS" thành "React"). Chỉ liệt kê kỹ năng được đề cập.
    - `experience.start_date`, `experience.end_date`, `education.start_date`, `education.end_date`: Định dạng ngày tháng là "YYYY-MM" hoặc "YYYY". Nếu là "Hiện tại", dùng "Present".
    - Nếu không tìm thấy thông tin cho một trường, sử dụng `null` cho trường đơn lẻ, hoặc danh sách/đối tượng rỗng (`[]`, `{{}}`) cho trường phức tạp.

    **Yêu cầu định dạng trả về:**
    1.  Chỉ trả về MỘT đối tượng JSON hợp lệ.
    2.  KHÔNG thêm bất kỳ văn bản giải thích, lời chào, hay ghi chú nào khác ngoài đối tượng JSON.
    3.  Đảm bảo cú pháp JSON là chính xác.

    **Nội dung CV cần phân tích:**
    ```text
    {cv_text_content}
    ```
    """

    print(f"Đang gửi yêu cầu phân tích CV đến model {OPENAI_MODEL}...")
    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert CV parsing AI. Your task is to extract information from the provided CV text and return it as a structured, valid JSON object, following the user's specified schema precisely. Respond ONLY with the JSON object."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1, # Giảm nhiệt độ để kết quả nhất quán hơn
            # max_tokens có thể cần điều chỉnh dựa trên độ dài CV và độ phức tạp của JSON
            # max_tokens=2048,
            response_format={"type": "json_object"} # Quan trọng: Yêu cầu model trả về JSON
        )

        message_content = response.choices[0].message.content
        print("Đã nhận phản hồi từ OpenAI.")

        try:
            # GPT-3.5 đôi khi vẫn có thể trả về text không hoàn toàn là JSON thuần túy
            # Cố gắng tìm và trích xuất khối JSON từ text nếu cần
            json_match = re.search(r"```json\s*([\s\S]+?)\s*```|({[\s\S]*})", message_content, re.DOTALL)
            if json_match:
                if json_match.group(1): # Khớp với ```json ... ```
                    json_str = json_match.group(1).strip()
                else: # Khớp với { ... }
                    json_str = json_match.group(2).strip()

                parsed_json = json.loads(json_str)
                return parsed_json
            else:
                # Nếu không có dấu hiệu ```json, thử parse trực tiếp
                parsed_json = json.loads(message_content)
                return parsed_json

        except json.JSONDecodeError as json_err:
            print(f"Lỗi: Không thể parse phản hồi từ OpenAI thành JSON: {json_err}")
            print("--- Phản hồi thô từ OpenAI ---")
            print(message_content)
            print("--- Hết phản hồi thô ---")
            return None

    except Exception as e:
        print(f"Lỗi khi gọi API OpenAI hoặc xử lý kết quả: {e}")
        return None

# --- MAIN EXECUTION ---
if __name__ == "__main__":
    print("-" * 30)
    if CV_PDF_PATH == "YOUR_CV_FILE_PATH_HERE.pdf" or not os.path.exists(CV_PDF_PATH):
        print("!!! LỖI: Vui lòng thay thế 'YOUR_CV_FILE_PATH_HERE.pdf' trong code")
        print("bằng đường dẫn thực tế đến file CV PDF của bạn.")
        print("Đảm bảo file tồn tại trước khi chạy.")
        print("-" * 30)
    else:
        cv_text = extract_text_from_pdf(CV_PDF_PATH)

        if cv_text:
            structured_data = get_structured_cv_data_from_gpt35(cv_text)

            if structured_data:
                print("\n--- KẾT QUẢ TRÍCH XUẤT TỪ GPT-3.5 TURBO (JSON) ---")
                print(json.dumps(structured_data, indent=4, ensure_ascii=False))

                output_filename = os.path.splitext(os.path.basename(CV_PDF_PATH))[0] + "_gpt35_extracted.json"
                try:
                    with open(output_filename, 'w', encoding='utf-8') as outfile:
                        json.dump(structured_data, outfile, indent=4, ensure_ascii=False)
                    print(f"\nKết quả cũng đã được lưu vào file: {output_filename}")
                except Exception as write_e:
                     print(f"\nLỗi khi lưu kết quả ra file {output_filename}: {write_e}")
            else:
                print("\nKhông nhận được dữ liệu JSON hợp lệ từ OpenAI.")
        else:
            print("\nKhông thể xử lý do lỗi đọc file PDF.")

    print("-" * 30)