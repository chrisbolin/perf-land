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
    // basics
    url: row.url,
    rank: row.rank2017,
    startedDateTime: row.startedDateTime,
    // site info
    cdn: row.cdn,
    // request totals
    reqTotal: row.reqTotal,
    reqHtml: row.reqHtml,
    reqJS: row.reqJS,
    reqCSS: row.reqCSS,
    reqImg: row.reqImg,
    // byte totals
    bytesTotal: row.bytesTotal,
    bytesHtml: row.bytesHtml,
    bytesJS: row.bytesJS,
    bytesCSS: row.bytesCSS,
    bytesImg: row.bytesImg,
    // lighthouse performance
    lighthousePerformanceScore: payload["_lighthouse.Performance"],
    firstContentfulPaint:
      payload["_lighthouse.Performance.first-contentful-paint"],
    maxPotentialFirstInputDelay:
      payload["_lighthouse.Performance.max-potential-fid"],
    speedIndex: payload["_lighthouse.Performance.speed-index"],
    firstMeaningfulPaint:
      payload["_lighthouse.Performance.first-meaningful-paint"],
    firstCPUIdle: payload["_lighthouse.Performance.first-cpu-idle"],
    timeToInteractive: payload["_lighthouse.Performance.interactive"],
    // other performance
    timeToFirstByte: row.TTFB,
  };
}

const filePath = yargs.argv._[0];

console.time("transform");
transformFile(filePath).then(() => {
  console.timeEnd("transform");
});
