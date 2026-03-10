import sys

path = r'd:\QuestCode-Ai\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
in_map = False
map_start_idx = -1
map_end_idx = -1

for i, line in enumerate(lines):
    if '{messages.map((msg, idx) => {' in line:
        map_start_idx = i
        in_map = True
    if in_map and '});' in line and (i > 0 and ')' in lines[i-1]):
        # This is a bit risky but let's try to find the end of the map
        # Better: find the next significant block or use indices from view_file
        pass

# Hardcoded indices based on Step 256 (1981 to 2033)
# 1981 is index 1980
start = 1980
end = 2033

# Corrected block content
corrected_block = [
    '                          {messages.map((msg, idx) => {\n',
    '                            return (\n',
    '                              <div key={idx} className={`chat-bubble-container ${msg.role}`} data-msg-idx={idx}>\n',
    '                                <div className={`message-bubble ${msg.role}`}>\n',
    "                                  {msg.role === 'ai' && msg.content && msg.content !== '*Thinking...*' && (\n",
    '                                    <div className="msg-bubble-tools">\n',
    '                                      <button\n',
    "                                        className={`icon-btn ${isDictionaryActive ? 'active' : ''}`}\n",
    '                                        onClick={(e) => {\n',
    '                                          e.stopPropagation();\n',
    '                                          setIsDictionaryActive(!isDictionaryActive);\n',
    '                                        }}\n',
    '                                        title={isDictionaryActive ? "Disable Dictionary Mode" : "Enable Dictionary Mode (Click words)"}\n',
    '                                      >\n',
    '                                        <BookOpen size={16} />\n',
    '                                      </button>\n',
    '                                      <button\n',
    "                                        className={`icon-btn ${speakingMsgIdx === idx ? 'active' : ''}`}\n",
    '                                        onClick={(e) => {\n',
    '                                          e.stopPropagation();\n',
    '                                          e.preventDefault();\n',
    '                                          handleListen(msg.content, idx);\n',
    '                                        }}\n',
    '                                        title={speakingMsgIdx === idx ? "Stop listening" : "Listen"}\n',
    '                                      >\n',
    '                                        {speakingMsgIdx === idx ? <VolumeX size={15} /> : <Volume2 size={15} />}\n',
    '                                      </button>\n',
    '                                    </div>\n',
    '                                  )}\n',
    '\n',
    '                                  <SmartContent\n',
    '                                    content={msg.content}\n',
    '                                    markdownComponents={markdownComponents}\n',
    '                                  />\n',
    '\n',
    "                                  {msg.role === 'ai' && idx === messages.length - 1 && (\n",
    '                                    <div className="chat-reference-anchor"></div>\n',
    '                                  )}\n',
    '\n',
    '                                  {/* Action Bar */}\n',
    "                                  {msg.role === 'ai' && msg.content && msg.content !== '*Thinking...*' && (\n",
    '                                    <div className="msg-action-bar">\n',
    '                                      <button className="msg-action-btn" onClick={() => handleTryAgain(idx)}>\n',
    '                                        <RefreshCw size={16} /> <span>Try again</span>\n',
    '                                      </button>\n',
    '\n',
    '                                      <button className="msg-action-btn" disabled={isQuizGenerating} onClick={() => handleGenerateQuiz(msg.content)}>\n',
    "                                        <Zap size={16} /> <span>{isQuizGenerating ? 'Generating...' : 'Generate Quiz'}</span>\n",
    '                                      </button>\n',
    '                                    </div>\n',
    '                                  )}\n',
    '                                </div>\n',
    '                              </div>\n',
    '                            );\n',
    '                          })}\n'
]

final_lines = lines[:start] + corrected_block + lines[end:]

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.writelines(final_lines)
print("Structural repair completed.")
