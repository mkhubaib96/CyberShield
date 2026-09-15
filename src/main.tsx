import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("CyberShield root element was not found.");

createRoot(root).render(<ErrorBoundary><App /></ErrorBoundary>);
