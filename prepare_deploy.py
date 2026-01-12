import json
import os
import shutil
import re

# Logic:
# 1. Read papers.js
# 2. Filter for P4 WA1/CA1
# 3. Create deploy/ directory
# 4. Copy index.html
# 5. Create filtered deploy/papers.js
# 6. Copy referenced PDFs to deploy/papers/...

def prepare():
    # Setup directories
    if os.path.exists('deploy'):
        shutil.rmtree('deploy')
    os.makedirs('deploy')
    
    # Read papers
    with open('papers.js', 'r', encoding='utf-8') as f:
        content = f.read()
        json_str = content.replace('const papers = ', '').rstrip(';').strip()
        all_papers = json.loads(json_str)
        
    # Filter
    exam_papers = []
    for p in all_papers:
        if p.get('level') == 'P4' and p.get('term') in ['WA1', 'CA1']:
            exam_papers.append(p)
    
    print(f"Found {len(exam_papers)} papers for deployment.")
    
    # Copy PDFs
    successful_copies = 0
    for p in exam_papers:
        src = p.get('file_path', '').replace('/', os.sep)
        if not os.path.exists(src):
            print(f"Warning: File missing {src}")
            continue
            
        dst = os.path.join('deploy', src)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst)
        successful_copies += 1
        
    print(f"Copied {successful_copies} PDF files.")
    
    # Write filtered papers.js
    json_output = json.dumps(exam_papers, indent=2)
    with open('deploy/papers.js', 'w', encoding='utf-8') as f:
        f.write(f"const papers = {json_output};")
        
    # Copy index.html
    shutil.copy2('index.html', 'deploy/index.html')
    
    print("Deployment preparation complete in 'deploy/' folder.")

if __name__ == '__main__':
    prepare()
