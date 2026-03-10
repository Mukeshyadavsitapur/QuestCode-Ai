import sys
import os

path = r'd:\QuestCode-Ai\src\App.tsx'
if not os.path.exists(path):
    print(f"Error: {path} not found")
    sys.exit(1)

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_done = False
for i, line in enumerate(lines):
    # Search for the specific pattern around line 2033
    if 2000 < i < 2050 and line.strip() == ')}':
        if not skip_done:
            print(f"Removing line {i+1}: {line.strip()}")
            skip_done = True
            continue 
    new_lines.append(line)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.writelines(new_lines)
print("Done")
