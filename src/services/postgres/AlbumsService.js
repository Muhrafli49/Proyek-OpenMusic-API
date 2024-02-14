const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapAlbumsToModel } = require('../../utils/albums');
const { mapSongsToModel} = require('../../utils/songs');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');


class AlbumsService {
    constructor(cacheService, storageService) {
        this._pool = new Pool();
        this._cacheService = cacheService;
        this._storageService = storageService
    }

    async addAlbum({ name, year }) {
        const id = `album-${nanoid(16)}`;
        const createdAt = new Date().toISOString();

        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3, $4) RETURNING id',
            values: [id, name, year, createdAt],
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

    async editAlbumById(id, { name, year }) {
        const updatedAt = new Date().toISOString();

        const query = {
            text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
            values: [name, year, updatedAt, id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
        }
    }

    async getSongsByAlbumId(albumId) {
        const query = {
          text: 'SELECT * FROM songs where album_id = $1',
            values: [albumId],
        }
    
        const result = await this._pool.query(query)
    
        return result.rows.map(mapSongsToModel)
    }

    // async editCoverAlbumById(id, coverUrl) {
    //     const query = {
    //         text: 'UPDATE albums SET id = $1 WHERE coverUrl = $2 RETURNING id',
    //         values: [id, coverUrl],
    //     };
    //     const { rowCount } = await this._pool.query(query);
    
    //     if (!rowCount) {
    //         throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan.');
    //     }
    // }

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
    async getAlbumCoverById(id) {
        const query = {
            text: 'SELECT path FROM album_covers WHERE album_id = $1 LIMIT 1',
            values: [id],
        }
    
        const result = await this._pool.query(query)
    
        if (!result.rowCount) {
            return null
        }
    
        return result.rows[0]
    }

    // likes album
    async addAlbumLike(albumId, userId) {
        const id = nanoid(16)

        const checkAlbum = {
            text: 'SELECT id FROM albums WHERE id = $1',
            values: [albumId],
        }
        const checkAlbumResult = await this._pool.query(checkAlbum)
        if (!checkAlbumResult.rowCount) {
            throw new NotFoundError('Album tidak ditemukan')
        }
    
        const checkQuery = {
            text: 'SELECT COUNT(*) FROM user_album_likes WHERE user_id = $2 AND album_id = $1',
            values: [albumId, userId],
        }
        const checkResult = await this._pool.query(checkQuery)
        if (checkResult.rows[0].count > 0) {
            throw new InvariantError('Anda telah menyukai album ini sebelumnya')
        }
    
        const insertQuery = {
            text: 'INSERT INTO user_album_likes VALUES($1, $2, $3)',
            values: [id, albumId, userId],
        }
        const result = await this._pool.query(insertQuery)
        if (!result.rowCount) {
            throw new InvariantError('Gagal menambahkan like')
        }
    
        await this._cacheService.delete(`albumslike:${albumId}`)
    
        return result.rows[0]
    }
    
    async deleteAlbumLike(albumId, userId) {
        const query = {
            text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
            values: [albumId, userId],
        };
        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('User menghapus like');
        }
    
        await this._cacheService.delete(`albumslike:${albumId}`);
    }
    
    async getAlbumLikesById(albumId) {
        try {
        const result = await this._cacheService.get(`albumslike:${albumId}`);
        
        return {
            like: JSON.parse(result),
            source: 'cache',
        }
        } catch (error) {
        const query = {
            text: 'SELECT COUNT(*) AS total_likes FROM user_album_likes WHERE album_id = $1',
            values: [albumId],
        };

        const result = await this._pool.query(query);
    
        const totalLikes = result.rows.length > 0 ? parseInt(result.rows[0].total_likes, 10) : 0

        await this._cacheService.set(
            `albumslike:${albumId}`,
            JSON.stringify(totalLikes)
        )

        return {
            like: totalLikes,
        }
        }
    } 
    // albumservice 
    async addAlbumCover({ albumId, file, meta }) {
        try {
            const filename = await this._storageService.writeFile(file, meta);

            const query = {
                text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
                values: [filename, albumId],
            };

            const result = await this.pool.query(query);
            if (!result.rowCount) {
                throw new NotFoundError('Gagal mengubah cover album, Id tidak ditemukan!');
            }

            return filename;
        } catch (error) {
            // Tambahkan penanganan kesalahan di sini jika diperlukan
            console.error(error);
            throw new Error('Gagal menambahkan cover album.');
        }
    }

}

module.exports = AlbumsService;