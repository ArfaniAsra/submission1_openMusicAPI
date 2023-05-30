const autoBind = require('auto-bind');
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();

    autoBind(this);
  }

  async addSongToPlaylist({ owner, playlistId, songId }) {
    await this.verifyPlaylistAccess(playlistId, owner);

    const id = nanoid(16);

    const queryCheckSongs = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    const resultCheckSongs = await this._pool.query(queryCheckSongs);
    if (!resultCheckSongs.rows.length) {
      throw new NotFoundError('Id lagu tidak valid');
    }

    await this.verifyPlaylistOwner(owner);
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan ke dalam playlist');
    }
    return result.rows[0].id;
  }

  async getSongsFromPlaylistById({ owner, playlistId }) {
    await this.verifyPlaylistExists(playlistId);
    await this.verifyPlaylistOwner(owner);
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists INNER JOIN users ON playlists.owner = users.id WHERE playlists.id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    const querySongs = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM playlists INNER JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id INNER JOIN songs ON songs.id = playlist_songs.song_id WHERE playlists.id = $1',
      values: [playlistId],
    };

    const resultSong = await this._pool.query(querySongs);

    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
      username: result.rows[0].username,
      songs: resultSong.rows,
    };
  }

  async deleteSongByIdFromPlaylist(owner, songId) {
    await this.verifyPlaylistOwner(owner);

    const query = {
      text: 'DELETE FROM playlist_songs WHERE song_id = $1 RETURNING id',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu di dalam playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE owner = $1',
      values: [owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Aktivitas gagal ditambahkan');
    }
  }

  async getActivities(userId, id) {
    await this.verifyPlaylistExists(id);
    await this.verifyPlaylistAccess(id, userId);

    const query = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
      FROM users
      INNER JOIN playlist_song_activities
      ON users.id = playlist_song_activities.user_id
      INNER JOIN songs
      ON songs.id = playlist_song_activities.song_id
      WHERE playlist_song_activities.user_id = $1 AND playlist_song_activities.playlist_id = $2`,
      values: [userId, id],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async verifySongExists(songId) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Id lagu tidak ditemukan');
    }
  }

  async verifyPlaylistExists(playlistId) {
    const queryPlaylist = {
      text: `SELECT playlists.id, playlists.name, users.username AS username
      FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const resultPlaylist = await this._pool.query(queryPlaylist);

    const querySong = {
      text: `SELECT songs.id, songs.title, songs.performer
      FROM playlists
      INNER JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id
      INNER JOIN songs ON songs.id = playlist_songs.song_id
      WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const resultSong = await this._pool.query(querySong);

    if (!resultSong.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    if (!resultPlaylist.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
  }
}

module.exports = PlaylistSongsService;
