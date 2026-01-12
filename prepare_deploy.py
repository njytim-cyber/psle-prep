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
        
        # Check availability based on PDF link presence
        # (For web deployment, only papers with remote links are "available")
        if meta.get('pdf_link'):
            meta['available'] = True
        else:
            # If no link, mark as unavailable (Local Only)
            meta['available'] = False
            
        deploy_metadata.append(meta)
    
    print(f"Generated papers.js with {len(deploy_metadata)} entries.")
    available_count = sum(1 for p in deploy_metadata if p['available'])
    print(f"Papers available for web: {available_count}/{len(deploy_metadata)}")
    
    # Write papers.js
    json_output = json.dumps(deploy_metadata, indent=2)
    with open('deploy/papers.js', 'w', encoding='utf-8') as f:
        f.write(f"const papers = {json_output};")
        
    # Copy index.html
    shutil.copy2('index.html', 'deploy/index.html')
    
    print("Deployment preparation complete in 'deploy/' folder.")

if __name__ == '__main__':
    prepare()
