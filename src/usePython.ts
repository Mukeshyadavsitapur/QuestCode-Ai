import { useState, useEffect, useRef } from 'react';

// Global worker state to persist across hook usages
let pythonWorker: Worker | null = null;
let isReady = false;
let loadError: string | null = null;
const initializationListeners = new Set<(ready: boolean, error: string | null) => void>();

// Shared buffer for synchronous input (blocking the worker thread)
// SAB layout: 
// [0..3]: Int32 status (0: idle, 1: input requested, 2: input ready)
// [4..7]: Uint32 length of the string
// [8..1024]: UTF-8 encoded string data
let sharedInputBuffer: SharedArrayBuffer | null = null;
let sharedInputStatus: Int32Array | null = null;
let sharedInputData: Uint8Array | null = null;
let sharedInputLength: Uint32Array | null = null;

function getPythonWorker() {
  if (typeof window === 'undefined') return null;
  
  if (!pythonWorker) {
    if (typeof SharedArrayBuffer !== 'undefined') {
      sharedInputBuffer = new SharedArrayBuffer(1024);
      sharedInputStatus = new Int32Array(sharedInputBuffer, 0, 1);
      sharedInputLength = new Uint32Array(sharedInputBuffer, 4, 1);
      sharedInputData = new Uint8Array(sharedInputBuffer, 8, 1016);
    } else {
      console.warn("SharedArrayBuffer not supported. inputs will not work.");
    }

    pythonWorker = new Worker(new URL('./pythonWorker.ts', import.meta.url), { type: 'module' });
    
    pythonWorker.onmessage = (e) => {
      const { type, content, prompt_msg } = e.data;
      if (type === 'ready') {
        isReady = true;
        initializationListeners.forEach(l => l(true, null));
      } else if (type === 'error' && !isReady) {
        loadError = content;
        initializationListeners.forEach(l => l(false, content));
      } else if (type === 'input_request' && sharedInputStatus && sharedInputData && sharedInputLength) {
        // Handle blocking input request
        const userInput = prompt(prompt_msg || "Python input:") || "";
        const encoder = new TextEncoder();
        const encoded = encoder.encode(userInput);
        
        // Truncate if too long for buffer
        const safeEncoded = encoded.slice(0, 1016);
        sharedInputData.set(safeEncoded);
        sharedInputLength[0] = safeEncoded.length;
        
        // Signal worker that data is ready (Status 1 -> 2)
        Atomics.store(sharedInputStatus, 0, 2);
        Atomics.notify(sharedInputStatus, 0);
      }
    };
    
    pythonWorker.postMessage({ 
      type: 'init', 
      sharedBuffer: sharedInputBuffer 
    });
  }
  return pythonWorker;
}

export function usePython() {
  const [isPyodideLoading, setIsPyodideLoading] = useState(!isReady);
  const [error, setError] = useState<string | null>(loadError);
  const outputCallbackRef = useRef<(str: string) => void>(() => {});

  useEffect(() => {
    const worker = getPythonWorker();
    if (!worker) return;

    if (isReady) {
      setIsPyodideLoading(false);
      setError(null);
    } else if (loadError) {
      setIsPyodideLoading(false);
      setError(loadError);
    }

    const onStatusUpdate = (ready: boolean, err: string | null) => {
      setIsPyodideLoading(!ready && !err);
      setError(err);
    };

    initializationListeners.add(onStatusUpdate);

    const onMessage = (e: MessageEvent) => {
      const { type, content } = e.data;
      if (type === 'stdout' || type === 'stderr') {
        outputCallbackRef.current(content + "\n");
      }
    };

    worker.addEventListener('message', onMessage);

    return () => {
      initializationListeners.delete(onStatusUpdate);
      worker.removeEventListener('message', onMessage);
    };
  }, []);

  const runPython = async (code: string, onOutput: (str: string) => void): Promise<void> => {
    return new Promise((resolve) => {
      const worker = getPythonWorker();
      
      if (error) {
        onOutput(`Error: Python initialization failed - ${error}\nPlease refresh the page to try again.`);
        resolve();
        return;
      }

      if (!isReady || !worker) {
        onOutput("Error: Python interpreter is still loading...");
        resolve();
        return;
      }

      outputCallbackRef.current = onOutput;

      const handleRunMessage = (e: MessageEvent) => {
        if (e.data.type === 'done' || e.data.type === 'error') {
          if (e.data.type === 'error') {
            onOutput(`\nError:\n${e.data.content}`);
          }
          worker.removeEventListener('message', handleRunMessage);
          resolve();
        }
      };

      worker.addEventListener('message', handleRunMessage);
      worker.postMessage({ type: "run", code });
    });
  };

  const stopPython = () => {
    if (pythonWorker) {
      pythonWorker.terminate();
      pythonWorker = null;
      isReady = false;
      loadError = null;
      sharedInputBuffer = null;
      sharedInputStatus = null;
      sharedInputData = null;
      sharedInputLength = null;
      initializationListeners.forEach(l => l(false, null));
      getPythonWorker();
    }
  };

  return { isPyodideLoading, runPython, stopPython, error };
}
