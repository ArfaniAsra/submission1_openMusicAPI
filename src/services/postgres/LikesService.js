const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const ClientError = require('../../exceptions/ClientError');

class LikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addLike(userId, albumId) {
    const isLike = await this.verifyLikeExist(userId, albumId);
    if (isLike > 0) {
      throw new ClientError('Anda sudah menyukai album ini');
    }

    const likeId = `like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [likeId, userId, albumId],
    };

    const result = await this._pool.query(query);

    await this._cacheService.delete(`likes: ${albumId}`);
    return result.rows;
  }

  async deleteLike(userId, albumId) {
    const isLike = await this.verifyLikeExist(userId, albumId);

    if (isLike === 0) {
      throw new ClientError('Like tidak ada di dalam daftar');
    }

    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 RETURNING id',
      values: [userId],
    };

    const result = await this._pool.query(query);

    await this._cacheService.delete(`likes: ${albumId}`);
    return result.rows;
  }

  async getLikeById(albumId) {
    try {
      const result = await this._cacheService.get(`likes: ${albumId}`);
      return {
        likes: JSON.parse(result),
        isCache: 1,
      };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);

      await this._cacheService.set(`likes: ${albumId}`, JSON.stringify(result.rowCount));
      return {
        likes: result.rowCount,
      };
    }
  }

  async verifyLikeExist(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    return result.rowCount;
  }
}

module.exports = LikesService;
