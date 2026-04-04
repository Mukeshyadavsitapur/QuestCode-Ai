export const ML_LEARNING_DATA: Record<string, string> = {
    "1.1": `
# Introduction to Machine Learning (Chapter 1.1)

Welcome to the world of Machine Learning! This course is inspired by Andrew Ng's world-famous ML curriculum, designed to take you from a curious beginner to a confident practitioner.

## 🤖 What is Machine Learning?

In traditional programming, you write a set of rules (code) and give it data to get an output. In **Machine Learning**, you give the computer data and the expected outputs, and it **learns the rules** itself!

### The Arthur Samuel Definition (1959)
Arthur Samuel, a pioneer in AI, defined machine learning as:
> "The field of study that gives computers the ability to learn without being explicitly programmed."

#### ♟️ The Checkers Legend
Back in the 1950s, Arthur Samuel wrote a **Checkers playing program**. The amazing thing? Samuel himself was a very good player!
- He programmed the computer to play **tens of thousands of games** against itself.
- By watching which board positions led to wins and which led to losses, the program learned over time.
- Eventually, it became a **better player** than Samuel himself!

**Key Takeaway:** The more opportunities you give a learning algorithm to learn, the better it will perform.

---

### The Tom Mitchell Definition (1998)
A more formal definition used today:
> "A computer program is said to learn from experience **E** with respect to some class of tasks **T** and performance measure **P**, if its performance at tasks in **T**, as measured by **P**, improves with experience **E**."

#### 📧 Example: Your Spam Filter
- **Task (T):** Classifying emails as "Spam" or "Not Spam".
- **Experience (E):** Watching you mark emails as spam.
- **Performance (P):** The percentage of emails correctly classified.

---

## 🛠️ Tools vs. Skills: The House Analogy

Imagine someone gives you a state-of-the-art hammer and a high-tech hand drill and says, *"Good luck, now you have all the tools you need to build a three-story house!"*

It doesn't work like that, right? You need the **skills** to use those tools effectively.
- **Tools:** Learning algorithms (the "hammers" of ML).
- **Skills:** Knowing *how* and *when* to apply them (the "craftsmanship").

In this application, you'll get both. You won't just learn the algorithms; icons you'll learn the **best practices** used by top ML engineers to build practical systems that actually work.

---

## 🚀 What's Ahead?

We will explore three main areas of Machine Learning:

1.  **Supervised Learning:** The most used type in the real world today. We'll spend most of our time here.
2.  **Unsupervised Learning:** Finding hidden patterns in data (like grouping similar news stories together).
3.  **Specialized Systems:** Recommender systems (like Netflix's "Because you watched...") and Reinforcement Learning.

---

## 💻 Setting Up Your Environment

To practice Machine Learning, we use **Jupyter Notebook**. It allows you to write code, see outputs instantly, and write notes (like these!) all in one place.

### Step-by-Step Installation:

1.  **The Easy Way (Anaconda):** 
    Download [Anaconda](https://www.anaconda.com/download). It comes with Python, Jupyter, and all ML libraries (NumPy, Pandas, Scikit-Learn).
    
2.  **The Pro Way (Pip):**
    If you already have Python, type this in your terminal:
    \`\`\`bash
    pip install notebook
    \`\`\`

3.  **Launching Jupyter:**
    Type \`jupyter notebook\` in your terminal/command prompt.

### Your First "Notebook" Experience
In the editor on the right, we've provided a **Notebook-like environment**. 
- Each box is a **Cell**.
- Try typing \`print("Hello ML!")\` in the first cell and clicking the play button!

---

*This lesson is available offline to get you started immediately.*
`,
    "1.2": `
# Supervised Learning Part 1 (Chapter 1.2)

Machine Learning is creating massive value across the globe, and **Supervised Learning** is the superstar leading the charge. In fact, it's estimated that roughly **99% of the economic value** created by AI today comes from this one type of learning!

## 🧠 What is Supervised Learning?

At its simplest, Supervised Learning refers to algorithms that learn **X-to-Y mappings** (or Input-to-Output mappings).

### The "Right Answer" Characteristic
The key secret to supervised learning is that you provide your algorithm with **examples to learn from that include the right answers**.

![Supervised Learning Mapping](/ml_notes/supervised_learning_mapping.png)

- **X (Input):** The data you give the computer.
- **Y (Output):** The "label" or "right answer" you want the computer to learn.

By seeing thousands of these **Input-Output pairs**, the algorithm eventually learns to take a brand new input (something it's never seen) and give a reasonably accurate prediction of what the output should be!

---

## 🌎 Real-World Examples

Supervised learning is happening all around you every day. Let's look at how X maps to Y in different technologies:

| Input (X) | Output (Y) | Application |
| :--- | :--- | :--- |
| **Email** | Spam or Not Spam? | Spam Filter |
| **Audio Clip** | Text Transcript | Speech Recognition |
| **English Sentence** | Spanish Translation | Machine Translation |
| **Ad + User Info** | Will they click? (0 or 1) | Online Advertising |
| **Image + Radar** | Location of other cars | Self-Driving Cars |
| **Phone Photo** | Is it scratched? (Yes/No) | Visual Inspection (Manufacturing) |

> [!NOTE]
> **Online Advertising** is currently considered the most lucrative form of supervised learning, driving billions in revenue by showing ads that users are more likely to find useful.

---

## 📈 Deep Dive: Housing Price Prediction

Imagine you want to help a friend sell their house. You've collected data on house sizes and their sale prices. You might plot it like this:

- **Horizontal Axis (X):** Size of the house (in square feet).
- **Vertical Axis (Y):** Price of the house (in thousands of dollars).

### How the Algorithm "Learns"
A learning algorithm can look at your data points and try to find a pattern.

![Housing Price Regression Graph](/ml_notes/housing_price_regression_graph.png)

It might:
1.  **Fit a Straight Line:** A simple prediction—good for some cases.
2.  **Fit a Curve:** A more complex prediction that might be more accurate for your specific data.

If your friend has a **750 sq. ft. house**, the algorithm uses the line or curve it learned to predict the price ($150k or even $200k depending on the pattern!).

---

## 🔢 Regression vs. Classification

The housing example is a specific type of supervised learning called **Regression**.

**Regression** is when you are trying to predict a **number** from infinitely many possible numbers (like a price, a temperature, or a percentage).

> [!TIP]
> **The Goal:** Later in this course, we will learn how the computer systematically chooses whether to use a line, a curve, or something even more complex to get the best prediction.

In the next lesson, we will look at the second major type of supervised learning: **Classification**.

---

*This lesson is available offline to get you started immediately.*
`,
    "1.3": `
# Supervised Learning Part 2: Classification (Chapter 1.3)

In the last lesson, we explored **Regression**, where we predicted a number (like a house price). Now, we’ll dive into the second major type of supervised learning: **Classification**.

## 🎯 What is Classification?

While regression predicts a number out of infinitely many possibilities, **Classification** predicts a **Category** (or "Class") out of a small, finite set of possibilities.

### Regression vs. Classification
- **Regression:** "What will the temperature be tomorrow?" (Any number: 72.5, 73.1, etc.)
- **Classification:** "Is it going to be Sunny, Cloudy, or Rainy?" (3 specific categories)

---

## 🏥 Case Study: Breast Cancer Detection

A classic example of classification is helping doctors diagnose tumors.

### 1. Binary Classification (0 or 1)
In many cases, we only have two possible outcomes:
- **0 (Benign):** A harmless lump.
- **1 (Malignant):** A dangerous, cancerous tumor.

#### Visualizing on a Line
If we only look at **Tumor Size**, we can plot our data on a simple line. Notice how the benign cases ('O') tend to be smaller, while malignant cases ('X') are larger.

![Classification 1D](/ml_notes/classification_1d.png)

### 2. Multi-class Classification
Algorithms can also predict more than two categories. For example, a system might distinguish between:
- **Category 0:** Benign
- **Category 1:** Cancer Type A
- **Category 2:** Cancer Type B

---

## 🗺️ Multiple Inputs & Decision Boundaries

In the real world, doctors look at more than just size. They might also consider the **Patient's Age**. 

When we have two inputs (Age and Size), we can plot the data on a 2D graph. Our goal is to find a **Decision Boundary**—a line or curve that perfectly separates the 'Benign' clusters from the 'Malignant' ones.

![Decision Boundary 2D](/ml_notes/decision_boundary_2d.png)

### Complexity in Practice
Professional systems used in hospitals don't stop at two inputs. They might analyze dozens of factors, such as:
- Clump thickness
- Uniformity of cell size
- Uniformity of cell shape

---

## ⚖️ Summary: Supervised Learning Twins

| Feature | Regression | Classification |
| :--- | :--- | :--- |
| **Output Type** | Continuous Number | Discrete Category |
| **Examples** | House Prices, Weather | Spam Filters, Cancer Diagnosis |
| **Possibilities** | Infinite | Finite (Small set) |

> [!TIP]
> **Remember:** Supervised learning is all about learning from the "right answers" (Labels). Whether it's a number or a category, you need labeled data to train your algorithm.

---

*This lesson is available offline to get you started immediately.*
`,
    "1.4": `
# Unsupervised Learning Part 1: Clustering (Chapter 1.4)

After Supervised Learning, the most widely used form of machine learning is **Unsupervised Learning**. 

## 🤖 What is Unsupervised Learning?

In supervised learning, we give the algorithm "right answers" (labels like "Spam" or "Benign"). In **Unsupervised Learning**, we give the algorithm data that **isn't associated with any output labels**.

### The Concept
Imagine we have data on patients (Age and Tumor Size), but we don't know who has cancer and who doesn't. Our job isn't to diagnose—it's to find **structure, patterns, or interesting groups** hidden within that data.

![Clustering Concept](/ml_notes/clustering_concept_comparison.png)

> [!NOTE]
> We call it "Unsupervised" because we aren't "supervising" the algorithm to find a specific answer. Instead, we ask it to figure out all by itself what's interesting!

---

## 🧩 The Clustering Algorithm

A **Clustering Algorithm** is a specific type of unsupervised learning that automatically groups unlabeled data into different clusters.

### Real-World Example 1: Google News
Every day, Google News looks at hundreds of thousands of articles. Without a person telling it what to do, it groups related stories together.

- For example, if several articles mention **"Panda," "Twins," and "Zoo,"** the algorithm realizes they belong in the same group.

![Google News Analogy](/ml_notes/google_news_clustering_analogy.png)

### Real-World Example 2: DNA Microarrays
Researchers use clustering to group individuals based on their genetic activity. By looking at which genes are "active" (red/green colors in a grid), the algorithm can automatically find major "types" of people without being told what those types are in advance.

### Real-World Example 3: Market Segmentation
Companies use clustering to group customers into different segments. For example, the **DeepLearning.ai** community was found to have distinct groups:
- **Skill Seekers:** Learning to grow their knowledge.
- **Career Builders:** Learning to get a promotion or a new job.
- **The News-Hungry:** Staying updated on AI impacts.

---

## ⚖️ Summary: Supervised vs. Unsupervised

| Feature | Supervised Learning | Unsupervised Learning |
| :--- | :--- | :--- |
| **Data Type** | Labeled (X and Y) | Unlabeled (X only) |
| **Goal** | Predict "Right Answer" | Find "Hidden Structure" |
| **Logic** | Mapping Input to Output | Grouping Similar Items |

---

> [!TIP]
> **Conclusion:** Unsupervised learning is just as "super" as supervised learning! It helps us find meaning in vast oceans of unlabeled data that would be impossible for humans to organize manually.

---

*This lesson is available offline to get you started immediately.*
`,
    "1.5": `
# Unsupervised Learning Part 2 (Chapter 1.5)

In this lesson, we’ll move beyond clustering and explore the formal definitions and other powerful types of Unsupervised Learning.

## 📐 Formal Definition

Unlike Supervised Learning, which maps **X (Input)** to **Y (Output Labels)**, Unsupervised Learning only provides the algorithm with **X (Input)**. 

The algorithm's job is to find structure, patterns, or something interesting without any "right answers" to guide it.

---

## 🚀 Beyond Clustering

While **Clustering** (grouping similar points) is very popular, there are two other massive types of unsupervised learning you should know:

### 1. Anomaly Detection
Used to find **unusual events** that don't fit the normal pattern. This is the backbone of:
- **Fraud Detection:** Identifying transactions that look different from your usual spending.
- **System Monitoring:** Detecting when a computer server starts behaving strangely.

| Normal Behavior | 💡 Anomaly |
| :--- | :--- |
| 🔵 🔵 🔵 🔵 🔵 🔵 🔵 | 🔴 (Target found!) |

### 2. Dimensionality Reduction
This allows you to take a massive dataset and almost magically **compress it** into a much smaller one while losing as little information as possible.
- **Analogy:** Imagine summarizing an entire book into a two-page summary that still tells you almost everything important.

---

## 🧠 Knowledge Check

Let's test your understanding of Supervised vs. Unsupervised Learning. Which of these are Unsupervised?

| Scenario | Type | Why? |
| :--- | :--- | :--- |
| **Spam Filtering** | Supervised | We have labeled data (Spam vs. Not Spam). |
| **Google News** | Unsupervised | Articles are grouped by similarity, not pre-labeled. |
| **Market Segmentation** | Unsupervised | Groups are discovered automatically from data. |
| **Diagnosing Diabetes** | Supervised | We predict a label (Diabetes vs. Not Diabetes). |

---

## 🏗️ What's Next?

We've covered the major types of learning:
- **Supervised:** Regression & Classification.
- **Unsupervised:** Clustering, Anomaly Detection, & Dimensionality Reduction.

In the next section, we’ll see how all of this is actually implemented in the real world using one of the most exciting tools in AI: **Jupyter Notebooks**.

---

*This lesson is available offline to get you started immediately.*
`,
    "1.6": `
# Introduction to Jupyter Notebooks (Chapter 1.6)

For you to more deeply understand Machine Learning, you need to see, run, and eventually write code yourself. The most widely used tool by practitioners today is the **Jupyter Notebook**.

## 🛠️ The Practitioner's Default

Jupyter Notebook is the industry-standard environment for coding, experimenting, and sharing insights. It’s what developers at companies like Google, Meta, and Netflix use every day.

> [!TIP]
> **Optional Labs:** Throughout this course, you’ll find "Optional Labs." These are designed for you to open and run one line at a time—no grades, no pressure—just to see how real Machine Learning code looks and feels!

---

## 🗂️ The Two Types of Cells

A notebook is made up of "cells" (blocks). There are two primary types:

1.  **Markdown Cells:** These contain text, documentation, and explanations (like this one!).
2.  **Code Cells:** These contain the actual Python code that you can execute.

![Jupyter Cells Comparison](/ml_notes/jupyter_cell_comparison.png)

---

## ⚡ The Magic Shortcut: Shift + Enter

The most important thing to remember in a notebook is how to run a cell.

- **To run a cell:** Select it and hit **Shift + Enter**.
- If it's a **Code Cell**, the code will execute, and the output will appear below.
- If it's a **Markdown Cell**, it will render as beautifully formatted text.

![Shift + Enter Visual](/ml_notes/shift_enter_shortcut_visual.png)

---

## 🐍 Hands-on: Python Basics

Inside a code cell, you can write many things, including powerful print statements using **f-strings**.

\`\`\`python
# Example: Using an f-string
variable = "right in the strings!"
print(f"f-strings allow you to embed variables {variable}")
\`\`\`

> [!NOTE]
> When you run a code cell, try to predict what it will do first. Then hit **Shift + Enter** and see if you were right! 

---

## 🏗️ What's Next?

Congratulations! You now know your way around a Jupyter Notebook. In the next section, we’ll start building our very first **Supervised Learning Algorithm**.

---

*This lesson is available offline to get you started immediately.*
`,
    "1.7": `
# Optional Lab: Jupyter Practice (Chapter 1.7)

Welcome to your first **Optional Lab**! In this lab, we'll practice the concepts you've learned so far. Remember, there are no grades—just explore and have fun!

## 🎯 Lab Goals
By the end of this lab, you will:
- Practice running Markdown and Code cells.
- Use Python **f-strings** to display dynamic messages.
- Perform basic variable math.

---

## 📝 Task 1: Render the Markdown
Below this sentence is a Markdown cell (in a real notebook). Try to imagine you are selecting it and hitting **Shift + Enter**.

> **"Machine Learning is the field of study that gives computers the ability to learn without being explicitly programmed."** — Arthur Samuel

---

## 💻 Task 2: Your First F-String
In a real Jupyter Notebook, you would write this in a **Code Cell**. Read the code and try to predict what it will print.

\`\`\`python
# Task: Change the name and run the cell!
my_name = "Future ML Expert"
print(f"Hello, my name is {my_name} and I am learning Machine Learning!")
\`\`\`

---

## ➕ Task 3: Simple Variable Math
Machine Learning involves a lot of numbers. Let's practice some basic variable addition.

\`\`\`python
# Define two numbers
apples = 5
oranges = 10

# Calculate the total
total_fruit = apples + oranges

print(f"I have {apples} apples and {oranges} oranges.")
print(f"Total fruit: {total_fruit}")
\`\`\`

---

## 🏗️ Task 4: Building a List
In Machine Learning, we often work with lists of data. Let's create a list of the ML types you've learned.

\`\`\`python
# Create a list of the ML types
ml_types = ["Regression", "Classification", "Clustering", "Anomaly Detection"]

# Add one more to the list!
ml_types.append("Dimensionality Reduction")

print(f"We will learn about: {ml_types}")
\`\`\`

---

## 🤖 Task 5: Your First ML Function
Functions help us reuse code. Let's create a greeting function for a "Machine Learning Pupil".

\`\`\`python
# Task: Define and call the function
def greet_learner(name, rank):
    print(f"Welcome, {name}! Your current rank is: {rank}")

greet_learner("Future Scientist", "ML Padawan")
\`\`\`

---

## ⚠️ Task 6: Conditional Test (If/Else)
Imagine you are building a system to flag large tumors. Let's write a simple check.

\`\`\`python
# Task: Guess the output first!
tumor_size = 7.5 # in mm

if tumor_size > 5.0:
    print("⚠️ Warning: Large tumor detected!")
else:
    print("✅ Status: Normal size.")
\`\`\`

---

## 🎓 Week 1 Complete!

Congratulations on finishing the first week of **Machine Learning Introduction**! You've covered:
- **What is ML?** (The Arthur Samuel checkers story).
- **Supervised Learning** (Regression & Classification).
- **Unsupervised Learning** (Clustering, Anomaly Detection, & Dimensionality Reduction).
- **Jupyter Notebooks** (Markdown vs. Code cells).

![Week 1 Complete](/ml_notes/week_1_completion_badge.png)

> [!IMPORTANT]
> You are now ready to dive deep into your first real algorithm starting next week: **Linear Regression**!

---

*This lesson is available offline to get you started immediately.*
`,
    "2.1": `
# Linear Regression: The Art of Prediction (Chapter 2.1)

Welcome to Course 1! Today, we’re going to explore the backbone of modern AI: **Linear Regression**. Don't let the name intimidate you—at its heart, it’s just a way to "connect the dots" to predict the future.

## 📏 What is Linear Regression?

Imagine you're trying to guess how much a pizza will cost based on its diameter. 
- A 10-inch pizza might be $10.
- A 12-inch pizza might be $12.
- What about a 14-inch pizza? You'd probably guess $14!

You just performed **Linear Regression** in your head! You found a relationship (1 inch = $1) and used it to make a prediction.

> [!TIP]
> **The Goal:** In ML, we want the computer to find these "rules of thumb" automatically by looking at thousands of examples.

---

## 🏠 The Portland Housing Problem

To see this in action, imagine you’re a real estate agent in Portland. You have a collection of house sizes and their sale prices.

### 📊 Visualizing the "Relationship"
We plot this data on a graph:
- **Horizontal Axis (x):** House Size (the "Cause").
- **Vertical Axis (y):** Sale Price (the "Result").

![Linear Regression Housing Plot](/ml_notes/linear_regression_housing_plot.png)

Each cross × is a house that was actually sold. Notice how they mostly form a "diagonal line" going up? Our job is to find the **best straight line** that passes through these points.

---

## 🏗️ Building Our Model

When we say "Supervised Learning," we mean we're telling the computer:
1. "Here is the **Input** (Size: 1,250 sq ft)."
2. "Here is the **Right Answer** (Price: $220,000)."

The computer looks at all these pairs and says: *"Aha! I see the pattern. For every extra square foot, the price goes up by about $200."*

---

## 📝 The "Secret Language" of ML (Notation)

To talk to the computer, we use a few symbols. They might look scary at first, but think of them as labels in a spreadsheet:

| Symbol | English Name | What it means in our example |
| :--- | :--- | :--- |
| **x** | **Input Variable** (Feature) | The size of the house (e.g., 2104 sq ft). |
| **y** | **Output Variable** (Target) | The actual price it sold for (e.g., $400k). |
| **m** | **Training Examples** | The total number of houses in our data. |
| **(x, y)** | **Training Example** | One single row in our data table. |
| **(x⁽ⁱ⁾, y⁽ⁱ⁾)** | **The i-th Example** | The data for a specific house (like the 5th house). |

> [!IMPORTANT]
> **Wait! Is x⁽ⁱ⁾ an exponent?**
> NO! In ML notation, the number in parentheses (i) is just an index (like a row number). x⁽²⁾ just means "the input for the 2nd house in our list," not "x squared."

---

## 🧠 Concept Check: Can you predict?

Look at this tiny "Training Set":

| Size (x) | Price (y) |
| :--- | :--- |
| 1,000 | 200 |
| 2,000 | 400 |
| 3,000 | ??? |

If you guessed **600**, congratulations! You've just "trained" your first mental model. In the next chapter, we'll see the math that lets the computer do this automatically for billions of data points!

---

*This lesson is available offline to get you started immediately.*
`,
    "2.2": `
# The Model Representation (Chapter 2.2)

In this lesson, we’ll explore the "inner workings" of a supervised learning algorithm. What does it do with the house sizes and prices we gave it, and how does it actually make a prediction?

## 🔄 The Prediction Workflow

Think of a supervised learning model as a **factory**. 
1. **Training Set**: You feed it your data (sizes and prices).
2. **Learning Algorithm**: The algorithm "studies" the data to find the best pattern.
3. **The Machine (f)**: It outputs a mathematical function (or "machine") that can predict the price for any new house size.

![Supervised Learning Workflow](/ml_notes/supervised_learning_workflow.png)

---

## 🎩 Meet the Characters: ŷ vs y

To understand the math, we need to distinguish between **Truth** and **Guessing**:

| Term | Symbol | What it represents |
| :--- | :--- | :--- |
| **Target** | **y** | The **Actual Price** the house sold for (The Truth). |
| **Prediction** | **ŷ** | The **Price Guess** made by our model (The Guess). |

> [!NOTE]
> We call it **y-hat** (**ŷ**) because it's like the variable is wearing a little hat to show it's only an estimate!

---

## 📐 The "Straight Line" Formula

In our housing example, we've decided our "machine" will be a straight line. The mathematical formula for this line is:

### f_w,b(x) = wx + b

![Linear Equation Visual](/ml_notes/linear_equation_visual.png)

This looks like high school algebra (**y = mx + c**), but with different letters. Let's break it down:
- **x**: The input (House Size).
- **w**: The **Weight** (Slope). It determines how *steep* the line is.
- **b**: The **Bias** (Intercept). It determines where the line *starts* on the vertical axis.

Together, **w** and **b** are called **Parameters**. 

---

## 🛠️ Turning the Knobs

Imagine you're standing in front of a machine with two knobs: one labeled **w** and one labeled **b**.
- Turning the **w knob** tilts the line up or down.
- Turning the **b knob** slides the whole line up or down.

The goal of Machine Learning is to find the **perfect setting** for these two knobs so that the line passes as close as possible to all the data points!

---

## 🏷️ Why "Univariate"?

You might hear this model called **Univariate Linear Regression**. 
- **Uni** = One
- **Variate** = Variable
It’s just a fancy way of saying we are only using **one feature** (House Size) to predict the price. Later, we'll use multiple features like number of bedrooms, location, and age!

---

*This lesson is available offline to get you started immediately.*
`,
    "2.3": `
# Optional Lab: Model Representation (Chapter 2.3)

Welcome to your first programming lab! In this lab, you will implement the model function **f_w,b(x) = wx + b** for linear regression with one variable.

## 🎯 Lab Goals
- Implement the linear regression model using Python and NumPy.
- Visualize your data and your model's predictions using Matplotlib.
- Gain an intuition for how parameters **w** and **b** affect the model's fit.

---

## 📝 Notation Summary

Here is a quick reference for the notation we will use in this lab:

![Notation Reference Card](/ml_notes/notation_reference_card.png)

| Notation | Description | Python Variable |
| :--- | :--- | :--- |
| **x** | Training Example feature (Size in 1000 sqft) | \`x_train\` |
| **y** | Training Example targets (Price in $1000s) | \`y_train\` |
| **x^(i), y^(i)** | i-th Training Example | \`x_i, y_i\` |
| **m** | Number of training examples | \`m\` |
| **w** | Parameter: weight | \`w\` |
| **b** | Parameter: bias | \`b\` |
| **f_w,b(x^(i))** | Model prediction at x^(i) | \`f_wb\` |

---

## 🛠️ Tools of the Trade
We will use two essential Python libraries:
1.  **NumPy**: The standard library for scientific computing.
2.  **Matplotlib**: The most popular library for plotting data.

\`\`\`python
import numpy as np
import matplotlib.pyplot as plt
\`\`\`

---

## 🏠 Problem Statement

We'll use a simple dataset with two houses:
- **House 1**: 1,000 sqft sold for $300,000.
- **House 2**: 2,000 sqft sold for $500,000.

| Size (1000 sqft) | Price ($1000s) |
| :--- | :--- |
| 1.0 | 300 |
| 2.0 | 500 |

### 1. Creating the Training Data
Data is stored in one-dimensional NumPy arrays. 

\`\`\`python
x_train = np.array([1.0, 2.0])
y_train = np.array([300.0, 500.0])
print(f"x_train = {x_train}")
print(f"y_train = {y_train}")
\`\`\`

### 2. Number of Training Examples (m)
We can use \`.shape\` or \`len()\` to find how many examples we have.

\`\`\`python
m = x_train.shape[0]
print(f"Number of training examples is: {m}")
\`\`\`

---

## 📊 Plotting the Data
Using \`plt.scatter()\`, we can visualize our training points as red crosses.

![Lab Data Plot](/ml_notes/lab_data_plot.png)

\`\`\`python
plt.scatter(x_train, y_train, marker='x', c='r')
plt.title("Housing Prices")
plt.ylabel('Price (in 1000s of dollars)')
plt.xlabel('Size (1000 sqft)')
plt.show()
\`\`\`

---

## 🤖 The Model Function

The function for linear regression is **f_wb(x_i) = w * x_i + b**. Let's implement a function to compute this for all our points.

\`\`\`python
def compute_model_output(x, w, b):
    m = x.shape[0]
    f_wb = np.zeros(m) # Initialize an array of zeros
    for i in range(m):
        f_wb[i] = w * x[i] + b
    return f_wb
\`\`\`

### Testing parameters w=100 and b=100
If we set these parameters, let's see how our line looks:

\`\`\`python
w = 100
b = 100
tmp_f_wb = compute_model_output(x_train, w, b)

plt.plot(x_train, tmp_f_wb, c='b', label='Our Prediction')
plt.scatter(x_train, y_train, marker='x', c='r', label='Actual Values')
plt.legend()
plt.show()
\`\`\`

---

## 💡 Challenge
In the example above, **w=100** and **b=100** did not fit the data. **Can you find the right values?**

> [!TIP]
> Try **w = 200** and **b = 100**.

### 🚀 Making a Prediction
Once you have the right parameters, you can predict the price for a house with **1200 sqft** (x = 1.2):

\`\`\`python
w = 200                         
b = 100    
x_i = 1.2
prediction = w * x_i + b    
print(f"Prediction: \${prediction:.0f} thousand dollars")
\`\`\`

---

## 🎓 Summary
Congratulations! You've learned how a linear regression model uses parameters to establish relationships between features and targets.

---

*This lesson is available offline to get you started immediately.*
`,
    "2.4": `
# Cost Function Formula (Chapter 2.4)

In machine learning, we need more than just a model—we need a way to tell the computer how "perfect" or "terrible" its guess is. This is where the **Cost Function** comes in.

## ⛳ The "Golf Score" Analogy

Think of the Cost Function as a **Golf Score**. 
- In many games, you want the highest score possible.
- In Golf (and Machine Learning), **the lower the score, the better you’re doing!**

A score of **0** means your model is perfect. A high score means your model is making big mistakes.

---

## 📏 Measuring the "Gap" (Residuals)

How do we calculate this score? We look at the distance between the **Actual Price (y)** and our **Predicted Price (ŷ)**. This distance is called the **Error** or **Residual**.

![Error Visualization](/ml_notes/cost_function_error_visualization.png)

> [!TIP]
> **Error = ŷ - y**
> If your model predicts 200k but the house actually sold for 220k, your error is -20k.

---

## 📐 Why the "Squared" Error?

You might wonder: *"Why don't we just add up all the errors?"* 
There are two main reasons we **square** them instead:

1. **No Canceling Out**: If one error is +10 and another is -10, adding them gives 0 (Perfect!), even though the model was wrong twice. Squaring makes both errors positive (+100 and +100).
2. **Penalizing "Big" Mistakes**: Squaring makes large errors much bigger. A mistake of 10 squared is 100, but a mistake of 20 squared is **400**! This forces the model to prioritize fixing large errors.

---

## 🧪 The Master Formula: J(w,b)

To find the best line, we need to calculate the **Squared Error Cost Function**. Here is your all-in-one guide to the formula and its symbols:

![Squared Error Cost Function Annotated Guide](/ml_notes/cost_function_annotated_guide.png)

---

## 🧠 Concept Check: The Perfect Model

If you have a model that passes perfectly through every single data point in your training set, what will the value of the Cost Function **J(w,b)** be?

1. A very large number
2. Exactly 0
3. It depends on the number of houses

*Correct Answer: **Exactly 0**. Since every (ŷ - y) would be 0, the total cost becomes 0!*

---

*This lesson is available offline to get you started immediately.*
`,
    "2.5": `
# Cost Function Intuition (Chapter 2.5)

In this lesson, we'll bridge the gap between "Looking at a graph" and "Calculating a score."

## 💡 The Big Idea
Every time you change your model's parameters (**w** or **b**), two things happen:
1.  **The Line Moves**: Its position relative to the data points changes (**Left Graph**).
2.  **The Cost Changes**: The math "Score" for that line goes up or down (**Right Graph**).

---

## ⚖️ The Simplified Model: f_w(x) = wx
To find the "bottom" of the cost bowl easily, we'll temporarily set **b = 0**. This means our line must pass through (0,0), and we only have one knob to turn: **w**.

---

## 📻 The "Radio Dial" Analogy
Think of choosing **w** like searching for a radio station.
- Turning the dial (**w**) rotates the line around the origin.
- When the line is exactly on the data points, the cost is **0** (Clear Signal).
- When the line is far away, the cost is **High** (Static).

![Radio Dial Analogy](/ml_notes/radio_dial_analogy_w.png)

---

## 🌎 The Side-by-Side Sync
The key to understanding Machine Learning is seeing how the **Left Graph** (Model Fit) and **Right Graph** (Cost Score) work together.

> [!TIP]
> **The Sync**: As you rotate the line on the Left, the cost value on the Right "slides" along the sides of the valley.

---

## 🚶 Walkthrough: Turning the Dial
Let's see what happens to the cost using three points: **(1,1), (2,2), and (3,3)**.

### Case 1: w = 1.0 (Perfect Fit)
![Case 1: Perfect Fit](/ml_notes/cost_case_w_1_0.png)
The line passes exactly through all points. The cost is **0**. This is our "Sweet Spot".

### Case 2: w = 0.5 (Too Shallow)
![Case 2: Too Shallow](/ml_notes/cost_case_w_0_5.png)
The line is tilted too low. The cost is climbing to **~0.58**.

### Case 3: w = 0.0 (Worst Fit)
![Case 3: Worst Fit](/ml_notes/cost_case_w_0_0.png)
The line is flat. The cost is at its highest in this set: **~2.33**.

### Case 4: w = 1.5 (Too Steep)
![Case 4: Too Steep](/ml_notes/cost_case_w_1_5.png)
The line is tilted too high. The cost is climbing again to **~0.58**.

---

## 🏗️ Summary Table: Turning the Dial

| Dial Setting (w) | Visual Fit (Model) | Match Quality | Cost (Score) |
| :---: | :--- | :---: | :---: |
| **1.0** | Perfect Alignment | ✅ **Perfect** | **0** (Goal!) |
| **0.5** | Too shallow (low) | ⚠️ **Poor** | **0.58** (High) |
| **0.0** | Flat (Horizontal) | ❌ **Bad** | **2.33** (Highest) |
| **1.5** | Too steep (high) | ⚠️ **Poor** | **0.58** (High) |

---

## 🎢 The "Valley" Insight
The **Goal of Learning** is simply to find the deepest part of the valley. 

![Ball in the Valley](/ml_notes/ball_in_valley_intuition.png)

---

## 🧠 Concept Check: The Minimum
If the cost function **J(w)** is at its lowest possible point (the bottom of the bowl), what does that tell you about the line on the **Left Graph**?
1. It is as far as possible from the points.
2. It has the best possible fit for the data.
3. It must be a horizontal line.

*Correct Answer: **2**. The lowest cost means the smallest total distance between the line and the points!*

---

*This lesson is available offline to get you started immediately.*
`,
    "2.6": `
# Visualizing the Cost Landscape (Chapter 2.6)

In this lesson, we'll shift from a simple "Valley" to a full **3D Landscape**. This is what happens when we use both knobs: **w** and **b**.

## 💡 The Big Idea
When you have two parameters, your Cost Function **J(w,b)** is no longer a 2D line. It becomes a **3D Bowl**.
- **Moving w or b**: You are sliding around the base of the bowl.
- **The Height**: Represents the **Cost**. Higher is worse, lower is better.

![3D Surface Plot](/ml_notes/cost_function_3d_bowl.png)

---

## 🗺️ Contour Plots (The Hiking Map)
Visualizing 3D on a 2D screen is hard! To solve this, we use **Contour Plots**.
Imagine looking straight down into the bowl from a helicopter.
1.  **The Rings**: Each circle represents a specific "Height" (Cost).
2.  **The Goal**: The very center of the smallest ring—that's the **Bullseye** (Minimum Cost).

![Mount Fuji Contour Analogy](/ml_notes/cost_function_contour_fuji.png)

> [!NOTE]
> **Reading the Rings**: Just like a topographical map, rings that are close together mean a steep drop-off, while far-apart rings mean a gentle slope.

---

*In the next chapter, we will practice "Reading the Map" using real-world model examples.*
`,
    "2.7": `
# The Grand Junction: Putting it All Together (Chapter 2.7)

This is where the magic happens. We've seen the line, we've seen the formula, and we've seen the map. Now, let's connect them into one single, powerful intuition.

## 🤝 The Master Connection
Linear Regression is a game of syncing three different worlds. When you change your **w** or **b** knobs, all three change at once:

| If your Data Graph looks like... | Then your Cost Score J is... | And your Map Position is... |
| :--- | :--- | :--- |
| **A messy miss** (Line far from dots) | **Sky-High** (High Elevation) | Lost in the outer mountains 🏔️ |
| **A "close-enough" fit** | **Getting Warm** (Low Elevation) | Entering the inner rings 🏠 |
| **The Perfect Match** | **Absolute Zero** (Minimum) | You've hit the **Bullseye**! 🎯 |

---

## 🛠️ The Student's Troubleshooting Guide
As you learn to build AI models, use this guide to "read" what's going wrong just by looking at the parameters:

1.  **Wrong w (The Seesaw)**: If the line is tilted too steeply or too flat, you have a **Weight** problem. On your contour map, this means you are sliding too far **Left or Right** of the center.
2.  **Wrong b (The Elevator)**: If the line has the right tilt but is shifted way too high or low, you have a **Bias** problem. On your map, this means you are floating too far **Above or Below** the center.
3.  **The Double Trouble**: Usually, both are off! To reach the goal, you must "walk" both parameters toward the center at the same time.

---

## 🧐 Why the "Squared" Error? (The Secret Ingredient)
In Chapter 2.4, we learned the formula **(ŷ - y)²**. You might wonder: *Why not just add up the distance?*

-   **No Negatives**: Squaring ensures that a miss of -10 doesn't "cancel out" a miss of +10. All errors become positive distances.
-   **The Penalty**: Squaring makes a **small miss** look tiny (**0.1² = 0.01**), but a **big miss** look massive (**10² = 100**). This forces the model to ignore tiny jitters and prioritize fixing the biggest mistakes first!

---

## 🚀 From Manual to Automatic
For the last few lessons, you've been acting as the "Brain," manually turning the knobs for **w** and **b**. You've felt how tricky it can be to find that perfect bullseye by hand.

**The good news?** In the real world, we let the computer do the walking.

In the next section, we introduce **Gradient Descent**—an algorithm that behaves like a ball rolling down our "Cost Bowl" automatically until it reaches the very bottom.

---

*This lesson is available offline to get you started immediately.*
`,
    "2.8": `
# Optional Lab: Cost Function (Chapter 2.8)

In this lab, you will implement and explore the cost function for linear regression with one variable.

> [!IMPORTANT]
> **Cloud Server / JupyterLite Setup**: Since you are using a cloud-based environment (like the "Lite" mode), you don't need to install anything on your computer. All you need to do is:
> 1. Run the **Setup Cell** below to create the utility files in your cloud workspace.
> 2. Ensure you run \`%matplotlib widget\` at the start of your notebook to enable interactive sliders.
> 3. If you get a 'ModuleNotFoundError: ipympl', run \`pip install ipympl\` (for local/colab) or \`import piplite; await piplite.install('ipympl')\` (for Lite mode) in a new cell.
> 4. If the slider doesn't appear, try reloading the page or clicking "Restart Kernel".

\`\`\`python
# STEP 1: CREATE UTILITY FILES
import os
import sys

# Auto-install ipympl for interactive widgets if missing
try:
    import ipympl
except ImportError:
    print("Installing interactive widget support (ipympl)...")
    try:
        import piplite
        # Explicitly install missing dependencies
        await piplite.install('ipywidgets')
        await piplite.install('ipython_genutils')
        # Use deps=False to avoid conflict with newer IPython versions in JupyterLite
        await piplite.install('ipympl==0.9.3', deps=False)
        print("✅ ipympl 0.9.3 and widgets installed via piplite.")
    except ImportError:
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "ipywidgets", "ipython_genutils", "ipympl==0.9.3"])
        print("✅ ipympl 0.9.3 and widgets installed via pip.")
    print("⚠️  IMPORTANT: Please RESTART YOUR KERNEL and run this cell again to activate widgets.")

# Polyfill 'js' module for matplotlib (fixes 'cannot import alert/document from js')
import js
if not hasattr(js, 'alert'):
    js.alert = lambda x: print(f"JS ALERT: {x}")
if not hasattr(js, 'document'):
    class MockElement:
        def __getattr__(self, name): return lambda *args, **kwargs: MockElement()
    class MockDocument:
        def __init__(self):
            self.body = MockElement()
            self.head = MockElement()
        def createElement(self, *args, **kwargs): return MockElement()
        def getElementById(self, *args, **kwargs): return MockElement()
        def getElementsByTagName(self, *args, **kwargs): return [MockElement()]
    js.document = MockDocument()

# Polyfill TimerTornado for matplotlib (fixes 'cannot import TimerTornado')
try:
    import matplotlib.backends.backend_webagg_core as webagg
    if not hasattr(webagg, 'TimerTornado'):
        class MockTimer:
            def __init__(self, *args, **kwargs): pass
            def start(self): pass
            def stop(self): pass
        webagg.TimerTornado = MockTimer
except ImportError:
    pass

lab_utils_content = """
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.widgets import Slider
from mpl_toolkits.mplot3d import axes3d

def compute_cost(x, y, w, b):
    m = x.shape[0]
    f_wb = w * x + b
    cost = np.sum((f_wb - y)**2)
    total_cost = 1 / (2 * m) * cost
    return total_cost

def plt_intuition(x_train, y_train):
    w_range = np.linspace(0, 400, 50)
    b_fixed = 100
    fig, ax = plt.subplots(1, 2, figsize=(12, 5))
    plt.subplots_adjust(bottom=0.25)
    ax[0].scatter(x_train, y_train, marker='x', c='r', label="Actual")
    w_init = 200
    line, = ax[0].plot(x_train, w_init * x_train + b_fixed, c='b', label="Model")
    ax[1].plot(w_range, [compute_cost(x_train, y_train, w, b_fixed) for w in w_range])
    dot, = ax[1].plot([w_init], [compute_cost(x_train, y_train, w_init, b_fixed)], 'ro')
    
    ax_slider = plt.axes([0.25, 0.1, 0.5, 0.03])
    slider = Slider(ax_slider, 'w', 0, 400, valinit=w_init)
    def update(val):
        w = slider.val
        line.set_ydata(w * x_train + b_fixed)
        dot.set_data([w], [compute_cost(x_train, y_train, w, b_fixed)])
        fig.canvas.draw_idle()
    slider.on_changed(update)
    plt_intuition.slider_ref = slider
    plt.show()

def plt_stationary(x_train, y_train):
    w_range = np.linspace(50, 350, 50); b_range = np.linspace(-100, 200, 50)
    W, B = np.meshgrid(w_range, b_range); Z = np.zeros(W.shape)
    for i in range(W.shape[0]):
        for j in range(W.shape[1]):
            Z[i,j] = compute_cost(x_train, y_train, W[i,j], B[i,j])
    fig = plt.figure(figsize=(12, 4))
    ax1 = fig.add_subplot(1, 2, 1, projection='3d')
    ax1.plot_surface(W, B, Z, cmap='viridis', alpha=0.8)
    ax2 = fig.add_subplot(1, 2, 2)
    ax2.contour(W, B, Z, levels=20, cmap='viridis')
    plt.show()
    return fig, ax2, None

def soup_bowl():
    fig = plt.figure(); ax = fig.add_subplot(projection='3d')
    x = np.linspace(-10, 10, 100); y = np.linspace(-10, 10, 100)
    X, Y = np.meshgrid(x, y); Z = X**2 + Y**2
    ax.plot_surface(X, Y, Z, cmap='viridis')
    plt.show()

def plt_update_onclick(*args): pass
"""

style_content = """
axes.spines.top: False
axes.spines.right: False
grid.alpha: 0.3
"""

with open('lab_utils_uni.py', 'w') as f: f.write(lab_utils_content)
with open('questcode_ai.mplstyle', 'w') as f: f.write(style_content)
print("✅ Setup complete! lab_utils_uni.py and questcode_ai.mplstyle created.")
print("💡 Tip: Make sure to run '%matplotlib widget' in a new cell before plotting.")
\`\`\`

## 🎯 Lab Goals
- Implement the cost function using Python and NumPy.
- Understand how w and b affect the cost score.
- Visualize the convex "soup bowl" surface of the error landscape.

---

## 🛠️ Tools & Setup
We will use the standard scientific stack:
\`\`\`python
import numpy as np
import matplotlib.pyplot as plt
from lab_utils_uni import plt_intuition, plt_stationary, plt_update_onclick, soup_bowl

# House sizes (1000 sqft) and prices ($1000s)
x_train = np.array([1.0, 2.0])
y_train = np.array([300.0, 500.0])
\`\`\`

---

## 📐 Computing the Cost

The cost measures how well our model is predicting the target price. The formula for the cost J is:

J(w,b) = 1/2m * sum( (f_{w,b}(x^i) - y^i)^2 )

Where:
- f_{w,b}(x^i) = wx^i + b is our prediction.
- (f_{w,b}(x^i) - y^i)^2 is the squared error.

### Python Implementation
The code below calculates cost by looping over each training example.

\`\`\`python
def compute_cost(x, y, w, b): 
    # number of training examples
    m = x.shape[0] 
    
    cost_sum = 0 
    for i in range(m): 
        f_wb = w * x[i] + b   
        cost = (f_wb - y[i]) ** 2  
        cost_sum = cost_sum + cost  
    total_cost = (1 / (2 * m)) * cost_sum  

    return total_cost
\`\`\`

---

## 🖱️ Cost Function Intuition (Interactive)

Your goal is to find parameters w and b that minimize the cost. In a notebook environment, you can use a slider to see this in action:

![Cost Slider Intuition](/ml_notes/cost_function_slider.png)

\`\`\`python
# Run this in your notebook to start the interactive slider
plt_intuition(x_train, y_train)
\`\`\`

### Observations:
- Cost is minimized when **w=200** (matching our previous lab).
- Using the best w and b results in a **perfect fit** (Cost = 0).
- Moving w away from 200 causes the cost to rise rapidly.

---

## 🏔️ Larger Data Set & Convex Surface

What happens when data points don't fall perfectly on a line? Let's use a more realistic dataset:

\`\`\`python
x_train = np.array([1.0, 1.7, 2.0, 2.5, 3.0, 3.2])
y_train = np.array([250, 300, 480, 430, 630, 730])

plt.close('all') 
fig, ax, dyn_items = plt_stationary(x_train, y_train)
updater = plt_update_onclick(fig, ax, x_train, y_train, dyn_items)
\`\`\`


### The Convex "Soup Bowl"
The cost function squares the loss, ensuring the error surface is **convex**. This means it will always have one single global minimum that we can find.

![Symmetric Soup Bowl](/ml_notes/convex_cost_bowl.png)

\`\`\`python
# Visualizing the symmetric soup bowl
soup_bowl()
\`\`\`

---

## ✍️ Additional Practice

### Exercise 1: Hand-Calculation
If you have data points (1, 300) and (2, 500), and you choose **w=100, b=100**:
1. Calculate f_{w,b}(1) and f_{w,b}(2).
2. Find the error for each point.
3. Calculate the total cost J(100, 100).
4. *Check: Is this cost higher or lower than J(200, 100)?*

### Exercise 2: Scaling Impact
What do you think happens to the "soup bowl" shape if the house prices were in millions instead of thousands? Would the bowl get steeper or flatter?

### Exercise 3: Zero Cost?
Given the **Larger Data Set** above, is it possible to find a straight line that gives exactly J=0? Why or why not?

---

## 🎓 Conclusion
- The **Cost Equation** provides a score of how well predictions match data.
- **Minimizing cost** is how we find the "best" model.
- The **Convex** nature of the cost function is why Machine Learning algorithms are so reliable!

---

*This lesson is available offline to get you started immediately.*
`,
};
