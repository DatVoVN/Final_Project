import fitz  # PyMuPDF
import os
import re
import sys

# Ensure console prints Unicode characters correctly
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def extract_text_from_pdf_cv(pdf_path: str) -> str | None:
    """
    Extracts all text content from a PDF CV file.

    Args:
        pdf_path (str): Path to the PDF file.

    Returns:
        str | None: Extracted text if successful, None if an error occurs.
    """
    if not os.path.exists(pdf_path):
        print(f"Error: File does not exist at '{pdf_path}'")
        return None

    if not pdf_path.lower().endswith(".pdf"):
        print(f"Error: '{pdf_path}' is not a PDF file.")
        return None

    full_text = ""
    print(f"Opening and processing PDF file: {pdf_path}")

    try:
        with fitz.open(pdf_path) as doc:
            print(f"-> PDF contains {doc.page_count} page(s).")

            for page_num in range(doc.page_count):
                page = doc.load_page(page_num)
                page_text = page.get_text("text")

                full_text += page_text
                if page_num < doc.page_count - 1:
                    full_text += f"\n\n--- End of Page {page_num + 1} ---\n\n"

        print("-> Finished reading the PDF file.")

        # Clean text
        full_text = re.sub(r'(\n\s*){3,}', '\n\n', full_text)
        full_text = re.sub(r'[ \t]+', ' ', full_text)
        full_text = full_text.strip()

        return full_text

    except fitz.errors.PasswordError:
        print(f"Error: PDF file '{pdf_path}' is password-protected.")
        return None
    except Exception as e:
        print(f"Unknown error while processing PDF '{pdf_path}': {e}")
        return None

# --- Demo ---
if __name__ == "__main__":
    pdf_path = r"C:\Users\DAT VO\Desktop\DoAnTotNghiep\AI\VO-VAN-DAT-TopCV.vn-090425.51402.pdf"

    print("Starting CV text extraction from PDF...")
    extracted = extract_text_from_pdf_cv(pdf_path)

    if extracted:
        print("\n" + "="*20 + " EXTRACTED CV TEXT " + "="*20)
        print(extracted)
        print("\n" + "="*(44 + len("EXTRACTED CV TEXT")))
        print(f"Total characters extracted: {len(extracted)}")
    else:
        print("\nText extraction failed.")
