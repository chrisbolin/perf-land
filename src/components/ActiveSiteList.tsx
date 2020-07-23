import React from "react";
import styled from "styled-components/macro";

import Button from "./Button";
import Text from "./Text";

const List = styled.ul`
  margin-top: ${(props) => props.theme.spacing(0.5)};
  margin-left: ${(props) => props.theme.spacing(1.5)};
`;

const HighlightButton = styled(Button)``;

const Icon = styled.span<{ isVisible: Boolean }>`
  visibility: ${(props) => (props.isVisible ? `visible` : `hidden`)};
  margin-left: ${(props) => props.theme.spacing(-2)};
  width: ${(props) => props.theme.spacing(2)};

  font-size: 0.9rem;
  line-height: 1;
`;

const StyledText = styled(Text)`
  margin-top: ${(props) => props.theme.spacing(0.5)};
  position: relative;

  ${HighlightButton}:focus ${Icon}, &:hover ${Icon} {
    visibility: visible;
    opacity: 0.5;
  }
`;

const RemoveButton = styled(Button)`
  height: 1rem;
  width: 1rem;
  position: absolute;
  top: 2px;

  margin-left: ${(props) => props.theme.spacing(0.5)};

  border-radius: 2rem;
  border: 1px solid ${(props) => props.theme.colors.neutral};
  background-color: ${(props) => props.theme.colors.neutral};
  color: ${(props) => props.theme.colors.nearBlack};

  &:after {
    content: "×";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    line-height: 1;
  }

  &:focus,
  &:hover {
    background-color: ${(props) => props.theme.colors.lightNeutral};
  }
`;

const ActiveSiteList = ({
  hasUrls,
  highlightedUrl,
  sites,
  onClickHighlight,
  onClickRemoveHighlight,
  onClickRemove,
}: {
  hasUrls: boolean;
  highlightedUrl: string;
  sites: Array<any>;
  onClickHighlight: (siteUrl: string) => void;
  onClickRemoveHighlight: () => void;
  onClickRemove: (siteUrl: string) => void;
}) => {
  if (hasUrls) {
    return (
      <List>
        {sites.map((site, index) => {
          const isHighlighted = site.url === highlightedUrl;
          const toggleHighlight = isHighlighted
            ? () => onClickRemoveHighlight()
            : () => onClickHighlight(site.url);
          return (
            <StyledText key={`${site.url}-${index}`} as="li" size="small">
              <HighlightButton onClick={toggleHighlight}>
                {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
                <Icon role="img" aria-hidden="true" isVisible={isHighlighted}>
                  ⭐️
                </Icon>

                {site.name}
              </HighlightButton>
              <RemoveButton
                onClick={() => onClickRemove(site.url)}
                aria-label="Remove"
              />
            </StyledText>
          );
        })}
      </List>
    );
  }
  return null;
};

export default ActiveSiteList;
