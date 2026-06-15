import os
import re

files_to_update = [
    "README.md",
    "docs/file-walkthrough.md",
    "docs/index.md",
    "docs/from-scratch-tutorial.md",
    "docs/architecture-guide.md",
    "frontend/frontend/src/components/Home.jsx",
    "frontend/frontend/src/components/Dashboard.jsx",
    "frontend/frontend/index.html"
]

def replace_in_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace occurrences
    new_content = re.sub(r'Micro Task Hub', 'Student Deck', content, flags=re.IGNORECASE)
    new_content = re.sub(r'Micro-Task Hub', 'Student Deck', new_content, flags=re.IGNORECASE)

    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
    else:
        print(f"No changes for {filepath}")

for file in files_to_update:
    replace_in_file(file)

print("Renaming completed.")
