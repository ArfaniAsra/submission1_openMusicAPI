/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.sql('UPDATE albums SET "coverUrl" = NULL WHERE "coverUrl" = NULL');
};

exports.down = (pgm) => {
  pgm.sql('UPDATE albums SET "coverUrl" = NULL WHERE "coverUrl" IS NULL');
};
