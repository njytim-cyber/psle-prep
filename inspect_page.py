
import urllib.request
import re

def inspect_forms():
    try:
        url = "https://www.testpapersfree.com/maths/"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            
        print(f"Inspecting forms on {url}...")
        
        # Simple regex to find <form> tags and their inputs
        forms = re.findall(r'<form.*?>.*?</form>', html, re.IGNORECASE | re.DOTALL)
        if not forms:
            print("No forms found. Checking for filter links...")
            # Check for links that look like filters, e.g., ?level=P4
            links = re.findall(r'href=["\']([^"\']+\?.*?)["\']', html)
            for link in links:
                print(f"Filter link?: {link}")
                
            # Also check for "Primary 4" specific links
            p4_links = re.findall(r'<a[^>]+href=["\'](.*?)["\'][^>]*>.*?Primary 4.*?</a>', html, re.IGNORECASE | re.DOTALL)
            for link in p4_links:
                print(f"P4 Specific Link: {link}")

        for i, form in enumerate(forms):
            print(f"--- Form {i+1} ---")
            print(form[:500]) # Print first 500 chars of form
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_forms()
