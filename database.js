const mysql2 = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

const pool = mysql2.createPool({
  host: process.env.MySQLhost,
  port: process.env.MySQLport,
  user: process.env.MySQLuser,
  password: process.env.MySQLpassword,
  database: process.env.MySQLhostdatabase,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const getData = async (textToSearch) => {
  try {
    const [results] = await pool.query(
      "SELECT code_in_iata FROM cities WHERE city LIKE ? LIMIT 10",
      [`%${textToSearch}%`]
    );

    if (results.length > 0) {
      return results[0].code_in_iata;
    } else {
      return null;
    }
  } catch (err) {
    console.error("Ошибка при выполнении запроса:", err);
    throw err;
  }
};

const getSuggestions = async (text) => {
  try {
    const [results] = await pool.query(
      "SELECT city FROM cities WHERE city LIKE ?",
      [`%${text}%`]
    );

    return results.map((row) => ({ city: row.city }));
  } catch (err) {
    console.error("Ошибка при выполнении запроса:", err);
    throw err;
  }
};

module.exports = {
  getData,
  getSuggestions,
};
