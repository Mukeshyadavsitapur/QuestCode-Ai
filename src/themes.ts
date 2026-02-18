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
    statusBarStyle: "light-content" | "dark-content";
}

export const themes: Record<string, Theme> = {
    day: { id: 'day', label: 'Day', bg: "#ffffff", text: "#1a1a1a", secondary: "#555555", uiBg: "#f8f9fa", border: "#e9ecef", highlight: "#e7f5ff", buttonBg: "#f1f3f5", bubbleUser: "#2563eb", bubbleAI: "#f8f9fa", inputBg: "#f1f3f5", logoBg: "#4f46e5", logoText: "#ffffff", toolColor: null, activeWord: "#bfdbfe", primary: "#2563eb", statusBarStyle: "light-content" },
    sepia: { id: 'sepia', label: 'E-Reader', bg: "#f8f1e3", text: "#5b4636", secondary: "#8c7b66", uiBg: "#f1eadd", border: "#e3dccf", highlight: "#e8dfce", buttonBg: "#e8dfce", bubbleUser: "#8c7b66", bubbleAI: "#f1eadd", inputBg: "#e3dccf", logoBg: "#8c7b66", logoText: "#f5e6d3", toolColor: ["#a89f91", "#8c7b66"], activeWord: "#d6cbb6", primary: "#8c7b66", statusBarStyle: "dark-content" },
    night: { id: 'night', label: 'Night', bg: "#000000", text: "#e5e5e5", secondary: "#a3a3a3", uiBg: "#121212", border: "#27272a", highlight: "#1f2937", buttonBg: "#18181b", bubbleUser: "#4b5563", bubbleAI: "#18181b", inputBg: "#18181b", logoBg: "#e5e5e5", logoText: "#000000", toolColor: ["#1f2937", "#374151"], activeWord: "#374151", primary: "#2563eb", statusBarStyle: "light-content" },
    midnight: { id: 'midnight', label: 'Midnight', bg: "#0f172a", text: "#cbd5e1", secondary: "#94a3b8", uiBg: "#1e293b", border: "#334155", highlight: "#1e293b", buttonBg: "#334155", bubbleUser: "#3b82f6", bubbleAI: "#1e293b", inputBg: "#0f172a", logoBg: "#cbd5e1", logoText: "#0f172a", toolColor: ["#1e293b", "#334155"], activeWord: "#3b82f6", primary: "#3b82f6", statusBarStyle: "light-content" },
    forest: { id: 'forest', label: 'Forest', bg: "#f0fdf4", text: "#14532d", secondary: "#166534", uiBg: "#dcfce7", border: "#bbf7d0", highlight: "#dcfce7", buttonBg: "#bbf7d0", bubbleUser: "#16a34a", bubbleAI: "#dcfce7", inputBg: "#f0fdf4", logoBg: "#166534", logoText: "#f0fdf4", toolColor: null, activeWord: "#86efac", primary: "#16a34a", statusBarStyle: "dark-content" },
    yellow: { id: 'yellow', label: 'Sunny', bg: "#fefce8", text: "#422006", secondary: "#a16207", uiBg: "#fef9c3", border: "#fde047", highlight: "#fef08a", buttonBg: "#fde047", bubbleUser: "#ca8a04", bubbleAI: "#fef9c3", inputBg: "#fefce8", logoBg: "#ca8a04", logoText: "#ffffff", toolColor: null, activeWord: "#fde047", primary: "#ca8a04", statusBarStyle: "dark-content" },
    coffee: { id: 'coffee', label: 'Coffee', bg: "#201a16", text: "#d6c4b0", secondary: "#8a7b6b", uiBg: "#2c241f", border: "#3e322b", highlight: "#2c241f", buttonBg: "#3e322b", bubbleUser: "#a67c52", bubbleAI: "#2c241f", inputBg: "#2c241f", logoBg: "#a67c52", logoText: "#201a16", toolColor: ["#2c241f", "#3e322b"], activeWord: "#43302b", primary: "#a67c52", statusBarStyle: "light-content" },
    nord: { id: 'nord', label: 'Nord', bg: "#2e3440", text: "#d8dee9", secondary: "#81a1c1", uiBg: "#3b4252", border: "#4c566a", highlight: "#3b4252", buttonBg: "#434c5e", bubbleUser: "#88c0d0", bubbleAI: "#3b4252", inputBg: "#3b4252", logoBg: "#88c0d0", logoText: "#2e3440", toolColor: ["#3b4252", "#434c5e"], activeWord: "#434c5e", primary: "#88c0d0", statusBarStyle: "light-content" },
    ocean: { id: 'ocean', label: 'Ocean', bg: "#f0f9ff", text: "#0c4a6e", secondary: "#0284c7", uiBg: "#e0f2fe", border: "#bae6fd", highlight: "#e0f2fe", buttonBg: "#bae6fd", bubbleUser: "#0ea5e9", bubbleAI: "#e0f2fe", inputBg: "#f0f9ff", logoBg: "#0284c7", logoText: "#f0f9ff", toolColor: null, activeWord: "#7dd3fc", primary: "#0284c7", statusBarStyle: "dark-content" },
    slate: { id: 'slate', label: 'Slate', bg: "#f8fafc", text: "#334155", secondary: "#64748b", uiBg: "#e2e8f0", border: "#cbd5e1", highlight: "#e2e8f0", buttonBg: "#cbd5e1", bubbleUser: "#475569", bubbleAI: "#e2e8f0", inputBg: "#f8fafc", logoBg: "#475569", logoText: "#f8fafc", toolColor: null, activeWord: "#94a3b8", primary: "#475569", statusBarStyle: "dark-content" },
};
