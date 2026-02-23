const pgPromise = require("pg-promise");
const { loadEnvSecrets } = require("./secrets");

const pgp = pgPromise({
  connect: async (client) => {
    // console.log(client);
    // await client.query(`SET search_path TO "emdb-schema", public`);
  },
  error: (err, e) => {
    // e.query exists for query errors
    // e.cn exists for connection errors
    console.error("PostgreSQL error:", err);

    if (e?.query) {
      console.error("Query:", e.query);
    }
    if (e?.cn) {
      console.error("Connection:", e.query);
    }
    if (e?.params) {
      console.error("Params:", e.params);
    }
  },
});

let db;

const initializeDb = async () => {
  console.log("Initializing DB...");
  try {
    const secrets = loadEnvSecrets();
    // const secrets =
    //   process.env.NODE_ENV === "local"
    //     ? loadEnvSecrets()
    //     : await loadSecretsSM();
    // console.log("initializeDb secrets fetched successfully", secrets);

    db = pgp({
      host: secrets.DB_HOST,
      port: secrets.DB_PORT,
      database: secrets.DB_NAME,
      user: secrets.DB_USER,
      password: secrets.DB_PASSWORD,

      ssl: { rejectUnauthorized: false },
      // ssl:
      //   process.env.DB_SSL === "true"
      //     ? { rejectUnauthorized: false } // For lower envronments // checkHere
      //     : false, // for prod

      max: 10, // max connections // but checkHere
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      options: "-c search_path=emdb-schema,public",
    });
    console.log("initializeDb Successfully...");
  } catch (error) {
    console.error("initializeDb Failed...", error);
    process.exit(1);
  }
};

const getDb = () => {
  if (!db) {
    throw new Error("DB not initialized. Call initializeDb() first.");
  }
  return db;
};

module.exports = { initializeDb, getDb };
