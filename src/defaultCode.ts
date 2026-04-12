export const DEFAULT_RUST_CODE = `// Welcome to your AI Programming Tutor
// Write code here and ask AI for help!

fn main() {
    println!("Hello, Rust learner!");
}`;

export const DEFAULT_PYTHON_CODE = `# Welcome to your AI Programming Tutor
# Write code here and ask AI for help!

def main():
    print("Hello, Python learner!")

if __name__ == "__main__":
    main()`;

export const DEFAULT_HTML_CODE = `<!-- Welcome to HTML Learning -->
<!DOCTYPE html>
<html>
<head>
    <title>Hello World</title>
</head>
<body>
    <h1>Hello, HTML Learner!</h1>
    <p>This is a paragraph.</p>
</body>
</html>`;

export const DEFAULT_CSS_CODE = `/* Welcome to CSS Learning */
/* Style the web components on the right! */

:root {
  --primary: #58a6ff;
  --bg: #0d1117;
  --surface: #161b22;
  --text: #c9d1d9;
  --border: #30363d;
}

body {
  background-color: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 20px;
}

.preview-container {
  max-width: 800px;
  margin: 0 auto;
}

.preview-header {
  border-bottom: 1px solid var(--border);
  padding-bottom: 20px;
  margin-bottom: 30px;
}

.preview-header h1 {
  color: var(--primary);
  margin: 0 0 10px 0;
}

.grid-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.main-card, .sidebar-card, .features-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-secondary {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
}

.btn:hover {
  opacity: 0.8;
}

.form-group {
  margin: 20px 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9em;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary);
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-link {
  display: block;
  color: var(--text);
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 4px;
}

.nav-link:hover {
  background: var(--bg);
}

.nav-link.active {
  background: rgba(88, 166, 255, 0.1);
  color: var(--primary);
}

.feature-badge {
  display: inline-block;
  background: rgba(46, 160, 67, 0.15);
  color: #3fb950;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75em;
  font-weight: 600;
  margin-bottom: 12px;
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
}
`;

export const DEFAULT_JS_CODE = `// Welcome to JavaScript Learning
console.log("Hello, JavaScript Learner!");

function greet(name) {
    return "Hello, " + name + "!";
}`;

export const DEFAULT_ML_CODE = `# Welcome to Machine Learning!
# We will use Python with libraries like NumPy, Pandas, and Scikit-Learn.

import numpy as np

def main():
    # Simple NumPy Example
    data = np.array([1, 2, 3, 4, 5])
    print("Original Data:", data)
    print("Mean:", np.mean(data))
    print("Standard Deviation:", np.std(data))

if __name__ == "__main__":
    main()`;
export const DEFAULT_ML_NOTES_CODE = JSON.stringify([
  { id: "1", code: "# Welcome to Machine Learning Notes!\n# This is a Jupyter-like notebook cell.\nprint('Hello, ML Learner!')", output: "" },
  { id: "2", code: "import numpy as np\n# State persists between cells!\nx = np.array([1, 2, 3])\nprint('x:', x)", output: "" }
]);

export const DEFAULT_ENGLISH_CODE = `# Welcome to English Learning!
# Practice your sentences here.

# Example:
# Sarah is driving to work right now.
# I am currently learning English with QuestCode AI.

# Write your own sentences below:
`;
