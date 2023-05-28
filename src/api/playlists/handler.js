const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    console.log('terbaca');
    this._validator.validatePlaylistPayload(request.payload);
    console.log('validator');
    const { name } = request.payload;
    console.log(`name:${name}`);
    const { id: credentialId } = request.auth.credentials;
    console.log(`credentialId:${credentialId}`);

    const playlistId = await this._service.addPlaylist({ name, owner: credentialId });
    console.log(`playlistId:${playlistId}`);

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    console.log(credentialId);
    const playlists = await this._service.getPlaylists({ owner: credentialId });
    console.log(playlists);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deletePlaylistById(id);

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil dihapus',
    });
    response.code(200);
    return response;
  }
}

module.exports = PlaylistsHandler;
