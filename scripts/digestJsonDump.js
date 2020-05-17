const fs = require("fs");
const readline = require("readline");
const path = require("path");
const yargs = require("yargs");

async function digest(sourcePath, destinationDir, limit = -1) {
  const readStream = fs.createReadStream(sourcePath);

  const readlineInterface = readline.createInterface({ input: readStream });
  let linesRead = 0;
  for await (const jsonBlob of readlineInterface) {
    if (linesRead === limit) break;
    linesRead++;
    try {
      const url = jsonBlob.match(/{"url":"([^"]*)/)[1];
      const startedDateTime = jsonBlob.match(/"startedDateTime":"([^"]*)/)[1];
      const simpleFileName = url.replace(/\//g, "");
      const filePath = path.join(
        destinationDir,
        `${simpleFileName}:${startedDateTime}.json`
      );
      fs.writeFile(filePath, jsonBlob, {}, () => null);
    } catch (e) {
      console.error("line read failed", jsonBlob);
      console.error(e);
    }
  }
  return linesRead;
}

// node scripts/digestJsonDump.js dump.json scripts 2

function main() {
  const [sourcePath, destinationDir, limitStr = "-1"] = yargs.argv._;
  console.time("digest");
  digest(sourcePath, destinationDir, parseInt(limitStr)).then((linesRead) => {
    console.timeEnd("digest");
    console.log(linesRead);
  });
}

main();
