const autoBind = require('auto-bind');

class PlaylistSongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistSongsHandler(request, h) {
    this._validator.validatePlaylistSongsPayload(request.payload);
    const { songId } = request.payload;
    // console.log(`songId: ${songId}`);
    const { playlistId } = request.params;
    console.log(`playlistId: ${playlistId}`);
    const { id: credentialId } = request.auth.credentials;
    console.log(`credentialId: ${credentialId}`);
    await this._service.addSongToPlaylist({
      owner: credentialId, playlistId, songId,
    });
    console.log('addSongToPlaylist selesai');
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistByIdSongsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;
    const playlists = await this._service.getSongsFromPlaylistById({
      owner: credentialId, playlistId,
    });

    const response = h.response({
      status: 'success',
      data: {
        playlist: playlists,
      },
    });
    response.code(200);
    return response;
  }

  async deletePlaylistByIdSongsHandler(request, h) {
    this._validator.validatePlaylistSongsPayload(request.payload);
    const { id } = request.params;
    this._service.deleteSongByIdFromPlaylist(id);

    const response = h.response({

      status: 'success',
      message: 'Lagu dari playlist berhasil dihapus',
    });
    response.code(200);
    return response;
  }
}

module.exports = PlaylistSongsHandler;
