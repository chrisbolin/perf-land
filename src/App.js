import React, { useEffect, useState } from "react";
import { parse } from "papaparse";
import { groupBy } from "lodash";
import Select from "react-select";

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

function App() {
  const [records, setRecords] = useState({});
  const [urls, setUrls] = useState([]);
  const [urlOptions, setUrlOptions] = useState([]);
  useEffect(() => {
    downloadRecords().then((records) => {
      setRecords(records);
      const urls = Object.keys(records);
      setUrls(urls);
      const options = urls.map((url) => ({ value: url, label: url }));
      setUrlOptions(options);
    });
  }, []);
  window.records = records;
  return (
    <div className="App">
      <h2>{urls.length}</h2>
      <Select options={urlOptions} />
    </div>
  );
}

export default App;
