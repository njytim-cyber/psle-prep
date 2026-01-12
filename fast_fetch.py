import json
import requests
from bs4 import BeautifulSoup
import re
import time
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# Lock for thread-safe printing/counting
print_lock = threading.Lock()
results_lock = threading.Lock()

def get_page(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        # Shorter timeout for speed
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            return response.text
    except Exception:
        pass
    return None

def process_paper(p):
    # If already has link, skip
    if p.get('pdf_link'):
        return None

    url = p['url']
    html = get_page(url)
    if not html:
        return None

    soup = BeautifulSoup(html, 'html.parser')
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
            pdf_url = urllib.parse.urljoin(url, pdf_url)
        return (p['url'], pdf_url)
    
    return None

def main():
    print("Reading papers.js...")
    with open('papers.js', 'r', encoding='utf-8') as f:
        content = f.read()
        json_str = content.replace('const papers = ', '').rstrip(';').strip()
        all_papers = json.loads(json_str)

    # We only need to process papers that don't have links
    # But currently none have links (lost data)
    # UNLESS papers.js was updated partially? (Unlikely)
    
    # Create map for O(1) update
    paper_map = {p['url']: p for p in all_papers}
    
    tasks = []
    total = len(all_papers)
    print(f"Starting parallel fetch for {total} papers (20 threads)...")
    
    updated_count = 0
    
    with ThreadPoolExecutor(max_workers=20) as executor:
        future_map = {executor.submit(process_paper, p): p for p in all_papers}
        
        completed = 0
        for future in as_completed(future_map):
            completed += 1
            res = future.result()
            if res:
                p_url, pdf_link = res
                with results_lock:
                    paper_map[p_url]['pdf_link'] = pdf_link
                    updated_count += 1
                    
            if completed % 50 == 0:
                print(f"Progress: {completed}/{total} - Found {updated_count} PDFs")

    print(f"Done! Updated {updated_count} papers.")
    
    # Save
    json_output = json.dumps(all_papers, indent=2)
    with open('papers.js', 'w', encoding='utf-8') as f:
        f.write(f"const papers = {json_output};")
    print("Saved to papers.js")

if __name__ == '__main__':
    main()
