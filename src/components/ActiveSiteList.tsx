import React from "react";
import styled from "styled-components/macro";

import Button from "./Button";
import Text from "./Text";

const List = styled.ul`
  margin-left: ${(props) => props.theme.spacing(1.5)};
`;

const Icon = styled.span`
  margin-left: ${(props) => props.theme.spacing(-2)};

  font-size: 0.9rem;
  line-height: 1;
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
            <Text key={`${site.url}-${index}`} as="li" size="small">
              <Button onClick={toggleHighlight}>
                {isHighlighted ? (
                  // eslint-disable-next-line jsx-a11y/accessible-emoji
                  <Icon role="img" aria-label="Highlight">
                    🔍
                  </Icon>
                ) : null}
                {site.name}
              </Button>
              <Button
                onClick={() => onClickRemove(site.url)}
                aria-label="Remove"
              >
                <span aria-hidden="true">×</span>
              </Button>
            </Text>
          );
        })}
      </List>
    );
  }
  return null;
};

export default ActiveSiteList;
