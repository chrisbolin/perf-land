/* mixins for styled-components usage */
import { css } from "styled-components/macro";

/* usage: ${mobile`border: 1px solid black;`} */
export function mobile(args: TemplateStringsArray) {
  return css`
    @media screen and (max-width: ${(props) =>
        props.theme.breakpoints.tablet - 1}px) {
      ${css(args)};
    }
  `;
}

/* usage: ${tablet`border: 1px solid black;`} */
export function tablet(args: TemplateStringsArray) {
  return css`
    @media screen and (min-width: ${(props) =>
        props.theme.breakpoints.tablet}px) {
      ${css(args)};
    }
  `;
}

/* usage: ${desktop`border: 1px solid black;`} */
export function desktop(args: TemplateStringsArray) {
  return css`
    @media screen and (min-width: ${(props) =>
        props.theme.breakpoints.desktop}px) {
      ${css(args)};
    }
  `;
}
