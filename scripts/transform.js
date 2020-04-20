const fs = require("fs");
const yargs = require("yargs");
const { parseFile } = require("fast-csv");

function transformFile(filePath, rowTransformer) {
  return new Promise((resolve, reject) => {
    const results = [];
    parseFile(filePath, { headers: true })
      .on("error", (error) => reject(error))
      .on("data", (row) => {
        const transformedRow = rowTransformer(row);
        if (transformedRow) {
          results.push(transformedRow);
        }
      })
      .on("end", () => resolve(results));
  });
}

function transformRow(row) {
  return row.url;
}

const firstArgument = yargs.argv._[0];

console.time("transform");
transformFile(firstArgument, transformRow).then((results) => {
  console.log(results.length);
  console.timeEnd("transform");
});
