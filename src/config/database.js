import knex from "knex";
import knexConfig from "../../knexfile.js";


const db = knex(knexConfig.development);

// test connection on startup
db.raw("SELECT 1")
  .then(() => {
    console.log("Database connected successfully.");
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });

export default db;
