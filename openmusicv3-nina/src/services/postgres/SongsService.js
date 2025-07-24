const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/invariantError');
const NotFoundError = require('../../exceptions/notFoundError');
const { mapSongsDBToModel } = require('../../utils');

class SongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`;
    const timestamp = new Date().toISOString();

    const query = {
      text: `
        INSERT INTO songs (id, title, year, genre, performer, duration, album_id, inserted_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
        RETURNING id
      `,
      values: [
        id,
        title,
        Number(year),
        genre,
        performer,
        Number(duration),
        albumId,
        timestamp,
      ],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    await this._cacheService.delete('songs');
    return result.rows[0].id;
  }

  async getSongs(title = '', performer = '') {
    try {
      const cached = await this._cacheService.get('songs');
      return JSON.parse(cached);
    } catch {
      const query = {
        text: `
          SELECT id, title, performer
          FROM songs
          WHERE title ILIKE $1 OR performer ILIKE $2
        `,
        values: [`%${title}%`, `%${performer}%`],
      };

      const result = await this._pool.query(query);
      const mapped = result.rows.map(mapSongsDBToModel);
      await this._cacheService.set('songs', JSON.stringify(mapped));
      return mapped;
    }
  }

  async getSongsByAlbumId(albumId) {
    const query = {
      text: 'SELECT * FROM songs WHERE album_id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    
    if (result.rows.length > 0) {
  
} else {
  return []
}


    return result.rows.map(mapSongsDBToModel);
  }

  async getSongById(songId) {
    try {
      const cached = await this._cacheService.get(`songs:${songId}`);
      return JSON.parse(cached);
    } catch {
      const query = {
        text: 'SELECT * FROM songs WHERE id = $1',
        values: [songId],
      };

      const result = await this._pool.query(query);
      if (!result.rowCount) {
        throw new NotFoundError('Lagu tidak ditemukan');
      }

      const mapped = mapSongsDBToModel(result.rows[0]);
      await this._cacheService.set(`songs:${songId}`, JSON.stringify(mapped));
      return mapped;
    }
  }

  async editSongById(songId, { title, year, genre, performer, duration, albumId }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: `
        UPDATE songs
        SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6, updated_at = $7
        WHERE id = $8
        RETURNING id
      `,
      values: [
        title,
        Number(year),
        genre,
        performer,
        Number(duration),
        albumId,
        updatedAt,
        songId,
      ],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }

    await this._cacheService.delete('songs');
    await this._cacheService.delete(`songs:${songId}`);
  }

  async deleteSongById(songId) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }

    await this._cacheService.delete('songs');
    await this._cacheService.delete(`songs:${songId}`);
  }

  async verifySongIsExist(id) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
  }
}

module.exports = SongsService;
