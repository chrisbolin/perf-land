import React from "react";
import styled, { css } from "styled-components/macro";
import { Theme } from "../styles/theme";

interface TextProps {
  as?: any;
  children: any;
  id?: string;
  size?: "small" | "medium" | "large";
  theme?: Theme;
}

const getSizeStyles = (size?: "small" | "medium" | "large") => {
  switch (size) {
    case "small":
      return css`
        font-size: 1rem;
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

const StyledText = styled.p<{ size?: "small" | "medium" | "large" }>`
  ${(props) => getSizeStyles(props.size)};

  font-family: ${(props) => props.theme.fonts.body};
  line-height: 1.5;
`;

const Text: React.FunctionComponent<TextProps> = ({
  children,
  ...props
}: {
  children: any;
}) => {
  return <StyledText {...props}>{children}</StyledText>;
};

export default Text;
