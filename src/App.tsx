import React, { useReducer, memo } from "react";
import Select from "react-select";
import {
  VictoryBar,
  VictoryBrushContainer,
  VictoryChart,
  VictoryAxis,
  VictoryLabel,
} from "victory";

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
import "./App.css";

declare global {
  interface Window {
    state: any;
  }
}

type EventCallbackFunction = (event: React.SyntheticEvent) => void;
type IdentityFunction = (x: number) => number;

function SelectedSite({
  site,
  onRemoveClick,
  highlighted,
  onHighlightClick,
  onHighlightRemoveClick,
}: {
  site: AugmentedSite;
  highlighted: boolean;
  onRemoveClick: EventCallbackFunction;
  onHighlightClick: EventCallbackFunction;
  onHighlightRemoveClick: EventCallbackFunction;
}) {
  return (
    <div className={`SelectedSite ${highlighted ? `highlighted` : ``}`}>
      <button
        className={`SelectedSite-btn ${highlighted ? `highlighted` : ``}`}
        onClick={highlighted ? onHighlightRemoveClick : onHighlightClick}
      >
        {site.name}
        <span className="icon">{highlighted ? " ⭐" : null}</span>
      </button>
      <button
        className="SelectedSite-removeBtn"
        onClick={onRemoveClick}
        aria-label="Remove"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}

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

const urlSelectStyles = {
  control: (provided: Object) => ({
    ...provided,
    backgroundColor: "#ffffff",
    border: "none",
    borderRadius: "2rem",
    boxShadow: "-0.5em -0.5em 1.5em 0 #dbfff5, 0.5em 0.5em 1.5em 0 #6ee0bf",
    margin: "0",
    minHeight: "0",
  }),
  valueContainer: (provided: Object) => ({
    ...provided,
    padding: "0.5rem 1.25rem",
  }),
  indicatorsContainer: (provided: Object) => ({
    ...provided,
    paddingRight: "0.5rem",
  }),
  indicatorSeparator: (provided: Object) => ({
    ...provided,
    margin: "0 0.25rem 0 0",
  }),
  menu: (provided: Object, state: Object) => ({
    ...provided,
    borderRadius: "1rem",
    boxShadow: "0.5em 0.5em 1.5em 0 #6ee0bf",
    padding: "0.6rem 0",
  }),
  option: (provided: Object, state: Object) => ({
    ...provided,
    padding: "0.25em 1.25rem",
  }),
};

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

  return (
    <div className="App">
      <div className="Hero">
        <div className="Title">
          <h1>perf land</h1>
          <div className="text">
            <p>
              explore the world of web performance and compare thousands of
              websites. made with :love: by{" "}
              <a href="https://formidable.com">Formidable</a>.
            </p>
          </div>
        </div>
        <div className="About">
          <h2 id="about">about</h2>
          <p>
            perf land is currently in the <strong>alpha</strong> stage. If there
            are features you'd like to see or bugs you'd like to tell us about,
            check out the{" "}
            <a href="https://github.com/FormidableLabs/perf-land">repository</a>
            .
          </p>
          <p>
            There are over 600,000 sites are available here. The underlying data
            is from the HTTP Archive, a public and free resource.
          </p>
          <p>
            The performance tests are run from a private instance of WebPageTest
            located in Redwood City, California. If you'd like to learn more
            about the tests,{" "}
            <a href="https://httparchive.org/faq#how-is-the-data-gathered">
              head to the HTTP Archive
            </a>
            .
          </p>
        </div>
      </div>

      <h2>websites</h2>

      <h3>preset collections</h3>
      <div className="BtnWrapper">
        {Object.keys(presets).map((presetKey) => (
          <button
            className="Btn"
            key={presetKey}
            onClick={() =>
              dispatch(actions.selectPresetUrls(presetKey as PresetName))
            }
          >
            {presetKey}
          </button>
        ))}
      </div>

      <div className="Collections">
        {!!Object.keys(savedCollections).length && (
          <div className="Collections-Cell">
            <h3>saved collections</h3>
            <div className="BtnWrapper">
              {Object.keys(savedCollections).map((collectionName) => (
                <button
                  className="Btn"
                  key={collectionName}
                  onClick={() =>
                    dispatch(actions.selectCollection(collectionName))
                  }
                >
                  {collectionName}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="Collections-Cell Collections-Cell--right">
          <div className="BtnWrapper">
            {viewingSavedCollection ? (
              <button
                className="Btn Btn--action"
                onClick={() => promptAndSaveCollection()}
              >
                update preset
              </button>
            ) : null}
            {viewingSavedCollection && (
              <button
                className="Btn Btn--action"
                onClick={() =>
                  dispatch(
                    actions.deleteCollection(state.currentCollection.name)
                  )
                }
              >
                delete preset
              </button>
            )}
          </div>
        </div>
      </div>

      {!!urls.length && (
        <>
          <div className="Collections">
            <h3>active</h3>
            <div className="Collections-Cell Collections-Cell--right">
              <div className="BtnWrapper">
                <button
                  className="Btn Btn--action"
                  onClick={() => dispatch(actions.clearAllSelectedUrls())}
                >
                  clear all
                </button>
                {viewingSavedCollection ? null : (
                  <button
                    className="Btn Btn--action"
                    onClick={() => promptAndSaveCollection()}
                  >
                    save preset
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="BtnWrapper">
            {currentSites.map((site) => (
              <SelectedSite
                key={site.url}
                site={site}
                onRemoveClick={() => dispatch(actions.removeUrl(site.url))}
                highlighted={site.url === highlightedUrl}
                onHighlightClick={() =>
                  dispatch(actions.changeHighlightSite(site.url))
                }
                onHighlightRemoveClick={() =>
                  dispatch(actions.removeHighlightSite())
                }
              />
            ))}

            {loadingSites && <LoadingSites />}

            <Select
              className="UrlSelect"
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
              value={null}
              placeholder="add website..."
              styles={urlSelectStyles}
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
          </div>
        </>
      )}

      <h2>comparisons</h2>
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
        <p>
          &copy; 2020 <a href="https://formidable.com">Formidable</a>
        </p>
      </div>
    </div>
  );
}

export default App;
