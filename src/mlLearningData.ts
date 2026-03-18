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
Back in the 1950s, Arthur Samuel wrote a **Checkers playing program**. The amazing thing? Samuel himself wasn't a very good player!
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

In this class, you'll get both. You won't just learn the algorithms; icons you'll learn the **best practices** used by top ML engineers to build practical systems that actually work.

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
# Linear Regression Part 1 (Chapter 2.1)

Welcome to Course 1! Today, we’re going to look at the overall process of supervised learning and dive into our very first model: **Linear Regression**.

## 📏 What is Linear Regression?

Linear regression is probably the most widely used learning algorithm in the world today. At its core, it simply means **fitting a straight line to your data**. 

> [!TIP]
> **Why start here?** Many of the concepts you learn with linear regression will apply to almost every other machine learning model you’ll see later in this specialization.

---

## 🏠 The Portland Housing Problem

Imagine you’re a real estate agent in Portland. A client wants to sell her house, and she asks, *"How much do you think I can get for this?"* To answer this, you look at a dataset of houses that were recently sold in the city.

### 📊 Visualizing the Data
We plot the data where:
- **Horizontal Axis (x):** Size of the house in square feet.
- **Vertical Axis (y):** Price of the house in thousands of dollars.

![Linear Regression Housing Plot](/ml_notes/linear_regression_housing_plot.png)

Each little cross on the graph represents a house. If your client's house is **1,250 square feet**, you can use the straight line fit to the data to predict a price of about **$220,000**.

---

## 🧠 Supervised Learning Recap

This is a **Supervised Learning** model because we are training it with the "right answers."
- You give the model examples (house sizes).
- You also give it the correct output (the actual sale prices).

Since the model predicts a **number** (like 220,000 or 1.5), it is specifically a **Regression Model**.

| Type | Predicts... | Example |
| :--- | :--- | :--- |
| **Regression** | Continuous Numbers | House Prices, Stock Value |
| **Classification** | Discrete Categories | Cat vs. Dog, Spam vs. Not Spam |

---

## 📝 Machine Learning Notation

To talk about these concepts effectively, we use a standard set of mathematical notations. Don't worry if you don't memorize them all at once—they will become second nature over time!

![ML Notation Guide](/ml_notes/ml_notation_guide.png)

### Key Terms:
1.  **x**: The **Input Variable** (also called a **feature**). In our example, this is the House Size.
2.  **y**: The **Output Variable** (also called the **target variable**). This is what we want to predict (the Price).
3.  **m**: The total number of **training examples** (rows in your data table).
4.  **(x, y)**: A single training example (one pair of input and output).
5.  **(x⁽ⁱ⁾, y⁽ⁱ⁾)**: The **i-th** training example. The superscript **(i)** is NOT exponentiation (it's not $x^2$); it simply refers to the row number in your table.

### Example Training Set (m = 47)

| Size (x) | Price (y) | Notation |
| :--- | :--- | :--- |
| 2,104 | 400 | (x⁽¹⁾, y⁽¹⁾) |
| 1,600 | 330 | (x⁽²⁾, y⁽²⁾) |
| 2,400 | 369 | (x⁽³⁾, y⁽³⁾) |

---

## 🚀 What's Next?

In the next video, we’ll look at how to take this training set and feed it to a learning algorithm so it can actually "learn" that straight line!

---

*This lesson is available offline to get you started immediately.*
`,
    "2.2": `
# The Model Representation (Chapter 2.2)

In this lesson, we’ll explore how a supervised learning algorithm actually works. What does it do with the data, and what exactly does it output?

## 🔄 The Supervised Learning Workflow

To train a model, we feed the **Training Set** (Input Features + Output Targets) into a **Learning Algorithm**. The algorithm then produces a **Function (f)**.

![Supervised Learning Workflow](/ml_notes/supervised_learning_workflow.png)

### How it predicts:
1.  You give the function a **new input (x)** (e.g., house size).
2.  The function outputs an **estimate or prediction**, which we call **ŷ (y-hat)**.

> [!NOTE]
> **ŷ vs. y**: In machine learning, **y** refers to the actual true value from the data, while **ŷ** is the estimated value predicted by the model.

---

## 📐 Mathematically Representing the Model

A key question is: *What mathematical formula do we use for f?* 

For now, we’ll stick with a straight line. This is represented by the formula:

### f_w,b(x) = wx + b

![Linear Equation Visual](/ml_notes/linear_equation_visual.png)

- **w and b** are numbers called **parameters** (or weights and biases).
- The values of **w** and **b** determine exactly where the line sits on the graph and how it predicts **ŷ** for a given **x**.

---

## 🏷️ Univariate Linear Regression

Since we are using only **one input variable** (house size x), this model is called **Univariate Linear Regression**.
- **Uni** = One (Latin)
- **Variate** = Variable

It’s a fancy way of saying "Linear regression with one variable." Later, we’ll see models that take many inputs (like number of bedrooms, age of the house, etc.).

---

## 💻 Optional Lab: Model Representation

In the next step, you can look at an optional lab to see how to define a straight line function in Python. You'll be able to:
1.  Choose values for **w** and **b**.
2.  See how the line changes on the graph.
3.  Try to manually "fit" the line to the training data.

---

## 🧠 Moving Forward: The Cost Function

To make this model work automatically, we need a way to tell the computer how "good" its line is. This is where the **Cost Function** comes in—one of the most important ideas in all of AI.

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

To build a model that actually listens to data, we need a way to measure how well it's doing. This is where the **Cost Function** comes in. It provides the "score" that tells us how far off our predictions are.

## 🛠️ The Parameters: w and b

In our model **f_w,b(x) = wx + b**, the values **w** and **b** are called the **parameters**. You can think of them as the knobs you can turn to adjust your line:
- **w** is the **slope** (gradient).
- **b** is the **y-intercept** (bias).

![Parameter Intuition](/ml_notes/cost_function_parameter_intuition.png)

Depending on what values you pick, you get a different line. Our goal is to find the values that make the line fit the data as closely as possible.

---

## 📏 Measuring the Error

How do we define "closeness"? We look at the difference between the actual value **y** and our predicted value **ŷ**.

### Error = ŷ - y

For every point in our training set, we calculate this gap. If the gap is small, the model is doing well!

![Error Visualization](/ml_notes/cost_function_error_visualization.png)

---

## 📐 The Squared Error Cost Function

Mathematically, we don't just want the sum of errors (since positive and negative errors would cancel out). Instead, we take the **square** of each error. 

### J(w,b) = 1/2m * sum( (f_w,b(x^i) - y^i)^2 )

![Cost Function Formula](/ml_notes/cost_function_formula.png)

### Why 1/2m?
- **m**: We divide by the number of examples to get the *average* error. This way, the cost doesn't just grow because we added more data.
- **2**: We divide by 2 just to make internal calculus calculations a bit cleaner later on. It doesn't change which values of **w** and **b** are the best!

---

## 🏆 Summary
- The **Cost Function J(w,b)** measures the total error of our model.
- A **high cost** means the line is a poor fit.
- A **low cost** (approaching zero) means the line fits the data beautifully.

In the next lesson, we will see how to visualize this cost function in 3D to see the "valley" where the best parameters live!

---

*This lesson is available offline to get you started immediately.*
`,
    "2.5": `
# Cost Function Intuition (Chapter 2.5)

Now that we have the math for the Cost Function, let's build some intuition about what it's actually doing. To make things easy to visualize, we'll use a simplified version of our model.

## ⚖️ Simplified Model

Instead of **f_w,b(x) = wx + b**, we'll set the bias **b = 0**. This means our line must pass through the origin (0,0).

### f_w(x) = wx

Now we only have one parameter to worry about: **w**.

---

## 📊 Side-by-Side: f_w(x) vs J(w)

To understand how the cost works, we need to look at two different graphs at the same time:
1.  **Left Graph (The Model)**: Shows our training data and the line defined by **w**.
2.  **Right Graph (The Cost)**: Shows the value of **J(w)** for different values of **w**.

![f_w vs J(w)](/ml_notes/cost_function_fw_vs_jw.png)

---

## 🚶 Walkthrough: Changing w

Let's see what happens to the cost as we change the slope **w** using a training set with three points: **(1,1), (2,2), and (3,3)**.

### Case 1: w = 1
- The model is **f(x) = 1 * x**.
- Our predictions: **f(1)=1, f(2)=2, f(3)=3**.
- **Error**: Every prediction matches the target exactly!
- **Cost**: **J(1) = 0**.
- *This is the global minimum (the bottom of our cost curve).*

### Case 2: w = 0.5
- The model is **f(x) = 0.5 * x**.
- Our predictions: **f(1)=0.5, f(2)=1, f(3)=1.5**.
- **Error**: We are "missing" the targets.
- **Cost**: **J(0.5) ≈ 0.58**.
- *The cost is starting to climb.*

### Case 3: w = 0
- The model is **f(x) = 0**.
- **Cost**: **J(0) ≈ 2.33**.
- *Even higher error.*

---

## 🎢 The Cost Curve (Parabola)

If we plot the cost **J(w)** for many different values of **w**, we get a U-shaped curve called a **parabola**.

![Cost Parabola](/ml_notes/cost_function_parabola_min.png)

### The Goal of Learning
Our goal in Machine Learning is to find the **w** that is at the very bottom of this "valley". 

![Accumulated Error](/ml_notes/cost_error_summation.png)

The lower the point on the cost curve, the better our line fits the data!

## 🎓 Summary
- For every choice of **w**, there is a corresponding **total cost**.
- The cost function **J(w)** helps us find the "sweet spot" for our parameter.
- Minimizing **J(w)** is the key to training our model.

---

*This lesson is available offline to get you started immediately.*
`,
};
