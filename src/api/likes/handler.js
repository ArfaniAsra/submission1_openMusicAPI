const autoBind = require('auto-bind');

class LikesHandler {
  constructor(service, albumsService) {
    this._service = service;
    this._albumsService = albumsService;

    autoBind(this);
  }

  async postLikeHandler(request, h) {
    const { albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._albumsService.getAlbumById(albumId);
    await this._service.addLike(credentialId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Anda menyukai album ini',
    });
    response.code(201);
    return response;
  }

  async deleteLikeHandler(request, h) {
    const { albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.deleteLike(credentialId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Like pada album ini berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  async getLikeByIdHandler(request, h) {
    const { albumId } = request.params;
    const { likes, isCache } = await this._service.getLikeById(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    if (isCache) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }
}

module.exports = LikesHandler;
