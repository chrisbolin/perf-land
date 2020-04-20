import React, { useEffect, useState } from "react";
import { parse } from "papaparse";
import { keyBy } from "lodash";
import AsyncSelect from "react-select/async";

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
    "https://www.nytimes.com/",
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

function getUrlMatches(searchString, urls) {
  const MAX_RESULTS = 100;
  return urls.filter((url) => url.includes(searchString)).slice(0, MAX_RESULTS);
}

function Item({ url, onRemove }) {
  return (
    <div className="Item">
      {url}
      <button onClick={() => onRemove(url)}>X</button>
    </div>
  );
}

function App() {
  const [records, setRecords] = useState({});
  const [urls, setUrls] = useState([]);
  const [selectedUrls, setSelectedUrls] = useState(new Set());

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
        getUrlMatches(inputValue, urls).map((url) => ({
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

  window.records = records;

  return (
    <div className="App">
      <h2>websites</h2>
      <AsyncSelect
        className="UrlSelect"
        loadOptions={loadOptions}
        defaultOptions={[]}
        onChange={(option) => addUrl(option.value)}
        value=""
        placeholder="Add websites..."
      />
      {Array.from(selectedUrls.keys()).map((url) => (
        <Item key={url} url={url} onRemove={removeUrl} />
      ))}
      <button onClick={removeAllUrls}>clear</button>
      <div>
        <h2>presets</h2>
        <button onClick={() => selectPresetUrls("airlines")}>airlines</button>
        <button onClick={() => selectPresetUrls("news")}>news</button>
      </div>
    </div>
  );
}

export default App;
