import json
import re
import os
import sys # Import sys to check stdout encoding

# import pandas as pd # Uncomment if you want CSV output and have pandas installed

def safe_print(text_to_print):
    """
    Prints text to the console, replacing characters incompatible
    with the console's detected encoding to prevent UnicodeEncodeError.
    """
    try:
        # Attempt to print directly
        print(text_to_print)
    except UnicodeEncodeError:
        try:
            # If direct print fails, encode using detected stdout encoding with replacement
            # Fallback to 'utf-8' if stdout encoding is not detected (less common)
            fallback_encoding = sys.stdout.encoding if sys.stdout.encoding else 'utf-8'
            encoded_text = str(text_to_print).encode(fallback_encoding, errors='replace')
            # Decode back to string using the same encoding for printing
            decoded_text = encoded_text.decode(fallback_encoding)
            print(decoded_text)
        except Exception as e_fallback:
            # Very basic fallback if even the replacement strategy fails
            print(f"[safe_print fallback error: {e_fallback}] Printing raw representation:")
            # Use repr() to get a string representation that escapes non-ASCII characters
            print(repr(text_to_print))
    except Exception as e_other:
         # Catch other potential print-related errors
         print(f"[safe_print other error: {e_other}] Printing raw representation:")
         print(repr(text_to_print))


def find_experience(text):
    """
    Uses regex to find mentions of years or months of experience in the text.
    Returns a list of unique strings found.
    """
    patterns = [
        r'(\d+\+?)\s+years? of (?:experience|kinh nghiệm)',
        r'(\d+\+?)\s+năm kinh nghiệm',
        r'(?:ít nhất|tối thiểu|minimum|at least)\s+(\d+)\s+(?:years?|năm)',
        r'from\s+(\d+)\s+(?:years?|năm)',
        r'(\d+)\s+months? of (?:experience|kinh nghiệm)',
        r'(\d+)\s+tháng kinh nghiệm',
        r'experience\s+(\d+\+?)\s+years?',
        r'\b(\d+)\s*-\s*(\d+)\s+(?:years?|năm)\b'
    ]
    found_experience = []
    processed_text_lower = text.lower()

    for pattern in patterns:
        try:
            matches = re.findall(pattern, processed_text_lower)
            for match in matches:
                if isinstance(match, tuple):
                    range_pattern = r'\b' + match[0] + r'\s*-\s*' + match[1] + r'\s+(?:years?|năm)\b'
                    original_match = re.search(range_pattern, text, re.IGNORECASE)
                    if original_match:
                         found_experience.append(original_match.group(0).strip())
                    else:
                         found_experience.append(f"{match[0]}-{match[1]} years/năm")
                else:
                    # Regex to find the original match in the original text
                    # Creates a pattern like r'\b5\+?\s+years? of (?:experience|kinh nghiệm)'
                    # Need to handle potential regex characters in the match string itself if necessary,
                    # but usually 'match' is just digits and maybe '+' which is handled.
                    specific_pattern = pattern.replace(r'(\d+\+?)', r'\b' + re.escape(match) + r'\b', 1)
                    specific_pattern = specific_pattern.replace(r'(\d+)', r'\b' + re.escape(match) + r'\b', 1)

                    original_match_search = re.search(specific_pattern, text, re.IGNORECASE)

                    if original_match_search:
                         full_match_text = original_match_search.group(0).strip()
                         # Add context for clarity
                         context_window = 30
                         start = max(0, original_match_search.start() - context_window)
                         end = min(len(text), original_match_search.end() + context_window)
                         # Replace newlines in snippet for cleaner printing
                         context_snippet = text[start:end].replace('\n', ' ')
                         # Format the output string
                         found_experience.append(f"{full_match_text} (context: ...{context_snippet}...)")
                    else: # Fallback if specific search fails (less likely with corrected pattern)
                        unit = "years/năm"
                        if "month" in pattern or "tháng" in pattern:
                            unit = "months/tháng"
                        found_experience.append(f"{match} {unit}")

        except re.error as e:
            safe_print(f"Regex error with pattern '{pattern}': {e}") # Use safe_print for error messages too
            continue

    return list(dict.fromkeys(found_experience))


def extract_keywords(text, keywords):
    """
    Extracts predefined keywords found within the text.
    Uses word boundaries for more accuracy.
    Returns a list of unique keywords found.
    """
    found = []
    lower_text = " " + text.lower() + " " # Add padding for boundary checks
    for keyword in keywords:
        pattern_keyword = re.escape(keyword.lower()) # Use lower keyword for pattern matching
        # Use lookarounds for better boundary matching, especially with special chars
        pattern = r'(?<![a-zA-Z0-9])' + pattern_keyword + r'(?![a-zA-Z0-9])'
        # Alternative simpler boundary: pattern = r'\b' + pattern_keyword + r'\b' (might miss C#/.NET sometimes)
        try:
            if re.search(pattern, lower_text): # Search in lower_text
                found.append(keyword) # Append the original keyword casing
        except re.error as e:
             safe_print(f"Regex error searching for keyword '{keyword}' with pattern '{pattern}': {e}")
             continue
    # Return unique keywords while trying to preserve original casing order (dict.fromkeys)
    return list(dict.fromkeys(found))


def get_relevant_section(text):
    """
    Tries to isolate the 'skills and experience' or 'requirements' section.
    Falls back to the full text if specific sections aren't clearly marked.
    """
    text_lower = text.lower()
    start_index = -1
    end_index = len(text)

    start_markers = [
        "\nyour skills and experience\n", "\nyour skills and experience:",
        "\nyêu cầu công việc\n", "\nyêu cầu công việc:",
        "\nrequirements\n", "\nrequirements:",
        "\ntechnical skills\n", "\ntechnical skills:",
        "\nmust-have:\n", "\nmust-have",
        "\nskills & experiences\n", "\nskills & experiences:",
        "\nvề kỹ năng và kinh nghiệm\n", "\nvề kỹ năng và kinh nghiệm:",
    ]
    end_markers = [
        "\nwhy you'll love working here\n", "\nwhy you'll love working here:",
        "\nphúc lợi\n", "\nphúc lợi:",
        "\nbenefits\n", "\nbenefits:",
        "\ncompany benefits\n", "\ncompany benefits:",
        "\nnice to have:\n", "\nnice-to-have:", # Often follows must-have
        "\nsoft-skills essentials\n", "\nsoft-skills essentials:", # Seen in one example
    ]

    found_start_indices = []
    for marker in start_markers:
         idx = text_lower.find(marker)
         if idx != -1:
              found_start_indices.append(idx + len(marker))

    if found_start_indices:
        start_index = min(found_start_indices)
    else:
        job_desc_marker = "job description\n"
        idx = text_lower.find(job_desc_marker)
        if idx != -1:
             start_index = idx + len(job_desc_marker)
        else:
             start_index = 0

    found_end_indices = []
    # Search for end markers only *after* the determined start index
    search_start_pos = start_index if start_index > 0 else 0
    for marker in end_markers:
        idx = text_lower.find(marker, search_start_pos)
        if idx != -1:
            found_end_indices.append(idx)

    if found_end_indices:
        end_index = min(found_end_indices)

    if start_index != -1 and start_index < end_index :
        return text[start_index:end_index].strip()
    elif start_index != -1:
         return text[start_index:].strip()
    else:
        safe_print("Warning: Could not reliably identify skills/requirements section, analyzing full description.")
        return text


def extract_job_details(job_data):
    """
    Extracts structured details from a single job listing dictionary.
    """
    details = {
        'title': job_data.get('title', 'N/A'),
        'company': job_data.get('company', 'N/A'),
        'url': job_data.get('url', 'N/A'),
        'salary': job_data.get('salary', 'N/A'),
        'location': job_data.get('location', 'N/A'),
        'work_model': job_data.get('work_model', 'N/A'),
        'skills_listed': job_data.get('skills', []),
        'experience_found': [],
        'tech_keywords_mentioned': [],
        'education_hints': [],
        'language_hints': []
    }

    description_text = job_data.get('description_text', '')
    if description_text:
        details['experience_found'] = find_experience(description_text)
        relevant_text = get_relevant_section(description_text)

        tech_keywords = [
            'PHP', 'Laravel', 'ReactJS', 'NextJS', 'Node.js', 'Vue.js', 'Angular',
            'Java', 'J2EE', 'Spring', 'Spring Boot', 'Struts',
            '.NET', 'C#', 'ASP.NET', '.NET Core', 'VB.NET', 'DevExpress',
            'Python', 'Django', 'Flask',
            'Golang', 'Go',
            'Swift', 'Objective C', 'iOS', 'Kotlin', 'Android', 'Flutter', 'React Native',
            'HTML', 'CSS', 'JavaScript', 'TypeScript', 'AJAX',
            'SQL', 'MySQL', 'PostgreSQL', 'SQL Server', 'Oracle', 'NoSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Lucene', 'Solr',
            'API', 'REST', 'GraphQL', 'SOAP', 'Web Service', 'Microservices', 'gRPC', 'WebAPI',
            'AWS', 'Azure', 'GCP', 'Cloud', 'Docker', 'Kubernetes', 'K8S', 'Terraform', 'Serverless',
            'Linux', 'Windows Server',
            'Git', 'Jira', 'CI/CD', 'Jenkins', 'GitLab CI', 'Azure DevOps', 'Gradle', 'Maven',
            'Selenium', 'Appium', 'Jmeter', 'JUnit', 'Mockito', 'Cypress', 'Playwright', 'Postman', 'SOAPUI',
            'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'Canva', 'InDesign',
            'Agile', 'Scrum', 'TDD', 'OOP', 'MVC', 'Design Pattern', 'Data Structures', 'Algorithms',
            'AI', 'Machine Learning', 'ML', 'LLM', 'NLP', 'Deep Learning', 'Computer Vision',
            'Embedded', 'C++', 'MCU', 'Firmware', 'RTOS', 'UART', 'SPI', 'I2C',
            'QA', 'QC', 'Tester', 'Automation Test', 'Manual Test', 'UAT', 'SIT', 'Regression Test', 'Performance Testing', 'Load Testing', 'Security Testing',
            'UI', 'UX', 'UI/UX', 'Designer', 'Wireframe', 'Prototype', 'Design System', 'User Research', 'Usability',
            'Project Manager', 'PM', 'Product Manager', 'BrSE', 'Bridge Engineer', 'Team Leader', 'Technical Lead', 'Tech Lead',
            'Big Data', 'Kafka', 'Data Lake', 'OLAP', 'ETL', 'Spark', 'Hadoop',
            'Security', 'Cryptography', 'MPC', 'Blockchain', 'Web3', 'Fintech', 'Cybersecurity',
            'WordPress', 'CMS', 'E-commerce', 'SAP', 'ERP', 'CRM',
            'Shell Scripting', 'PowerShell', 'Networking', 'System Administration',
        ]
        details['tech_keywords_mentioned'] = extract_keywords(relevant_text, tech_keywords)

        edu_keywords = [
            "Bachelor", "Degree", "Master", "PhD", "University", "College", "Diploma",
            "Cử nhân", "Bằng", "Đại học", "Cao đẳng", "Thạc sĩ", "Tiến sĩ", "Chứng chỉ",
            "Computer Science", "Khoa học máy tính", "CNTT", "IT", "Information Technology",
            "Engineering", "Kỹ thuật", "Software Engineering", "Computer Engineering",
            "NIIT", "Aptech"
        ]
        details['education_hints'] = extract_keywords(relevant_text, edu_keywords)

        lang_keywords = [
            "English", "Tiếng Anh", "Japanese", "Tiếng Nhật", "Korean", "Tiếng Hàn", "Chinese", "Tiếng Trung", "French", "Tiếng Pháp", "German", "Tiếng Đức",
            "Fluent", "Proficient", "Intermediate", "Basic", "Communication", "Good communication", "Excellent communication",
            "Read", "Write", "Speak", "Listen", "Đọc", "Viết", "Nói", "Nghe", "Giao tiếp",
            "N1", "N2", "N3", "N4", "N5", "JLPT", "TOEIC", "IELTS", "TOEFL"
            ]
        details['language_hints'] = extract_keywords(relevant_text, lang_keywords)

    return details

json_file_path = r'C:\Users\DAT VO\Desktop\DoAnTotNghiep\AI\itviec_jobs_full_selenium.json' # <<< YOUR PATH HERE

all_job_details = []

if not os.path.exists(json_file_path):
    safe_print(f"Error: File not found at '{json_file_path}'")
else:
    try:
        # Specify UTF-8 encoding explicitly when opening the file
        with open(json_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if not content:
                safe_print(f"Error: File '{json_file_path}' is empty.")
                jobs_data = []
            else:
                # Load JSON data
                jobs_data = json.loads(content)

        if not isinstance(jobs_data, list):
             safe_print(f"Error: Expected a JSON list in '{json_file_path}', but got {type(jobs_data)}")
        else:
             safe_print(f"Reading data from {json_file_path}...")
             for i, job in enumerate(jobs_data):
                  if isinstance(job, dict):
                       extracted_info = extract_job_details(job)
                       all_job_details.append(extracted_info)
                  else:
                       safe_print(f"Warning: Skipping non-dictionary item at index {i} in JSON list: {type(job)}")

             # --- Output the results ---
             safe_print(f"\nSuccessfully processed {len(all_job_details)} job entries.")

             # --- Option 1: Print summary for each job using safe_print ---
             safe_print("\n--- Summary ---")
             for i, details in enumerate(all_job_details):
                  safe_print("=" * 50)
                  safe_print(f"Job {i+1}: {details['title']} @ {details['company']}")
                  safe_print(f"  URL: {details['url']}")
                  # Convert lists to strings for safe_print
                  safe_print(f"  Skills Listed: {', '.join(details['skills_listed']) if details['skills_listed'] else 'None'}")
                  safe_print(f"  Experience Found: {details['experience_found']}") # Experience strings might contain context
                  mentioned_only = sorted(list(set(details['tech_keywords_mentioned']) - set(details['skills_listed'])))
                  safe_print(f"  Other Keywords Mentioned: {', '.join(mentioned_only) if mentioned_only else 'None'}")
                  safe_print(f"  Education Hints: {', '.join(details['education_hints']) if details['education_hints'] else 'None'}")
                  safe_print(f"  Language Hints: {', '.join(details['language_hints']) if details['language_hints'] else 'None'}")
             safe_print("=" * 50)

             # --- Option 2: Save to CSV (Requires pandas) ---
             output_csv_file = 'extracted_job_details.csv'
             try:
                 import pandas as pd
                 safe_print(f"\nAttempting to save details to {output_csv_file}...")
                 df = pd.DataFrame(all_job_details)

                 list_columns = ['skills_listed', 'experience_found', 'tech_keywords_mentioned', 'education_hints', 'language_hints']
                 for col in list_columns:
                      if col in df.columns:
                           # Ensure robust conversion for CSV: handle non-lists and join lists
                           df[col] = df[col].apply(lambda x: ', '.join(map(str, x)) if isinstance(x, list) else str(x))

                 df.to_csv(output_csv_file, index=False, encoding='utf-8-sig')
                 safe_print(f"Successfully saved results to '{output_csv_file}'")
             except ImportError:
                 safe_print("\nNote: 'pandas' library not installed.")
                 safe_print("      To save results to CSV, install it using: pip install pandas")
             except Exception as e:
                 safe_print(f"\nError saving to CSV: {e}")

    except json.JSONDecodeError as e:
        safe_print(f"Error decoding JSON from '{json_file_path}'. Check file format. Details: {e}")
    except FileNotFoundError:
         safe_print(f"Error: File not found at '{json_file_path}'") # Should be caught by os.path.exists now
    except Exception as e:
        safe_print(f"An unexpected error occurred: {e}")
        # For debugging, you might want to print the traceback too
        import traceback
        traceback.print_exc()