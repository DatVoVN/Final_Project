# -*- coding: utf-8 -*- # Thêm encoding declaration
import time
import random
import json
import csv
import logging
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException, WebDriverException, NoSuchElementException
import requests # Vẫn giữ lại phòng khi cần

# --- Cấu hình Logging ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- Cấu hình Selenium ---
SELENIUM_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
REQUEST_TIMEOUT = 45
DELAY_BETWEEN_LIST_PAGES = (7, 12)
DELAY_BETWEEN_DETAIL_PAGES = (4, 8)
DELAY_AFTER_PAGE_LOAD = 4
BASE_URL = "https://itviec.com"

# ******** SELECTOR TRANG DANH SÁCH (ĐÃ CẬP NHẬT) ********
# Thẻ bao ngoài cùng cho mỗi job item trên trang /it-jobs
LIST_PAGE_JOB_ITEM_SELECTOR = 'div.job-card' # <<<=== ĐÃ CẬP NHẬT THEO HTML ĐẦY ĐỦ
# Selector để lấy link từ bên trong job item
LIST_PAGE_LINK_SELECTOR = 'h3[data-url]'
# ---------------------------------------------------------------

# --- Hàm khởi tạo WebDriver (Giữ nguyên) ---
def create_driver():
    """Khởi tạo và trả về một instance của Selenium WebDriver."""
    try:
        chrome_options = Options()
        chrome_options.add_argument(f"user-agent={SELENIUM_USER_AGENT}")
        # Bỏ comment dòng dưới nếu muốn thấy trình duyệt chạy để debug
        # chrome_options.add_argument("--headless=new") # Cú pháp mới cho headless
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--log-level=3")
        chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])
        chrome_options.add_experimental_option("useAutomationExtension", False)
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_argument("start-maximized");
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")

        logging.info("Đang khởi tạo WebDriver...")
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.set_page_load_timeout(REQUEST_TIMEOUT)
        logging.info("WebDriver đã được khởi tạo.")
        return driver
    except Exception as e:
        logging.error(f"Lỗi nghiêm trọng khi khởi tạo WebDriver: {e}")
        logging.error("Vui lòng kiểm tra cài đặt Chrome và ChromeDriver.")
        raise

# --- Hàm lấy TẤT CẢ URL công việc từ trang danh sách (Sử dụng Selenium - Selector đã cập nhật) ---
def get_job_urls_selenium(max_pages=None):
    """
    Lấy danh sách URL công việc từ TẤT CẢ các trang danh sách sử dụng Selenium.
    """
    job_urls = set()
    logging.info(f"Bắt đầu lấy URL công việc từ {BASE_URL} (dùng Selenium)")
    page = 2
    driver = None
    consecutive_empty_pages = 0

    try:
        driver = create_driver()

        while True:
            if max_pages is not None and page > max_pages:
                logging.info(f"Đã đạt giới hạn {max_pages} trang. Dừng lấy URL.")
                break
            if consecutive_empty_pages >= 3:
                 logging.warning(f"Đã có {consecutive_empty_pages} trang liên tiếp không tìm thấy job/link. Dừng lấy URL.")
                 break

            page_url = f"{BASE_URL}/it-jobs?page={page}"
            logging.info(f"Đang xử lý trang danh sách (Selenium): {page_url}")

            page_load_successful = False
            page_source = None
            try:
                driver.get(page_url)
                time.sleep(random.uniform(DELAY_AFTER_PAGE_LOAD, DELAY_AFTER_PAGE_LOAD + 2))
                page_source = driver.page_source
                page_load_successful = True

                # Kiểm tra Cloudflare cơ bản (có thể cần tinh vi hơn)
                if page_source and ("Checking your browser" in page_source[:2000] or "Cloudflare" in page_source[:2000]):
                     logging.warning(f"Phát hiện dấu hiệu Cloudflare/Challenge trên trang {page_url}. Chờ thêm và thử lại...")
                     time.sleep(random.uniform(15, 20))
                     page_source = driver.page_source # Lấy lại source sau khi chờ
                     if "Checking your browser" in page_source[:2000] or "Cloudflare" in page_source[:2000]:
                           logging.error(f"Vẫn bị Cloudflare chặn: {page_url}. Bỏ qua trang này.")
                           consecutive_empty_pages += 1
                           page += 1
                           continue # Bỏ qua trang này

            except TimeoutException:
                 logging.warning(f"Selenium timed out khi tải trang danh sách: {page_url}. Bỏ qua trang này.")
                 consecutive_empty_pages += 1
                 page += 1
                 time.sleep(10)
                 continue
            except WebDriverException as e:
                 logging.error(f"Lỗi WebDriverException khi tải trang {page_url}: {e}. Dừng lấy URL.")
                 break
            except Exception as e:
                 logging.exception(f"Lỗi không xác định khi tải trang {page_url}: {e}. Dừng lấy URL.")
                 break


            if not page_load_successful or not page_source:
                 logging.warning(f"Không tải được source của trang {page}. Bỏ qua.")
                 consecutive_empty_pages += 1
                 page += 1
                 continue

            try:
                soup = BeautifulSoup(page_source, 'lxml')
                # Sử dụng selector đã cập nhật
                job_items = soup.select(LIST_PAGE_JOB_ITEM_SELECTOR)

                logging.debug(f"Page {page}: Found {len(job_items)} items matching '{LIST_PAGE_JOB_ITEM_SELECTOR}'")

                if not job_items:
                    no_jobs_message = soup.find(string=lambda t: "Không tìm thấy công việc nào" in str(t))
                    if no_jobs_message:
                         logging.info(f"Trang {page} báo không có công việc (trang cuối?). Dừng lấy URL.")
                         break # Đây là điều kiện dừng mong muốn
                    else:
                         # Ghi lại một phần HTML để debug nếu không tìm thấy
                         logging.warning(f"Không tìm thấy job item nào trên trang {page} với selector '{LIST_PAGE_JOB_ITEM_SELECTOR}'. HTML source (đầu): {page_source[:500]}...")
                    consecutive_empty_pages += 1
                    if page > 1 and consecutive_empty_pages >= 3:
                        break
                    else:
                         page += 1
                         time.sleep(random.uniform(DELAY_BETWEEN_LIST_PAGES[0], DELAY_BETWEEN_LIST_PAGES[1]))
                         continue

                consecutive_empty_pages = 0 # Reset nếu tìm thấy items
                found_new_on_page = 0
                for item_index, item in enumerate(job_items):
                    try:
                        # Lấy link từ selector đã định nghĩa
                        link_tag = item.select_one(LIST_PAGE_LINK_SELECTOR)

                        if link_tag and link_tag.get('data-url'):
                            job_path = link_tag['data-url'].split('?')[0]
                            full_url = BASE_URL + job_path if job_path.startswith('/') else (BASE_URL + '/' + job_path if not job_path.startswith(BASE_URL) else job_path)

                            if full_url.startswith(BASE_URL) and full_url not in job_urls:
                                job_urls.add(full_url)
                                found_new_on_page += 1
                                logging.debug(f"  Trang {page}, Item {item_index+1}: Đã thêm URL mới: {full_url}")
                        else:
                            # Ghi log chi tiết hơn nếu không tìm thấy link bên trong item đã tìm thấy
                            item_html_snippet = str(item)[:200] # Lấy một phần HTML của item để xem
                            logging.debug(f"  Trang {page}, Item {item_index+1}: Không tìm thấy link với selector '{LIST_PAGE_LINK_SELECTOR}' bên trong item. Item HTML snippet: {item_html_snippet}...")

                    except Exception as item_ex:
                        logging.error(f"Lỗi khi xử lý item {item_index+1} trên trang {page}: {item_ex}")
                        continue

                logging.info(f"Trang {page}: Xử lý {len(job_items)} items, thêm được {found_new_on_page} URL mới.")

                if found_new_on_page == 0 and page > 1:
                    # Nếu không có URL mới trên trang > 1, có thể đã hết hoặc có vấn đề
                    logging.info(f"Không tìm thấy URL mới nào trên trang {page}. Xem xét dừng hoặc tiếp tục.")
                    consecutive_empty_pages += 1 # Coi như trang trống/lỗi link
                    # Không break ngay, thử thêm 1-2 trang nữa phòng trường hợp trang lỗi tạm thời

                page += 1
                delay = random.uniform(DELAY_BETWEEN_LIST_PAGES[0], DELAY_BETWEEN_LIST_PAGES[1])
                logging.info(f"Nghỉ {delay:.2f} giây trước khi sang trang {page}...")
                time.sleep(delay)

            except Exception as soup_ex:
                 logging.exception(f"Lỗi khi phân tích HTML hoặc xử lý items trên trang {page}: {soup_ex}")
                 consecutive_empty_pages += 1
                 page += 1
                 continue

    except Exception as main_loop_ex:
        logging.exception(f"Lỗi nghiêm trọng trong vòng lặp chính của get_job_urls_selenium: {main_loop_ex}")
    finally:
        if driver:
            logging.info("Đang đóng WebDriver sau khi lấy URL.")
            try:
                driver.quit()
            except Exception as quit_ex:
                logging.error(f"Lỗi khi đóng WebDriver: {quit_ex}")

    logging.info(f"Đã lấy được tổng cộng {len(job_urls)} URL công việc duy nhất (Selenium).")
    return list(job_urls)


# --- Hàm crawl dữ liệu chi tiết từ một URL công việc (Giữ nguyên từ code trước) ---
def scrape_job_details_selenium(job_url):
    """
    Crawl dữ liệu chi tiết từ một trang công việc cụ thể sử dụng Selenium.
    """
    logging.info(f"Đang crawl chi tiết (Selenium) từ: {job_url}")
    driver = None
    job_data = {'url': job_url}

    try:
        driver = create_driver()
        driver.get(job_url)
        time.sleep(random.uniform(DELAY_AFTER_PAGE_LOAD, DELAY_AFTER_PAGE_LOAD + 2))
        page_source = driver.page_source

        if page_source and ("Checking your browser" in page_source[:2000] or "Cloudflare" in page_source[:2000]):
            logging.warning(f"Phát hiện dấu hiệu Cloudflare/Challenge trên trang chi tiết: {job_url}. Chờ...")
            time.sleep(random.uniform(15, 20))
            page_source = driver.page_source
            if "Checking your browser" in page_source[:2000] or "Cloudflare" in page_source[:2000]:
                 logging.error(f"Vẫn bị Cloudflare chặn ở trang chi tiết: {job_url}. Bỏ qua.")
                 return job_data

        if not page_source:
             logging.error(f"Không lấy được page source cho trang chi tiết: {job_url}")
             return job_data

        soup = BeautifulSoup(page_source, 'lxml')

        # --- Phần trích xuất dữ liệu chi tiết (Giữ nguyên logic, thêm kiểm tra None) ---
        header_container = soup.find('div', class_='job-show-header')
        info_container = soup.find('div', class_='job-show-info')
        content_container = soup.find('section', class_='job-content')
        sidebar_container = soup.find('div', class_='job-sidebar') # Hoặc class tương ứng với sidebar

        # 1. Tiêu đề công việc
        job_data['title'] = None
        if header_container:
            title_tag = header_container.find('h1', class_='ipt-xl-6 text-it-black')
            if title_tag: job_data['title'] = title_tag.get_text(strip=True)

        # 2. Tên công ty
        job_data['company'] = None
        if header_container:
            company_tag = header_container.find('div', class_='employer-name')
            if company_tag: job_data['company'] = company_tag.get_text(strip=True)

        # 3. Mức lương
        job_data['salary'] = "Not specified" # Mặc định
        if header_container:
            salary_container = header_container.find('div', class_='salary')
            if salary_container:
                 salary_span = salary_container.find('span', class_='ips-2') # Tìm span có class ips-2
                 if salary_span: job_data['salary'] = salary_span.get_text(strip=True)

        # 4. Địa điểm làm việc
        job_data['location'] = None
        if info_container:
             location_tag = info_container.select_one('div:has(svg use[href*="map-pin"]) span.normal-text')
             if location_tag: job_data['location'] = location_tag.get_text(strip=True)

        # 5. Hình thức làm việc
        job_data['work_model'] = None
        if info_container:
             # Thử tìm span chứa text cụ thể trước
             hybrid_span = info_container.find('span', class_='normal-text', string=lambda t: t and 'Hybrid' in t)
             remote_span = info_container.find('span', class_='normal-text', string=lambda t: t and 'Remote' in t)
             office_span = info_container.find('span', class_='normal-text', string=lambda t: t and ('Office' in t or 'office' in t))
             # Nếu không thấy, thử tìm cấu trúc chung hơn
             work_model_tag = info_container.select_one('div.preview-header-item:has(svg[clip-path*="clip0_947_6633"]) span.normal-text')

             if hybrid_span: job_data['work_model'] = 'Hybrid'
             elif remote_span: job_data['work_model'] = 'Remote'
             elif office_span: job_data['work_model'] = 'At office' # Hoặc lấy text chính xác từ span
             elif work_model_tag : job_data['work_model'] = work_model_tag.get_text(strip=True)

        # 6. Ngày đăng
        job_data['date_posted'] = None
        if info_container:
             date_posted_tag = info_container.select_one('div:has(svg use[href*="clock"]) span.normal-text')
             if date_posted_tag:
                 date_text = date_posted_tag.get_text(strip=True).replace('Posted', '').strip()
                 job_data['date_posted'] = date_text

        # 7. Kỹ năng/Tags
        job_data['skills'] = []
        # Thử tìm cả ở info_container và content_container (đôi khi skills nằm trong mô tả)
        skills_info_container = info_container.find('div', class_='imt-2') if info_container else None
        if skills_info_container:
            skill_tags = skills_info_container.select('a > div.itag')
            job_data['skills'].extend([skill.get_text(strip=True) for skill in skill_tags if skill.get_text(strip=True)])

        # Tìm thêm skills trong content nếu có cấu trúc riêng (ví dụ: div class="job-details__tag-list")
        skills_content_container = content_container.find('div', class_='job-details__tag-list') if content_container else None
        if skills_content_container:
            skill_tags = skills_content_container.select('.tag') # Lấy các thẻ có class 'tag'
            job_data['skills'].extend([skill.get_text(strip=True) for skill in skill_tags if skill.get_text(strip=True)])
        # Loại bỏ trùng lặp nếu có
        job_data['skills'] = list(set(job_data['skills']))


        # 8. Mô tả công việc, Yêu cầu, Lý do gia nhập
        job_data['description_raw_html'] = None
        job_data['description_text'] = None
        job_data['description_sections'] = {}
        if content_container:
             job_data['description_raw_html'] = str(content_container)
             job_data['description_text'] = content_container.get_text(separator='\n', strip=True)
             # Logic chia section (giữ nguyên)
             current_section_title = "Introduction"
             current_section_content = []
             valid_section_found = False
             for element in content_container.children:
                 if element.name == 'h2':
                      valid_section_found = True
                      if current_section_title and current_section_content:
                          section_text = '\n'.join(filter(None, [c.strip() for c in current_section_content])).strip()
                          if section_text: job_data['description_sections'][current_section_title] = section_text
                      current_section_title = element.get_text(strip=True)
                      current_section_content = []
                 elif element.name == 'div' and 'border-bottom-dashed' in element.get('class', []): continue
                 elif current_section_title or not valid_section_found:
                      if hasattr(element, 'get_text'):
                           text = element.get_text(separator='\n', strip=True)
                           if text: current_section_content.append(text)
                      elif isinstance(element, str) and element.strip():
                           current_section_content.append(element.strip())
             if current_section_title and current_section_content:
                 section_text = '\n'.join(filter(None, [c.strip() for c in current_section_content])).strip()
                 if section_text: job_data['description_sections'][current_section_title] = section_text
        else:
            logging.warning(f"Không tìm thấy content container (section.job-content) cho: {job_url}")

        # 9. Logo công ty
        job_data['company_logo_url'] = None
        # Thử tìm trong sidebar trước
        if sidebar_container:
            logo_img_tag = sidebar_container.select_one('div.employer-information__logo img')
            if logo_img_tag and logo_img_tag.get('src'):
                 job_data['company_logo_url'] = logo_img_tag['src']
        # Nếu không thấy, thử tìm trong header (ít phổ biến hơn cho logo chính)
        if not job_data['company_logo_url'] and header_container:
             logo_img_tag = header_container.select_one('a.logo-employer-card img') # Logo nhỏ ở header
             if logo_img_tag and logo_img_tag.get('src'):
                 # Có thể đây chỉ là logo nhỏ, không phải logo chính
                 job_data['company_logo_url'] = logo_img_tag['src']


        # Kiểm tra dữ liệu cơ bản
        if not job_data.get('title') and not job_data.get('company'):
            logging.warning(f"Dữ liệu trích xuất từ trang chi tiết thiếu title/company: {job_url}")
            # Có thể trả về job_data (chỉ có URL) hoặc None
            # return None

        logging.info(f"Crawl thành công chi tiết (Selenium): {job_url}")
        return job_data

    except TimeoutException:
        logging.error(f"Selenium timed out khi tải trang chi tiết: {job_url}")
        return job_data # Trả về ít nhất URL
    except WebDriverException as e:
        logging.error(f"Lỗi WebDriverException khi crawl chi tiết {job_url}: {e}")
        return job_data
    except Exception as e:
        logging.exception(f"Lỗi không xác định khi crawl chi tiết (Selenium) {job_url}: {e}")
        return job_data
    finally:
        if driver:
            try:
                driver.quit()
            except Exception as quit_ex:
                 logging.error(f"Lỗi khi đóng WebDriver chi tiết: {quit_ex}")


# --- Hàm Lưu dữ liệu (Giữ nguyên) ---
def save_to_json(data, filename="itviec_jobs_full_selenium.json"):
    """Lưu danh sách dữ liệu công việc vào file JSON."""
    if not data:
        logging.warning("Không có dữ liệu để lưu vào JSON.")
        return
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        logging.info(f"Đã lưu dữ liệu thành công vào file JSON: {filename}")
    except IOError as e:
        logging.error(f"Lỗi IO khi lưu file JSON {filename}: {e}")
    except Exception as e:
        logging.error(f"Lỗi không xác định khi lưu JSON: {e}")

def save_to_csv(data, filename="itviec_jobs_full_selenium.csv"):
    """Lưu danh sách dữ liệu công việc vào file CSV."""
    if not data:
        logging.warning("Không có dữ liệu để lưu vào CSV.")
        return

    base_fieldnames = ['url', 'title', 'company', 'salary', 'location', 'work_model', 'date_posted', 'skills', 'description_text', 'description_sections', 'company_logo_url', 'description_raw_html']
    all_keys = set(k for job in data for k in job.keys())
    fieldnames = base_fieldnames + sorted([key for key in all_keys if key not in base_fieldnames])

    processed_data = []
    for job in data:
        row = {}
        for key in fieldnames:
            value = job.get(key)
            if isinstance(value, list): row[key] = ', '.join(map(str, value))
            elif isinstance(value, dict): row[key] = json.dumps(value, ensure_ascii=False)
            elif value is None: row[key] = ''
            else: row[key] = str(value)
        processed_data.append(row)

    try:
        with open(filename, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore', restval='')
            writer.writeheader()
            writer.writerows(processed_data)
        logging.info(f"Đã lưu dữ liệu thành công vào file CSV: {filename}")
    except IOError as e:
        logging.error(f"Lỗi IO khi lưu file CSV {filename}: {e}")
    except Exception as e:
        logging.error(f"Lỗi không xác định khi lưu CSV: {e}")


# --- Hàm thực thi chính (Giữ nguyên) ---
def crawl_itviec(max_list_pages=None, max_detail_pages=None, save_json=True, save_csv=True):
    """
    Hàm chính điều khiển quá trình crawl toàn bộ itviec.
    """
    start_time = time.time()
    logging.info(f"===== BẮT ĐẦU QUÁ TRÌNH CRAWL ITVIEC (SELENIUM) - Max List Pages: {max_list_pages}, Max Detail Pages: {max_detail_pages} =====")

    # 1. Lấy danh sách URL công việc bằng Selenium
    job_urls = get_job_urls_selenium(max_pages=max_list_pages)

    if not job_urls:
        logging.warning("Không lấy được URL công việc nào. Kết thúc.")
        end_time = time.time()
        total_time_seconds = end_time - start_time
        total_time_minutes = total_time_seconds / 60
        logging.info(f"===== KẾT THÚC QUÁ TRÌNH CRAWL (SELENIUM) - Không có URL =====")
        logging.info(f"Tổng thời gian thực thi: {total_time_seconds:.2f} giây (~{total_time_minutes:.2f} phút)")
        return

    logging.info(f"Tổng số URL tìm được: {len(job_urls)}")

    urls_to_crawl = job_urls
    if max_detail_pages is not None:
        if max_detail_pages <= 0:
             logging.warning("max_detail_pages <= 0, sẽ không crawl chi tiết job nào.")
             urls_to_crawl = []
        elif max_detail_pages < len(job_urls):
             logging.warning(f"Giới hạn crawl chi tiết ở {max_detail_pages} công việc đầu tiên.")
             urls_to_crawl = job_urls[:max_detail_pages]

    # 2. Crawl chi tiết từng công việc bằng Selenium
    all_jobs_data = []
    total_urls_to_crawl = len(urls_to_crawl)

    if total_urls_to_crawl > 0:
        logging.info(f"Bắt đầu crawl chi tiết cho {total_urls_to_crawl} công việc...")
        for i, url in enumerate(urls_to_crawl):
            logging.info(f"--- Đang crawl công việc chi tiết {i+1}/{total_urls_to_crawl}: {url} ---")
            details = scrape_job_details_selenium(url)
            if details:
                if details.get('title') or details.get('company'): # Chỉ thêm nếu có dữ liệu cơ bản
                    all_jobs_data.append(details)
                    logging.info(f"===> Crawl thành công chi tiết {i+1}/{total_urls_to_crawl}")
                else:
                    logging.warning(f"===> Dữ liệu chi tiết trả về bị trống, bỏ qua: {url}")
            else:
                logging.warning(f"===> Bỏ qua công việc do lỗi crawl chi tiết (hàm trả về None): {url}")

            delay = random.uniform(DELAY_BETWEEN_DETAIL_PAGES[0], DELAY_BETWEEN_DETAIL_PAGES[1])
            logging.debug(f"Nghỉ {delay:.2f} giây trước khi crawl job tiếp theo...")
            time.sleep(delay)
        logging.info(f"Hoàn thành crawl chi tiết. Crawl thành công {len(all_jobs_data)}/{total_urls_to_crawl} công việc.")
    else:
        logging.info("Không có URL chi tiết nào cần crawl.")


    # 3. Lưu kết quả
    if all_jobs_data:
        logging.info(f"Bắt đầu lưu {len(all_jobs_data)} jobs vào file...")
        if save_json: save_to_json(all_jobs_data)
        if save_csv: save_to_csv(all_jobs_data)
    else:
        logging.warning("Không có dữ liệu công việc nào được crawl thành công để lưu.")

    end_time = time.time()
    total_time_seconds = end_time - start_time
    total_time_minutes = total_time_seconds / 60
    logging.info("===== KẾT THÚC QUÁ TRÌNH CRAWL (SELENIUM) =====")
    logging.info(f"Tổng thời gian thực thi: {total_time_seconds:.2f} giây (~{total_time_minutes:.2f} phút)")


# --- Chạy chương trình ---
if __name__ == "__main__":
    try:
        # --- Cấu hình chạy ---
        MAX_LIST_PAGES_TO_GET_URLS = None  # None = không giới hạn
        MAX_DETAIL_JOBS_TO_SCRAPE = None # None = không giới hạn

        # --- Để test nhanh, bạn có thể đặt giá trị nhỏ ---
        # MAX_LIST_PAGES_TO_GET_URLS = 2  # Chỉ lấy URL từ 2 trang đầu
        # MAX_DETAIL_JOBS_TO_SCRAPE = 5 # Chỉ crawl chi tiết 5 job đầu tiên tìm được

        crawl_itviec(max_list_pages=MAX_LIST_PAGES_TO_GET_URLS,
                     max_detail_pages=MAX_DETAIL_JOBS_TO_SCRAPE,
                     save_json=True,
                     save_csv=True)
    except Exception as e:
        logging.exception("Lỗi không mong muốn xảy ra ở cấp cao nhất của chương trình.")