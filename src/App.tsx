import React, { useReducer, memo } from "react";
import {
  VictoryBar,
  VictoryBrushContainer,
  VictoryChart,
  VictoryAxis,
  VictoryLabel,
} from "victory";
import styled from "styled-components/macro";

import {
  AugmentedSite,
  PresetName,
  reducer,
  initializeState,
  selectors,
  actions,
  presets,
  effects,
  MIN_SEARCH_STRING_LENGTH,
} from "./state";

import ActiveSiteList from "./components/ActiveSiteList";
import Button from "./components/Button";
import Collections from "./components/Collections";
import Heading from "./components/Heading";
import Hero from "./components/Hero";
import Sidebar from "./components/Sidebar";
import StyledSelect from "./components/StyledSelect";

import "./App.css";

declare global {
  interface Window {
    state: any;
  }
}

type EventCallbackFunction = (event: React.SyntheticEvent) => void;
type IdentityFunction = (x: number) => number;

function LoadingSites() {
  return <span>loading...</span>;
}

function SiteDetail({ site }: { site: AugmentedSite }) {
  return (
    <tr>
      <td>
        <a href={site.url}>{site.name}</a>
      </td>
      <td>{site.cdn || "none detected"}</td>
      <td>
        {new Date(site.startedDateTime * 1000).toLocaleString(undefined, {
          timeZoneName: "short",
        })}
      </td>
    </tr>
  );
}
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
    <div className="Chart">
      <span className="Chart-title">{name}</span>
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
            return isHighlighted ? `${t} ⭐️` : `${t}`;
          }}
          tickLabelComponent={
            <VictoryLabel textAnchor="start" dy={-15} dx={14} />
          }
        />
      </VictoryChart>
    </div>
  );
}

const Chart = memo(
  ChartNoMemo,
  (prevProps, nextProps) =>
    prevProps.highlightedUrl === nextProps.highlightedUrl &&
    prevProps.sites.length === nextProps.sites.length
);

const Wrapper = styled.div`
  padding: ${(props) => props.theme.spacing(10)}
    ${(props) => props.theme.spacing(6)} 0;
`;

const Layout = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  margin-top: ${(props) => props.theme.spacing(16)};
  padding-top: ${(props) => props.theme.spacing(4)};

  background-color: ${(props) => props.theme.colors.lightTan};
`;

const Content = styled.div``;

function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initializeState);

  window.state = state;

  const { highlightedUrl, savedCollections, urls } = state;
  const currentSites = selectors.currentSites(state);
  const viewingSavedCollection = selectors.viewingSavedCollection(state);
  const searching = selectors.searching(state);
  const loadingSites = selectors.loadingSites(state);

  // effects

  effects.useSelectedSites(state, dispatch);
  effects.usePersistState(state);

  // event handlers
  const promptAndSaveCollection = () => {
    const name = viewingSavedCollection
      ? state.currentCollection.name
      : prompt("Save as");

    if (name) {
      dispatch(actions.saveCollection(name));
    }
  };

  const hasUrls = !!urls.length;

  return (
    <React.Fragment>
      <Wrapper>
        <Hero />
      </Wrapper>

      <Layout>
        <Sidebar>
          <Heading as="h3" size="small">
            My Stuff
          </Heading>
          <Collections
            activeCollection={state.currentCollection.name}
            collections={savedCollections}
            onClick={(name: string) => dispatch(actions.selectCollection(name))}
            activeSites={
              <React.Fragment>
                <ActiveSiteList
                  hasUrls={hasUrls}
                  highlightedUrl={highlightedUrl}
                  sites={currentSites}
                  onClickHighlight={(siteUrl: string) =>
                    dispatch(actions.changeHighlightSite(siteUrl))
                  }
                  onClickRemoveHighlight={() =>
                    dispatch(actions.removeHighlightSite())
                  }
                  onClickRemove={(siteUrl: string) =>
                    dispatch(actions.removeUrl(siteUrl))
                  }
                />
                <StyledSelect
                  options={state.urls.map(({ url }) => ({
                    value: url,
                    label: url,
                  }))}
                  onChange={(option) => {
                    if (!option || "length" in option) return;
                    dispatch(actions.addUrl(option.value));
                  }}
                  onInputChange={(input: string) => {
                    effects.searchForUrls(state, dispatch, input);
                  }}
                  inputValue={state.search}
                  placeholder="Add website..."
                  value={null}
                  isLoading={searching}
                  loadingMessage={({ inputValue }) =>
                    `searching for "${inputValue}"...`
                  }
                  noOptionsMessage={({ inputValue }) =>
                    inputValue.length < MIN_SEARCH_STRING_LENGTH
                      ? "please be more specific"
                      : `no results for "${inputValue}"`
                  }
                />
              </React.Fragment>
            }
          />
          {viewingSavedCollection ? (
            <Button onClick={() => promptAndSaveCollection()}>
              update "{state.currentCollection.name}"
            </Button>
          ) : null}
          {viewingSavedCollection && (
            <Button
              onClick={() =>
                dispatch(actions.deleteCollection(state.currentCollection.name))
              }
            >
              delete
            </Button>
          )}
          <Heading as="h3" size="small">
            Examples
          </Heading>
          <Collections
            activeCollection={state.currentCollection.name}
            collections={presets}
            onClick={(presetKey: string) =>
              dispatch(actions.selectPresetUrls(presetKey as PresetName))
            }
            activeSites={
              <React.Fragment>
                <ActiveSiteList
                  hasUrls={hasUrls}
                  highlightedUrl={highlightedUrl}
                  sites={currentSites}
                  onClickHighlight={(siteUrl: string) =>
                    dispatch(actions.changeHighlightSite(siteUrl))
                  }
                  onClickRemoveHighlight={() =>
                    dispatch(actions.removeHighlightSite())
                  }
                  onClickRemove={(siteUrl: string) =>
                    dispatch(actions.removeUrl(siteUrl))
                  }
                />
                <StyledSelect
                  options={state.urls.map(({ url }) => ({
                    value: url,
                    label: url,
                  }))}
                  onChange={(option) => {
                    if (!option || "length" in option) return;
                    dispatch(actions.addUrl(option.value));
                  }}
                  onInputChange={(input: string) => {
                    effects.searchForUrls(state, dispatch, input);
                  }}
                  inputValue={state.search}
                  placeholder="Add website..."
                  value={null}
                  isLoading={searching}
                  loadingMessage={({ inputValue }) =>
                    `searching for "${inputValue}"...`
                  }
                  noOptionsMessage={({ inputValue }) =>
                    inputValue.length < MIN_SEARCH_STRING_LENGTH
                      ? "please be more specific"
                      : `no results for "${inputValue}"`
                  }
                />
              </React.Fragment>
            }
          />
        </Sidebar>

        <Content>
          <Heading as="h2" size="large">
            {state.currentCollection.name} {/* TODO: If modified, add '*' */}
          </Heading>
          {hasUrls ? (
            <div className="Collections-Cell Collections-Cell--right">
              {loadingSites && <LoadingSites />}
              <Button onClick={() => dispatch(actions.clearAllSelectedUrls())}>
                Clear All
              </Button>
              {viewingSavedCollection ? null : (
                <Button onClick={() => promptAndSaveCollection()}>
                  Save to My Stuff
                </Button>
              )}
            </div>
          ) : null}
          <div className="columns">
            <Chart
              sites={currentSites}
              name="Time to first byte (ms)"
              field="TTFB"
              highlightedUrl={highlightedUrl}
            />
            <Chart
              sites={currentSites}
              name="First contentful paint (ms)"
              field="firstContentfulPaint"
              highlightedUrl={highlightedUrl}
            />
            <Chart
              sites={currentSites}
              name="First meaningful paint (ms)"
              field="firstMeaningfulPaint"
              highlightedUrl={highlightedUrl}
            />
            <Chart
              sites={currentSites}
              name="First cpu idle (ms)"
              field="firstCPUIdle"
              highlightedUrl={highlightedUrl}
            />
            <Chart
              sites={currentSites}
              name="Time to interactive (ms)"
              field="timeToInteractive"
              highlightedUrl={highlightedUrl}
            />
            <Chart
              sites={currentSites}
              name="Max potential first input delay (ms)"
              field="maxPotentialFirstInputDelay"
              highlightedUrl={highlightedUrl}
            />
            <Chart
              sites={currentSites}
              name="Speed index"
              field="speedIndex"
              highlightedUrl={highlightedUrl}
            />
            <Chart
              sites={currentSites}
              name="Lighthouse performance score"
              field="performanceScore"
              highlightedUrl={highlightedUrl}
              reverse
            />
            <Chart
              sites={currentSites}
              name="JavaScript payload (kB)"
              field="bytesJS"
              highlightedUrl={highlightedUrl}
              yTransform={(y) => Math.round(y / 1000)}
            />
            <Chart
              sites={currentSites}
              name="Image payload (kB)"
              field="bytesImg"
              highlightedUrl={highlightedUrl}
              yTransform={(y) => Math.round(y / 1000)}
            />
            <Chart
              sites={currentSites}
              name="Total request payload (kB)"
              field="bytesTotal"
              highlightedUrl={highlightedUrl}
              yTransform={(y) => Math.round(y / 1000)}
            />
            <Chart
              sites={currentSites}
              name="Number of requests"
              field="reqTotal"
              highlightedUrl={highlightedUrl}
            />
          </div>
        </Content>
      </Layout>

      <h2>site details</h2>
      <div>
        <table className="SiteDetails">
          <thead>
            <tr>
              <th>site</th>
              <th>cdn</th>
              <th>profile time</th>
            </tr>
          </thead>
          <tbody>
            {currentSites.map((site) => (
              <SiteDetail key={site.url} site={site} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="footer">
        <p>&copy; 2020</p>
      </div>
    </React.Fragment>
  );
}

export default App;
