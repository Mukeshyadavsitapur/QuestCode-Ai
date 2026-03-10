import sys
import os

path = r'd:\QuestCode-Ai\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Fix 1: Restore closing brace for tools div if it was missed
    if line.strip() == '</button>' and (i + 1 < len(lines) and '</div>' in lines[i+1]) and (i + 2 < len(lines) and 'SmartContent' in lines[i+2]):
        new_lines.append(line)
        new_lines.append(lines[i+1])
        new_lines.append('                                    )}\n')
        print(f"Added tools closure after line {i+2}")
        # Skip the next line since we handled it
        continue
    
    # Fix 2: Restore closing brace for action bar role check
    if line.strip() == '</div>' and (i > 0 and 'Generate Quiz' in lines[i-1]) and (i + 1 < len(lines) and '</div>' in lines[i+1]):
        new_lines.append(line)
        new_lines.append('                                    )}\n')
        print(f"Added action bar role check closure after line {i+1}")
        continue

    # Fix 3: Ensure message-bubble div and chat-bubble-container div close correctly
    # If we see </div> then </div> then ); then }
    
    new_lines.append(line)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.writelines(new_lines)
print("Done")
