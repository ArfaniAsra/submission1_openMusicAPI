const autoBind = require('auto-bind');
const config = require('../../utils/config');

class UploadsHandler {
  constructor(service, albumsService, validator) {
    this._service = service;
    this._albumsService = albumsService;
    this._validator = validator;

    autoBind(this);
  }

  async postUploadImageHandler(request, h) {
    const { cover: data } = request.payload;
    const { albumId: id } = request.params;
    this._validator.validateImageHeaders(data.hapi.headers);

    const filename = await this._service.writeFile(data, data.hapi);
    const fileLocation = `http://${config.app.host}:${config.app.port}/upload/images/${filename}`;
    await this._albumsService.addCoverAlbum({ id, coverUrl: fileLocation });

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
