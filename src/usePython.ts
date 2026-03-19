import { useState, useEffect } from 'react';
import { LAB_UTILS_UNI, QUESTCODE_AI_MPLSTYLE } from './pythonAssets';

// Global singleton and loading promise to prevent multiple initializations
let pyodideInstance: any = null;
let pyodidePromise: Promise<any> | null = null;
let pyodideLoadError: string | null = null;

/**
 * Internal function to handle the actual Pyodide loading logic
 */
async function initPyodide() {
  try {
    // 1. Inject script if not present
    if (!document.getElementById('pyodide-script')) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.id = 'pyodide-script';
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Pyodide script from CDN."));
        document.head.appendChild(script);
      });
    } else if (!(window as any).loadPyodide) {
      // Script is present but not yet loaded, wait for it
      await new Promise<void>((resolve, reject) => {
        const script = document.getElementById('pyodide-script') as HTMLScriptElement;
        const prevOnload = script.onload;
        script.onload = (e) => {
          if (typeof prevOnload === 'function') prevOnload.call(script, e);
          resolve();
        };
        script.onerror = () => reject(new Error("Existing Pyodide script failed to load."));
      });
    }

    // 2. Initialize Pyodide
    const pyodide = await (window as any).loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
    });
    
    // 3. Load core packages
    await pyodide.loadPackage(['numpy', 'matplotlib', 'micropip']);
    
    // 4. Load ipympl via micropip (more reliable for v0.25.0+)
    const micropip = pyodide.pyimport('micropip');
    try {
      await micropip.install('ipympl');
    } catch (e) {
      console.warn("Failed to install ipympl via micropip:", e);
      // Continue anyway, basic plotting might still work
    }
    
    // 5. Set up environment polyfills
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
    
    // 5. Write utility files
    pyodide.FS.writeFile('lab_utils_uni.py', LAB_UTILS_UNI);
    pyodide.FS.writeFile('questcode_ai.mplstyle', QUESTCODE_AI_MPLSTYLE);

    // Initial stdout setup
    pyodide.setStdout({ batched: (str: string) => { console.log(str); } });
    
    pyodideInstance = pyodide;
    return pyodide;
  } catch (error: any) {
    pyodideLoadError = error.message || "Unknown initialization error";
    console.error("Pyodide initialization failed:", error);
    throw error;
  }
}

export function usePython() {
  const [isPyodideLoading, setIsPyodideLoading] = useState(!pyodideInstance);
  const [error, setError] = useState<string | null>(pyodideLoadError);

  useEffect(() => {
    if (pyodideInstance) {
      setIsPyodideLoading(false);
      return;
    }

    // Use global promise to ensure we only try once or handle concurrent calls
    if (!pyodidePromise) {
      pyodidePromise = initPyodide();
    }

    pyodidePromise
      .then(() => {
        setIsPyodideLoading(false);
        setError(null);
      })
      .catch((err) => {
        setIsPyodideLoading(false);
        setError(err.message || "Failed to initialize Python engine");
        // Reset promise to allow retrying if it failed? 
        // For now, let's keep it failed but maybe provide a way to retry
        pyodidePromise = null; 
      });
  }, []);

  const runPython = async (code: string, onOutput: (str: string) => void): Promise<void> => {
    if (error) {
      onOutput(`Error: Python initialization failed - ${error}\nPlease refresh the page to try again.`);
      return;
    }

    if (!pyodideInstance) {
      onOutput("Error: Python interpreter is still loading...");
      return;
    }

    const pyodide = pyodideInstance;

    // Redirect stdout/stderr to callback
    pyodide.setStdout({ batched: (str: string) => { onOutput(str + "\n"); } });
    pyodide.setStderr({ batched: (str: string) => { onOutput(str + "\n"); } });

    // Handle input()
    pyodide.setStdin({
      stdin: () => {
         return prompt("Python Script is asking for input:") || "";
      }
    });

    try {
      await pyodide.runPythonAsync(`
import builtins
from js import window

def custom_input(prompt_msg=""):
    return window.prompt(prompt_msg) or ""

builtins.input = custom_input
      `);

      await pyodide.runPythonAsync(code);
    } catch (err: any) {
        onOutput(`\nError:\n${err.message}`);
    }
  };

  return { isPyodideLoading, runPython, error };
}

