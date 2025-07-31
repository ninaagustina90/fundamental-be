const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/invariantError');
const AuthorizationError = require('../../exceptions/authorizationError');
const NotFoundError = require('../../exceptions/notFoundError');

class PlaylistSongsService {
  constructor(playlistsService, cacheService) {
    this._pool = new Pool();
    this._playlistsService = playlistsService;
    this._cacheService = cacheService;
  }

  // 🎶 Tambah lagu ke playlist
  async addSongToPlaylist({ playlistId, userId, songId }) {
    try {
    // await this._playlistsService.verifyPlaylistIsExist(playlistId);
    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
    }catch(error) {
      throw new AuthorizationError('Anda tidak berhak mengakses playlist ini');
    }

    try{
    const id = `playlistsong-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO playlist_songs (id, playlist_id, song_id)
             VALUES ($1, $2, $3) ON CONFLICT (playlist_id, song_id) DO NOTHING RETURNING id`,
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
  }catch(error){
    if (!result.rowCount) {
      throw new InvariantError('Lagu sudah ada di playlist atau gagal ditambahkan');
    }
  }
    //await this._cacheService.delete(`playlistsongs:${playlistId}`);
    return result.rows[0];
  }

  // 📃 Ambil daftar lagu dari playlist
  async getSongsFromPlaylist(playlistId, userId) {
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    try {
        const cached = await this._cacheService.get(`playlistsongs:${playlistId}`);
        if (cached) {
            return JSON.parse(cached); // Return cached songs if available
        }
    } catch (error) {
        console.error('Error retrieving from cache:', error);
        // Proceed to query the database even if cache retrieval fails
    }

    const query = {
        text: `
            SELECT songs.id, songs.title, songs.performer
            FROM playlist_songs
            INNER JOIN songs ON songs.id = playlist_songs.song_id
            WHERE playlist_songs.playlist_id = $1
        `,
        values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
        // Return an empty array if no songs are found
        return [];
    }

    await this._cacheService.set(`playlistsongs:${playlistId}`, JSON.stringify(result.rows));
    return result.rows;
}


  // ❌ Hapus lagu dari playlist
  async deleteSongFromPlaylist(playlistId, songId, userId) {
    await this._playlistsService.verifyPlaylistIsExist(playlistId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const query = {
      text: `DELETE FROM playlist_songs
             WHERE playlist_id = $1 AND song_id = $2 RETURNING id`,
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus dari playlist. ID tidak ditemukan');
    }

    await this._cacheService.delete(`playlistsongs:${playlistId}`);
  }
}

module.exports = PlaylistSongsService;
