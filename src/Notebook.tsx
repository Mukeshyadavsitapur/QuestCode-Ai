import { useEffect } from "react";
import { Server, Cloud } from "lucide-react";

interface NotebookProps {
  theme: string;
  mode: "lite" | "local";
  localUrl: string;
  refreshKey: number;
  onCellsChange: (cellsJson: string) => void;
}

export function Notebook({ theme, mode, localUrl, refreshKey, onCellsChange }: NotebookProps) {
  // Give a default valid JSON string so App.tsx doesn't complain about invalid JSON if it checks
  useEffect(() => {
    onCellsChange(JSON.stringify([{ type: "jupyter_iframe" }]));
  }, [onCellsChange]);

  const getThemeParam = () => {
    return theme === "vs-dark" ? "?theme=JupyterLab Dark" : "?theme=JupyterLab Light";
  };

  return (
    <div className="notebook-container" style={{ 
        height: "100%", 
        background: "var(--code-bg)", 
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
    }}>
      {/* Iframe View */}
      <div style={{ flex: 1, position: "relative" }}>
          {mode === "local" ? (
             <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--code-bg)" }}>
                 {/* Only show this warning if it looks like they haven't set up the local server, but we will render the iframe over it anyway. If iframe fails it might just show blank due to X-Frame-Options */}
                 <Server size={48} style={{ color: "var(--text-muted)", opacity: 0.5, marginBottom: "16px" }} />
                 <p style={{ color: "var(--text-main)", fontWeight: 600 }}>Connecting to {localUrl}</p>
                 <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "400px", textAlign: "center" }}>
                     Make sure your Jupyter server is running. You may need to start it with: <br/>
                     <code style={{ background: "var(--bg-tertiary)", padding: "2px 6px", borderRadius: "4px", marginTop: "8px", display: "inline-block" }}>jupyter notebook --NotebookApp.allow_origin='*'</code>
                 </p>
             </div>
          ) : (
             <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--code-bg)" }}>
                 <Cloud size={48} style={{ color: "var(--text-muted)", opacity: 0.5, marginBottom: "16px" }} />
                 <p style={{ color: "var(--text-main)", fontWeight: 600 }}>Loading JupyterLite...</p>
                 <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "400px", textAlign: "center" }}>
                     This runs entirely in your browser. The first load may take a few moments.
                 </p>
             </div>
          )}

          <iframe
            key={refreshKey}
            src={mode === "lite" ? `https://jupyterlite.github.io/demo/lab/index.html${getThemeParam()}` : localUrl}
            style={{ 
                width: "100%", 
                height: "100%", 
                border: "none", 
                position: "absolute", 
                top: 0, 
                left: 0, 
                zIndex: 10,
                background: "transparent"
            }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            title="Jupyter Notebook"
          />
      </div>
    </div>
  );
}
