export const OFFLINE_LEARNING_DATA: Record<string, Record<string, string>> = {
    "ml-notes": {
        "1.1": `
# Introduction to Machine Learning (Chapter 1.1)

Welcome to the world of Machine Learning! This course is inspired by Andrew Ng's world-famous ML curriculum, designed to take you from a curious beginner to a confident practitioner.

## 🤖 What is Machine Learning?

In traditional programming, you write a set of rules (code) and give it data to get an output. In **Machine Learning**, you give the computer data and the expected outputs, and it **learns the rules** itself!

### Two Classical Definitions:

1.  **Arthur Samuel (1959):** "The field of study that gives computers the ability to learn without being explicitly programmed." 
    *   *Analogy:* Instead of teaching a child exactly how to recognize a cat by listing every feature (ears, whiskers, tail), you show them 100 pictures of cats. Eventually, the child "just knows" what a cat looks like.

2.  **Tom Mitchell (1998):** "A computer program is said to learn from experience **E** with respect to some class of tasks **T** and performance measure **P**, if its performance at tasks in **T**, as measured by **P**, improves with experience **E**."
    *   **Example (Spam Filter):**
        *   **Task (T):** Classifying emails as spam or not spam.
        *   **Experience (E):** Watching you mark emails as spam.
        *   **Performance (P):** The percentage of emails correctly classified.

---

## 🚀 Setting Up Your Environment: Jupyter Notebook

To practice Machine Learning, we use a tool called **Jupyter Notebook**. It allows you to write code, see outputs instantly, and write notes (like these!) all in one place.

### Why use Jupyter?
Unlike standard scripts, Jupyter lets you run code in **Cells**. You can run one cell, change a variable, and run the next cell without restarting everything. This is perfect for experimenting with data!

### Step-by-Step Installation:

1.  **The Easy Way (Anaconda):** 
    *   Download and install [Anaconda](https://www.anaconda.com/download). It comes with Python, Jupyter, and all the ML libraries (NumPy, Pandas, Scikit-Learn) pre-installed.
    
2.  **The Pro Way (Pip):**
    *   If you already have Python, open your terminal and type:
      \`\`\`bash
      pip install notebook
      \`\`\`

3.  **Launching Jupyter:**
    *   Open your terminal/command prompt and type:
      \`\`\`bash
      jupyter notebook
      \`\`\`
    *   A tab will open in your web browser. Click **New > Python 3** to start your first notebook!

### Your First "Notebook" Experience
In the editor on the right, we've provided a **Notebook-like environment**. 
- Each box is a **Cell**.
- You can run them one by one.
- Try typing \`print("Hello ML!")\` in the first cell and clicking the play button!

---

### What's Next?
In the next chapter, we will dive into the different types of Machine Learning: **Supervised** and **Unsupervised** learning. 

*This lesson is available offline to get you started immediately.*
`,
    },
    python: {
        "1.1": `
# Get Started With Python (Chapter 1.1)

Python is one of the most popular and versatile programming languages in the world today. It is widely used in web development, data science, artificial intelligence, automation, and more.

## Why Learn Python as Your First Programming Language?

If you are new to programming, Python is widely considered the **best first language** to learn. Here is why:

### 1. Simple and Readable Syntax
Python's syntax is remarkably close to English. Unlike languages like C++ or Java, which involve complex symbols and boilerplate code, Python allows you to express concepts in fewer lines of code.
*   **Example:** To print "Hello World", you just write \`print("Hello World")\`.

### 2. High Demand in the Job Market
From startups to tech giants like Google, Meta, and Netflix, Python is a core part of the tech stack. Learning Python opens doors to high-paying careers in Software Engineering, Data Analysis, and Machine Learning.

### 3. Massive Community Support
Python has a huge, global community. If you run into a problem, someone has likely already solved it and shared the solution online. You have access to millions of free libraries and tutorials.

### 4. Versatility
Python isn't just for one thing. You can build:
*   **Websites** (using Django or Flask)
*   **AI & Machine Learning Models** (using TensorFlow or Scikit-Learn)
*   **Automated Scripts** to handle boring repetitive tasks
*   **Data Visualizations** and complex mathematical models

## How to Setup Python on Your Computer

To start coding on your own machine, follow these steps:

1.  **Download Python:** Visit [python.org](https://www.python.org/downloads/) and download the latest version for your Operating System (Windows, macOS, or Linux).
2.  **Install:** Run the installer. **Important:** On Windows, make sure to check the box that says **"Add Python to PATH"** before clicking Install.
3.  **Verify Installation:** Open your Command Prompt (Windows) or Terminal (macOS/Linux) and type: \`python --version\`. You should see the version number you just installed.
4.  **Get an Editor:** While you can use any text editor, we recommend **Visual Studio Code** (VS Code) with the Python extension for the best experience.

---

### What's Next?
In the next chapter, we will write your very first Python program and understand how the code actually runs!

*This lesson is available offline to get you started immediately.*
`,
        "1.2": `
# Your First Python Program (Chapter 1.2)

Now that you have Python set up, it's time to write your very first program! Traditionally, the first program anyone writes in a new language is the **"Hello, World!"** program.

## The print() Function

In Python, we use the \`print()\` function to display text or information on the screen.

### Writing "Hello World"
To print "Hello World", you simply write the following line:

\`\`\`python
print("Hello World")
\`\`\`

### How it works:
*   **print**: This is the built-in function that tells Python to output something.
*   **Parentheses ( )**: These are used to "call" the function and pass data to it.
*   **Quotes " "**: The text inside the quotes is what will be displayed. In Python, text is called a **String**. You can use either double quotes (\`"\`) or single quotes (\`'\`).

### Try it Yourself!
1.  Look at the code editor on the right phase of your screen.
2.  Type \`print("Hello from QuestCode!")\` into the editor.
3.  Click the **Run** button (usually at the bottom in the terminal panel).
4.  You should see your message appear instantly in the terminal!

---

### What's Next?
In the next section, we will learn about **Comments**—a way to write notes in your code that Python ignore.

*This lesson is available offline to get you started immediately.*
`,
        "1.3": `
# Python Comments (Chapter 1.3)

Comments are a way to write notes in your code that Python completely ignores. They are essential for explaining what your code does, making it easier for you and others to understand later.

## Single-line Comments
In Python, we use the hash or pound symbol (\`#\`) to start a comment. Everything after the \`#\` on that line is ignored by the computer.

\`\`\`python
# This is a comment - It will not run
print("Hello World") # You can also add comments after code
\`\`\`

## Multi-line Comments (Docstrings)
Python doesn't have a specific "multi-line comment" symbol like \`/* ... */\` in some other languages. Instead, we use a multiline string (triple quotes) if the string is not assigned to a variable.

\`\`\`python
"""
This is a multi-line comment.
It is often called a 'docstring'.
Python sees it as a string but ignores it
if it's not being used for anything.
"""
print("Comments are useful!")
\`\`\`

## Why use comments?
1.  **Explain the "Why":** Don't just explain *what* the code does (the code already says that). Explain *why* you wrote it that way.
2.  **Mental Sandbox:** You can "comment out" lines of code to temporarily stop them from running while you test something else.

---

### What's Next?
Next, we'll learn about **Indentation**, which is one of the most unique and important features of Python!

*This lesson is available offline to get you started immediately.*
`,
        "1.4": `
# Python Indentation (Chapter 1.4)

In most programming languages (like C, Java, or JavaScript), braces \`{ }\` are used to define blocks of code. However, Python uses **indentation** to indicate which lines of code belong together.

## Why Indentation Matters
In Python, indentation is not just for making the code look "pretty"—it is a strict part of the language's syntax. It tells the computer where a specific block of logic starts and ends.

### The Power of the Colon \`:\`
Blocks of code (like \`if\` statements, loops, or functions) always follow a colon. The colon is a "signal" that says: *"Everything that follows, as long as it's indented, belongs to me!"*

### Visual Example: Nested Blocks
Look at how different levels of indentation create "groups" of code:

\`\`\`python
if True:
    print("Level 1 Indentation")
    if True:
        print("Level 2 Indentation (Nested)")
    print("Back to Level 1")
print("Level 0 - Outside all blocks")
\`\`\`

## Indentation vs Braces
| Feature | Python | C / Java / JavaScript |
| :--- | :--- | :--- |
| **Block Marker** | Whitespace (Indentation) | Curly Braces \`{ }\` |
| **Mandatory** | Yes (Code won't run without it) | No (Only braces are mandatory) |
| **Readability** | High (Forced clean code) | Variable (Depends on developer) |

## The Rules to Follow:
1.  **Consistency is Key:** You must use the same number of spaces (usually 4) for every line in the same block. You cannot mix spaces and tabs.
2.  **IndentationError:** If you forget to indent after a colon, or if your indentation is inconsistent, Python will stop and show an error immediately.

## Pro-Tip:
If you are using the editor in QuestCode, the **Tab** key is your best friend! It will automatically indent your code to the correct level every time you press it.

---

### What's Next?
Next, we'll wrap up the introduction with some **Practice Questions** to test what you've learned!

*This lesson is available offline to get you started immediately.*
`,
        "1.5": `
<div class="practice-questions">
  <h2>Chapter 1.5: Practice Questions</h2>
  <div class="question">
    <p><strong>1. Display a Message:</strong> Write a program that prints "Python is versatile!"</p>
    <p class="tip-text">Tip: Remember to wrap your text in double quotes inside the print function.</p>
    <details>
      <summary>Show Answer</summary>
      <div class="answer-content">
        <pre class="language-python"><code>print("Python is versatile!")</code></pre>
        <p><strong>Explanation:</strong> The <code>print()</code> function is used to output text to the console. The text you want to print must be surrounded by quotes (double <code>"</code> or single <code>'</code>) to tell Python it's a <strong>string</strong> (text data).</p>
      </div>
    </details>
  </div>
  <div class="question">
    <p><strong>2. The Best First Language:</strong> Why is Python considered the best first language for beginners?</p>
    <p class="tip-text">Tip: Think about how close Python's syntax is to the English language.</p>
    <details>
      <summary>Show Answer</summary>
      <div class="answer-content">
        <p>Python is considered the best for several reasons:</p>
        <ul>
          <li><strong>Readable Syntax:</strong> It reads almost like English, making it intuitive to learn.</li>
          <li><strong>No Boilerplate:</strong> You don't need complex code structures to perform simple tasks.</li>
          <li><strong>Versatility:</strong> It's used in web development, AI, automation, and data science.</li>
        </ul>
      </div>
    </details>
  </div>
  <div class="question">
    <p><strong>3. Single-line Comments:</strong> Identify the correct symbol for a single-line comment.</p>
    <p class="tip-text">Tip: It's also known as the hash or pound symbol.</p>
    <details>
      <summary>Show Answer</summary>
      <div class="answer-content">
        <p>The <code>#</code> symbol. Anything written after the <code>#</code> on the same line will be ignored by Python at runtime.</p>
        <pre class="language-python"><code># This is an example of a comment
print("Focus on the code!")</code></pre>
      </div>
    </details>
  </div>
  <div class="question">
    <p><strong>4. Installation Step:</strong> What is the most important box to check when installing Python on Windows?</p>
    <p class="tip-text">Tip: This allows you to run Python from any command prompt window.</p>
    <details>
      <summary>Show Answer</summary>
      <div class="answer-content">
        <p>The <strong>"Add Python to PATH"</strong> checkbox.</p>
        <p><strong>Why?</strong> Adding Python to your system's PATH environment variable allows the computer to find the <code>python</code> command when you type it into the Terminal or Command Prompt from any directory.</p>
      </div>
    </details>
  </div>
  <div class="question">
    <p><strong>5. Multi-line Comments:</strong> Write a 3-line comment using docstrings.</p>
    <p class="tip-text">Tip: Use triple quotes (""") at both the beginning and the end.</p>
    <details>
      <summary>Show Answer</summary>
      <div class="answer-content">
        <pre class="language-python"><code>"""
This is a multi-line comment.
It is often called a docstring.
It spans across several lines.
"""</code></pre>
        <p><strong>Note:</strong> Docstrings are actually strings that aren't assigned to variables, which Python treats as comments. They are perfect for documenting modules or large functions.</p>
      </div>
    </details>
  </div>
  <div class="question">
    <p><strong>6. Simple Math Output:</strong> Write a program to print the result of 10 multiplied by 5.</p>
    <p class="tip-text">Tip: You don't need quotes if you are printing a mathematical calculation.</p>
    <details>
      <summary>Show Answer</summary>
      <div class="answer-content">
        <pre class="language-python"><code>print(10 * 5)</code></pre>
        <p><strong>Explanation:</strong> The <code>print()</code> function can also evaluate expressions (like math). Since numbers and math operations are not strings, they do not need quotes. Python evaluates <code>10 * 5</code> and prints the result, <code>50</code>.</p>
      </div>
    </details>
  </div>
  <div class="question">
    <p><strong>7. Fixing Indentation:</strong> Fix the error in this code:</p>
<pre class="language-python"><code>if True:
print("Success")</code></pre>
    <p class="tip-text">Tip: Every line after a colon (:) must be shifted to the right.</p>
    <details>
      <summary>Show Answer</summary>
      <div class="answer-content">
        <pre class="language-python"><code>if True:
    print("Success")</code></pre>
        <p><strong>Detail:</strong> Python uses indentation to define code blocks. After a colon <code>:</code>, you must indent the volgende line (the standard is <strong>4 spaces</strong>). Failing to do so results in an <code>IndentationError</code>.</p>
      </div>
    </details>
  </div>
  <div class="question">
    <p><strong>8. The "Why" of Comments:</strong> What is the main purpose of adding comments to your code?</p>
    <p class="tip-text">Tip: Think about what happens when you or others read the code months later.</p>
    <details>
      <summary>Show Answer</summary>
      <div class="answer-content">
        <p>The primary purpose is to explain <strong>the "Why"</strong> behind your code logic. Good comments help:</p>
        <ul>
          <li><strong>You:</strong> Understand your logic when you return to the code weeks later.</li>
          <li><strong>Others:</strong> Collaborate effectively by understanding your thought process.</li>
          <li><strong>Debugging:</strong> You can "comment out" lines to disable them while testing.</li>
        </ul>
      </div>
    </details>
  </div>
  <div class="question">
    <p><strong>9. Single vs Double Quotes:</strong> Is <code>print('Hello')</code> valid in Python?</p>
    <p class="tip-text">Tip: Python is flexible with quote types as long as they match.</p>
    <details>
      <summary>Show Answer</summary>
      <div class="answer-content">
        <p><strong>Yes, it is perfectly valid.</strong></p>
        <p>Python accepts both single quotes (<code>'</code>) and double quotes (<code>"</code>) to define strings. One advantage is that you can nest them: <code>print('He said "Hello!"')</code> would work correctly.</p>
      </div>
    </details>
  </div>
  <div class="question">
    <p><strong>10. Verification:</strong> What command do you type in the terminal to check your Python version?</p>
    <p class="tip-text">Tip: It starts with the word 'python' followed by a double dash.</p>
    <details>
      <summary>Show Answer</summary>
      <div class="answer-content">
        <p><code>python --version</code> (or sometimes <code>python3 --version</code> on macOS/Linux).</p>
        <p><strong>Importance:</strong> It's good practice to verify your installation regularly to ensure you're using the correct version and that your environment variables are set correctly.</p>
      </div>
    </details>
  </div>
</div>

*This lesson is available offline to get you started immediately.*
`,
        "2.1": `
# Chapter 2.1: Python Variables and Literals

Welcome to the heart of programming! In this lesson, we'll learn how to store information so we can use it later.

## 1. What is a Variable?
Imagine you have a physical box. You put a toy inside it and stick a label on the box that says "my_favorite_toy". 

In programming, a **Variable** is like that box.
- The **Value** is what you put inside the box (the toy).
- The **Variable Name** is the label you stick on the box.

### Creating your first variable
In Python, we use the equals sign (\`=\`) to assign a value to a variable.

\`\`\`python
# We are creating a variable named 'score' and storing the number 100 in it.
score = 100

# Now, whenever we use 'score', Python knows we mean 100.
print(score) 
\`\`\`

---

## 2. Dynamic Typing: The Python Advantage
In some languages like Java or C++, you have to tell the computer manually: "Hey, this box will *only* hold numbers." 

**Python is different.** It is "Dynamically Typed," which means it automatically detects what's inside the box.

\`\`\`python
x = 5               # Now x is a number
print(x)

x = "Hello World"   # Now x is a string (text)
print(x)
\`\`\`

---

## 3. Multiple Assignments
Python is built for efficiency. You can create multiple variables at once:

\`\`\`python
# Instead of doing:
# a = 1
# b = 2
# c = 3

# You can just do:
a, b, c = 1, 2, 3

print(a, b, c) # Output: 1 2 3
\`\`\`

---

## 4. Understanding Literals
A **Literal** is just the technical name for the raw data you assign to a variable. Here are the most common types:

### A. Numeric Literals
- **Integers**: Whole numbers (Positive or Negative). Example: \`10\`, \`-500\`.
- **Floats**: Numbers with decimals. Example: \`3.14\`, \`-0.5\`.

### B. String Literals
Text data. You must wrap them in quotes.
- \`"Double quotes"\` are the standard.
- \`'Single quotes'\` work exactly the same.
- \`"""Triple quotes"""\` are special. They let your text span across **multiple lines**!

### C. Boolean Literals
Representing "Yes" or "No" in logic.
- \`True\` (Always with a capital T)
- \`False\` (Always with a capital F)

### D. The 'None' Literal
Sometimes you have a box but nothing is in it yet. For this, we use \`None\`. It represents the absence of a value.

\`\`\`python
user_name = None # We know we'll have a name later, but right now it's empty.
\`\`\`

---

### Pro-Tip: The type() Function
If you're ever confused about what's inside a variable, ask Python!

\`\`\`python
price = 19.99
print(type(price)) # Output: <class 'float'>
\`\`\`

*This lesson is available offline to get you started immediately.*
`,
        "2.2": `
# Chapter 2.2: Naming Rules (Snake Case)

In the last lesson, we learned that variables are like boxes with labels. But just like you wouldn't label a box with "!!!" or "123-ABC" in an organized warehouse, Python has some strict rules about what those labels (variable names) can look like.

## 1. The Mandatory Rules
If you break these, Python will throw a \`SyntaxError\` and your code won't run at all:

- **Must start with a letter or underscore (_):** A name cannot start with a number.
  - ✅ \`user_name\`, \`_id\`, \`player1\`
  - ❌ \`1st_place\` (Starts with a number)
- **Only letters, numbers, and underscores:** No spaces, hyphens (\`-\`), or special symbols like \`@\`, \`$\`, \`%\`.
  - ✅ \`total_score\`, \`price_2\`
  - ❌ \`user name\` (Contains a space)
  - ❌ \`total-cost\` (Contains a hyphen)
  - ❌ \`email@address\` (Contains a special symbol)
- **Case-Sensitive:** \`Score\`, \`score\`, and \`SCORE\` are three completely different boxes!

\`\`\`python
# These are three DIFFERENT variables
age = 25
Age = 30
AGE = 35

print(age) # Output: 25
print(Age) # Output: 30
\`\`\`

---

## 2. The Python Convention: Snake Case
While the computer only cares about the mandatory rules, Python programmers have a "social contract" called **Snake Case**. 

In Snake Case, you write everything in **lowercase** and use **underscores** instead of spaces. This makes long names easy to read.

| Style | Description | Example |
| :--- | :--- | :--- |
| **Snake Case** | Lowercase with underscores | \`user_login_count\` |
| **Camel Case** | Capitalize every word except first | \`userLoginCount\` |
| **Pascal Case** | Capitalize every word | \`UserLoginCount\` |

*Always use **snake_case** for variables and functions in Python to keep your code looking professional!*

---

## 3. Keywords: The Reserved Names
Some words are already "taken" by Python because they have special meanings. You cannot use these as your own variable names.

**Common Reserved Keywords:**
- \`False\`, \`None\`, \`True\`
- \`and\`, \`as\`, \`assert\`, \`break\`
- \`class\`, \`continue\`, \`def\`, \`del\`
- \`if\`, \`else\`, \`elif\`, \`for\`, \`while\`
- \`import\`, \`in\`, \`is\`, \`lambda\`, \`not\`, \`or\`, \`pass\`, \`return\`

---

## 4. Best Practices: "Readability Counts"
One of the core philosophies of Python is that **code is read more often than it is written.**

| Good Name (Descriptive) | Bad Name (Vague) |
| :--- | :--- |
| ✅ \`user_email_address\` | ❌ \`u_e\` |
| ✅ \`max_speed_limit\` | ❌ \`m\` |
| ✅ \`is_logged_in\` | ❌ \`status\` |
| ✅ \`remaining_attempts\` | ❌ \`x\` |

### Pro-Tip: Avoid Double Meanings
Don't use name that could be confusing. For example, if you have a variable for a balance, call it \`account_balance\` rather than just \`bal\`, which could mean "ball" or "balloon".

---

### What's Next?
In the next chapter, we will learn about **Type Conversion**—how to change data from one type to another (e.g., turning a string into a number).

*This lesson is available offline to get you started immediately.*
`,
        "2.3": `
# Chapter 2.3: Python Type Conversion

In programming, you often need to change data from one type to another. For example, if you get "10" from a user (which is a **String**), you can't add it to a number until you convert it into an **Integer**. This process is called **Type Conversion** (or **Type Casting**).

Python has two types of conversion:
1. **Implicit Conversion** (Automatic)
2. **Explicit Conversion** (Manual)

---

## 1. Implicit Conversion: Python's Magic
Sometimes, Python is smart enough to convert data types automatically without you doing anything. This usually happens to prevent data loss.

### A. Integer to Float
When you add an integer and a float, Python converts the integer to a float.
\`\`\`python
num_int = 123    # Integer
num_float = 1.27 # Float

# Python converts num_int to float automatically.
result = num_int + num_float

print(result)       # Output: 124.27
print(type(result)) # Output: <class 'float'>
\`\`\`

### B. Boolean to Integer
Believe it or not, Python treats Booleans as numbers behind the scenes! \`True\` is \`1\` and \`False\` is \`0\`.
\`\`\`python
print(True + 5)  # Output: 6
print(False + 5) # Output: 5
\`\`\`

---

## 2. Explicit Conversion: Taking Control
When Python can't (or won't) do it automatically, you must do it yourself using built-in functions.

| Function | Action | Example |
| :--- | :--- | :--- |
| **\`int()\`** | Converts to Whole Number | \`int("10")\` → \`10\` |
| **\`float()\`** | Converts to Decimal Number | \`float("10.5")\` → \`10.5\` |
| **\`str()\`** | Converts to Text (String) | \`str(100)\` → \`"100"\` |

### A. Converting Strings to Numbers
This is the most common use case. When you get input from a user, it's always a string.
\`\`\`python
price = "19.99"
# We need to convert it to a float to do math
discounted_price = float(price) - 5.0

print(discounted_price) # Output: 14.99
\`\`\`

### B. The "Truncation" Trap
When you convert a **Float** to an **Integer**, Python doesn't round the number. It simply **cuts off** the decimal part.
\`\`\`python
print(int(10.99)) # Output: 10 (Not 11!)
print(int(-2.7))  # Output: -2
\`\`\`

---

## 3. Dealing with Errors (ValueError)
You can only convert values that make logical sense. If you try to turn a word into a number, Python will crash with a \`ValueError\`.

\`\`\`python
# ✅ This works
print(int("500")) 

# ❌ This CRASHES
# print(int("Hello")) 
\`\`\`

---

### Pro-Tip: The "Type Check" First
If your code crashes during conversion, it's usually because the data wasn't what you expected. You can always use \`type()\` to debug!

---

### What's Next?
In the next chapter, we will learn about **Basic Input and Output**—how to ask the user for information and display it back to them!

*This lesson is available offline to get you started immediately.*
`,
        "2.4": `
# Chapter 2.4: Python Basic Input and Output

Programming is all about interaction! So far, we've only seen how to display information. In this lesson, we'll learn how to ask the user for data and show it back to them in a friendly way.

---

## 1. Python Output: The \`print()\` Function
We've used \`print()\` since the very beginning, but it has some hidden features that make it very flexible.

### A. Printing Multiple Items
You can print many things at once by separating them with a comma. Python will automatically add a space between them.
\`\`\`python
name = "Quest"
version = 2.0

print("Welcome to", name, "version", version)
# Output: Welcome to Quest version 2.0
\`\`\`

### B. Custom Separators (\`sep\`)
By default, the comma adds a space. You can change this using \`sep\`.
\`\`\`python
print("Apple", "Banana", "Cherry", sep=" | ")
# Output: Apple | Banana | Cherry
\`\`\`

### C. The \`end\` Parameter
By default, \`print()\` always adds a new line at the end. You can change this using \`end\`.
\`\`\`python
print("Loading", end="...")
print(" Done!")
# Output: Loading... Done!
\`\`\`

---

## 2. Python Input: The \`input()\` Function
To get information from the user, we use the \`input()\` function.

### How it works:
When Python hits an \`input()\` line, it **pauses** the program and waits for the user to type something and press **Enter**.

\`\`\`python
# The text inside input() is the prompt shown to the user.
user_name = input("Enter your name: ")
print(f"Hello, {user_name}!")
\`\`\`

---

## 3. The "Gotcha": Everything is a String!
This is common mistake for beginners: **The \`input()\` function always returns a String (Text)**, even if you type a number.

### The Problem:
\`\`\`python
age = input("Enter your age: ")
# If the user types 25, 'age' is "25" (Text), not 25 (Number)

# print(age + 5) # ❌ This will CRASH! You can't add text and numbers.
\`\`\`

### The Solution: Type Conversion
You must wrap the input in \`int()\` or \`float()\` to use it for math.
\`\`\`python
# Combined Input and Conversion
age = int(input("Enter your age: "))
print(f"In 5 years, you will be {age + 5} years old!")
\`\`\`

---

## 4. Modern Formatting: F-Strings
F-Strings (Formatted Strings) are the most readable way to join text and variables. Just put an \`f\` before the quotes.

### Feature: Math inside Braces
You can perform simple calculations directly inside the \`{}\`.
\`\`\`python
price = 100
tax = 0.05
print(f"Total Price: \${price + (price * tax)}")
# Output: Total Price: $105.0
\`\`\`

---

## 5. Mini Project: The "Greeter" Script
Let's put everything together!

\`\`\`python
# 1. Ask for input
name = input("Player Name: ")
level = int(input("Current Level: "))

# 2. Perform a calculation
next_level = level + 1

# 3. Display the result beautifully
print(f"--- Welcome, {name}! ---")
print(f"You are level {level}.", end=" ")
print(f"Keep going to reach level {next_level}!")
\`\`\`

---

### What's Next?
In the next chapter, we will learn about **Python Operators**—the symbols like \`+\`, \`-\`, \`*\`, and \`/\` that let us perform calculations!

*This lesson is available offline to get you started immediately.*
`,
        "2.5": `
# Chapter 2.5: Python Operators

In the previous lessons, we learned how to store data and get it from the user. Now, it's time to actually **do something** with that data! **Operators** are special symbols that perform operations on variables and values.

---

## 1. Arithmetic Operators
These are used for mathematical calculations.

| Operator | Name | Example | Result |
| :--- | :--- | :--- | :--- |
| \`+\` | Addition | \`10 + 5\` | \`15\` |
| \`-\` | Subtraction | \`10 - 5\` | \`5\` |
| \`*\` | Multiplication | \`10 * 5\` | \`50\` |
| \`/\` | Division | \`10 / 4\` | \`2.5\` |
| \`//\` | Floor Division | \`10 // 4\` | \`2\` (Removes decimal) |
| \`%\` | Modulo | \`10 % 3\` | \`1\` (Remainder) |
| \`**\` | Exponentiation | \`2 ** 3\` | \`8\` (2³) |

### Pro-Tip: Operator Precedence (PEMDAS)
Just like in math, Python follows an order of operations:
1. Parentheses \`( )\`
2. Exponents \`**\`
3. Multiplication/Division \`* / // %\`
4. Addition/Subtraction \`+ -\`

\`\`\`python
print(10 + 2 * 5)   # Output: 20 (not 60)
print((10 + 2) * 5) # Output: 60
\`\`\`

---

## 2. Comparison Operators
These compare two values and always return either \`True\` or \`False\`.

- **\`==\`**: Equal to
- **\`!=\`**: Not equal to
- **\`>\`**: Greater than
- **\`<\`**: Less than
- **\`>=\`**: Greater than or equal to
- **\`<=\`**: Less than or equal to

### Comparing Strings
You can even compare text! Python compares them alphabetically.
\`\`\`python
print("Apple" < "Banana") # Output: True
print("cat" == "Cat")     # Output: False (Case matters!)
\`\`\`

---

## 3. Logical Operators
Used to combine multiple conditions together.

| Operator | Description | Logic |
| :--- | :--- | :--- |
| **\`and\`** | Both must be True | \`is_student and has_id\` |
| **\`or\`** | At least one must be True | \`is_weekend or is_holiday\` |
| **\`not\`** | Reverses the result | \`not is_rainy\` |

### Short-Circuiting
If the first part of an **\`or\`** is True, Python doesn't even look at the second part. It already knows the whole thing is True!

---

## 4. Special Operators: Identity & Membership

### A. Membership (\`in\`, \`not in\`)
Checks if a value exists inside a collection (like a list or a string).
\`\`\`python
message = "Python is Fun"

print("Python" in message) # Output: True
print("Java" in message)   # Output: False
\`\`\`

### B. Identity (\`is\`, \`is not\`)
Checks if two variables point to the **exact same object** in memory.
- ✅ Use \`==\` to check if values are the same.
- 💡 Use \`is\` sparingly (most common for \`is None\`).

---

## 5. Practical Example: The Mini-Calculator
\`\`\`python
num1 = float(input("First number: "))
num2 = float(input("Second number: "))
op = input("Operation (+, -, *, /): ")

if op == "+":
    result = num1 + num2
elif op == "-":
    result = num1 - num2
elif op == "*":
    result = num1 * num2
elif op == "/":
    result = num1 / num2
else:
    result = "Invalid Operator"

print(f"Result: {result}")
\`\`\`

---

### What's Next?
Congratulations! You've finished the Python Fundamentals section. In the next chapter, we will have some **Practice Questions** to test everything you've learned!

*This lesson is available offline to get you started immediately.*
`,
        "2.6": `
<div class="practice-questions">
  <h2>Chapter 2.6: Practice Questions</h2>
  
  <div class="question">
    <p><strong>1. Variable Assignment:</strong> Create a variable named <code>pi</code> and store the value <code>3.14</code> in it.</p>
    <p class="tip-text">Tip: Use the equals sign (=) for assignment.</p>
    <details>
      <summary>Show Answer</summary>
      <div class="answer-content">
        <pre class="language-python"><code>pi = 3.14</code></pre>
        <p><strong>Explanation:</strong> In Python, you create a variable by giving it a name and using the <code>=</code> operator to assign it a value. Here, <code>pi</code> is the name and <code>3.14</code> is the literal value.</p>
      </div>
    </details>
  </div>

  <div class="question">
    <p><strong>2. Identifying Literals:</strong> What type of literal is <code>"QuestCode"</code>?</p>
    <p class="tip-text">Tip: Think about what surrounds the text.</p>
    <details>
      <summary>Show Answer</summary>
      <div class="answer-content">
        <p>It is a <strong>String literal</strong>.</p>
        <p><strong>Explanation:</strong> Any data wrapped in double quotes (<code>" "</code>) or single quotes (<code>' '</code>) is treated as a string (text) in Python.</p>
      </div>
    </details>
  </div>

  <div class="question">
    <p><strong>3. Invalid Names:</strong> Why is <code>2nd_player</code> an invalid variable name?</p>
    <p class="tip-text">Tip: Review the rule about how variable names must start.</p>
    <details>
      <summary>Show Answer</summary>
      <div class="answer-content">
        <p>Because it starts with a <strong>number</strong>.</p>
        <p><strong>Rule:</strong> Variable names must start with a letter (a-z, A-Z) or an underscore (<code>_</code>). They cannot start with a digit (0-9).</p>
      </div>
    </details>
  </div>

  <div class="question">
    <p><strong>4. Snake Case:</strong> Convert the variable name <code>userHomeAddress</code> into the standard Python <strong>Snake Case</strong>.</p>
    <p class="tip-text">Tip: Use lowercase letters and underscores instead of spaces or capital letters.</p>
    <details>
      <summary>Show Answer</summary>
      <div class="answer-content">
        <pre class="language-python"><code>user_home_address</code></pre>
        <p><strong>Explanation:</strong> Snake Case is the standard convention in Python where words are separated by underscores and all letters are lowercase.</p>
      </div>
    </details>
  </div>

  <div class="question">
    <p><strong>5. Floating Point Truncation:</strong> What will be the output of <code>print(int(9.99))</code>?</p>
    <p class="tip-text">Tip: Remember what happens to the decimal part during integer conversion.</p>
    <details>
      <summary>Show Answer</summary>
      <div class="answer-content">
        <pre class="language-python"><code>9</code></pre>
        <p><strong>Explanation:</strong> Converting a float to an integer using <code>int()</code> does not round the number; it <strong>truncates</strong> (cuts off) everything after the decimal point.</p>
      </div>
    </details>
  </div>

  <div class="question">
    <p><strong>6. Modulo Operator:</strong> What is the result of <code>10 % 3</code>?</p>
    <p class="tip-text">Tip: This operator finds the <strong>remainder</strong> of a division.</p>
    <details>
      <summary>Show Answer</summary>
      <div class="answer-content">
        <pre class="language-python"><code>1</code></pre>
        <p><strong>Explanation:</strong> 10 divided by 3 is 3 with a remainder of 1. The <code>%</code> (modulo) operator returns that remainder.</p>
      </div>
    </details>
  </div>

  <div class="question">
    <p><strong>7. Boolean Implicit Conversion:</strong> What is the result of <code>True + 10</code>?</p>
    <p class="tip-text">Tip: Remember what numerical value Python assigns to <code>True</code>.</p>
    <details>
      <summary>Show Answer</summary>
      <div class="answer-content">
        <pre class="language-python"><code>11</code></pre>
        <p><strong>Explanation:</strong> In Python, <code>True</code> is treated as <code>1</code> and <code>False</code> as <code>0</code> when used in mathematical operations.</p>
      </div>
    </details>
  </div>

  <div class="question">
    <p><strong>8. Logical 'and':</strong> What is the result of <code>True and False</code>?</p>
    <p class="tip-text">Tip: For 'and' to be True, <strong>both</strong> sides must be True.</p>
    <details>
      <summary>Show Answer</summary>
      <div class="answer-content">
        <pre class="language-python"><code>False</code></pre>
        <p><strong>Explanation:</strong> The <code>and</code> operator only returns <code>True</code> if both conditions are met. Since one side is <code>False</code>, the whole expression is <code>False</code>.</p>
      </div>
    </details>
  </div>

  <div class="question">
    <p><strong>9. F-String Formatting:</strong> Correct the code to print: "Price: $50.0"</p>
    <pre class="language-python"><code>price = 50.0
print("Price: {price}")</code></pre>
    <p class="tip-text">Tip: You need a special character before the quotes to make it an f-string.</p>
    <details>
      <summary>Show Answer</summary>
      <div class="answer-content">
        <pre class="language-python"><code>print(f"Price: \${price}")</code></pre>
        <p><strong>Explanation:</strong> Adding an <code>f</code> before the string allows you to embed variables directly inside curly braces <code>{}</code>.</p>
      </div>
    </details>
  </div>

  <div class="question">
    <p><strong>10. Integer Division:</strong> What is the difference between <code>10 / 4</code> and <code>10 // 4</code>?</p>
    <p class="tip-text">Tip: One returns a float, the other returns an integer.</p>
    <details>
      <summary>Show Answer</summary>
      <div class="answer-content">
        <p><code>10 / 4</code> results in <code>2.5</code> (Float Division).</p>
        <p><code>10 // 4</code> results in <code>2</code> (Floor Division).</p>
        <p><strong>Explanation:</strong> Standard division (<code>/</code>) always returns a float. Floor division (<code>//</code>) rounds the result down to the nearest whole number.</p>
      </div>
    </details>
  </div>
</div>

*This lesson is available offline to get you started immediately.*
`
    }
};
