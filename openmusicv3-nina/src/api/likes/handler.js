const autoBind = require('auto-bind').default; // ⛑️ penting untuk akses fungsi default

class LikesHandler {
  constructor(likesService, albumsService) {
    this._service = likesService;
    this._albumsService = albumsService;

    autoBind(this); // 🛡️ pastikan semua method terikat ke this
  }

  async postLikeAlbumHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { id: albumId } = request.params;

      await this._albumsService.getAlbumById(albumId);
      const message = await this._service.likedAlbums(credentialId, albumId);

      return h.response({
        status: 'success',
        message,
      }).code(201);
    } catch (error) {
      console.error('postLikeAlbumHandler error:', error);
      throw error;
    }
  }

  async getLikeAlbumHandler(request, h) {
    try {
      const { id: albumId } = request.params;
      await this._albumsService.getAlbumById(albumId);

      const { cache, likes } = await this._service.getLikes(albumId);

      const response = h.response({
        status: 'success',
        data: { likes },
      });

      if (cache) response.header('X-Data-Source', 'cache');
      return response.code(200);
    } catch (error) {
      console.error('getLikeAlbumHandler error:', error);
      throw error;
    }
  }

  async deleteLikeAlbumHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { id: albumId } = request.params;

      await this._albumsService.getAlbumById(albumId);
      const message = await this._service.deleteLike(credentialId, albumId);

      return h.response({
        status: 'success',
        message,
      }).code(200);
    } catch (error) {
      console.error('deleteLikeAlbumHandler error:', error);
      throw error;
    }
  }
}

module.exports = LikesHandler;
