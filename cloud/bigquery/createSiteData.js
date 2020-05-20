const fs = require("fs").promises;
const path = require("path");

const { parseFile } = require("fast-csv");
const yargs = require("yargs");
const { mapValues, orderBy } = require("lodash");

function transformRow(row) {
  return mapValues(row, (value, key) => {
    switch (key) {
      case "url":
      case "startedDateTime":
      case "cdn":
      case "source":
        return value;
      default:
        // assume all others are numbers
        return parseFloat(value);
    }
  });
}

function writeSite(rows, url, destinationDir) {
  if (rows.length === 0) return;
  const fileName = url.replace(/\//g, "");
  const filePath = path.join(destinationDir, `${fileName}.json`);
  const sortedRows = orderBy(rows, ["startedDateTime"], ["desc"]);
  return fs.writeFile(filePath, JSON.stringify(sortedRows, null, 1));
}

function digest(sourcePath, destinationDir, limit = -1) {
  return new Promise((resolve) => {
    let count = 0;
    let currentUrl = null;
    let currentRows = [];
    parseFile(sourcePath, { headers: true })
      .on("error", (error) => console.error("ERROR", error))
      .on("data", (data) => {
        const row = transformRow(data);
        if (row.url !== currentUrl) {
          writeSite(currentRows, currentUrl, destinationDir);
          currentRows = [];
        }
        currentUrl = row.url;
        currentRows.push(row);
        count++;
      })
      .on("end", () => {
        writeSite(currentRows, currentUrl, destinationDir);
        resolve(count);
      });
  });
}

// node cloud/bigquery/createSiteData.js ./big.csv ./out
function main() {
  const [sourcePath, destinationDir, limitStr = "-1"] = yargs.argv._;
  console.time("digest");
  digest(sourcePath, destinationDir, parseInt(limitStr)).then((linesRead) => {
    console.timeEnd("digest");
    console.log(linesRead);
  });
}

main();
