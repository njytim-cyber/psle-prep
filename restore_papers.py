
import os
import re
import json
import time
import requests
import urllib.parse
from bs4 import BeautifulSoup

BASE_URL = "https://www.testpapersfree.com"
OUTPUT_DIR = "papers"
METADATA_FILE = "papers.json"

# Subject configuration: display name -> URL path
SUBJECTS = {
    'Maths': 'maths',
    'Science': 'science',
    'English': 'english'
}

# Keywords to identify subject in paper titles
SUBJECT_KEYWORDS = {
    'Maths': ['Math', 'Maths'],
    'Science': ['Science', 'Sci'],
    'English': ['English', 'Eng']
}

def get_page(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        return response.content
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def download_file(url, filepath):
    try:
        content = get_page(url)
        if content:
            with open(filepath, 'wb') as f:
                f.write(content)
            print(f"Downloaded: {filepath}")
            return True
    except Exception as e:
        print(f"Failed to download {url}: {e}")
    return False

def clean_name(text):
    return re.sub(r'[<>:"/\\|?*]', '', text).strip()

def parse_term(title):
    title_upper = title.upper()
    if "SA1" in title_upper: return "SA1"
    if "SA2" in title_upper: return "SA2"
    if "CA1" in title_upper: return "CA1"
    if "CA2" in title_upper: return "CA2"
    if "WA1" in title_upper: return "WA1"
    if "WA2" in title_upper: return "WA2"
    if "WA3" in title_upper: return "WA3"
    if "EYA" in title_upper or "END OF YEAR" in title_upper: return "End of Year"
    if "TERM 1" in title_upper: return "Term 1"
    if "TERM 2" in title_upper: return "Term 2"
    if "TERM 3" in title_upper: return "Term 3"
    return "Other"

def scrape_papers():
    levels = ['P4', 'P5', 'P6']
    papers_metadata = []
    processed_titles = set()
    total_papers_found = 0

    for subject_name, subject_path in SUBJECTS.items():
        print(f"\n=== Processing Subject: {subject_name} ===")
        
        for level in levels:
            print(f"--- Processing Level: {level} ---")
            page = 1
            
            while True:
                # Construct URL for specific subject and level
                level_list_url = f"https://www.testpapersfree.com/{subject_path}/?level={level}&year=%25&type=%25&school=%25"
                paged_url = f"{level_list_url}&page={page}"
                print(f"Fetching {subject_name} {level} page {page}: {paged_url}")
                content = get_page(paged_url)
                if not content:
                    break

                soup = BeautifulSoup(content, 'html.parser')
                links = soup.find_all('a', href=True)
                
                papers_on_page = 0
                
                for a in links:
                    href = a['href']
                    title = a.get_text().strip()
                    
                    # Filter for papers matching current subject (heuristic)
                    keywords = SUBJECT_KEYWORDS.get(subject_name, [])
                    if not any(kw in title for kw in keywords):
                        continue

                    # Extract Year
                    year_match = re.search(r'20[2-9][0-9]', title)
                    year = int(year_match.group(0)) if year_match else 0
                    
                    # Filter for 2020 onwards
                    if year < 2020:
                        continue
                        
                    if title in processed_titles:
                        continue
                    
                    processed_titles.add(title)
                    papers_on_page += 1
                    total_papers_found += 1
                    
                    print(f"Found {subject_name} {level} Paper ({total_papers_found}): {title}")
                    
                    # Extract School Name
                    parts = title.split('-')
                    if len(parts) > 1:
                        school = parts[-1].strip()
                    else:
                        school = "Unknown"
                        
                    term = parse_term(title)
                    
                    paper_info = {
                        "title": title,
                        "year": year,
                        "school": clean_name(school),
                        "term": term,
                        "level": level,
                        "subject": subject_name,
                        "url": urllib.parse.urljoin(BASE_URL + f"/{subject_path}/", href)
                    }
                    
                    # Process individual paper page
                    process_paper_page(paper_info, papers_metadata)
                    
                    # Be nice to the server
                    time.sleep(1)
                    
                if papers_on_page == 0:
                    print(f"No new {subject_name} {level} papers found on page {page}. Limit reached.")
                    break
                    
                page += 1

    # Final save
    update_data_file(papers_metadata)
    print(f"Finished. Total papers: {len(papers_metadata)}")

def update_data_file(metadata):
    try:
        js_file = 'papers.js'
        
        # Create the JS object string
        json_str = json.dumps(metadata, indent=2)
        content = f"const papers = {json_str};"
        
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write(content)
            
    except Exception as e:
        print(f"Error updating JS data file: {e}")

def process_paper_page(paper_info, metadata_list):
    # Optimization: Check if we already have the file locally
    # Structure: papers/School/Year/Term/
    dir_path = os.path.join(OUTPUT_DIR, str(paper_info['school']), str(paper_info['year']), paper_info['term'])
    filename = clean_name(paper_info['title']) + ".pdf"
    filepath = os.path.join(dir_path, filename)
    
    if os.path.exists(filepath):
        print(f"  Found local file: {filepath}")
        paper_info['file_path'] = filepath.replace(os.sep, '/')
        metadata_list.append(paper_info)
        update_data_file(metadata_list)
        return

    print(f"  Fetching details: {paper_info['url']}")
    content = get_page(paper_info['url'])
    if not content:
        return

    soup = BeautifulSoup(content, 'html.parser')
    
    # Try to find PDF link
    pdf_url = None
    
    # Strategy 1: Link ending in .pdf
    pdf_link = soup.find('a', href=re.compile(r'\.pdf$', re.IGNORECASE))
    if pdf_link:
        pdf_url = pdf_link['href']
    
    # Strategy 2: "Download" text link
    if not pdf_url:
        dl_link = soup.find('a', string=re.compile(r'Download', re.IGNORECASE))
        if dl_link and dl_link.has_attr('href'):
            pdf_url = dl_link['href']
            
    # Strategy 3: Check iframes
    if not pdf_url:
        iframe = soup.find('iframe')
        if iframe and iframe.has_attr('src') and 'pdf' in iframe['src']:
            pdf_url = iframe['src']

    if pdf_url:
        # Resolve URL
        if not pdf_url.startswith('http'):
            # It's relative to the page URL or base
            # Most links seem relative to root or current dir
            # Handle ../ or / cases
            pdf_url = urllib.parse.urljoin(paper_info['url'], pdf_url)
            
        # Structure: papers/School/Year/Term/
        dir_path = os.path.join(OUTPUT_DIR, str(paper_info['school']), str(paper_info['year']), paper_info['term'])
        os.makedirs(dir_path, exist_ok=True)
        
        filename = clean_name(paper_info['title']) + ".pdf"
        filepath = os.path.join(dir_path, filename)
        
        saved = False
        if not os.path.exists(filepath):
            if download_file(pdf_url, filepath):
                saved = True
        else:
            print(f"  Skipping existing: {filepath}")
            saved = True
            
        if saved:
            # Use forward slashes for web compatibility
            rel_path = filepath.replace(os.sep, '/')
            paper_info['file_path'] = rel_path
            metadata_list.append(paper_info)
            update_data_file(metadata_list)
            
    else:
        print("  NO PDF FOUND")

if __name__ == "__main__":
    scrape_papers()
