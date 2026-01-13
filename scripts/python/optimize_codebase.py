
import os

def optimize():
    with open('index.html', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # defined indices (0-based)
    # CSS Block: Line 17 (<style>) to Line 1658 (</style>)
    # Content: Line 18 to 1657
    css_start_tag = 16  # line 17
    css_content_start = 17 # line 18
    css_content_end = 1657 # line 1658 (end of content, excluding tag)
    css_end_tag = 1657     # line 1658 (</style>)

    # JS Block: Line 1963 (<script>) to Line 3706 (</script>)
    # Content: Line 1964 to 3705
    js_start_tag = 1962   # line 1963
    js_content_start = 1963 # line 1964
    js_content_end = 3705   # line 3706 (end of content)
    js_end_tag = 3705       # line 3706 (</script>)

    # Validate markers
    if '<style>' not in lines[css_start_tag]:
        print(f"Error: Expected <style> at line {css_start_tag+1}, found: {lines[css_start_tag]}")
        # Search for it to be safe
        for i, line in enumerate(lines):
            if '<style>' in line:
                print(f"Found <style> at {i+1}")
                css_start_tag = i
                css_content_start = i + 1
                break
        
        # Search for end style
        for i in range(css_start_tag, len(lines)):
            if '</style>' in lines[i]:
                print(f"Found </style> at {i+1}")
                css_end_tag = i
                css_content_end = i
                break

    if '<script>' not in lines[js_start_tag]:
        print(f"Error: Expected <script> at line {js_start_tag+1}, found: {lines[js_start_tag]}")
        # Search for the LAST script tag
        script_starts = [i for i, l in enumerate(lines) if '<script>' in l]
        script_ends = [i for i, l in enumerate(lines) if '</script>' in l]
        if script_starts and script_ends:
            js_start_tag = script_starts[-1]
            js_content_start = js_start_tag + 1
            js_end_tag = script_ends[-1]
            js_content_end = js_end_tag
            print(f"Found last script block: {js_start_tag+1} to {js_end_tag+1}")

    # Extract CSS
    css_lines = lines[css_content_start:css_content_end]
    with open('css/styles.css', 'w', encoding='utf-8') as f:
        f.writelines(css_lines)
    print(f"Extracted {len(css_lines)} lines to css/styles.css")

    # Extract JS
    js_lines = lines[js_content_start:js_content_end]
    with open('js/app.js', 'w', encoding='utf-8') as f:
        f.writelines(js_lines)
    print(f"Extracted {len(js_lines)} lines to js/app.js")

    # Reconstruct HTML
    new_html = []
    # Up to CSS start
    new_html.extend(lines[:css_start_tag])
    # Link
    new_html.append('    <link rel="stylesheet" href="css/styles.css">\n')
    # Gap between CSS end and JS start (includes HTML body)
    new_html.extend(lines[css_end_tag+1:js_start_tag])
    # Script src
    new_html.append('    <script src="js/app.js"></script>\n')
    # Rest of file
    new_html.extend(lines[js_end_tag+1:])

    with open('index.html', 'w', encoding='utf-8') as f:
        f.writelines(new_html)
    print("Updated index.html")

if __name__ == '__main__':
    optimize()
