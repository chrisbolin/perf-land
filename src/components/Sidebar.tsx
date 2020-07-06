import React from "react";
import styled from "styled-components/macro";

const Wrapper = styled.div`
  flex: 0 0 ${(props) => props.theme.spacing(30)};
  padding: ${(props) => props.theme.spacing(2)}
    ${(props) => props.theme.spacing(2)} ${(props) => props.theme.spacing(2)}
    ${(props) => props.theme.spacing(4)};
`;

const Sidebar = ({ children }: { children: any }) => {
  return <Wrapper>{children}</Wrapper>;
};

export default Sidebar;
