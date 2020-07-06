import React from "react";
import styled, { css } from "styled-components/macro";
import { Theme } from "../styles/theme";

interface HeadingProps {
  as?: any;
  children: any;
  id?: string;
  size?: "medium" | "large" | "xlarge";
  theme?: Theme;
}

const getSizeStyles = (size?: "medium" | "large" | "xlarge") => {
  switch (size) {
    case "xlarge":
      // h1
      return css`
        margin: 0;

        font-size: 3.5rem;
        font-weight: 800;
        text-transform: uppercase;
      `;
    case "large":
      // h2
      return css`
        margin: 4rem 0 0;

        font-size: 1.5rem;
        font-weight: 600;
        letter-spacing: 0.187em;
        text-transform: uppercase;
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

const StyledHeading = styled.span<{ size?: "medium" | "large" | "xlarge" }>`
  ${(props) => getSizeStyles(props.size)};

  font-family: ${(props) => props.theme.fonts.heading};
  line-height: 1;
`;

const Heading: React.FunctionComponent<HeadingProps> = ({
  children,
  ...props
}: {
  children: any;
}) => {
  return <StyledHeading {...props}>{children}</StyledHeading>;
};

export default Heading;
