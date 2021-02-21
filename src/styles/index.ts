/* mixins for styled-components usage */
import { css } from "styled-components/macro";

/* usage: ${mobile`border: 1px solid black;`} */
export function mobile(literals: TemplateStringsArray, ...placeholders: any[]) {
  return css`
    @media screen and (max-width: ${(props) =>
        props.theme.breakpoints.tablet - 1}px) {
      ${css(literals, ...placeholders)};
    }
  `;
}

/* usage: ${tablet`border: 1px solid black;`} */
export function tablet(literals: TemplateStringsArray, ...placeholders: any[]) {
  return css`
    @media screen and (min-width: ${(props) =>
        props.theme.breakpoints.tablet}px) {
      ${css(literals, ...placeholders)};
    }
  `;
}

/* usage: ${desktop`border: 1px solid black;`} */
export function desktop(
  literals: TemplateStringsArray,
  ...placeholders: any[]
) {
  return css`
    @media screen and (min-width: ${(props) =>
        props.theme.breakpoints.desktop}px) {
      ${css(literals, ...placeholders)};
    }
  `;
}
