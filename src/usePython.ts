import { useState, useEffect, useRef } from 'react';

export function usePython() {
  const [isPyodideLoading, setIsPyodideLoading] = useState(true);
  const pyodideRef = useRef<any>(null);

  useEffect(() => {
    const loadPyodide = async () => {
      try {
        // @ts-ignore
        const pyodide = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
        });
        
        // Create a custom print wrapper to capture stdout
        pyodide.setStdout({ batched: (str: string) => { console.log(str); } });
        
        pyodideRef.current = pyodide;
        setIsPyodideLoading(false);
      } catch (error) {
        console.error("Failed to load Pyodide:", error);
        setIsPyodideLoading(false);
      }
    };

    // Dynamically inject the Pyodide script if not present
    if (!document.getElementById('pyodide-script')) {
      const script = document.createElement('script');
      script.id = 'pyodide-script';
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
      script.onload = loadPyodide;
      document.head.appendChild(script);
    } else if ((window as any).loadPyodide) {
        loadPyodide();
    }
  }, []);

  const runPython = async (code: string, onOutput: (str: string) => void): Promise<void> => {
    if (!pyodideRef.current) {
      onOutput("Error: Python interpreter is still loading...");
      return;
    }

    const pyodide = pyodideRef.current;

    // Redirect stdout to our callback immediately before run
    pyodide.setStdout({ batched: (str: string) => { onOutput(str + "\n"); } });
    pyodide.setStderr({ batched: (str: string) => { onOutput(str + "\n"); } });

    // Handle generic built-in input() 
    pyodide.setStdin({
      stdin: () => {
         return prompt("Python Script is asking for input:") || "";
      }
    });

    try {
      // Monkeypatch the built-in input function to use the provided prompt string
      await pyodide.runPythonAsync(`
import builtins
from js import window

def custom_input(prompt_msg=""):
    return window.prompt(prompt_msg) or ""

builtins.input = custom_input
      `);

      // For async input() support in Pyodide, we often have to wrap the code if we want to use true async custom modals, 
      // but for a learning application MVP, the synchronous browser prompt() bound to stdin works flawlessly and natively pauses the WASM thread!
      await pyodide.runPythonAsync(code);
    } catch (error: any) {
        onOutput(`\nError:\n${error.message}`);
    }
  };

  return { isPyodideLoading, runPython };
}
