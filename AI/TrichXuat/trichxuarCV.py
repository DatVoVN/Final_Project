import fitz

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with fitz.open(pdf_path) as doc:
            for page in doc:
                text += page.get_text()
    except Exception as e:
        print(f"Lỗi đọc PDF: {e}")
    return text

if __name__ == "__main__":
    path_to_cv = "test.pdf"
    cv_text = extract_text_from_pdf(path_to_cv)
    print("Trích xuất nội dung CV:")
    print(cv_text[:1000])
