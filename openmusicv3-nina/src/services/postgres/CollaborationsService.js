const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/invariantError');

class CollaborationsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService ?? {
      get: async () => null,
      set: async () => {},
      delete: async () => {},
    };
  }

  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;
    const query = {
      text: `
        INSERT INTO collaborations (id, playlist_id, user_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (playlist_id, user_id) DO NOTHING
        RETURNING id
      `,
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi sudah ada atau gagal ditambahkan');
    }

    await this._deleteUserCache(userId);
    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: `
        DELETE FROM collaborations
        WHERE playlist_id = $1 AND user_id = $2
        RETURNING id
      `,
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal dihapus. ID tidak ditemukan');
    }

    await this._deleteUserCache(userId);
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: `
        SELECT id FROM collaborations
        WHERE playlist_id = $1 AND user_id = $2
      `,
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal diverifikasi');
    }
  }

  async _deleteUserCache(userId) {
    try {
      await this._cacheService.delete(`playlists:${userId}`);
    } catch (error) {
      console.warn(`⚠️ Gagal menghapus cache untuk user ${userId}: ${error.message}`);
    }
  }
}

module.exports = CollaborationsService;
