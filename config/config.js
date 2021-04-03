require('dotenv').config();

module.exports = {
  development : {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "p_level_up",
    host: process.env.DB_HOST,
    dialect: "mysql",
  },production : {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "p_level_up",
    host: process.env.DB_HOST,
    dialect: "mysql",
  }
}
