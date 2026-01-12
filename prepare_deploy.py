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
        
    # Filter and Copy
    deploy_metadata = []
    successful_copies = 0
    
    for p in all_papers:
        # Clone metadata so we don't affect original
        meta = p.copy()
        
        # Check if in Exam Set (P4 WA1/CA1)
        is_exam_set = (p.get('level') == 'P4' and p.get('term') in ['WA1', 'CA1'])
        
        if is_exam_set:
            # Mark as available
            meta['available'] = True
            # We rely on pdf_link now, no need to copy files
            # if 'pdf_link' is missing, it might default to page url or we can warn
            if not meta.get('pdf_link'):
                print(f"Warning: No PDF link for {p['title']}")
        else:
            # Mark as unavailable (Local Only)
            meta['available'] = False
            
        deploy_metadata.append(meta)
    
    print(f"Generated papers.js with {len(deploy_metadata)} entries.")
    
    # Write papers.js
    json_output = json.dumps(deploy_metadata, indent=2)
    with open('deploy/papers.js', 'w', encoding='utf-8') as f:
        f.write(f"const papers = {json_output};")
        
    # Copy index.html
    shutil.copy2('index.html', 'deploy/index.html')
    
    print("Deployment preparation complete in 'deploy/' folder.")

if __name__ == '__main__':
    prepare()
