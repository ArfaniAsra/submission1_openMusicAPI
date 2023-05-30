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
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifySongExists(songId);
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.addActivity(playlistId, songId, credentialId, 'add');
    await this._service.addSongToPlaylist({
      owner: credentialId, playlistId, songId,
    });
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
    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.addActivity(playlistId, songId, credentialId, 'delete');
    await this._service.deleteSongByIdFromPlaylist(credentialId, songId);

    const response = h.response({
      status: 'success',
      message: 'Lagu dari playlist berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  async getActivitiesHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const activitiesResult = await this._service.getActivities(credentialId, id);

    return {
      status: 'success',
      data: {
        playlistId: id,
        activities: activitiesResult,
      },
    };
  }
}

module.exports = PlaylistSongsHandler;
