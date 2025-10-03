// apps/web/src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import "./styles.css";
import "./lib/i18n";

const el = document.getElementById("root");
if (!el) throw new Error("root not found");
createRoot(el).render(<App />);
