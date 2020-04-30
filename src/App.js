import React, { useEffect, useState, useReducer } from "react";
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

function urlMatches(searchString, urls) {
  const MAX_RESULTS = 100;
  return urls.filter((url) => url.includes(searchString)).slice(0, MAX_RESULTS);
}

function selectRecords(records, selectedUrls) {
  return Array.from(selectedUrls.keys()).map((url) => records[url]);
}

function SelectedRecord({
  record,
  onRemoveClick,
  highlighted,
  onHighlightClick,
  onHighlightRemoveClick,
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

function RecordDetails({ record }) {
  return (
    <div className="RecordDetails">
      <h4>{record.url}</h4>
      <ul>
        <li>cdn: {record.cdn || "none"}</li>
        <li>
          profile time, local time:{" "}
          {new Date(parseInt(record.startedDateTime * 1000)).toLocaleString()}
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
            <VictoryLabel angle={-90} textAnchor="left" dy={10} dx={12} />
          }
        />
        <VictoryAxis dependentAxis />
        <VictoryBar
          data={data}
          style={{
            data: {
              fill: ({ datum }) =>
                datum.x === highlightedUrl ? "blue" : undefined,
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

function reducer(state, action) {
  switch (action.type) {
    case RECEIVE_SITES: {
      const sites = action.payload;
      return {
        sites: { ...state.sites, sites },
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
    default: {
      throw new Error(`Action type not handled: ${action.type}`);
    }
  }
}

const initialState = {
  highlightedUrl: null,
  sites: {},
  urls: [],
  selectedUrls: new Set(),
};

function App() {
  const [records, setRecords] = useState({});
  const [urls, setUrls] = useState([]);
  const [{ highlightedUrl, selectedUrls }, dispatch] = useReducer(
    reducer,
    initialState
  );

  console.log({ highlightedUrl, selectedUrls });

  // reducer state

  const changeHighlightSite = (url) =>
    dispatch({
      type: CHANGE_HIGHLIGHTED_URL,
      payload: url,
    });

  const removeHighlightSite = () =>
    dispatch({
      type: CHANGE_HIGHLIGHTED_URL,
      payload: null,
    });

  const addUrl = (url) =>
    dispatch({
      type: ADD_SELECTED_URL,
      payload: url,
    });

  const removeUrl = (url) =>
    dispatch({
      type: REMOVE_SELECTED_URL,
      payload: url,
    });

  const clearAllSelectedUrls = () =>
    dispatch({ type: CLEAR_ALL_SELECTED_URLS });

  const selectPresetUrls = (presetName) =>
    dispatch({ type: SELECT_PRESET_URLS, payload: presetName });

  // effects

  useEffect(() => {
    downloadRecords().then((records) => {
      setRecords(records);
      const urls = Object.keys(records);
      setUrls(urls);
      selectPresetUrls("airlines");
    });
  }, []);

  const loadOptions = (inputValue, callback) => {
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

  const currentlySelectedRecords = selectRecords(records, selectedUrls);

  window.records = records;

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
            defaultOptions={[]}
            onChange={(option) => addUrl(option.value)}
            value=""
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
                onClick={() => selectPresetUrls(presetKey)}
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
