import { DefaultTheme } from "styled-components/macro";

const breakpoints = {
  mobile: 375,
  tablet: 768,
  desktop: 1280,
};

const colors = {
  // Neutrals
  nearBlack: "#000f08",
  darkNeutral: "#6a6358",
  neutral: "#dad2c5",
  lightNeutral: "#F2ECE1",
  lighterNeutral: "#F7F4ED",
  white: "#ffffff",

  // Accent
  mint: "#b4f2e0",
  // Selection Background
  yellow: "#f9f98a",
};

const fonts = {
  body: `'IBM Plex Mono', Inconsolata, monospace`,
  heading: `"Syne", sans-serif`,
};

const theme: DefaultTheme = {
  breakpoints,
  colors,
  fonts,
  spacing: (multipler) => `${multipler * 0.5}rem`,
};

export type Theme = typeof theme;
export type ThemeColors = typeof colors;
export default theme;