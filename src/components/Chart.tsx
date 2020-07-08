import React, { memo } from "react";
import styled from "styled-components/macro";
import {
  VictoryBar,
  VictoryBrushContainer,
  VictoryChart,
  VictoryAxis,
  VictoryLabel,
} from "victory";

import Heading from "./Heading";
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

  const brushDomainStart = data.findIndex((site) => site.isHighlighted);

  return (
    <Wrapper>
      <Heading as="span" size="small">
        {name}
      </Heading>
      <VictoryChart
        width={360}
        height={data.length * 60}
        domainPadding={20}
        padding={{ top: 20, right: 20, bottom: 50, left: 1 }}
        containerComponent={
          <VictoryBrushContainer
            allowDrag={false}
            allowResize={false}
            brushDimension="x"
            brushDomain={{
              x:
                brushDomainStart >= 0
                  ? [brushDomainStart + 0.6, brushDomainStart + 1.75]
                  : [0, 0],
            }}
            brushStyle={{
              fill: "#feeb5c",
              fillOpacity: 0.1,
            }}
          />
        }
      >
        <VictoryBar
          horizontal
          data={data}
          barWidth={10}
          style={{
            data: {
              fill: ({ datum }) => datum.color,
            },
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: "#000", strokeWidth: 1 },
            grid: { stroke: "#fff" },
          }}
        />
        <VictoryAxis
          style={{
            axis: { stroke: "#ff0000", strokeWidth: 0 },
          }}
          tickFormat={(t, index) => {
            const isHighlighted = data[index].isHighlighted;
            return isHighlighted ? `${t} 🔍` : `${t}`;
          }}
          tickLabelComponent={
            <VictoryLabel textAnchor="start" dy={-15} dx={14} />
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
