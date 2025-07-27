const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/invariantError');
const AuthorizationError = require('../../exceptions/authorizationError');

class PlaylistSongsService {
  constructor(playlistsService, cacheService) {
    this._pool = new Pool();
    this._playlistsService = playlistsService;
    this._cacheService = cacheService;
  }

  // 🎶 Tambahkan lagu ke playlist (verifikasi dulu akses dan keberadaan playlist)
  async addSongToPlaylist({ playlistId, userId, songId }) {
    await this._playlistsService.verifyPlaylistIsExist(playlistId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const id = `playlistsong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlistsongs (id, playlist_id, song_id) VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    await this._cacheService.delete(`playlistsongs:${playlistId}`);
    return result.rows[0].id;
  }

  // 📃 Ambil daftar lagu dari playlist (dengan cache dan verifikasi akses)
  async getSongsFromPlaylist(playlistId, userId) {
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    try {
      const cached = await this._cacheService.get(`playlistsongs:${playlistId}`);
      return JSON.parse(cached);
    } catch {
      const query = {
        text: `
          SELECT songs.id, songs.title, songs.performer
          FROM playlistsongs
          INNER JOIN songs ON songs.id = playlistsongs.song_id
          WHERE playlistsongs.playlist_id = $1
        `,
        values: [playlistId],
      };

      const result = await this._pool.query(query);
      if (!result.rowCount) {
        throw new InvariantError('Playlist tidak memiliki lagu');
      }

      await this._cacheService.set(`playlistsongs:${playlistId}`, JSON.stringify(result.rows));
      return result.rows;
    }
  }

  // ❌ Hapus lagu dari playlist (verifikasi dulu akses dan eksistensi playlist)
  async deleteSongFromPlaylist(playlistId, songId, userId) {
    await this._playlistsService.verifyPlaylistIsExist(playlistId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
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
