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

  async addSongToPlaylist({ playlistId, userId, songId }) {
    // Verifikasi playlist dan akses
    await this._playlistsService.verifyPlaylistIsExist(playlistId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const id = `playlistsong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlistsongs VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    await this._cacheService.delete(`playlistsongs:${playlistId}`);
    return result.rows[0].id;
  }

  async getSongsFromPlaylist(playlistId, userId) {
    try {
      await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

      const cached = await this._cacheService.get(`playlistsongs:${playlistId}`);
      return JSON.parse(cached);
    } catch (err) {
      if (err instanceof AuthorizationError) {
        throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
      }

      const query = {
        text: `
          SELECT songs.id, songs.title, songs.performer
          FROM playlists
          INNER JOIN playlistsongs ON playlistsongs.playlist_id = playlists.id
          INNER JOIN songs ON songs.id = playlistsongs.song_id
          WHERE playlists.id = $1
        `,
        values: [playlistId],
      };

      const result = await this._pool.query(query);
      if (!result.rowCount) {
        throw new InvariantError('Lagu dari playlist tidak ditemukan');
      }

      await this._cacheService.set(`playlistsongs:${playlistId}`, JSON.stringify(result.rows));
      return result.rows;
    }
  }

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
