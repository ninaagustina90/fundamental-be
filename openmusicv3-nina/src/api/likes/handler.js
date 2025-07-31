const autoBind = require('auto-bind').default;

class LikesHandler {
  constructor(service, albumsService) {
    this._service = service;
    this._albumsService = albumsService;

    autoBind(this);
  }

  async postLikeAlbumHandler(request, h) {
    try {
      const { id: userId } = request.auth.credentials;
      const { id: albumId } = request.params;

      await this._service.verifyUser(userId);  // Tambahan validasi user
      await this._albumsService.verifyAlbumExist(albumId);
      await this._service.likeAlbum(userId, albumId); // Pastikan user belum like album ini

      const message = await this._service.likeAlbum(userId, albumId);

      return h.response({
        status: 'success',
        message,
      }).code(201);
    } catch (error) {
      console.error('postLikeAlbumHandler error:', error.message); // Aman & tidak mengungkap detail internal
      throw error;
    }
  }

  async getLikeAlbumHandler(request, h) {
   
    const { id: albumId } = request.params;

    const { likes, isCache } = await this._service.getAlbumLikes(albumId);

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

  async deleteLikeAlbumHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._service.unlikeAlbum(userId, albumId);

    return h.response({
      status: 'success',
      message: 'Batal menyukai album',
    }).code(200);
  }
}

module.exports = LikesHandler;
