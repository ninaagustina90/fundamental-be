const AuthorizationError = require('../../exceptions/authorizationError');
const NotFoundError = require('../../exceptions/notFoundError');

const autoBind = require('auto-bind').default; // ✅ ambil fungsi default agar tidak kena TypeError

class ExportsHandler {
  constructor(producerService, playlistService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistService;
    this._validator = validator;

    autoBind(this); // 🎯 pastikan semua method tetap terikat ke instance
  }

  async postExportPlaylistHandler(request, h) {
      try {
          // Validate the request payload
          this._validator.validateExportPlaylistPayload(request.payload);

          const { id: userId } = request.auth.credentials; // Get the user ID from the token
          const { playlistId } = request.params; // Get the playlist ID from the request parameters

          // Verify that the user is the owner of the playlist
          await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

          // Prepare the message for the export
          const message = {
              playlistId,
              targetEmail: request.payload.targetEmail,
          };

          // Send the message to the producer service
          await this._producerService.sendMessage(
              'export:playlists',
              JSON.stringify(message)
          );

          // Return a success response
          return h.response({
              status: 'success',
              message: 'Permintaan Anda sedang kami proses',
          }).code(201);
      } catch (error) {
          console.error('postExportPlaylistHandler error:', error);

          // Handle AuthorizationError specifically
          if (error instanceof AuthorizationError) {
              return h.response({
                  status: 'fail',
                  message: 'Anda tidak berhak mengakses resource ini',
              }).code(403); // 403 Forbidden
          }

          // Handle other errors
          return h.response({
              status: 'error',
              message: 'Maaf, terjadi kegagalan pada server kami.',
          }).code(500);
      }
  }

}

module.exports = ExportsHandler;
