import { css, createGlobalStyle } from "styled-components/macro";
import theme from "./theme";

const normalize = css`
  * {
    box-sizing: inherit;
  }

  html,
  body {
    box-sizing: border-box;
    margin: 0;
  }

  button {
    padding: 0;

    border: 0;
    border-radius: 0;
    background: transparent;
    color: inherit;
    font-family: inherit;
    font-size: inherit;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p {
    margin: 1.2em 0 0 0;
  }

  ul,
  li {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }
`;

const fonts = css`
  @font-face {
    font-family: "Syne";
    src: url("/assets/syne/Syne-Extra.woff2") format("woff2"),
      url("/assets/syne/Syne-Extra.woff") format("woff");
    font-weight: 800;
    font-style: normal;
  }

  @font-face {
    font-family: "Syne";
    src: url("/assets/syne/Syne-Regular.woff2") format("woff2"),
      url("/assets/syne/Syne-Regular.woff") format("woff");
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: "Syne";
    src: url("/assets/syne/Syne-Bold.woff2") format("woff2"),
      url("/assets/syne/Syne-Bold.woff") format("woff");
    font-weight: 600;
    font-style: normal;
  }
`;

export default createGlobalStyle`
  ${normalize};
  ${fonts};

  html {
    background-color: ${theme.colors.mint};
    background-image: linear-gradient(180deg, ${theme.colors.mint} 50%, ${theme.colors.lightNeutral} 51%);
    color: ${theme.colors.nearBlack};
    font-size: 14px;

    @media screen and (min-width: ${theme.breakpoints.tablet}px) {
        font-size: 18px;
    }

    @media screen and (min-width: ${theme.breakpoints.desktop}px) {
        font-size: 20px;
    }
  }

  body {
    font-family: ${theme.fonts.body};
  }

  ::selection {
    background: ${theme.colors.yellow};
  }

  a,
  a:visited {
    color: inherit;
  }

  td,
  th {
    padding: 0.25em 2em 0.25em 0;
  }

  th {
    text-align: left;
  }

  tspan {
    font-family: ${theme.fonts.body};
    font-size: 16px;
  }
`;
