const autoBind = require('auto-bind').default; // ✅ ambil fungsi default agar tidak TypeError

class PlaylistsHandler {
  constructor(playlistsService, playlistSongsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._playlistSongsService = playlistSongsService;
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this); // 🛠️ mengikat semua method ke instance class
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePostPlaylistPayload(request.payload);

      const { name } = request.payload;
      const { id: owner } = request.auth.credentials;

      const playlistId = await this._playlistsService.addPlaylist({ name, owner });

      return h.response({
        status: 'success',
        message: 'Playlist berhasil ditambahkan',
        data: { playlistId },
      }).code(201);
    } catch (error) {
      console.error('postPlaylistHandler error:', error);
      throw error;
    }
  }

  async getPlaylistsByUserIdHandler(request, h) {
    try {
      const { id: userId } = request.auth.credentials;
      const playlists = await this._playlistsService.getPlaylistsByUserId(userId);

      return h.response({
        status: 'success',
        data: { playlists },
      }).code(200);
    } catch (error) {
      console.error('getPlaylistsByUserIdHandler error:', error);
      throw error;
    }
  }

  async deletePlaylistByPlaylistIdHandler(request, h) {
    try {
      const { id: userId } = request.auth.credentials;
      const { playlistId } = request.params;

      await this._playlistsService.deletePlaylistByPlaylistId({ playlistId, userId });

      return h.response({
        status: 'success',
        message: 'Playlist berhasil dihapus',
      }).code(200);
    } catch (error) {
      console.error('deletePlaylistByPlaylistIdHandler error:', error);
      throw error;
    }
  }

  async postSongToPlaylistHandler(request, h) {
    try {
      this._validator.validatePostSongToPlaylistPayload(request.payload);

      const { songId } = request.payload;
      const { playlistId } = request.params;
      const { id: userId } = request.auth.credentials;

      await this._songsService.verifySongIsExist(songId);

      await this._playlistSongsService.addSongToPlaylist({
        playlistId,
        songId,
        userId,
      });

      return h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke playlist',
      }).code(201);
    } catch (error) {
      console.error('postSongToPlaylistHandler error:', error);
      throw error;
    }
  }

  async getSongsFromPlaylistHandler(request, h) {
    try {
      const { playlistId } = request.params;
      const { id: userId } = request.auth.credentials;

      const songs = await this._playlistSongsService.getSongsFromPlaylist(playlistId, userId);

      return h.response({
        status: 'success',
        data: { songs },
      }).code(200);
    } catch (error) {
      console.error('getSongsFromPlaylistHandler error:', error);
      throw error;
    }
  }

  async deleteSongFromPlaylistHandler(request, h) {
    try {
      this._validator.validateDeleteSongFromPlaylistPayload(request.payload);

      const { songId } = request.payload;
      const { playlistId } = request.params;
      const { id: userId } = request.auth.credentials;

      await this._playlistSongsService.deleteSongFromPlaylist(
        playlistId,
        songId,
        userId
      );

      return h.response({
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
      }).code(200);
    } catch (error) {
      console.error('deleteSongFromPlaylistHandler error:', error);
      throw error;
    }
  }
}

module.exports = PlaylistsHandler;
