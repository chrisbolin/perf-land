import React, { useEffect, useState } from "react";
import { parse } from "papaparse";
import { groupBy } from "lodash";
import AsyncSelect from "react-select/async";

import "./App.css";

function downloadRecords() {
  return new Promise((resolve, reject) => {
    console.time("download");
    parse("/dump005.csv", {
      download: true,
      header: true,
      complete: (results) => {
        console.timeEnd("download");
        resolve(groupBy(results.data, "url"));
      },
      error: (error) => reject(error),
    });
  });
}

function getUrlMatches(searchString, urls) {
  const MAX_RESULTS = 100;
  return urls.filter((url) => url.includes(searchString)).slice(0, MAX_RESULTS);
}

function App() {
  const [records, setRecords] = useState({});
  const [urls, setUrls] = useState([]);
  useEffect(() => {
    downloadRecords().then((records) => {
      setRecords(records);
      const urls = Object.keys(records);
      setUrls(urls);
    });
  }, []);
  window.records = records;

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

  return (
    <div className="App">
      <h2>{urls.length}</h2>
      <AsyncSelect loadOptions={loadOptions} defaultOptions={[]} />
    </div>
  );
}

export default App;
