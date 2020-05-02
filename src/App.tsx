import React, { useReducer } from "react";
import AsyncSelect from "react-select/async";
import { VictoryBar, VictoryChart, VictoryAxis, VictoryLabel } from "victory";

import {
  AugmentedSite,
  PresetName,
  reducer,
  initialState,
  selectors,
  actions,
  presets,
  effects,
} from "./state";
import "./App.css";

type EventCallbackFunction = (event: React.SyntheticEvent) => void;
type IdentityFunction = (x: number) => number;

function urlMatches(searchString: string, urls: string[]) {
  const MAX_RESULTS = 100;
  return urls.filter((url) => url.includes(searchString)).slice(0, MAX_RESULTS);
}

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
      <ul>
        <li>cdn: {site.cdn || "none"}</li>
        <li>
          profile time, local time:{" "}
          {new Date(parseInt(site.startedDateTime) * 1000).toLocaleString()}
        </li>
      </ul>
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
  field: string;
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
      y: yTransform(parseFloat(site[field])) || 0,
    }))
    .sort((a, b) => (a.y - b.y) * (reverse ? -1 : 1));

  return (
    <div className="Chart">
      <VictoryChart>
        <VictoryAxis
          label={name}
          tickLabelComponent={
            <VictoryLabel angle={-90} textAnchor="start" dy={10} dx={12} />
          }
        />
        <VictoryAxis dependentAxis />
        <VictoryBar
          data={data}
          style={{
            data: {
              fill: ({ datum }) => (datum.url === highlightedUrl ? "blue" : ""),
            },
          }}
        />
      </VictoryChart>
    </div>
  );
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { highlightedUrl, urls } = state;
  const selectedSites = selectors.selectedSites(state);

  console.log(state, { selectedSites });

  // effects

  effects.useSelectedSites(state, dispatch);

  // search

  const loadOptions = (inputValue: string, callback: Function) => {
    const MIN_INPUT = 3;
    if (inputValue.length < MIN_INPUT) {
      callback([]);
    } else {
      callback(
        urlMatches(inputValue, urls).map((url) => ({
          value: url,
          label: url,
        }))
      );
    }
  };

  return (
    <div className="App">
      <h1>perf land</h1>
      <div>
        <ul>
          <li>note: this is a demo. be aware of sharp edges</li>
          <li>select some websites to compare</li>
          <li>or pick a preset group of sites</li>
          <li>most of the top 20,000 sites are here</li>
          <li>there will definitely be some sites missing! let me know</li>
          <li>
            all data is from the HTTP Archive, which is public and free (in all
            senses)
          </li>
          <li>
            tests are run from a private instance of WebPageTest located in
            Redwood City, California.{" "}
            <a href="https://httparchive.org/faq#how-is-the-data-gathered">
              more info here.
            </a>
          </li>
        </ul>
      </div>
      <h1>websites</h1>
      {!urls.length && <p>loading...</p>}
      {!!urls.length && (
        <div>
          <AsyncSelect
            className="UrlSelect"
            loadOptions={loadOptions}
            onChange={(option) => {
              if (!option || "length" in option) return;
              dispatch(actions.addUrl(option.value));
            }}
            placeholder="Add website..."
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
            clear
          </button>
          <div>
            <b>presets:</b>
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
      {!!selectedSites.length && <h1>charts</h1>}
      <div className="charts">
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
      {!!selectedSites.length && <h1>details</h1>}
      {selectedSites.map((site) => (
        <SiteDetails key={site.url} site={site} />
      ))}
    </div>
  );
}

export default App;
