/* eslint-disable max-len */
/* eslint-disable import/no-extraneous-dependencies */
const Jwt = require('@hapi/jwt');
const InvariantError = require('../exceptions/InvariantError');
const config = require('../utils/config');

const TokenManager = {
  generateAccessToken: (payload) => Jwt.token.generate(payload, config.jwt_token.access_token_key),
  generateRefreshToken: (payload) => Jwt.token.generate(payload, config.jwt_token.refresh_token_key),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, config.jwt_token.refresh_token_key);
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
};

module.exports = TokenManager;
