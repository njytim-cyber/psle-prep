
import requests
from bs4 import BeautifulSoup

def inspect_show_page():
    try:
        # Using a valid ID found in the previous step
        url = "https://www.testpapersfree.com/show.php?testpaperid=89527"
        print(f"Fetching {url}...")
        
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Look for PDF links
        pdf_links = soup.find_all('a', href=re.compile(r'\.pdf$'))
        if pdf_links:
            print(f"Found {len(pdf_links)} PDF links:")
            for a in pdf_links:
                print(f"  {a['href']}")
        else:
            print("No direct PDF links found. Checking iframes...")
            iframes = soup.find_all('iframe')
            for f in iframes:
                src = f.get('src', '')
                if 'pdf' in src:
                    print(f"  Iframe PDF src: {src}")

        # Also dump potential download buttons
        buttons = soup.find_all('a', string=re.compile(r'Download', re.IGNORECASE))
        for b in buttons:
            print(f"  Download Button: {b['href']}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    import re
    inspect_show_page()
