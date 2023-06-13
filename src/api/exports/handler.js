const autoBind = require('auto-bind');

class ExportSongsHandler {
  constructor(service, playlistSongsService, playlistsService, validator) {
    this._service = service;
    this._playlistSongsService = playlistSongsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportSongsHandler(request, h) {
    this._validator.validateExportSongsPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._playlistSongsService.verifyPlaylistExists(playlistId);

    const message = {
      userId: request.auth.credentials.id,
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._service.sendMessage('export:playlist', JSON.stringify(message));
    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportSongsHandler;
