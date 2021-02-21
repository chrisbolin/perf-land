/// <reference path="../react-aria-modal.d.ts" />
import React, { FunctionComponent, useState } from "react";
import styled from "styled-components/macro";
import Modal from "react-aria-modal";

import { mobile, tablet } from "../styles";

const Wrapper = styled.div`
  flex: 0 0 ${(props) => props.theme.spacing(30)};
  padding: ${(props) => props.theme.spacing(2)}
    ${(props) => props.theme.spacing(2)} ${(props) => props.theme.spacing(2)}
    ${(props) => props.theme.spacing(4)};

  border: 1px solid blue;
`;

const HideOnMobile = styled.div`
  ${mobile`display: none;`};
  ${tablet`display: block;`};
`;

const Mobile = styled.div`
  ${mobile`display: block;`};
  ${tablet`display: none;`};
`;

const Sidebar: FunctionComponent<{
  children: any;
  className?: string;
}> = ({ children, className }) => {
  const [isOpen, setOpen] = useState(true);

  const getApplicationNode = () => document.getElementById("root") as Element;

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  return (
    <React.Fragment>
      {isOpen ? (
        <Mobile>
          <Modal
            titleText="test"
            onExit={handleClose}
            getApplicationNode={getApplicationNode}
          >
            <Wrapper className={className}>{children}</Wrapper>
          </Modal>
        </Mobile>
      ) : null}
      <HideOnMobile>
        <Wrapper className={className}>{children}</Wrapper>
      </HideOnMobile>
    </React.Fragment>
  );
};

export default Sidebar;
