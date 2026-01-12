import json
import requests
from bs4 import BeautifulSoup
import re
import time
import urllib.parse

# Logic adapted from download.py
def get_page(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            return response.text
    except Exception as e:
        print(f"Error fetching {url}: {e}")
    return None

def fetch_links():
    # Read papers.js
    with open('papers.js', 'r', encoding='utf-8') as f:
        content = f.read()
        json_str = content.replace('const papers = ', '').rstrip(';').strip()
        all_papers = json.loads(json_str)

    # Filter for Exam Set
    exam_papers = [p for p in all_papers if p.get('level') == 'P4' and p.get('term') in ['WA1', 'CA1']]
    print(f"Targeting {len(exam_papers)} papers...")

    updated_count = 0
    
    for i, p in enumerate(exam_papers):
        print(f"[{i+1}/{len(exam_papers)}] Processing: {p['title']}")
        
        # skip if already has pdf_link
        if p.get('pdf_link'):
            print("  Already has link.")
            continue

        html = get_page(p['url'])
        if not html:
            continue

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
                pdf_url = urllib.parse.urljoin(p['url'], pdf_url)
            
            p['pdf_link'] = pdf_url
            print(f"  Found PDF: {pdf_url}")
            updated_count += 1
        else:
            print("  NO PDF LINK FOUND")
            
        time.sleep(0.5) # Be nice

    print(f"Updated {updated_count} papers with direct PDF links.")
    
    # Save back to papers.js (updating the MAIN file with new field)
    # We need to update the original list
    # Use a map for easy lookup
    exam_map = {p['url']: p.get('pdf_link') for p in exam_papers if p.get('pdf_link')}
    
    for p in all_papers:
        if p['url'] in exam_map:
            p['pdf_link'] = exam_map[p['url']]
            
    json_output = json.dumps(all_papers, indent=2)
    with open('papers.js', 'w', encoding='utf-8') as f:
        f.write(f"const papers = {json_output};")
    
    # Also save a small list for user inspection
    with open('exam_links.json', 'w', encoding='utf-8') as f:
        json.dump(exam_papers, f, indent=2)

if __name__ == '__main__':
    fetch_links()
