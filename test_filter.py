
import requests
from bs4 import BeautifulSoup

def check_p4_math():
    try:
        # Based on form inspection, trying likely query param
        url = "https://www.testpapersfree.com/maths/?level=P4&year=%25&type=%25&school=%25" 
        print(f"Fetching {url}...")
        
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        links = soup.find_all('a', href=True)
        print(f"Found {len(links)} links. Checking for exam papers...")
        
        count = 0
        for a in links:
            href = a['href']
            text = a.get_text().strip()
            # Look for typical paper titles
            if ('202' in text) and ('P4' in text or 'Primary 4' in text):
                print(f"Match: {text} -> {href}")
                count += 1
                if count >= 10: break
                
        if count == 0:
            print("No papers found with this query.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_p4_math()
