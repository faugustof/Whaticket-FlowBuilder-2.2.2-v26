require("../bootstrap");


// são paulo timezone


module.exports = {
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_bin"
    // freezeTableName: true
  },
  options: { requestTimeout: 600000, encrypt: true },
  retry: {
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ],
    max: 100
  },
  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 100,
    min: parseInt(process.env.DB_POOL_MIN) || 15,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
    idle: parseInt(process.env.DB_POOL_IDLE) || 600000
  },
  dialect: process.env.DB_DIALECT || "postgres",
  timezone: 'America/Sao_Paulo',
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || "5432",
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  logging: false
};
