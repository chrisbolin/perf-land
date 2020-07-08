import styled, { css } from "styled-components/macro";
interface HeadingProps {
  size?: "small" | "medium" | "large" | "xlarge";
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

const Heading = styled.span<HeadingProps>`
  font-family: ${(props) => props.theme.fonts.heading};
  line-height: 1;

  ${(props) => getSizeStyles(props.size)};
`;

export default Heading;
