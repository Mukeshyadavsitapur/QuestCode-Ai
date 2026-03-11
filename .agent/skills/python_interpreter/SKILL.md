---
name: python_interpreter
description: Guidelines for managing and using the Python WASM interpreter (Pyodide) within QuestCode-Ai.
---

# Python Interpreter Skill

This skill documents the integration of Pyodide within the QuestCode-Ai application to provide a local, offline Python coding experience.

## Overview
QuestCode-Ai uses **Pyodide** (CPython compiled to WebAssembly) to execute Python code directly in the terminal panel without requiring a backend server for execution.

## Key Files
- `src/usePython.ts`: The primary React hook that manages Pyodide initialization, script injection, and execution logic.

## Technical Details

### Initialization
- The interpreter is loaded via a dynamically injected `<script>` tag pointing to `cdn.jsdelivr.net`.
- `loadPyodide()` is called to initialize the WASM environment.

### Stdout & Stderr
- Standard output and error are captured using `pyodide.setStdout` and `pyodide.setStderr`.
- Content is batched and passed to the terminal's output callback.

### Input Handling
- Native Python `input()` is supported by overriding `pyodide.setStdin`.
- It uses the browser's `prompt()` function, which synchronously pauses the WASM thread, mimicking a real terminal's blocking input behavior.

## Usage for Agents
When modifying Python execution or debugging issues:
1. **Check Script Version**: Ensure the CDN version in `usePython.ts` matches the `loadPyodide` index URL.
2. **Terminal Integration**: Output must be handled line-by-line or batched to avoid UI freezes.
3. **WASM Constraints**: Remember that Pyodide runs in a sandbox; it doesn't have access to the host file system unless manually mapped.
