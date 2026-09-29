import { ClerkProvider } from "@clerk/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { installDomRemoveChildGuard } from "./utils/domSafety.ts";
import "./index.css";

installDomRemoveChildGuard();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider afterSignOutUrl="/">
      <ErrorBoundary>
        <BrowserRouter
          future={{
            v7_startTransition: true,
          }}
        >
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </ClerkProvider>
  </StrictMode>
);
