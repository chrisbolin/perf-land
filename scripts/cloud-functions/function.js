const knex = require("knex");

const LIMIT_URL_COUNT = 100;

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.main = (req, res) => {
  const connection = knex({
    client: "mysql",
    connection: {
      [process.env.DB_CONNECTION_TYPE_KEY]:
        process.env.DB_CONNECTION_TYPE_VALUE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: "data",
    },
  });

  try {
    var urls = req.query.url.split(",");
    if (urls.length > LIMIT_URL_COUNT) throw new Error("Too many URLs");
  } catch (error) {
    res.status(400).send("Client error");
    console.error(error);
    return;
  }

  connection
    .select("*")
    .from("page_runs")
    .whereIn("url", urls)
    .orderBy("startedDateTime", "desc")
    .then((results) => {
      const payload = JSON.stringify(results, null, 2);
      res.status(200).send(payload);
    })
    .catch((error) => {
      res.status(500).send("Server error");
      console.error(error);
    })
    .then(() => connection.destroy());
};
