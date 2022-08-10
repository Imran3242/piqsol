import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "./polyfill";
import reportWebVitals from "./reportWebVitals";
import store from "./store/store";
import { Provider } from "react-redux";
import { App } from "./app";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useLocation } from "react-router";
import { MoralisProvider } from "react-moralis";
import "./polyfill";
const theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: "Visby CF Medium",
      textTransform: "none",
    },
    body1: {
      fontFamily: "Visby CF Medium",
    },
  },
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <React.StrictMode>
        <MoralisProvider
          serverUrl={process.env.REACT_APP_MORALIS_SERVER_URL}
          appId={process.env.REACT_APP_MORALIS_APP_ID}
        >
          <App />
        </MoralisProvider>
      </React.StrictMode>
    </Provider>
  </ThemeProvider>,
  document.getElementById("root")
);
reportWebVitals();
