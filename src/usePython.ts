import { useState, useEffect, useRef } from 'react';
import { LAB_UTILS_UNI, QUESTCODE_AI_MPLSTYLE } from './pythonAssets';

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
        
        // Load numpy, matplotlib, and ipympl (pinned for compatibility)
        await pyodide.loadPackage(['numpy', 'matplotlib', 'ipympl==0.9.3']);
        
        // Polyfill 'js' module for matplotlib's WebAgg backend which expects 'alert' and 'document'
        pyodide.runPython(`
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
        `);
        
        // Write utility files to Pyodide's virtual filesystem
        pyodide.FS.writeFile('lab_utils_uni.py', LAB_UTILS_UNI);
        pyodide.FS.writeFile('questcode_ai.mplstyle', QUESTCODE_AI_MPLSTYLE);

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
