const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/invariantError');
const NotFoundError = require('../../exceptions/notFoundError');
const ClientError = require('../../exceptions/clientError');
const AuthenticationError = require('../../exceptions/authenticationError');

class AlbumLikeService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async likeAlbum(albumId, userId) {
    const checkAlbumQuery = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [albumId],
    };

    const albumResult = await this._pool.query(checkAlbumQuery);
    if (!albumResult.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const checkLikeQuery = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const likeResult = await this._pool.query(checkLikeQuery);
    if (likeResult.rowCount > 0) {
      throw new InvariantError('Anda sudah menyukai album ini');
    }

    const addLikeQuery = {
      text: 'INSERT INTO user_album_likes VALUES ($1, $2)',
      values: [userId, albumId],
    };
    await this._pool.query(addLikeQuery);
    
    await this._cacheService.delete(`album_likes:${albumId}`);
  }

  async unlikeAlbum(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new InvariantError('Like tidak ditemukan');
    }

    await this._cacheService.delete(`album_likes:${albumId}`);
  }

  async getAlbumLikes(albumId) {
    try { 
      const result = await this._cacheService.get(`album_likes:${albumId}`);
      const likes = parseInt(result, 10);
      return {
        likes,
        isCaached: true,
      }
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const likes = parseInt(result.rows[0].count, 10);

      await this._cacheService.set(`album_likes:${albumId}`, likes);

      return { 
        likes,
        isCached: false,
      };
    }
  }

  async isUserLikedAlbum(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
   }
   
   async verifyUser(userId) {
    const query = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new AuthenticationErrorr('Anda tidak berhak menyukai album ini');
    }
  }
}

module.exports = AlbumLikeService;