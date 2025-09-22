// src/main.tsx
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { Theme } from "@radix-ui/themes";

import "animate.css";
import "@radix-ui/themes/styles.css";
import "./index.css";

import { store } from "./app/store.ts";
import { router } from "./app/routes.tsx";
import { SoundProvider } from "./hooks/useSound.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <Theme
      appearance="dark"
      accentColor="purple"
      grayColor="slate"
      radius="large"
    >
      <SoundProvider>
        <RouterProvider router={router} />
      </SoundProvider>
    </Theme>
  </Provider>,
);
