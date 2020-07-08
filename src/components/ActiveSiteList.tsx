import React from "react";
import styled from "styled-components/macro";

import Button from "./Button";
import Text from "./Text";

const List = styled.ul`
  margin-top: ${(props) => props.theme.spacing(0.5)};
  margin-left: ${(props) => props.theme.spacing(1.5)};
`;

const StyledButton = styled(Button)``;

const Icon = styled.span<{ isVisible: Boolean }>`
  visibility: ${(props) => (props.isVisible ? `visible` : `hidden`)};
  margin-left: ${(props) => props.theme.spacing(-2)};
  width: ${(props) => props.theme.spacing(2)};

  font-size: 0.9rem;
  line-height: 1;
`;

const StyledText = styled(Text)`
  margin-top: ${(props) => props.theme.spacing(0.5)};

  ${StyledButton}:focus ${Icon}, &:hover ${Icon} {
    visibility: visible;
    opacity: 0.5;
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
              <StyledButton onClick={toggleHighlight}>
                {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
                <Icon role="img" aria-hidden="true" isVisible={isHighlighted}>
                  🔍
                </Icon>

                {site.name}
              </StyledButton>
              <Button
                onClick={() => onClickRemove(site.url)}
                aria-label="Remove"
              >
                <span aria-hidden="true">×</span>
              </Button>
            </StyledText>
          );
        })}
      </List>
    );
  }
  return null;
};

export default ActiveSiteList;
