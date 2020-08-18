import React, { FunctionComponent, useState } from "react";
import styled from "styled-components/macro";
import Modal from "react-aria-modal";

const Wrapper = styled.div`
  flex: 0 0 ${(props) => props.theme.spacing(30)};
  padding: ${(props) => props.theme.spacing(2)}
    ${(props) => props.theme.spacing(2)} ${(props) => props.theme.spacing(2)}
    ${(props) => props.theme.spacing(4)};

  /* transform: translateX(0%); */
  border: 1px solid blue;
`;

const MobileWrapper = styled.div``;

const Sidebar: FunctionComponent<{
  children: any;
  className?: string;
}> = ({ children, className }) => {
  const [isOpen, setOpen] = useState(true);

  const getApplicationNode = () => document.getElementById("root") as Element;

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  return (
    <Modal onExit={handleClose} getApplicationNode={getApplicationNode}>
      <Wrapper className={className}>{children}</Wrapper>
    </Modal>
  );
};

export default Sidebar;
