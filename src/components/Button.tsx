import React from "react";
import styled from "styled-components/macro";

type EventCallbackFunction = (event: React.SyntheticEvent) => void;

interface ButtonProps {
  children: any;
  onClick?: EventCallbackFunction;
}

const Wrapper = styled.button`
  &:focus {
    outline: 2px dotted ${(props) => props.theme.colors.nearBlack};
  }
`;

const Button: React.FunctionComponent<ButtonProps> = ({
  children,
  ...props
}: {
  children: any;
}) => {
  return (
    <Wrapper type="button" {...props}>
      {children}
    </Wrapper>
  );
};

export default Button;
