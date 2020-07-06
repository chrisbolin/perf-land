import { DefaultTheme } from "styled-components/macro";

const breakpoints = {
  mobile: 375,
  tablet: 768,
  desktop: 1280,
};

const colors = {
  nearBlack: "#000f08",
  mint: "#b4f2e0",
  yellow: "#f9f98a",
};

const fonts = {
  body: `'IBM Plex Mono', monospace`,
  heading: `"Syne", sans-serif`,
};

const theme: DefaultTheme = {
  breakpoints,
  colors,
  fonts,
  spacing: (multipler) => `${multipler * 0.5}rem`,
};

export type Theme = typeof theme;
export default theme;
