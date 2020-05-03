const knex = require("knex");

const SEARCH_TYPE = "SEARCH_TYPE";
const GET_PAGES_TYPE = "GET_PAGES_TYPE";

const INPUT_URL_COUNT_MAX = 100;
const INPUT_SEARCH_STRING_MIN = 5;
const OUTPUT_SEARCH_RESULTS_MAX = 10;

/*
  place connection in global scope to cache it
  from docs (https://cloud.google.com/functions/docs/bestpractices/tips)
  Cloud Functions often recycles the execution environment ...
  If you declare a variable in global scope, its value can be reused in subsequent invocations ...
  It is particularly important to cache network connections, library references, and API client objects in global scope.
*/
const connection = knex({
  client: "mysql",
  connection: {
    [process.env.DB_CONNECTION_TYPE_KEY]: process.env.DB_CONNECTION_TYPE_VALUE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "data",
  },
});

function cacheResponse(res, daysInCache) {
  return res.header(
    "Cache-Control",
    `public, max-age=${daysInCache * 24 * 60 * 60}`
  );
}

function getPages(connection, res, urls) {
  return connection
    .select("*")
    .from("page_runs")
    .whereIn("url", urls)
    .orderBy("startedDateTime", "desc")
    .then((rows) => {
      cacheResponse(res, 10);
      res.status(200).json(rows);
    });
}

function searchUrls(connection, res, search) {
  return connection
    .select("url")
    .from("page_runs")
    .where("url", "like", `%${search}%`)
    .limit(OUTPUT_SEARCH_RESULTS_MAX)
    .then((rows) => {
      const urls = rows.map((row) => row.url);
      cacheResponse(res, 3);
      res.status(200).json(urls);
    });
}

function runAction(connection, res, type, data) {
  switch (type) {
    case GET_PAGES_TYPE:
      return getPages(connection, res, data);
    case SEARCH_TYPE:
      return searchUrls(connection, res, data);
    default:
      return new Promise((resolve, reject) => reject("No request type found"));
  }
}

function requestType(query) {
  const { search, url } = query;

  if (search) {
    if (search.length < INPUT_SEARCH_STRING_MIN)
      throw new Error("Search not long enough");
    return [SEARCH_TYPE, search];
  }

  if (url) {
    const urls = url.split(",");
    if (urls.length > INPUT_URL_COUNT_MAX) throw new Error("Too many URLs");
    return [GET_PAGES_TYPE, urls];
  }

  throw new Error("No valid query parameters");
}

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
function main(req, res) {
  let type, data;

  res.header("Access-Control-Allow-Origin", "*");

  try {
    [type, data] = requestType(req.query);
  } catch (error) {
    res.status(400).send("Client error");
    console.error(error);
    return;
  }

  return runAction(connection, res, type, data)
    .catch((error) => {
      res.status(500).send("Server error");
      console.error(error);
    })
    .then(() => connection); // return connection in promise (useful in testing)
}

exports.main = main;
