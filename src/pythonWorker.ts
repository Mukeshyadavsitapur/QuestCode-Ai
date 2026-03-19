import { LAB_UTILS_UNI, QUESTCODE_AI_MPLSTYLE } from './pythonAssets';
// @ts-ignore
import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.mjs";

let pyodide: any = null;

let sharedInputBuffer: SharedArrayBuffer | null = null;
let sharedInputStatus: Int32Array | null = null;
let sharedInputData: Uint8Array | null = null;
let sharedInputLength: Uint32Array | null = null;

async function loadPyodideAndPackages(sab?: SharedArrayBuffer) {
  try {
    if (sab) {
      sharedInputBuffer = sab;
      sharedInputStatus = new Int32Array(sharedInputBuffer, 0, 1);
      sharedInputLength = new Uint32Array(sharedInputBuffer, 4, 1);
      sharedInputData = new Uint8Array(sharedInputBuffer, 8, 1016);
    }
    
    // pyodide is now loaded via ES import
    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
    });

    await pyodide.loadPackage(["numpy", "matplotlib", "micropip"]);
    
    const micropip = pyodide.pyimport("micropip");
    try {
      await micropip.install("ipympl");
    } catch (e) {
      console.warn("Worker: Failed to install ipympl via micropip:", e);
    }

    // Polyfills
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

    // Setup blocking input using SharedArrayBuffer if available
    if (sharedInputStatus && sharedInputData && sharedInputLength) {
        // Expose helper to Python to avoid DataCloneError with Python dicts
        (self as any).sendInputRequest = (msg: string) => {
            self.postMessage({ type: "input_request", prompt_msg: msg });
        };
        (self as any).sharedInputStatus = sharedInputStatus;
        (self as any).sharedInputData = sharedInputData;
        (self as any).sharedInputLength = sharedInputLength;

        pyodide.runPython(`
import builtins
from js import self, Atomics

def custom_input(prompt_msg=""):
    # Clear status to 0 (idle)
    self.sharedInputStatus[0] = 0
    # Send request to main thread via JS helper
    self.sendInputRequest(prompt_msg)
    
    # Wait for status to become 2 (data ready)
    Atomics.wait(self.sharedInputStatus, 0, 0)
    
    # Read the data back
    length = self.sharedInputLength[0]
    # We must convert to a Python bytes object then decode
    data_bytes = self.sharedInputData.to_py()[:length]
    return bytes(data_bytes).decode('utf-8')

builtins.input = custom_input
        `);
    } else {
        pyodide.runPython(`
import builtins
def custom_input(prompt_msg=""):
    print("Warning: Synchronous input() not supported in this environment.")
    return ""
builtins.input = custom_input
        `);
    }

    pyodide.FS.writeFile('lab_utils_uni.py', LAB_UTILS_UNI);
    pyodide.FS.writeFile('questcode_ai.mplstyle', QUESTCODE_AI_MPLSTYLE);

    self.postMessage({ type: "ready" });
  } catch (error: any) {
    self.postMessage({ type: "error", content: error.message || "Failed to load Python engine in worker" });
  }
}

self.onmessage = async (e) => {
  const { type, code, sharedBuffer } = e.data;

  if (type === "init") {
    await loadPyodideAndPackages(sharedBuffer);
  } else if (type === "run") {
    if (!pyodide) {
      self.postMessage({ type: "error", content: "Python interpreter not ready" });
      return;
    }

    pyodide.setStdout({
      batched: (str: string) => self.postMessage({ type: "stdout", content: str })
    });
    pyodide.setStderr({
      batched: (str: string) => self.postMessage({ type: "stderr", content: str })
    });

    try {
      await pyodide.runPythonAsync(code);
      self.postMessage({ type: "done" });
    } catch (err: any) {
      self.postMessage({ type: "error", content: err.message });
    }
  }
};
