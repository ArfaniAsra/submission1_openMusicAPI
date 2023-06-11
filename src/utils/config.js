// utils/config.js

const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
  },
  postgres: {
    pguser: process.env.PGUSER,
    pghost: process.env.PGHOST,
    pgpassword: process.env.PGPASSWORD,
    pgdatabase: process.env.PGDATABASE,
    pgport: process.env.PGPORT,
  },
  jwt_token: {
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    refresh_token_key: process.env.REFRESH_TOKEN_KEY,
    access_token_age: process.env.ACCESS_TOKEN_AGE,
  },
  rabbitMq: {
    rabbitmq_server: process.env.RABBITMQ_SERVER,
  },
  redis: {
    host: process.env.REDIS_SERVER,
  },
};

module.exports = config;
