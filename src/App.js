import React, { useEffect, useState } from "react";
import { parse } from "papaparse";
import { groupBy } from "lodash";
import "./App.css";

function downloadRecords() {
  return new Promise((resolve, reject) => {
    console.time("download");
    parse("/dump005.csv", {
      download: true,
      header: true,
      complete: (results) => {
        console.timeEnd("download");
        resolve(groupBy(results.data, (rec) => rec.url + "!!!"));
      },
      error: (error) => reject(error),
    });
  });
}

function App() {
  const [records, setRecords] = useState({});
  const [urls, setURLs] = useState([]);
  useEffect(() => {
    downloadRecords().then((records) => {
      setRecords(records);
      setURLs(Object.keys(records));
    });
  }, []);
  window.records = records;
  return (
    <div className="App">
      <h2>{urls.length}</h2>
    </div>
  );
}

export default App;
