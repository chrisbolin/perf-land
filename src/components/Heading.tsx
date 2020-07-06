import React from "react";
import styled, { css } from "styled-components/macro";
import { Theme } from "../styles/theme";

interface HeadingProps {
  as?: any;
  children: any;
  id?: string;
  size?: "small" | "medium" | "large" | "xlarge";
  theme?: Theme;
}

const getSizeStyles = (size?: "small" | "medium" | "large" | "xlarge") => {
  switch (size) {
    case "xlarge":
      // h1
      return css`
        font-size: 3.5rem;
        font-weight: 800;
        text-transform: uppercase;
      `;
    case "large":
      // h2
      return css`
        font-size: 1.5rem;
        font-weight: 600;
        letter-spacing: 0.187em;
        text-transform: uppercase;
      `;
    case "small":
      return css`
        font-size: 1rem;
        font-weight: 600;
        line-height: 1.5;
      `;
    default:
    case "medium":
      // h3
      return css`
        font-size: 1.25rem;
        font-weight: 600;
        letter-spacing: 0.25em;
        text-transform: uppercase;
      `;
  }
};

const StyledHeading = styled.span<{
  size?: "small" | "medium" | "large" | "xlarge";
}>`
  font-family: ${(props) => props.theme.fonts.heading};
  line-height: 1;

  ${(props) => getSizeStyles(props.size)};
`;

const Heading: React.FunctionComponent<HeadingProps> = ({
  children,
  ...props
}) => {
  return <StyledHeading {...props}>{children}</StyledHeading>;
};

export default Heading;
