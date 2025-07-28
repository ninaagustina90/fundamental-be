const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/authorizationError');
const InvariantError = require('../../exceptions/invariantError');
const NotFoundError = require('../../exceptions/notFoundError');

class PlaylistsService {
  constructor(collaborationsService, cacheService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
    this._cacheService = cacheService;
  }

  // 📥 Tambah playlist baru
  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new InvariantError('Playlist gagal ditambahkan');

    // 🔧 Hindari error jika Redis tidak tersedia
    try {
      await this._cacheService.delete(`playlists:${owner}`);
    } catch (error) {
      console.warn('Gagal menghapus cache, tapi playlist tetap dibuat:', error.message);
    }

    return result.rows[0].id;
  }

  // 📃 Ambil semua playlist yang dimiliki dan dibagikan melalui kolaborasi
  async getPlaylists(userId) {
    try {
      const cached = await this._cacheService.get(`playlists:${userId}`);
      return JSON.parse(cached);
    } catch {
      const query = {
        text: `
          SELECT playlists.id, playlists.name, users.username
          FROM playlists
          JOIN users ON playlists.owner = users.id
          LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
          WHERE playlists.owner = $1 OR collaborations.user_id = $1
        `,
        values: [userId],
      };

      const result = await this._pool.query(query);
      try {
        await this._cacheService.set(`playlists:${userId}`, JSON.stringify(result.rows));
      } catch (error) {
        console.warn('Gagal menyimpan cache playlist:', error.message);
      }

      return result.rows;
    }
  }

  // 👤 Ambil playlist milik user (non-kolaboratif)
  async getPlaylistsByUserId(userId) {
    const query = {
      text: `
        SELECT playlists.id, playlists.name, users.username
        FROM playlists
        LEFT JOIN users ON playlists.owner = users.id
        WHERE playlists.owner = $1
      `,
      values: [userId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  // 🗑️ Hapus playlist (verifikasi kepemilikan terlebih dahulu)
  async deletePlaylistById(playlistId, userId) {
    await this.verifyPlaylistOwner(playlistId, userId);

    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Playlist gagal dihapus. ID tidak ditemukan');

    try {
      await this._cacheService.delete(`playlists:${userId}`);
    } catch (error) {
      console.warn('Gagal menghapus cache setelah delete playlist:', error.message);
    }
  }

  // 🔎 Ambil detail satu playlist berdasarkan ID
  async getPlaylistById(id) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Playlist tidak ditemukan');

    return result.rows[0];
  }

  // 🛡️ Verifikasi user adalah pemilik playlist
  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Playlist tidak ditemukan');

    if (result.rows[0].owner !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  // 📌 Cek keberadaan playlist berdasarkan ID
  async verifyPlaylistIsExist(playlistId) {
    const query = {
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Playlist tidak ditemukan');
  }

  // 🔒 Verifikasi akses terhadap playlist (owner atau kolaborator)
  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      await this._collaborationsService.verifyCollaborator(playlistId, userId);
    }
  }
}

module.exports = PlaylistsService;
