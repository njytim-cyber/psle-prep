import json
import re

# Read papers.js
with open('papers.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract JSON
json_str = content.replace('const papers = ', '').rstrip(';')
papers = json.loads(json_str)

# Find 'Other' term papers
other_papers = [p for p in papers if p.get('term') == 'Other']
print(f'Total papers with term "Other": {len(other_papers)}')
print()

# Check for Prelim in title
prelim_papers = []
exceptions = []

for p in other_papers:
    title = p.get('title', '')
    if 'Prelim' in title or 'PRELIM' in title or 'prelim' in title:
        prelim_papers.append(p)
    else:
        exceptions.append(p)

print(f'Papers with "Prelim" in title: {len(prelim_papers)}')
print(f'Exceptions (no "Prelim" in title): {len(exceptions)}')
print()

if exceptions:
    print('=== EXCEPTIONS ===')
    for p in exceptions:
        print(f"  - {p['title']}")

# Reclassify prelim papers
reclassified_count = 0
for p in papers:
    if p.get('term') == 'Other':
        title = p.get('title', '')
        if 'Prelim' in title or 'PRELIM' in title or 'prelim' in title:
            p['term'] = 'Prelim'
            reclassified_count += 1

print()
print(f'Reclassified {reclassified_count} papers from "Other" to "Prelim"')

# Save updated papers.js
json_str = json.dumps(papers, indent=2)
output = f"const papers = {json_str};"
with open('papers.js', 'w', encoding='utf-8') as f:
    f.write(output)

print('Updated papers.js saved!')
