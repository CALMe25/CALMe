import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { LanguageProvider } from "./contexts/LanguageContext.tsx";
import { UserPreferencesProvider } from "./contexts/UserPreferencesContext.tsx";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <UserPreferencesProvider>
          <App />
        </UserPreferencesProvider>
      </ThemeProvider>
    </LanguageProvider>
  </StrictMode>,
);
