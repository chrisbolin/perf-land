import styled, { css } from "styled-components/macro";
import { ThemeColors } from "../styles/theme";

interface TextProps {
  color?: keyof ThemeColors;
  size?: "small" | "medium" | "large";
}

const getSizeStyles = (size?: "small" | "medium" | "large") => {
  switch (size) {
    case "small":
      return css`
        font-size: 0.9rem;
        font-weight: 400;
      `;
    case "large":
      return css`
        font-size: 1.5rem;
        font-weight: 400;
      `;
    default:
    case "medium":
      return css`
        font-size: 1rem;
        font-weight: 400;
      `;
  }
};

const Text = styled.p.withConfig({
  // do not pass 'color' to DOM
  shouldForwardProp: (prop) => !["color"].includes(prop),
})<TextProps>`
  ${(props) => getSizeStyles(props.size)};

  ${(props) => {
    if (props.color) {
      if (props.theme.colors[props.color]) {
        return `color: ${props.theme.colors[props.color]};`;
      }
      return `color: ${props.color};`;
    }
  }}

  font-family: ${(props) => props.theme.fonts.body};
  line-height: 1.5;
`;

export default Text;
