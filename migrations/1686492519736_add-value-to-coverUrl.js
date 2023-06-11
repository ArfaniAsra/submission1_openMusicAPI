/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql('UPDATE albums SET "coverUrl" = NULL WHERE "coverUrl" IS NULL');
};

exports.down = (pgm) => {
  pgm.sql('UPDATE albums SET "coverUrl" IS NULL WHERE "coverUrl" = NULL');
};
