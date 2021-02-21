import React, { memo } from "react";
import styled from "styled-components/macro";
import { VictoryBar, VictoryChart, VictoryAxis, VictoryLabel } from "victory";

import Heading from "./Heading";
import theme from "../styles/theme";
import { AugmentedSite } from "../state";
import { mobile } from "../styles";

type IdentityFunction = (x: number) => number;

const Wrapper = styled.div`
  ${mobile`
    flex: 1 1 300px;
    margin: ${(props: any) => props.theme.spacing(1.5)} 0 0 0;
  `};

  display: inline-flex;
  flex-direction: column;
  justify-content: space-between;

  flex: 1 0 300px;
  margin: ${(props) => props.theme.spacing(1.5)}
    ${(props) => props.theme.spacing(1.5)} 0 0;
  max-width: 400px;
  padding: ${(props) => props.theme.spacing(3)}
    ${(props) => props.theme.spacing(3)};

  background-color: ${(props) => props.theme.colors.white};
  border-radius: ${(props) => props.theme.spacing(2.5)};
`;

const Icon = styled.tspan`
  font-size: 16px;
  line-height: 1;
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

  const LabelWithEmoji = ({
    x,
    y,
    index,
    text,
  }: {
    x: number;
    y: number;
    index: number;
    text: string;
  }) => {
    const isHighlighted = data[index].isHighlighted;
    const isWinner = index === data.length - 1;

    const star = isHighlighted ? (
      <Icon role="img" aria-hidden="true">
        ⭐️
        <tspan x={9.5}>&nbsp;</tspan>
      </Icon>
    ) : null;
    const trophy = isWinner ? (
      <Icon role="img" aria-hidden="true">
        <tspan dx={-6}>&nbsp;</tspan>
        🏆
      </Icon>
    ) : null;

    const dy = y - 12;
    const dx = isHighlighted ? x - 9 : x + 10;

    const fill = isHighlighted
      ? theme.colors.nearBlack
      : theme.colors.darkNeutral;
    return (
      <text
        x={dx}
        y={dy}
        style={{
          ...labelStyles,
          fill: fill,
          letterSpacing: "normal",
          padding: 10,
        }}
      >
        {star}
        {text}
        {trophy}
      </text>
    );
  };

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
        style={{ parent: { height: "auto" } }}
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
          }}
          //@ts-ignore Victory passes its props
          tickLabelComponent={<LabelWithEmoji />}
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
