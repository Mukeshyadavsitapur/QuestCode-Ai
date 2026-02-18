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
        title: "1. Getting Started",
        topics: [
            { id: "1.1", title: "Introduction to Rust" },
            { id: "1.2", title: "Installation & Setup" },
            { id: "1.3", title: "Hello, World!" },
            { id: "1.4", title: "Cargo: The Build System" },
        ],
    },
    {
        title: "2. Common Concepts",
        topics: [
            { id: "2.1", title: "Variables & Mutability" },
            { id: "2.2", title: "Data Types" },
            { id: "2.3", title: "Functions" },
            { id: "2.4", title: "Comments" },
            { id: "2.5", title: "Control Flow (if/else)" },
            { id: "2.6", title: "Loops (loop, while, for)" },
        ],
    },
    {
        title: "3. Ownership (Unique to Rust)",
        topics: [
            { id: "3.1", title: "What is Ownership?" },
            { id: "3.2", title: "References & Borrowing" },
            { id: "3.3", title: "The Slice Type" },
        ],
    },
    {
        title: "4. Structs & Enums",
        topics: [
            { id: "4.1", title: "Defining Structs" },
            { id: "4.2", title: "Method Syntax" },
            { id: "4.3", title: "Enums" },
            { id: "4.4", title: "The Match Control Flow" },
            { id: "4.5", title: "if let Syntax" },
        ],
    },
    {
        title: "5. Collections",
        topics: [
            { id: "5.1", title: "Vectors" },
            { id: "5.2", title: "Strings" },
            { id: "5.3", title: "Hash Maps" },
        ],
    },
    {
        title: "6. Error Handling",
        topics: [
            { id: "6.1", title: "Unrecoverable Errors with panic!" },
            { id: "6.2", title: "Recoverable Errors with Result" },
            { id: "6.3", title: "Propagating Errors" },
        ],
    },
    {
        title: "7. Generics, Traits & Lifetimes",
        topics: [
            { id: "7.1", title: "Generic Data Types" },
            { id: "7.2", title: "Traits & Shared Behavior" },
            { id: "7.3", title: "Lifetimes & Validating References" },
        ],
    },
    {
        title: "8. Advanced Concepts",
        topics: [
            { id: "8.1", title: "Closures" },
            { id: "8.2", title: "Iterators" },
            { id: "8.3", title: "Smart Pointers (Box, Rc, RefCell)" },
            { id: "8.4", title: "Concurrency (Threads, Channels)" },
            { id: "8.5", title: "Macros" },
        ],
    },
];

export const TOPICS_PYTHON: TopicGroup[] = [
    {
        title: "1. Introduction",
        topics: [
            { id: "1.1", title: "Introduction to Python" },
            { id: "1.2", title: "Installation & Setup" },
            { id: "1.3", title: "Python Syntax" },
            { id: "1.4", title: "Comments" },
        ],
    },
    {
        title: "2. Basics",
        topics: [
            { id: "2.1", title: "Variables" },
            { id: "2.2", title: "Data Types" },
            { id: "2.3", title: "Numbers" },
            { id: "2.4", title: "Casting" },
            { id: "2.5", title: "Strings & Methods" },
            { id: "2.6", title: "Booleans" },
        ],
    },
    {
        title: "3. Control Flow",
        topics: [
            { id: "3.1", title: "If ... Else" },
            { id: "3.2", title: "While Loops" },
            { id: "3.3", title: "For Loops" },
        ],
    },
    {
        title: "4. Functions & Modules",
        topics: [
            { id: "4.1", title: "Creating Functions" },
            { id: "4.2", title: "Arguments & Return Values" },
            { id: "4.3", title: "Lambda Functions" },
            { id: "4.4", title: "Scope (Global vs Local)" },
            { id: "4.5", title: "Modules" },
        ],
    },
    {
        title: "5. Data Structures",
        topics: [
            { id: "5.1", title: "Lists" },
            { id: "5.2", title: "Tuples" },
            { id: "5.3", title: "Sets" },
            { id: "5.4", title: "Dictionaries" },
        ],
    },
    {
        title: "6. Object Oriented Programming",
        topics: [
            { id: "6.1", title: "Classes & Objects" },
            { id: "6.2", title: "Inheritance" },
            { id: "6.3", title: "Polymorphism" },
        ],
    },
    {
        title: "7. Advanced Topics",
        topics: [
            { id: "7.1", title: "Iterators" },
            { id: "7.2", title: "File Handling" },
            { id: "7.3", title: "RegEx" },
            { id: "7.4", title: "PIP & Packages" },
            { id: "7.5", title: "Try ... Except" },
            { id: "7.6", title: "String Formatting" },
        ],
    },
];
