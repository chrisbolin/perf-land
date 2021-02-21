import React from "react";
import styled from "styled-components/macro";
import Button from "./Button";
import Text from "./Text";

const Wrapper = styled.div``;

const List = styled.ul``;

const ListItem = styled.li<{ isActive: boolean }>`
  margin-top: ${(props) => props.theme.spacing(0.5)};
  margin-left: ${(props) => props.theme.spacing(-2)};
  padding-left: ${(props) => props.theme.spacing(1.5)};

  border-left: ${(props) => props.theme.spacing(0.5)} solid
    ${(props) =>
      props.isActive ? props.theme.colors.nearBlack : "transparent"};
`;

const Collections = ({
  activeCollection,
  activeSites,
  collections,
  onClick,
}: {
  activeCollection: string;
  activeSites?: any;
  collections: any;
  onClick: (name: string) => void;
}) => {
  const hasCollection = !!Object.keys(collections).length;

  if (hasCollection) {
    return (
      <Wrapper>
        <List>
          {Object.keys(collections).map((name, index) => {
            // TODO: if a saved collection has the same name as a preset collection, both will be highlighted
            const isActive = name === activeCollection;
            return (
              <ListItem isActive={isActive} key={`${name}-${index}`}>
                <Button key={name} onClick={() => onClick(name)}>
                  {name}
                </Button>
                {isActive ? activeSites : null}
              </ListItem>
            );
          })}
        </List>
      </Wrapper>
    );
  }
  return (
    <Wrapper>
      <Text as="span" color="darkNeutral">
        When you save the current list of sites, they will appear here!
      </Text>
    </Wrapper>
  );
};

export default Collections;
