const { Pool } = require('pg');

class ExportSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async getExportSongs(playlistId, userId) {
    await this.verifyPlaylistOwner(userId);

    const queryPlaylist = {
      text: `SELECT playlists.id AS id, playlists.name AS name, users.username AS username
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

    return {
      playlist: {
        id: resultPlaylist.rows[0].id,
        name: resultPlaylist.rows[0].name,
        songs: resultSong.rows,
      },
    };
  }

  async verifyPlaylistOwner(userId) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE owner = $1',
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount < 1) {
      throw new Error('Anda tidak berhak mengekspor resource ini');
    }
  }
}

module.exports = ExportSongsService;
