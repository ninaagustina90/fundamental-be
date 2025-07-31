const autoBind = require('auto-bind').default; // ⛑️ pastikan ambil fungsi .default
const config = require('../../utils/config');

class UploadsHandler {
  constructor(service, albumsService, validator) {
    this._service = service;
    this._albumsService = albumsService;
    this._validator = validator;

    autoBind(this); // 🛡️ mengikat semua method ke instance class
  }

  async postUploadImageHandler(request, h) {
    try {
      const { cover } = request.payload;
      const { id: albumId } = request.params;

      this._validator.validateImageHeaders(cover.hapi.headers);

      await this._albumsService.getAlbumById(albumId);
      const filename = await this._service.writeFile(cover, cover.hapi);
      console.log(`File uploaded: ${filename}`); 

      const fileUrl = `http://${config.app.host}:${config.app.port}/upload/images/${filename}`;
      await this._albumsService.addCoverUrlAlbum(albumId, fileUrl);

      return h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
        data: { fileLocation: fileUrl },
      }).code(201);
    } catch (error) {
      console.error('postUploadImageHandler error:', error);
      throw error;
    }
  }
}

module.exports = UploadsHandler;
