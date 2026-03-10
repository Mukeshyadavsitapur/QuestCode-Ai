import sys
import os

path = r'd:\QuestCode-Ai\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Restore ')}' after tools div
    if 1980 < i < 2020 and '</div>' in line and (i+1 < len(lines) and 'SmartContent' in lines[i+1]):
        new_lines.append(line)
        new_lines.append('                                    )}\n')
        print(f"Restored )}} at line {i+2}")
        continue
    
    # Remove extra ')}' after action bar div and message-bubble div
    if 2000 < i < 2050 and line.strip() == ')}' and (i > 0 and '</div>' in lines[i-1]) and (i+1 < len(lines) and '</div>' in lines[i+1]):
         print(f"Removing extra )}} at line {i+1}")
         continue
         
    new_lines.append(line)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.writelines(new_lines)
print("Done")
