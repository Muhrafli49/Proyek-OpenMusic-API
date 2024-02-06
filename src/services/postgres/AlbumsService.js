const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapAlbumsToModel } = require('../../utils/albums');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');


class AlbumsService {
    constructor(cacheService) {
        this._pool = new Pool();
        this._cacheService = cacheService;
    }

    async addAlbum({ name, year, coverAlbum = null }) {
        const id = `album-${nanoid(16)}`;
        const createdAt = new Date().toISOString();

        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
            values: [id, name, year, coverAlbum, createdAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Album gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    async getAlbums() {
        const result = await this._pool.query('SELECT id, name, year FROM albums');
        return result.rows;
    }

    async getAlbumById(id) {
        const queryAlbum = {
            text: 'SELECT id, name, year FROM albums WHERE id = $1',
            values: [id],
        };

        const resultAlbum = await this._pool.query(queryAlbum);

        if (!resultAlbum.rowCount) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        return resultAlbum.rows.map(mapAlbumsToModel)[0];
    }

    async editAlbumById(id, { name, year,  coverAlbum = null}) {
        const updatedAt = new Date().toISOString();

        const query = {
            text: 'UPDATE albums SET name = $1, year = $2, "coverUrl" = $3,  updated_at = $4 WHERE id = $5 RETURNING id',
            values: [name, year, coverAlbum, updatedAt, id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
        }
    }

    async editCoverAlbumById(id, coverAlbum) {
        const query = {
            text: 'UPDATE albums SET coverUrl = $1 WHERE id = $2 RETURNING id',
            values: [id, coverAlbum],
        };
        const { rowCount } = await this._pool.query(query);
    
        if (!rowCount) {
            throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan.');
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
        }
    }

    async addAlbumLike(albumId, userId) {
        const id = `like-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
            values: [id, albumId, userId],
        };
        const { rows } = await this._pool.query(query);
    
        if (!rows[0].id) {
            throw new InvariantError('Gagal menyukai album.');
        }
    
        await this._cacheService.delete(`likes:${albumId}`);
    }
    
    async deleteAlbumLike(albumId, userId) {
        const query = {
            text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
            values: [albumId, userId],
        };
        const { rows } = await this._pool.query(query);
    
        if (!rows[0].id) {
            throw new InvariantError('Gagal batal menyukai album.');
        }
    
        await this._cacheService.delete(`likes:${albumId}`);
    }
    
    async getAlbumLikesById(albumId) {
        try {
        const result = await this._cacheService.get(`likes:${albumId}`);
        return ({
            isCache: true,
            likeCount: JSON.parse((result)),
        });
        } catch (error) {
        const query = {
            text: 'SELECT COUNT(album_id) FROM user_album_likes WHERE album_id = $1 GROUP BY album_id',
            values: [albumId],
        };
        const { rows } = await this._pool.query(query);
    
        await this._cacheService.set(`likes:${albumId}`, JSON.stringify(parseInt(rows[0].count, 10)));
        return ({
            isCache: false,
            likeCount: parseInt(rows[0].count, 10),
        });
        }
    }
    
    async searchAlbumById(id) {
        const query = {
            text: 'SELECT id FROM albums WHERE id = $1',
            values: [id],
        };
        const { rowCount } = await this._pool.query(query);
    
        if (!rowCount) {
            throw new NotFoundError('Id tidak ditemukan.');
        }
    }
    
    async searchAlbumLikeById(albumId, userId) {
        const query = {
            text: 'SELECT id FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
            values: [albumId, userId],
        };
        const { rowCount } = await this._pool.query(query);
    
        return rowCount;
    }
}

module.exports = AlbumsService;