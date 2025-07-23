const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/invariantError');
const NotFoundError = require('../../exceptions/notFoundError');

class LikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async likedAlbums(userId, albumId) {
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return await this.addLike(userId, albumId);
    }

    throw new InvariantError('Anda sudah menyukai album ini');
  }

  async addLike(userId, albumId) {
    const id = `like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes (id, user_id, album_id) VALUES ($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Gagal menyukai album');
    }

    await this._cacheService.delete(`likes:${albumId}`);
    return 'Like album berhasil ditambahkan';
  }

  async getLikes(albumId) {
    try {
      const cached = await this._cacheService.get(`likes:${albumId}`);
      return {
        cache: true,
        likes: JSON.parse(cached),
      };
    } catch {
      const query = {
        text: 'SELECT COUNT(*) AS likes FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const likes = parseInt(result.rows[0]?.likes ?? '0', 10);

      await this._cacheService.set(`likes:${albumId}`, JSON.stringify(likes));
      return { cache: false, likes };
    }
  }

  async deleteLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Status like tidak ditemukan');
    }

    await this._cacheService.delete(`likes:${albumId}`);
    return 'Status like berhasil dihapus';
  }
}

module.exports = LikesService;
