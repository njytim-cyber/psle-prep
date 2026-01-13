import json
import os

# Read papers.js
try:
    with open('papers.js', 'r', encoding='utf-8') as f:
        content = f.read()
        json_str = content.replace('const papers = ', '').rstrip(';').strip()
        papers = json.loads(json_str)
except Exception as e:
    print(f"Error reading papers.js: {e}")
    exit(1)

# Filter for Exam Set: P4 + (WA1 or CA1)
exam_papers = []
subjects = set()
total_size = 0

for p in papers:
    if p.get('level') == 'P4' and p.get('term') in ['WA1', 'CA1']:
        exam_papers.append(p)
        subjects.add(p.get('subject', 'Maths'))
        
        # Check size if file exists
        fpath = p.get('file_path', '').replace('/', os.sep)
        if os.path.exists(fpath):
            total_size += os.path.getsize(fpath)

print(f"--- Exam Set Analysis (P4 WA1/CA1) ---")
print(f"Total Papers: {len(exam_papers)}")
print(f"Subjects Covered: {', '.join(sorted(subjects))}")
if total_size > 0:
    print(f"Total Size: {total_size / (1024*1024):.2f} MB")
else:
    print("Total Size: Unknown (files not found locally)")

# Breakdown by Subject
by_subj = {}
for p in exam_papers:
    s = p.get('subject', 'Maths')
    by_subj[s] = by_subj.get(s, 0) + 1

print("\nBreakdown by Subject:")
for s, count in sorted(by_subj.items()):
    print(f"  {s}: {count}")
