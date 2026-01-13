
import urllib.request
import re

def find_links():
    try:
        url = "https://www.testpapersfree.com/p4/"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            
        print(f"Searching for 'Math' links on {url}...")
        
        # Regex to find hrefs
        links = re.findall(r'<a[^>]+href=["\'](.*?)["\'][^>]*>(.*?)</a>', html, re.IGNORECASE | re.DOTALL)
        
        for href, text in links:
            clean_text = re.sub(r'<[^>]+>', '', text).strip()
            if 'Math' in clean_text or 'math' in href:
                print(f"Found: {clean_text} -> {href}")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_links()
