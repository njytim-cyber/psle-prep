import json
import os
import sys

def check_no_conflict_markers(filepath):
    """Checks a file for git merge conflict markers."""
    if not os.path.exists(filepath):
        return True # logic handled elsewhere if file missing is critical
    
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        if '<<<<<<< HEAD' in content or '=======' in content and '>>>>>>>' in content:
            print(f"❌ FAILURE: Merge conflict markers found in {filepath}")
            return False
    return True

def validate_json(filepath):
    """Validates that a file contains valid JSON."""
    if not os.path.exists(filepath):
        print(f"⚠️ WARNING: {filepath} not found.")
        return True
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            json.load(f)
        return True
    except json.JSONDecodeError as e:
        print(f"❌ FAILURE: Invalid JSON in {filepath}: {e}")
        return False

def validate_js_module(filepath):
    """Basic check that a JS module doesn't have obvious syntax errors (like remaining conflict markers)."""
    return check_no_conflict_markers(filepath)

def run_checks():
    print("Running Pre-Deployment Validation Checks...")
    has_error = False

    # 1. Critical Files Check
    critical_files = ['index.html', 'package.json', 'js/app.js']
    for f in critical_files:
        if not check_no_conflict_markers(f):
            has_error = True

    # 2. JSON Validation
    if not validate_json('package.json'):
        has_error = True
    
    # 3. Check papers.js (Data integrity)
    papers_path = 'js/data/papers.js'
    if check_no_conflict_markers(papers_path):
        # Lightweight check: ensure it has the export statement
        try:
            with open(papers_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if 'export const papers =' not in content:
                    print(f"❌ FAILURE: {papers_path} missing 'export const papers ='")
                    has_error = True
        except Exception as e:
            print(f"❌ FAILURE: Could not read {papers_path}: {e}")
            has_error = True
    else:
        has_error = True

    if has_error:
        print("\n💥 Validation Failed. Deployment aborted.")
        sys.exit(1)
    else:
        print("\n✅ All validation checks passed!")
        sys.exit(0)

if __name__ == "__main__":
    run_checks()
