import React, { useEffect, useState } from "react";
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

function App() {
  const [records, setRecords] = useState({});
  const [urls, setUrls] = useState([]);
  const [selectedUrls, setSelectedUrls] = useState(new Set());
  const [{ highlightedUrl }, setUiState] = useState({ highlightedUrl: null });

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

  const addUrl = (url) =>
    setSelectedUrls((current) => {
      const next = new Set(current);
      next.add(url);
      return next;
    });

  const removeUrl = (url) =>
    setSelectedUrls((current) => {
      const next = new Set(current);
      next.delete(url);
      return next;
    });

  const removeAllUrls = () => setSelectedUrls(new Set());

  const selectPresetUrls = (presetName) => {
    const presetUrls = presets[presetName];
    setSelectedUrls(new Set(presetUrls));
    changeHighlightUrl(presetUrls[0]);
  };

  const changeHighlightUrl = (url) =>
    setUiState((uiState) => ({ ...uiState, highlightedUrl: url }));

  const removeHighlightUrl = (url) =>
    setUiState((uiState) => ({ ...uiState, highlightedUrl: null }));

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
              onHighlightClick={() => changeHighlightUrl(record.url)}
              onHighlightRemoveClick={removeHighlightUrl}
            />
          ))}
          <button onClick={removeAllUrls}>clear</button>
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
