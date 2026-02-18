export interface Topic {
    id: string;
    title: string;
}

export interface TopicGroup {
    title: string;
    topics: Topic[];
}

export const TOPICS_RUST: TopicGroup[] = [
    {
        title: "1. Rust Introduction",
        topics: [
            { id: "1.1", title: "Introduction to Rust" },
            { id: "1.2", title: "Installation & Setup (Rustup)" },
            { id: "1.3", title: "Hello, World! & Anatomy" },
            { id: "1.4", title: "Cargo: Creating Projects" },
            { id: "1.5", title: "Rust Comments (Line & Block)" },
            { id: "1.6", title: "Practice Questions" },
        ],
    },
    {
        title: "2. Rust Fundamentals",
        topics: [
            { id: "2.1", title: "Variables (let) & Mutability (mut)" },
            { id: "2.2", title: "Constants & Shadowing" },
            { id: "2.3", title: "Basic Data Types (Scalar)" },
            { id: "2.4", title: "Compound Types (Tuple, Array)" },
            { id: "2.5", title: "Type Conversion (as)" },
            { id: "2.6", title: "Basic Input (stdin) & Output (println!)" },
            { id: "2.7", title: "Operators" },
            { id: "2.8", title: "Practice Questions" },
        ],
    },
    {
        title: "3. Rust Flow Control",
        topics: [
            { id: "3.1", title: "If Expressions" },
            { id: "3.2", title: "Loops (loop, while, for)" },
            { id: "3.3", title: "Control Flow: break & continue" },
            { id: "3.4", title: "Match Control Flow (Pattern Matching)" },
            { id: "3.5", title: "if let Syntax" },
            { id: "3.6", title: "Practice Questions" },
        ],
    },
    {
        title: "4. Rust Data Types & Collections",
        topics: [
            { id: "4.1", title: "Vectors (Vec<T>)" },
            { id: "4.2", title: "Strings (String vs &str)" },
            { id: "4.3", title: "String Slicing" },
            { id: "4.4", title: "Hash Maps" },
            { id: "4.5", title: "Slices" },
            { id: "4.6", title: "Practice Questions" },
        ],
    },
    {
        title: "5. Rust Functions & Ownership",
        topics: [
            { id: "5.1", title: "Defining Functions" },
            { id: "5.2", title: "Parameters & Return Values" },
            { id: "5.3", title: "Statements vs Expressions" },
            { id: "5.4", title: "Ownership: Stack vs Heap" },
            { id: "5.5", title: "Ownership: Move Semantics" },
            { id: "5.6", title: "Borrowing & References" },
            { id: "5.7", title: "The Slice Type" },
            { id: "5.8", title: "Practice Questions" },
        ],
    },
    {
        title: "6. Rust Files & I/O",
        topics: [
            { id: "6.1", title: "Command Line Arguments" },
            { id: "6.2", title: "Reading Files (std::fs)" },
            { id: "6.3", title: "Writing Files" },
            { id: "6.4", title: "BufReader & Lines" },
            { id: "6.5", title: "Practice Questions" },
        ],
    },
    {
        title: "7. Rust Error Handling",
        topics: [
            { id: "7.1", title: "Unrecoverable: panic!" },
            { id: "7.2", title: "Recoverable: Result<T, E>" },
            { id: "7.3", title: "The Option Enum" },
            { id: "7.4", title: "Unwrap and Expect" },
            { id: "7.5", title: "Propagating Errors (?)" },
            { id: "7.6", title: "Practice Questions" },
        ],
    },
    {
        title: "8. Rust Structs & Traits (OOP)",
        topics: [
            { id: "8.1", title: "Defining Structs" },
            { id: "8.2", title: "Method Syntax (impl)" },
            { id: "8.3", title: "Enums & Pattern Matching" },
            { id: "8.4", title: "Defining Traits" },
            { id: "8.5", title: "Implementing Traits" },
            { id: "8.6", title: "Derivable Traits" },
            { id: "8.7", title: "Practice Questions" },
        ],
    },
    {
        title: "9. Rust Advanced Topics",
        topics: [
            { id: "9.1", title: "Generics" },
            { id: "9.2", title: "Lifetimes" },
            { id: "9.3", title: "Closures" },
            { id: "9.4", title: "Iterators" },
            { id: "9.5", title: "Smart Pointers (Box, Rc, RefCell)" },
            { id: "9.6", title: "Concurrency (Threads, Channels)" },
            { id: "9.7", title: "Macros" },
            { id: "9.8", title: "Practice Questions" },
        ],
    },
    {
        title: "10. Rust Date & Time",
        topics: [
            { id: "10.1", title: "Standard Time (std::time)" },
            { id: "10.2", title: "Duration & Measurements" },
            { id: "10.3", title: "External Crate: Chrono" },
            { id: "10.4", title: "Practice Questions" },
        ],
    },
    {
        title: "11. Additional Topics",
        topics: [
            { id: "11.1", title: "Project Structure (Modules)" },
            { id: "11.2", title: "Visibility (pub)" },
            { id: "11.3", title: "Testing (Unit & Integration)" },
            { id: "11.4", title: "Documentation Comments" },
            { id: "11.5", title: "Practice Questions" },
        ],
    },
];

export const TOPICS_PYTHON: TopicGroup[] = [
    {
        title: "1. Python Introduction",
        topics: [
            { id: "1.1", title: "Get Started With Python" },
            { id: "1.2", title: "Your First Python Program" },
            { id: "1.3", title: "Python Comments (Single & Multi-line)" },
            { id: "1.4", title: "Python Indentation vs Braces" },
            { id: "1.5", title: "Practice Questions" },
        ],
    },
    {
        title: "2. Python Fundamentals",
        topics: [
            { id: "2.1", title: "Python Variables and Literals" },
            { id: "2.2", title: "Naming Rules (Snake Case)" },
            { id: "2.3", title: "Python Type Conversion" },
            { id: "2.4", title: "Python Basic Input and Output" },
            { id: "2.5", title: "Python Operators" },
            { id: "2.6", title: "Practice Questions" },
        ],
    },
    {
        title: "3. Python Flow Control",
        topics: [
            { id: "3.1", title: "Python if...else Statement" },
            { id: "3.2", title: "Match Case (Python 3.10+)" },
            { id: "3.3", title: "Python for Loop (Range)" },
            { id: "3.4", title: "Python while Loop" },
            { id: "3.5", title: "Python break and continue" },
            { id: "3.6", title: "Python pass Statement" },
            { id: "3.7", title: "Practice Questions" },
        ],
    },
    {
        title: "4. Python Data Types",
        topics: [
            { id: "4.1", title: "Python Numbers and Mathematics" },
            { id: "4.2", title: "Python Casting" },
            { id: "4.3", title: "Python String (Slicing & Methods)" },
            { id: "4.4", title: "Python List (Methods & Slicing)" },
            { id: "4.5", title: "Python Tuple (Immutable)" },
            { id: "4.6", title: "Python Set (Unique Elements)" },
            { id: "4.7", title: "Python Dictionary (Key-Value)" },
            { id: "4.8", title: "Practice Questions" },
        ],
    },
    {
        title: "5. Python Functions",
        topics: [
            { id: "5.1", title: "Python Functions (Def)" },
            { id: "5.2", title: "Python Function Arguments" },
            { id: "5.3", title: "Python Variable Scope" },
            { id: "5.4", title: "Python Global Keyword" },
            { id: "5.5", title: "Python Recursion" },
            { id: "5.6", title: "Python Modules" },
            { id: "5.7", title: "Python Package" },
            { id: "5.8", title: "Python Main function" },
            { id: "5.9", title: "Practice Questions" },
        ],
    },
    {
        title: "6. Python Files",
        topics: [
            { id: "6.1", title: "Python Directory and Files Management" },
            { id: "6.2", title: "Context Managers (with statement)" },
            { id: "6.3", title: "Python CSV: Read and Write" },
            { id: "6.4", title: "Reading CSV files" },
            { id: "6.5", title: "Writing CSV files" },
            { id: "6.6", title: "Practice Questions" },
        ],
    },
    {
        title: "7. Python Exception Handling",
        topics: [
            { id: "7.1", title: "Python Exceptions" },
            { id: "7.2", title: "Python Exception Handling (try..except)" },
            { id: "7.3", title: "Python Custom Exceptions" },
            { id: "7.4", title: "The finally Block" },
            { id: "7.5", title: "Practice Questions" },
        ],
    },
    {
        title: "8. Python Object & Class",
        topics: [
            { id: "8.1", title: "Python Objects and Classes" },
            { id: "8.2", title: "The __init__ Method (Constructor)" },
            { id: "8.3", title: "Python Inheritance" },
            { id: "8.4", title: "Python Multiple Inheritance" },
            { id: "8.5", title: "Polymorphism in Python" },
            { id: "8.6", title: "Python Operator Overloading" },
            { id: "8.7", title: "Practice Questions" },
        ],
    },
    {
        title: "9. Python Advanced Topics",
        topics: [
            { id: "9.1", title: "List comprehension" },
            { id: "9.2", title: "Python Lambda/Anonymous Function" },
            { id: "9.3", title: "Python Iterators" },
            { id: "9.4", title: "Python Generators (yield)" },
            { id: "9.5", title: "Python Namespace and Scope" },
            { id: "9.6", title: "Python Closures" },
            { id: "9.7", title: "Python Decorators" },
            { id: "9.8", title: "Python @property decorator" },
            { id: "9.9", title: "Python RegEx" },
            { id: "9.10", title: "Practice Questions" },
        ],
    },
    {
        title: "10. Python Date and Time",
        topics: [
            { id: "10.1", title: "Python datetime Module" },
            { id: "10.2", title: "Python strftime()" },
            { id: "10.3", title: "Python strptime()" },
            { id: "10.4", title: "Get Current Date & Time" },
            { id: "10.5", title: "Timestamp to Datetime" },
            { id: "10.6", title: "Python time Module" },
            { id: "10.7", title: "Python sleep()" },
            { id: "10.8", title: "Practice Questions" },
        ],
    },
    {
        title: "11. Additional Topics",
        topics: [
            { id: "11.1", title: "Precedence and Associativity" },
            { id: "11.2", title: "Python Keywords and Identifiers" },
            { id: "11.3", title: "Python Asserts" },
            { id: "11.4", title: "Python JSON" },
            { id: "11.5", title: "Python PIP" },
            { id: "11.6", title: "Python *args and **kwargs" },
            { id: "11.7", title: "Practice Questions" },
        ],
    },
];

export const TOPICS_DSA: TopicGroup[] = [
    {
        title: "1. DSA Introduction",
        topics: [
            { id: "1.1", title: "What is an algorithm?" },
            { id: "1.2", title: "Data Structure and Types" },
            { id: "1.3", title: "Why learn DSA?" },
            { id: "1.4", title: "Asymptotic Notations (Big O)" },
            { id: "1.5", title: "Master Theorem" },
            { id: "1.6", title: "Divide and Conquer Algorithm" },
            { id: "1.7", title: "Practice Questions" },
        ],
    },
    {
        title: "2. Data Structures (I)",
        topics: [
            { id: "2.1", title: "Stack Data Structure" },
            { id: "2.2", title: "Queue Data Structure" },
            { id: "2.3", title: "Types of Queue" },
            { id: "2.4", title: "Circular Queue" },
            { id: "2.5", title: "Priority Queue" },
            { id: "2.6", title: "Deque (Double Ended Queue)" },
            { id: "2.7", title: "Practice Questions" },
        ],
    },
    {
        title: "3. Data Structures (II)",
        topics: [
            { id: "3.1", title: "Linked List Data Structure" },
            { id: "3.2", title: "Linked List Operations" },
            { id: "3.3", title: "Types of Linked List" },
            { id: "3.4", title: "Hash Table" },
            { id: "3.5", title: "Heap Data Structure" },
            { id: "3.6", title: "Fibonacci Heap" },
            { id: "3.7", title: "Decrease Key and Delete Node" },
            { id: "3.8", title: "Practice Questions" },
        ],
    },
    {
        title: "4. Tree based DSA (I)",
        topics: [
            { id: "4.1", title: "Tree Data Structure" },
            { id: "4.2", title: "Tree Traversal" },
            { id: "4.3", title: "Binary Tree" },
            { id: "4.4", title: "Full Binary Tree" },
            { id: "4.5", title: "Perfect Binary Tree" },
            { id: "4.6", title: "Complete Binary Tree" },
            { id: "4.7", title: "Balanced Binary Tree" },
            { id: "4.8", title: "Binary Search Tree" },
            { id: "4.9", title: "AVL Tree" },
            { id: "4.10", title: "Practice Questions" },
        ],
    },
    {
        title: "5. Tree based DSA (II)",
        topics: [
            { id: "5.1", title: "B Tree" },
            { id: "5.2", title: "Insertion in a B-tree" },
            { id: "5.3", title: "Deletion from a B-tree" },
            { id: "5.4", title: "B+ Tree" },
            { id: "5.5", title: "Insertion on a B+ Tree" },
            { id: "5.6", title: "Deletion from a B+ Tree" },
            { id: "5.7", title: "Red-Black Tree" },
            { id: "5.8", title: "Red-Black Tree Insertion" },
            { id: "5.9", title: "Deletion From a Red-Black Tree" },
            { id: "5.10", title: "Practice Questions" },
        ],
    },
    {
        title: "6. Graph based DSA",
        topics: [
            { id: "6.1", title: "Graph Data Structure" },
            { id: "6.2", title: "Spanning Tree" },
            { id: "6.3", title: "Strongly Connected Components" },
            { id: "6.4", title: "Adjacency Matrix" },
            { id: "6.5", title: "Adjacency List" },
            { id: "6.6", title: "DFS Algorithm" },
            { id: "6.7", title: "Breadth-first Search (BFS)" },
            { id: "6.8", title: "Bellman Ford's Algorithm" },
            { id: "6.9", title: "Practice Questions" },
        ],
    },
    {
        title: "7. Sorting and Searching Algorithms",
        topics: [
            { id: "7.1", title: "Bubble Sort" },
            { id: "7.2", title: "Selection Sort" },
            { id: "7.3", title: "Insertion Sort" },
            { id: "7.4", title: "Merge Sort" },
            { id: "7.5", title: "Quicksort" },
            { id: "7.6", title: "Counting Sort" },
            { id: "7.7", title: "Radix Sort" },
            { id: "7.8", title: "Bucket Sort" },
            { id: "7.9", title: "Heap Sort" },
            { id: "7.10", title: "Shell Sort" },
            { id: "7.11", title: "Linear Search" },
            { id: "7.12", title: "Binary Search" },
            { id: "7.13", title: "Practice Questions" },
        ],
    },
    {
        title: "8. Greedy Algorithms",
        topics: [
            { id: "8.1", title: "Greedy Algorithm Introduction" },
            { id: "8.2", title: "Ford-Fulkerson Algorithm" },
            { id: "8.3", title: "Dijkstra's Algorithm" },
            { id: "8.4", title: "Kruskal's Algorithm" },
            { id: "8.5", title: "Prim's Algorithm" },
            { id: "8.6", title: "Huffman Coding" },
            { id: "8.7", title: "Practice Questions" },
        ],
    },
    {
        title: "9. Dynamic Programming",
        topics: [
            { id: "9.1", title: "Dynamic Programming Introduction" },
            { id: "9.2", title: "Floyd-Warshall Algorithm" },
            { id: "9.3", title: "Longest Common Sequence" },
            { id: "9.4", title: "Memoization vs Tabulation" },
            { id: "9.5", title: "Practice Questions" },
        ],
    },
    {
        title: "10. Other Algorithms",
        topics: [
            { id: "10.1", title: "Backtracking Algorithm" },
            { id: "10.2", title: "Rabin-Karp Algorithm" },
            { id: "10.3", title: "Bit Manipulation" },
            { id: "10.4", title: "Practice Questions" },
        ],
    },
];
