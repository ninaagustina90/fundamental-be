const autoBind = require('auto-bind').default;

class PlaylistSongsHandler {
  constructor(playlistSongsService, playlistsService, songsService, validator) {
    this._playlistSongsService = playlistSongsService;
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validatePostSongToPlaylistPayload(request.payload);

    const { songId } = request.payload;
    const { playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._songsService.verifySongIsExist(songId);
    await this._playlistSongsService.addSongToPlaylist({ playlistId, userId, songId });

    return h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    }).code(201);
  }

  async getSongsHandler(request, h) {
    const { playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    const songs = await this._playlistSongsService.getSongsFromPlaylist(playlistId, userId);

    return h.response({
      status: 'success',
      data: { songs },
    }).code(200);
  }

  async deleteSongHandler(request, h) {
    this._validator.validateDeleteSongFromPlaylistPayload(request.payload);

    const { songId } = request.payload;
    const { playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._playlistSongsService.deleteSongFromPlaylist(playlistId, songId, userId);

    return h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    }).code(200);
  }
}

module.exports = PlaylistSongsHandler;
