const autoBind = require('auto-bind').default; // ✅ ambil fungsi default agar tidak kena TypeError

class ExportsHandler {
  constructor(producerService, playlistService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistService;
    this._validator = validator;

    autoBind(this); // 🎯 pastikan semua method tetap terikat ke instance
  }

  async postExportPlaylistSongsHandler(request, h) {
    try {
      this._validator.validateExportPlaylistPayload(request.payload);

      const { id: userId } = request.auth.credentials;
      const { playlistId } = request.params;

      await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

      const message = {
        playlistId,
        targetEmail: request.payload.targetEmail,
      };

      await this._producerService.sendMessage(
        'export:playlists',
        JSON.stringify(message)
      );

      return h.response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
      }).code(201);
    } catch (error) {
      console.error('postExportPlaylistSongsHandler error:', error);
      throw error;
    }
  }
}

module.exports = ExportsHandler;
