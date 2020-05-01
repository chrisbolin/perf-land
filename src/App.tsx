import React, { useEffect, useReducer } from "react";
import { parse } from "papaparse";
import { keyBy } from "lodash";
import AsyncSelect from "react-select/async";
import { VictoryBar, VictoryChart, VictoryAxis, VictoryLabel } from "victory";
import "./App.css";

const DATA_PATH = "/dump007.csv";

const presets = {
  airlines: [
    "www.united.com",
    "www.southwest.com",
    "www.delta.com",
    "www.jetblue.com",
    "www.alaskaair.com",
    "www.flyfrontier.com",
  ],
  news: [
    "www.aljazeera.com",
    "www.latimes.com",
    "app.nytimes.com",
    "www.theatlantic.com",
    "www.bbc.co.uk",
  ],
  "social media": [
    "m.facebook.com",
    "twitter.com",
    "www.instagram.com",
    "www.pinterest.com",
  ],
  lululemon: [
    "shop.lululemon.com",
    "www.target.com",
    "www.nike.com",
    "shop.nordstrom.com",
    "www.amazon.com",
    "www.mercadolivre.com.br",
  ],
};

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

function selectSelectedSite(state: State) {
  return Array.from(state.selectedUrls.keys()).map((url) => {
    return state.sites[url];
  });
}

type EventCallbackFunction = (event: React.SyntheticEvent) => void;

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

type IdentityFunction = (x: number) => number;

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

const RECEIVE_SITES = "RECEIVE_SITES";
const ADD_SELECTED_URL = "ADD_SELECTED_URL";
const REMOVE_SELECTED_URL = "REMOVE_SELECTED_URL";
const CLEAR_ALL_SELECTED_URLS = "CLEAR_ALL_SELECTED_URLS";
const SELECT_PRESET_URLS = "SELECT_PRESET_URLS";
const CHANGE_HIGHLIGHTED_URL = "CHANGE_HIGHLIGHTED_URL";

interface Site {
  url: string;
  cdn: string;
  startedDateTime: string;
  [otherKey: string]: string;
}

interface Sites {
  [key: string]: Site;
}

interface State {
  highlightedUrl: string;
  sites: Sites;
  urls: string[];
  selectedUrls: Set<string>;
}

interface BareAction {
  type: typeof CLEAR_ALL_SELECTED_URLS;
}

interface StringAction {
  type:
    | typeof ADD_SELECTED_URL
    | typeof REMOVE_SELECTED_URL
    | typeof CHANGE_HIGHLIGHTED_URL;
  payload: string;
}

type PresetName = "airlines" | "news" | "social media" | "lululemon";

interface SelectPresetAction {
  type: typeof SELECT_PRESET_URLS;
  payload: PresetName;
}

interface ReceiveSitesAction {
  type: typeof RECEIVE_SITES;
  payload: Sites;
}

type Action =
  | ReceiveSitesAction
  | SelectPresetAction
  | StringAction
  | BareAction;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case RECEIVE_SITES: {
      const sites = action.payload;
      return {
        ...state,
        sites: { ...state.sites, ...sites },
        urls: Object.keys(sites),
      };
    }
    case ADD_SELECTED_URL: {
      const selectedUrls = new Set(state.selectedUrls);
      selectedUrls.add(action.payload);
      return { ...state, selectedUrls };
    }
    case REMOVE_SELECTED_URL: {
      const selectedUrls = new Set(state.selectedUrls);
      selectedUrls.delete(action.payload);
      return { ...state, selectedUrls };
    }
    case CLEAR_ALL_SELECTED_URLS: {
      return { ...state, selectedUrls: new Set() };
    }
    case SELECT_PRESET_URLS: {
      const urls = presets[action.payload];
      const selectedUrls = new Set(urls);
      return { ...state, selectedUrls, highlightedUrl: urls[0] };
    }
    case CHANGE_HIGHLIGHTED_URL: {
      return { ...state, highlightedUrl: action.payload };
    }
  }
}

const initialState: State = {
  highlightedUrl: "",
  sites: {},
  urls: [],
  selectedUrls: new Set(),
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { highlightedUrl, urls } = state;
  const currentlySelectedRecords = selectSelectedSite(state);

  console.log(state);

  // reducer state

  const changeHighlightSite = (url: string) =>
    dispatch({
      type: CHANGE_HIGHLIGHTED_URL,
      payload: url,
    });

  const removeHighlightSite = () =>
    dispatch({
      type: CHANGE_HIGHLIGHTED_URL,
      payload: "",
    });

  const addUrl = (url: string) =>
    dispatch({
      type: ADD_SELECTED_URL,
      payload: url,
    });

  const removeUrl = (url: string) =>
    dispatch({
      type: REMOVE_SELECTED_URL,
      payload: url,
    });

  const clearAllSelectedUrls = () =>
    dispatch({ type: CLEAR_ALL_SELECTED_URLS });

  const selectPresetUrls = (presetName: PresetName) =>
    dispatch({ type: SELECT_PRESET_URLS, payload: presetName });

  const receiveSites = (sites: Sites) =>
    dispatch({
      type: RECEIVE_SITES,
      payload: sites,
    });

  // effects

  useEffect(() => {
    downloadRecords().then((records) => {
      receiveSites(records as Sites);
      selectPresetUrls("airlines");
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
      <h1>performance comparison</h1>
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
              addUrl(option.value);
            }}
            placeholder="Add website..."
          />
          {currentlySelectedRecords.map((record) => (
            <SelectedRecord
              key={record.url}
              record={record}
              onRemoveClick={() => removeUrl(record.url)}
              highlighted={record.url === highlightedUrl}
              onHighlightClick={() => changeHighlightSite(record.url)}
              onHighlightRemoveClick={removeHighlightSite}
            />
          ))}
          <button onClick={clearAllSelectedUrls}>clear</button>
          <div>
            <b>presets:</b>
            {Object.keys(presets).map((presetKey) => (
              <button
                key={presetKey}
                onClick={() => selectPresetUrls(presetKey as PresetName)}
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
