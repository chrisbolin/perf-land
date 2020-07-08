import React from "react";
import styled, { css } from "styled-components/macro";

type EventCallbackFunction = (event: React.SyntheticEvent) => void;

interface ButtonProps {
  children?: any;
  onClick?: EventCallbackFunction;
  white?: Boolean;
}

const whiteStyles = css`
  padding: ${(props) => props.theme.spacing(0.25)}
    ${(props) => props.theme.spacing(1.5)};
  background-color: ${(props) => props.theme.colors.white};
  color: ${(props) => props.theme.colors.nearBlack};
  border-radius: 2rem;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;

  &:focus,
  &:hover {
    box-shadow: 0 0 0 1px ${(props) => props.theme.colors.nearBlack};
  }

  &:active {
    background-color: ${(props) => props.theme.colors.lightNeutral};
  }
`;

const Wrapper = styled.button<ButtonProps>`
  &:hover {
    cursor: pointer;
  }

  &:focus {
    outline: 2px dotted ${(props) => props.theme.colors.nearBlack};
  }

  &:active {
    color: ${(props) => props.theme.colors.darkNeutral};
  }

  ${(props) => props.white && whiteStyles};
`;

const Button: React.FunctionComponent<ButtonProps> = ({
  children,
  ...props
}) => {
  if (children) {
    return (
      <Wrapper type="button" {...props}>
        {children}
      </Wrapper>
    );
  }
  return <Wrapper type="button" {...props} />;
};

export default Button;
