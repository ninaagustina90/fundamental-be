const autoBind = require('auto-bind').default;

class PlaylistsHandler {
  constructor(playlistsService, playlistSongsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._playlistSongsService = playlistSongsService;
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  // --- Playlist handlers ---

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);
    const { name } = request.payload;
    
    const { id: owner } = request.auth.credentials;
    console.log(`Creating playlist for user: ${request.auth.credentials}`);
    

    const playlistId = await this._playlistsService.addPlaylist({ name, owner });

    return h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: { playlistId },
    }).code(201);
  }

  async getPlaylistsByUserIdHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylistsByUserId(userId);

    return h.response({
      status: 'success',
      data: { playlists },
    }).code(200);
  }

  async deletePlaylistByPlaylistIdHandler(request, h) {
    const { playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._playlistsService.deletePlaylistById(playlistId, userId);

    return h.response({
      status: 'success',
      message: 'Playlist berhasil dihapus',
    }).code(200);
  }

  // --- PlaylistSongs handlers ---

  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);
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

async getSongsFromPlaylistHandler(request, h) {
    const { playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    console.log('Fetching songs for Playlist ID:', playlistId, 'User  ID:', owner);

    try {
        const songs = await this._playlistSongsService.getSongsFromPlaylist(playlistId, owner);
        
        console.log('Songs retrieved:', songs); // Log the retrieved songs

        // Check if songs is undefined or not an array
        if (!songs || !Array.isArray(songs)) {
            return h.response({
                status: 'fail',
                message: 'No songs found for the specified playlist.',
            }).code(404);
        }

        return h.response({
            status: 'success',
            data: { songs },
        }).code(200);
    } catch (error) {
        console.error('Error fetching songs from playlist:', error);
        return h.response({
            status: 'error',
            message: 'An error occurred while fetching songs.',
        }).code(500);
    }
}



  async deleteSongFromPlaylistHandler(request, h) {
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

module.exports = PlaylistsHandler;
