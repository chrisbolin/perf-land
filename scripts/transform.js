const fs = require("fs");
const { pipeline } = require("stream");
const yargs = require("yargs");
const { parseFile, format } = require("fast-csv");

function transformFile(filePath) {
  return new Promise((resolve, reject) => {
    pipeline(
      parseFile(filePath, { headers: true }),
      format({ transform: transformRow, headers: true }),
      fs.createWriteStream(filePath + "transform.csv"),
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

function transformRow(row) {
  const payload = JSON.parse(row.payload);
  return {
    url: row.url,
    firstContentfulPaint:
      payload["_lighthouse.Performance.first-contentful-paint"],
  };
}

const filePath = yargs.argv._[0];

console.time("transform");
transformFile(filePath).then(() => {
  console.timeEnd("transform");
});
