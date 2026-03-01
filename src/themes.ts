export interface Theme {
    id: string;
    label: string;
    bg: string;
    text: string;
    secondary: string;
    uiBg: string;
    border: string;
    highlight: string;
    buttonBg: string;
    bubbleUser: string;
    bubbleAI: string;
    inputBg: string;
    logoBg: string;
    logoText: string;
    toolColor: string[] | null;
    activeWord: string;
    primary: string;
    primaryText: string;
    statusBarStyle: "light-content" | "dark-content";
    codeBg: string;
    codeHeaderBg: string;
}

export const themes: Record<string, Theme> = {
    // 5 Perfect Reading Themes
    day: { id: 'day', label: 'Day', bg: "#ffffff", text: "#1f1f1f", secondary: "#5f6368", uiBg: "#f1f3f4", border: "#dadce0", highlight: "#e8eaed", buttonBg: "#f8f9fa", bubbleUser: "#e8eaed", bubbleAI: "#ffffff", inputBg: "#ffffff", logoBg: "#1a73e8", logoText: "#ffffff", toolColor: null, activeWord: "#000000", primary: "#1a73e8", primaryText: "#1a73e8", statusBarStyle: "light-content", codeBg: "#f8f9fa", codeHeaderBg: "#f1f3f4" },
    night: { id: 'night', label: 'Night', bg: "#131314", text: "#e3e3e3", secondary: "#c4c7c5", uiBg: "#1e1f20", border: "#333537", highlight: "#1f2937", buttonBg: "#282a2d", bubbleUser: "#282a2d", bubbleAI: "#131314", inputBg: "#1e1f20", logoBg: "#e3e3e3", logoText: "#131314", toolColor: null, activeWord: "#ffffff", primary: "#8ab4f8", primaryText: "#8ab4f8", statusBarStyle: "light-content", codeBg: "#000000", codeHeaderBg: "#1e1f20" },
    'e-reader': { id: 'e-reader', label: 'E-Reader', bg: "#fbf6e8", text: "#4a3c31", secondary: "#8c7b66", uiBg: "#f2ebd9", border: "#e8dfce", highlight: "#e8dfce", buttonBg: "#f2ebd9", bubbleUser: "#e8dfce", bubbleAI: "#fbf6e8", inputBg: "#fbf6e8", logoBg: "#4a3c31", logoText: "#fbf6e8", toolColor: null, activeWord: "#2d241d", primary: "#8c7b66", primaryText: "#4a3c31", statusBarStyle: "dark-content", codeBg: "#f2ebd9", codeHeaderBg: "#e8dfce" },
    forest: { id: 'forest', label: 'Forest', bg: "#1e3b2b", text: "#f0fef4", secondary: "#a0d1b3", uiBg: "#162e21", border: "#2d543e", highlight: "#264a36", buttonBg: "#2d543e", bubbleUser: "#264a36", bubbleAI: "#1e3b2b", inputBg: "#162e21", logoBg: "#4ade80", logoText: "#1e3b2b", toolColor: null, activeWord: "#ffffff", primary: "#4ade80", primaryText: "#4ade80", statusBarStyle: "light-content", codeBg: "#11241a", codeHeaderBg: "#162e21" },
    coffee: { id: 'coffee', label: 'Coffee', bg: "#201a16", text: "#d6c4b0", secondary: "#8a7b6b", uiBg: "#2c241f", border: "#3e322b", highlight: "#2c241f", buttonBg: "#3e322b", bubbleUser: "#3e322b", bubbleAI: "#201a16", inputBg: "#2c241f", logoBg: "#a67c52", logoText: "#201a16", toolColor: null, activeWord: "#ffffff", primary: "#a67c52", primaryText: "#a67c52", statusBarStyle: "light-content", codeBg: "#14100e", codeHeaderBg: "#2c241f" },
};
