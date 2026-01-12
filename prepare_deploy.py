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
    papers_path = 'js/data/papers.js'
    if not os.path.exists(papers_path):
        print(f"Error: {papers_path} not found.")
        return

    with open(papers_path, 'r', encoding='utf-8') as f:
        content = f.read()
        # ESM format: export const papers = [...];
        json_str = content.replace('export const papers = ', '').rstrip(';').strip()
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
    # Write papers.js
    if not os.path.exists('deploy/js/data'):
        os.makedirs('deploy/js/data')
        
    json_output = json.dumps(deploy_metadata, indent=2)
    with open('deploy/js/data/papers.js', 'w', encoding='utf-8') as f:
        f.write(f"export const papers = {json_output};")
        
    # Copy index.html and assets
    shutil.copy2('index.html', 'deploy/index.html')
    
    # Copy JS Modules
    if os.path.exists('js'):
        # We need to copy everything in js/ EXCEPT data/papers.js which we generated above
        # But copytree is recursive. Simpler to copy all js/ then overwrite papers.js
        # Actually simplest: Copy all js/ structure to deploy/js/ then write our filtered paper list
        if os.path.exists('deploy/js'):
            shutil.rmtree('deploy/js')
        shutil.copytree('js', 'deploy/js')
        
        # Overwrite the papers.js with the filtered one
        with open('deploy/js/data/papers.js', 'w', encoding='utf-8') as f:
            f.write(f"export const papers = {json_output};")

    # Copy CSS
    if os.path.exists('css'):
        if os.path.exists('deploy/css'): shutil.rmtree('deploy/css')
        shutil.copytree('css', 'deploy/css')
        
    # Copy Avatars
    if os.path.exists('avatars.png'):
        shutil.copy2('avatars.png', 'deploy/avatars.png')
    
    print("Deployment preparation complete in 'deploy/' folder.")

if __name__ == '__main__':
    prepare()
