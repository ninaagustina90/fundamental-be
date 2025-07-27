const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/invariantError');
const NotFoundError = require('../../exceptions/notFoundError');
const { mapSongsDBToModel } = require('../../utils');

class SongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSong({ title, year, performer, genre, duration, albumId }) {
    const id = `song-${nanoid(16)}`;
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    const query = {
      text: `INSERT INTO songs 
             (id, title, year, performer, genre, duration, album_id, inserted_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
             RETURNING id`,
      values: [id, title, year, performer, genre, duration, albumId, insertedAt, updatedAt],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new InvariantError('Lagu gagal ditambahkan');

    await this._cacheService.delete('songs');
    return result.rows[0].id;
  }

  async getSongs() {
    try {
      const result = await this._cacheService.get('songs');
      return JSON.parse(result);
    } catch (err) {
      const result = await this._pool.query('SELECT id, title, performer FROM songs');
      const mappedSongs = result.rows.map(mapSongsDBToModel);

      await this._cacheService.set('songs', JSON.stringify(mappedSongs));
      return mappedSongs;
    }
  }

  async getSongById(songId) {
    try {
      const result = await this._cacheService.get(`songs:${songId}`);
      return JSON.parse(result);
    } catch (err) {
      const query = {
        text: 'SELECT * FROM songs WHERE id = $1',
        values: [songId],
      };

      const result = await this._pool.query(query);
      if (!result.rowCount) throw new NotFoundError('Lagu tidak ditemukan');

      const mappedSong = mapSongsDBToModel(result.rows[0]);
      await this._cacheService.set(`songs:${songId}`, JSON.stringify(mappedSong));

      return mappedSong;
    }
  }

  async editSongById(songId, { title, year, performer, genre, duration, albumId }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: `UPDATE songs 
             SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, 
                 album_id = $6, updated_at = $7 
             WHERE id = $8 
             RETURNING id`,
      values: [title, year, performer, genre, duration, albumId, updatedAt, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');

    await this._cacheService.delete('songs');
    await this._cacheService.delete(`songs:${songId}`);
  }

  async deleteSongById(songId) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');

    await this._cacheService.delete('songs');
    await this._cacheService.delete(`songs:${songId}`);
  }

  async verifySongIsExist(songId) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Lagu tidak ditemukan');
  }

  async getSongsByAlbumId(albumId) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapSongsDBToModel);
  }
}

module.exports = SongsService;
