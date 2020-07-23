import React, { memo } from "react";
import styled from "styled-components/macro";
import { VictoryBar, VictoryChart, VictoryAxis, VictoryLabel } from "victory";

import Heading from "./Heading";
import theme from "../styles/theme";
import { AugmentedSite } from "../state";

type IdentityFunction = (x: number) => number;

const Wrapper = styled.div`
  flex: 1 0 300px;
  margin: ${(props) => props.theme.spacing(1.5)}
    ${(props) => props.theme.spacing(1.5)} 0 0;
  max-width: 400px;
  padding: ${(props) => props.theme.spacing(3)}
    ${(props) => props.theme.spacing(3)};

  background-color: ${(props) => props.theme.colors.white};
  border-radius: ${(props) => props.theme.spacing(2.5)};
`;

function ChartNoMemo({
  sites,
  field,
  name,
  highlightedUrl,
  reverse = false,
  yTransform = (x) => x,
}: {
  sites: AugmentedSite[];
  field:
    | "TTFB"
    | "firstContentfulPaint"
    | "firstMeaningfulPaint"
    | "firstCPUIdle"
    | "timeToInteractive"
    | "maxPotentialFirstInputDelay"
    | "speedIndex"
    | "performanceScore"
    | "bytesJS"
    | "bytesImg"
    | "bytesTotal"
    | "reqTotal";

  name: string;
  highlightedUrl: string;
  reverse?: boolean;
  yTransform?: IdentityFunction;
}) {
  if (!sites.length) return null;

  const data = sites
    .map((site) => ({
      ...site,
      isHighlighted: site.url === highlightedUrl,
      x: site.name,
      y: yTransform(site[field]) || 0,
    }))
    // standard sort: ascending; reverse: descending
    .sort((a, b) => (a.y - b.y) * (reverse ? 1 : -1));

  const labelStyles = {
    fill: theme.colors.darkNeutral,
    fontFamily: "inherit",
    fontSize: 16,
  };

  const DOMAIN_PADDING = 20;
  const AXIS_HEIGHT = 20;
  const BAR_HEIGHT = 4;
  const LABELLED_BAR_HEIGHT = BAR_HEIGHT + 40;
  const CHART_HEIGHT =
    DOMAIN_PADDING * 2 + AXIS_HEIGHT + data.length * LABELLED_BAR_HEIGHT;

  return (
    <Wrapper>
      <Heading as="span" size="small">
        {name}
      </Heading>
      <VictoryChart
        width={360}
        height={CHART_HEIGHT}
        domainPadding={{ x: DOMAIN_PADDING }}
        padding={{ top: 20, right: 20, bottom: 30, left: 20 }}
      >
        <VictoryBar
          horizontal
          data={data}
          barWidth={BAR_HEIGHT}
          style={{
            data: {
              fill: ({ datum }) => datum.color,
            },
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: theme.colors.darkNeutral, strokeWidth: 1 },
            grid: { stroke: "#fff" },
            tickLabels: labelStyles,
          }}
          tickFormat={(t) => {
            if (t > 999) {
              return `${t / 1000}k`;
            }
            return t;
          }}
        />
        <VictoryAxis
          style={{
            axis: { stroke: "#fff", strokeWidth: 0 },
            tickLabels: {
              ...labelStyles,
              fill: (t) => {
                const isHighlighted = data[t.index].isHighlighted;
                return isHighlighted
                  ? theme.colors.nearBlack
                  : theme.colors.darkNeutral;
              },
            },
          }}
          tickFormat={(t, index) => {
            const isHighlighted = data[index].isHighlighted;
            const isWinner = index === data.length - 1;
            const withTrophy = isWinner ? `${t} 🏆` : `${t}`;
            return isHighlighted ? `⭐️ ${withTrophy}` : `${withTrophy}`;
          }}
          tickLabelComponent={
            <VictoryLabel
              textAnchor="start"
              dy={-16}
              dx={(t) => {
                // @ts-ignore
                const isHighlighted = data[t.index].isHighlighted;
                return isHighlighted ? -9 : 10;
              }}
            />
          }
        />
      </VictoryChart>
    </Wrapper>
  );
}

const Chart = memo(
  ChartNoMemo,
  (prevProps, nextProps) =>
    prevProps.highlightedUrl === nextProps.highlightedUrl &&
    prevProps.sites.length === nextProps.sites.length
);

export default Chart;
