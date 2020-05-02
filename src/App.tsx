import React, { useEffect, useReducer } from "react";
import { parse } from "papaparse";
import { keyBy } from "lodash";
import AsyncSelect from "react-select/async";
import { VictoryBar, VictoryChart, VictoryAxis, VictoryLabel } from "victory";

import {
  Site,
  Sites,
  PresetName,
  reducer,
  initialState,
  selectors,
  actions,
  presets,
} from "./state";
import "./App.css";

type EventCallbackFunction = (event: React.SyntheticEvent) => void;
type IdentityFunction = (x: number) => number;

const DATA_PATH = "/dump007.csv";

function downloadRecords() {
  return new Promise((resolve, reject) => {
    console.time("download");
    parse(DATA_PATH, {
      download: true,
      header: true,
      complete: (results) => {
        console.timeEnd("download");
        resolve(keyBy(results.data, "url"));
      },
      error: (error) => reject(error),
    });
  });
}

function urlMatches(searchString: string, urls: string[]) {
  const MAX_RESULTS = 100;
  return urls.filter((url) => url.includes(searchString)).slice(0, MAX_RESULTS);
}

function SelectedRecord({
  record,
  onRemoveClick,
  highlighted,
  onHighlightClick,
  onHighlightRemoveClick,
}: {
  record: Site;
  highlighted: boolean;
  onRemoveClick: EventCallbackFunction;
  onHighlightClick: EventCallbackFunction;
  onHighlightRemoveClick: EventCallbackFunction;
}) {
  return (
    <div
      className="SelectedRecord"
      style={{ fontWeight: highlighted ? "bold" : "normal" }}
    >
      {record.url}
      <button onClick={onRemoveClick}>X</button>
      {!highlighted && <button onClick={onHighlightClick}>highlight</button>}
      {highlighted && (
        <button onClick={onHighlightRemoveClick}>remove highlight</button>
      )}
    </div>
  );
}

function RecordDetails({ record }: { record: Site }) {
  return (
    <div className="RecordDetails">
      <h4>{record.url}</h4>
      <ul>
        <li>cdn: {record.cdn || "none"}</li>
        <li>
          profile time, local time:{" "}
          {new Date(parseInt(record.startedDateTime) * 1000).toLocaleString()}
        </li>
      </ul>
    </div>
  );
}

function Chart({
  records,
  field,
  name,
  highlightedUrl,
  reverse = false,
  yTransform = (x) => x,
}: {
  records: Site[];
  field: string;
  name: string;
  highlightedUrl: string;
  reverse?: boolean;
  yTransform?: IdentityFunction;
}) {
  if (!records.length) return null;

  const data = records
    .map((record) => ({
      x: record.url,
      y: yTransform(parseFloat(record[field])) || 0,
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
              fill: ({ datum }) => (datum.x === highlightedUrl ? "blue" : ""),
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
  const currentlySelectedRecords = selectors.selectedSites(state);

  console.log(state);

  // effects

  useEffect(() => {
    downloadRecords().then((sites) => {
      dispatch(actions.receiveSites(sites as Sites));
      dispatch(actions.selectPresetUrls("airlines"));
    });
  }, []);

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
      <p>
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
      </p>
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
          {currentlySelectedRecords.map((record) => (
            <SelectedRecord
              key={record.url}
              record={record}
              onRemoveClick={() => dispatch(actions.removeUrl(record.url))}
              highlighted={record.url === highlightedUrl}
              onHighlightClick={() =>
                dispatch(actions.changeHighlightSite(record.url))
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
      {!!currentlySelectedRecords.length && <h1>charts</h1>}
      <div className="charts">
        <Chart
          records={currentlySelectedRecords}
          name="Time to first byte (ms)"
          field="TTFB"
          highlightedUrl={highlightedUrl}
        />
        <Chart
          records={currentlySelectedRecords}
          name="First contentful paint (ms)"
          field="firstContentfulPaint"
          highlightedUrl={highlightedUrl}
        />
        <Chart
          records={currentlySelectedRecords}
          name="First meaningful paint (ms)"
          field="firstMeaningfulPaint"
          highlightedUrl={highlightedUrl}
        />
        <Chart
          records={currentlySelectedRecords}
          name="First cpu idle (ms)"
          field="firstCPUIdle"
          highlightedUrl={highlightedUrl}
        />
        <Chart
          records={currentlySelectedRecords}
          name="Time to interactive (ms)"
          field="timeToInteractive"
          highlightedUrl={highlightedUrl}
        />
        <Chart
          records={currentlySelectedRecords}
          name="Max potential first input delay (ms)"
          field="maxPotentialFirstInputDelay"
          highlightedUrl={highlightedUrl}
        />
        <Chart
          records={currentlySelectedRecords}
          name="Speed index"
          field="speedIndex"
          highlightedUrl={highlightedUrl}
        />
        <Chart
          records={currentlySelectedRecords}
          name="Lighthouse performance score"
          field="performanceScore"
          highlightedUrl={highlightedUrl}
          reverse
        />
        <Chart
          records={currentlySelectedRecords}
          name="JavaScript payload (kB)"
          field="bytesJS"
          highlightedUrl={highlightedUrl}
          yTransform={(y) => Math.round(y / 1000)}
        />
        <Chart
          records={currentlySelectedRecords}
          name="Image payload (kB)"
          field="bytesImg"
          highlightedUrl={highlightedUrl}
          yTransform={(y) => Math.round(y / 1000)}
        />
        <Chart
          records={currentlySelectedRecords}
          name="Total request payload (kB)"
          field="bytesTotal"
          highlightedUrl={highlightedUrl}
          yTransform={(y) => Math.round(y / 1000)}
        />
        <Chart
          records={currentlySelectedRecords}
          name="Number of requests"
          field="reqTotal"
          highlightedUrl={highlightedUrl}
          yTransform={(y) => Math.round(y / 1000)}
        />
      </div>
      {!!currentlySelectedRecords.length && <h1>details</h1>}
      {currentlySelectedRecords.map((record) => (
        <RecordDetails key={record.url} record={record} />
      ))}
    </div>
  );
}

export default App;
