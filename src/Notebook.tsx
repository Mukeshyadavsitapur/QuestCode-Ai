import { useEffect } from "react";
import { Server, Cloud, ArrowLeft } from "lucide-react";

interface NotebookProps {
  theme: string;
  mode: "lite" | "local";
  localUrl: string;
  refreshKey: number;
  appliedCode: string | null;
  onClearApplied: () => void;
  onCellsChange: (cellsJson: string) => void;
}

export function Notebook({ theme, mode, localUrl, refreshKey, appliedCode, onClearApplied, onCellsChange }: NotebookProps) {
  // Give a default valid JSON string so App.tsx doesn't complain about invalid JSON if it checks
  useEffect(() => {
    onCellsChange(JSON.stringify([{ type: "jupyter_iframe" }]));
  }, [onCellsChange]);

  const getThemeParam = () => {
    const themeName = theme === "vs-dark" ? "JupyterLab Dark" : "JupyterLab Light";
    return `?theme=${encodeURIComponent(themeName)}`;
  };

  const getIframeSrc = () => {
    if (mode === "lite" && appliedCode) {
        // Use REPL mode for automatic code injection
        const baseUrl = "https://jupyterlite.github.io/demo/repl/index.html";
        const kernel = "python";
        const code = encodeURIComponent(appliedCode);
        const themeName = theme === "vs-dark" ? "JupyterLab Dark" : "JupyterLab Light";
        return `${baseUrl}?kernel=${kernel}&code=${code}&theme=${encodeURIComponent(themeName)}`;
    }
    
    return mode === "lite" ? `https://jupyterlite.github.io/demo/lab/index.html${getThemeParam()}` : localUrl;
  };

  return (
    <div className="notebook-container" style={{ 
        height: "100%", 
        background: "var(--code-bg)", 
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative"
    }}>
      {/* Overlay Button when in Applied Code mode */}
      {appliedCode && mode === "lite" && (
        <div style={{
            position: "absolute",
            top: "10px",
            right: "20px",
            zIndex: 100,
            display: "flex",
            gap: "8px"
        }}>
            <button 
                className="btn btn-sm btn-primary"
                onClick={onClearApplied}
                style={{ 
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.75rem",
                    padding: "6px 12px"
                }}
            >
                <ArrowLeft size={14} /> Back to Full Lab
            </button>
        </div>
      )}

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
                 <p style={{ color: "var(--text-main)", fontWeight: 600 }}>Loading Jupyter Environment...</p>
                 <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "400px", textAlign: "center" }}>
                     Preparing cell for applied code block.
                 </p>
             </div>
          )}

          <iframe
            key={`${refreshKey}-${appliedCode}`}
            src={getIframeSrc()}
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
            // @ts-ignore - credentialless is a newer attribute
            credentialless="true"
            title="Jupyter Notebook"
          />
      </div>
    </div>
  );
}
