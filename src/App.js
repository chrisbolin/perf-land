import React, { useEffect, useState } from "react";
import { parse } from "papaparse";
import { keyBy } from "lodash";
import AsyncSelect from "react-select/async";
import { VictoryBar, VictoryChart, VictoryAxis, VictoryLabel } from "victory";
import "./App.css";

const presets = {
  airlines: [
    "https://www.southwest.com/",
    "https://www.delta.com/",
    "https://www.united.com/",
    "https://www.jetblue.com/",
    "https://www.alaskaair.com/",
    "https://www.flyfrontier.com/",
  ],
  news: [
    "https://www.latimes.com/",
    "http://www.nytimes.com/",
    "https://www.theatlantic.com/",
    "https://www.bbc.co.uk/",
    "https://www.aljazeera.com/",
  ],
};

function downloadRecords() {
  return new Promise((resolve, reject) => {
    console.time("download");
    parse("/dump005.csv", {
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

function Record({
  record,
  onRemoveClick,
  highlighted,
  onHighlightClick,
  onHighlightRemoveClick,
}) {
  return (
    <div
      className="Record"
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

function Chart({ records, field, name, highlightedUrl, reverse = false }) {
  if (!records.length) return null;

  const data = records
    .map((record) => ({
      x: record.url,
      y: parseFloat(record[field]) || 0,
    }))
    .sort((a, b) => (a.y - b.y) * (reverse ? -1 : 1));

  return (
    <div className="Chart">
      <VictoryChart>
        <VictoryAxis
          label={name}
          tickLabelComponent={
            <VictoryLabel angle={-90} textAnchor="left" dy={10} dx={10} />
          }
        />
        <VictoryAxis dependentAxis />
        <VictoryBar
          data={data}
          style={{
            data: {
              fill: ({ datum }) =>
                datum.x === highlightedUrl ? "red" : undefined,
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

  const selectPresetUrls = (presetName) =>
    setSelectedUrls(new Set(presets[presetName]));

  const changeHighlightUrl = (url) =>
    setUiState((uiState) => ({ ...uiState, highlightedUrl: url }));

  const removeHighlightUrl = (url) =>
    setUiState((uiState) => ({ ...uiState, highlightedUrl: null }));

  const currentlySelectedRecords = selectRecords(records, selectedUrls);

  window.records = records;

  return (
    <div className="App">
      <h1>websites</h1>
      <AsyncSelect
        className="UrlSelect"
        loadOptions={loadOptions}
        defaultOptions={[]}
        onChange={(option) => addUrl(option.value)}
        value=""
        placeholder="Add websites..."
      />
      {currentlySelectedRecords.map((record) => (
        <Record
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
        <button onClick={() => selectPresetUrls("airlines")}>airlines</button>
        <button onClick={() => selectPresetUrls("news")}>news</button>
      </div>
      <h1>charts</h1>
      <div className="charts">
        <Chart
          records={currentlySelectedRecords}
          name="Time to First Byte (ms)"
          field="TTFB"
          highlightedUrl={highlightedUrl}
        />
        <Chart
          records={currentlySelectedRecords}
          name="First Contentful Paint (ms)"
          field="firstContentfulPaint"
          highlightedUrl={highlightedUrl}
        />
        <Chart
          records={currentlySelectedRecords}
          name="First Meaningful Paint (ms)"
          field="firstMeaningfulPaint"
          highlightedUrl={highlightedUrl}
        />
        <Chart
          records={currentlySelectedRecords}
          name="First CPU Idle (ms)"
          field="firstCPUIdle"
          highlightedUrl={highlightedUrl}
        />
        <Chart
          records={currentlySelectedRecords}
          name="Time to Interactive (ms)"
          field="timeToInteractive"
          highlightedUrl={highlightedUrl}
        />
        <Chart
          records={currentlySelectedRecords}
          name="Max Potential First Input Delay (ms)"
          field="maxPotentialFirstInputDelay"
          highlightedUrl={highlightedUrl}
        />
        <Chart
          records={currentlySelectedRecords}
          name="Speed Index"
          field="speedIndex"
          highlightedUrl={highlightedUrl}
        />
        <Chart
          records={currentlySelectedRecords}
          name="Lighthouse Performance Score"
          field="performanceScore"
          highlightedUrl={highlightedUrl}
          reverse
        />
      </div>
    </div>
  );
}

export default App;