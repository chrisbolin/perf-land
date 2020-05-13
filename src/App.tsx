import React, { useReducer } from "react";
import Select from "react-select";
import { VictoryBar, VictoryChart, VictoryAxis, VictoryLabel } from "victory";

import {
  AugmentedSite,
  PresetName,
  reducer,
  initializeState,
  selectors,
  actions,
  presets,
  effects,
} from "./state";
import "./App.css";

declare global {
  interface Window {
    _store: any;
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
    <div
      className="SelectedSite"
      style={{ fontWeight: highlighted ? "bold" : "normal" }}
    >
      {site.name}
      <button onClick={onRemoveClick}>X</button>
      {!highlighted && <button onClick={onHighlightClick}>highlight</button>}
      {highlighted && (
        <button onClick={onHighlightRemoveClick}>remove highlight</button>
      )}
    </div>
  );
}

function SiteDetails({ site }: { site: AugmentedSite }) {
  return (
    <div className="SiteDetails">
      <h4>{site.name}</h4>
      <p>
        full URL: <a href={site.url}>{site.url}</a>
      </p>
      <p>cdn: {site.cdn || "none detected"}</p>
      <p>
        profile time:{" "}
        {new Date(site.startedDateTime * 1000).toLocaleString(undefined, {
          timeZoneName: "short",
        })}
      </p>
    </div>
  );
}

function Chart({
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
      url: site.url,
      x: site.name,
      y: yTransform(site[field]) || 0,
    }))
    .sort((a, b) => (a.y - b.y) * (reverse ? -1 : 1));

  return (
    <div className="Chart">
      <VictoryChart padding={{ top: 20, right: 40, bottom: 50, left: 70 }}>
        <VictoryAxis
          label={name}
          tickLabelComponent={
            <VictoryLabel angle={-90} textAnchor="start" dy={10} dx={12} />
          }
        />
        <VictoryAxis dependentAxis />
        <VictoryBar
          data={data}
          barWidth={22}
          style={{
            data: {
              fill: ({ datum }) =>
                datum.url === highlightedUrl ? "#7171ff" : "",
            },
          }}
        />
      </VictoryChart>
    </div>
  );
}

function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initializeState);

  window._store = state;

  const { highlightedUrl, urls, savedCollections } = state;
  const selectedSites = selectors.selectedSites(state);

  // effects

  effects.useSelectedSites(state, dispatch);
  effects.usePersistState(state);

  return (
    <div className="App">
      <h1>perf land</h1>
      <div className="text">
        <p>
          explore the world of web performance and compare thousands of
          websites. made with :love: by{" "}
          <a href="https://formidable.com">Formidable</a>.
        </p>
        <p>
          learn more about perf land <a href="#about">here</a>.
        </p>
      </div>
      <h1>websites</h1>
      {!urls.length && <p>loading...</p>}
      {!!urls.length && (
        <div>
          <Select
            className="UrlSelect"
            options={state.urls.map(({ url }) => ({ value: url, label: url }))}
            onChange={(option) => {
              if (!option || "length" in option) return;
              dispatch(actions.addUrl(option.value));
            }}
            onInputChange={(input: string) => {
              effects.searchForUrls(state, dispatch, input);
            }}
            inputValue={state.search}
            value={null}
            placeholder="Add website..."
            // isLoading
            // loadingMessage={() => "loading"}
          />
          {selectedSites.map((site) => (
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
          <button onClick={() => dispatch(actions.clearAllSelectedUrls())}>
            clear all
          </button>
          <button onClick={() => dispatch(actions.saveCollection())}>
            save
          </button>
          <div>
            <h3>saved collections</h3>
            {Object.keys(savedCollections).map((collectionName) => (
              <button
                key={collectionName}
                onClick={() =>
                  dispatch(actions.selectCollection(collectionName))
                }
              >
                {collectionName}
              </button>
            ))}
          </div>
          <div>
            <h3>preset collections</h3>
            {Object.keys(presets).map((presetKey) => (
              <button
                key={presetKey}
                onClick={() =>
                  dispatch(actions.selectPresetUrls(presetKey as PresetName))
                }
              >
                {presetKey}
              </button>
            ))}
          </div>
        </div>
      )}
      {!!selectedSites.length && <h1>comparisons</h1>}
      <div className="columns">
        <Chart
          sites={selectedSites}
          name="Time to first byte (ms)"
          field="TTFB"
          highlightedUrl={highlightedUrl}
        />
        <Chart
          sites={selectedSites}
          name="First contentful paint (ms)"
          field="firstContentfulPaint"
          highlightedUrl={highlightedUrl}
        />
        <Chart
          sites={selectedSites}
          name="First meaningful paint (ms)"
          field="firstMeaningfulPaint"
          highlightedUrl={highlightedUrl}
        />
        <Chart
          sites={selectedSites}
          name="First cpu idle (ms)"
          field="firstCPUIdle"
          highlightedUrl={highlightedUrl}
        />
        <Chart
          sites={selectedSites}
          name="Time to interactive (ms)"
          field="timeToInteractive"
          highlightedUrl={highlightedUrl}
        />
        <Chart
          sites={selectedSites}
          name="Max potential first input delay (ms)"
          field="maxPotentialFirstInputDelay"
          highlightedUrl={highlightedUrl}
        />
        <Chart
          sites={selectedSites}
          name="Speed index"
          field="speedIndex"
          highlightedUrl={highlightedUrl}
        />
        <Chart
          sites={selectedSites}
          name="Lighthouse performance score"
          field="performanceScore"
          highlightedUrl={highlightedUrl}
          reverse
        />
        <Chart
          sites={selectedSites}
          name="JavaScript payload (kB)"
          field="bytesJS"
          highlightedUrl={highlightedUrl}
          yTransform={(y) => Math.round(y / 1000)}
        />
        <Chart
          sites={selectedSites}
          name="Image payload (kB)"
          field="bytesImg"
          highlightedUrl={highlightedUrl}
          yTransform={(y) => Math.round(y / 1000)}
        />
        <Chart
          sites={selectedSites}
          name="Total request payload (kB)"
          field="bytesTotal"
          highlightedUrl={highlightedUrl}
          yTransform={(y) => Math.round(y / 1000)}
        />
        <Chart
          sites={selectedSites}
          name="Number of requests"
          field="reqTotal"
          highlightedUrl={highlightedUrl}
        />
      </div>
      {!!selectedSites.length && <h1>site details</h1>}
      <div>
        {selectedSites.map((site) => (
          <SiteDetails key={site.url} site={site} />
        ))}
      </div>
      <h1 id="about">about</h1>
      <div className="text">
        <p>
          perf land is currently in the alpha stage. If there are features you'd
          like to see or bugs you'd like to tell us about, check out the{" "}
          <a href="https://github.com/FormidableLabs/perf-land">repository</a>.
        </p>
        <p>
          There are over 600,000 sites are available here. The underlying data
          is from the HTTP Archive, a public and free resource.
        </p>
        <p>
          The performance tests are run from a private instance of WebPageTest
          located in Redwood City, California. If you'd like to learn more about
          the tests,{" "}
          <a href="https://httparchive.org/faq#how-is-the-data-gathered">
            head to the HTTP Archive
          </a>
          .
        </p>
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
