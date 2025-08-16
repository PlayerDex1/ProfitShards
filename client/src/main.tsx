import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { I18nProvider } from "./i18n";
import { SpeedInsights } from "@vercel/speed-insights/react";

createRoot(document.getElementById("root")!).render(
  <I18nProvider>
    <App />
    <SpeedInsights />
  </I18nProvider>
);
