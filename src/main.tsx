import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Helmet } from "react-helmet";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./main.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { RootComponent } from "./kit";
import { platform } from "@tauri-apps/plugin-os";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <Helmet>
        <style>{`
        html,
        body,
        #root {
          padding: 0;
          border: 0;
          margin: 0;
          contain: content;
          overflow: hidden;
          border-radius: ${platform() == "macos" ? 10 : 8}px;
        }

        ${
          platform() !== "macos"
            ? `
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.4);
          border-radius: 4px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.6);
        }
        `
            : ""
        }
      `}</style>
      </Helmet>
      <RouterProvider router={router} />
      <RootComponent />
    </StrictMode>,
  );
}
