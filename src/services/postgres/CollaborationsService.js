const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("./../../exceptions/InvariantError");

class CollaborationsService {
    constructor() {
    this._pool = new Pool();
    }

    async addCollaboration(playlistsId, userId) {
        // Pemeriksaan apakah userId ada di tabel users
        const userExistsQuery = {
            text: 'SELECT id FROM users WHERE id = $1',
            values: [userId],
        };

        const userExistsResult = await this._pool.query(userExistsQuery);

        if (!userExistsResult.rows.length) {
            throw new InvariantError('User dengan ID tersebut tidak ditemukan');
        }

        // Lanjutkan dengan menambahkan kolaborasi setelah validasi berhasil
        const id = `collab-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistsId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Kolaborasi gagal ditambahkan');
        }

        return result.rows[0].id;
    }


    async deleteCollaboration(playlistsId, userId) {
        const query = {
            text: "DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id",
            values: [playlistsId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError("Kolaborasi gagal dihapus");
        }
    }

    async verifyCollaborator(playlistsId, userId) {
        const query = {
            text: "SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2",
            values: [playlistsId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError("Kolaborasi gagal diverifikasi");
        }
    }
}

module.exports = CollaborationsService;