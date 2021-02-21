import React from "react";
import ReactDOM from "react-dom";
import { ThemeProvider } from "styled-components/macro";

import App from "./App";
import GlobalStyle from "./styles/global";
import theme from "./styles/theme";

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <App />
  </ThemeProvider>,
  document.getElementById("root")
);
