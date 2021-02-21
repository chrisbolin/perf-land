import React from "react";
import styled from "styled-components/macro";

import Button from "./Button";

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  margin-top: ${(props) => props.theme.spacing(1)};
  padding-top: ${(props) => props.theme.spacing(1)};
  border-top: 1px solid ${(props) => props.theme.colors.neutral};
`;

const SavedCollectionButtons = ({
  onSave,
  onDelete,
}: {
  onSave: () => void;
  onDelete: () => void;
}) => {
  return (
    <Wrapper>
      <Button white onClick={onSave}>
        save
      </Button>
      <br />
      <Button white onClick={onDelete}>
        delete
      </Button>
    </Wrapper>
  );
};

export default SavedCollectionButtons;
