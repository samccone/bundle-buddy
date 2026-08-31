import React, { act } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

it("renders without crashing", async () => {
  const div = document.createElement("div");
  const root = createRoot(div);

  // App code-splits its routes, so let the lazy chunks settle inside act().
  await act(async () => {
    root.render(<App />);
  });

  await act(async () => {
    root.unmount();
  });
});
