import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

if (!container.__reactRoot) {
  container.__reactRoot = createRoot(container);
}

container.__reactRoot.render(<App />);
