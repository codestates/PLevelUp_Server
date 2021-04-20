require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'p_level_up',
    host: process.env.DB_HOST,
    dialect: 'mysql',
    dialectOptions: {
      useUTC: true,
      dateStrings: true,
      typeCast: true,
    },
    timezone: '+09:00',
  },
  production: {
    username: process.env.RDB_USER,
    password: process.env.RDB_PASSWORD,
    database: 'p_level_up',
    host: process.env.RDB_HOST,
    port: process.env.RDB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      useUTC: true,
      dateStrings: true,
      typeCast: true,
    },
    timezone: '+09:00',
  },
};
