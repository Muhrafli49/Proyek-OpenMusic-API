const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');
const SongsValidator = require('../../validator/albums');

class SongsHandler {
    constructor(SongsService, SongsValidator) {
        this._songsService = SongsService;
        this._songsValidator = SongsValidator;

        this.postSongHandler = this.postSongHandler.bind(this);
        this.getSongsHandler = this.getSongsHandler.bind(this);
        this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
        this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
        this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
        
        autoBind(this);
    }


    async postSongHandler(request, h) {
        try {
        this._songsValidator.validateSongsPayload(request.payload);
        const {title, year, performer, genre, duration, album_id} = request.payload;
    
        const songId = await this._songsService.addSong({
            title, year, performer, genre, duration, album_id});
    
        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil ditambahkan',
            data: {
                songId,
            },
        });
        response.code(201);
        return response;
        } catch (error) {
            if (error instanceof ClientError) {
            const response = h.response({
                status: 'fail',
                message: error.message,
            });
            response.code(error.statusCode);
            return response;
        }

        const response = h.response({
            status: 'error',
            message: 'Maaf, terjadi kegagalan pada server kami.',
        });
        response.code(500);
        console.error(error);
        return response;
        }
    }


    async getSongsHandler() {
        const songs = await this._songsService.getSongs();
        return {
            status: 'success',
            data: {
                songs,
            },
        };
    }


    async getSongByIdHandler(request, h) {
        try {
        const { id } = request.params;
        const song = await this._songsService.getSongById(id);
        return {
            status: 'success',
            data: {
                song,
            },
        };
        } catch (error) {
        if (error instanceof ClientError) {
            const response = h.response({
                status: 'fail',
                message: error.message,
            });
            response.code(error.statusCode);
            return response;
        }
    

        const response = h.response({
            status: 'error',
            message: 'Maaf, terjadi kegagalan pada server kami.',
        });
        response.code(500);
        console.error(error);
        return response;
        }
    }


    async putSongByIdHandler(request, h) {
        try {
        this._songsValidator.validateSongsPayload(request.payload);
        const { id } = request.params;

        await this._songsService.editSongById(id, request.payload);

        return {
        status: 'success',
        message: 'Lagu berhasil diperbarui',
        };
        } catch (error) {
        if (error instanceof ClientError) {
        const response = h.response({
            status: 'fail',
            message: error.message,
        });
        response.code(error.statusCode);
        return response;
        }


        const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
        });
        response.code(500);
        console.error(error);
        return response;
        }
    }

    async deleteSongByIdHandler(request, h) {
        try {
        const { id } = request.params;
        await this._songsService.deleteSongById(id);
        return {
        status: 'success',
        message: 'Lagu berhasil dihapus',
        };
        } catch (error) {
            if (error instanceof ClientError) {
            const response = h.response({
                status: 'fail',
                message: error.message,
            });
            response.code(error.statusCode);
            return response;
            }
    

        const response = h.response({
            status: 'error',
            message: 'Maaf, terjadi kegagalan pada server kami.',
        });
        response.code(500);
        console.error(error);
        return response;
        }
    }
}
    
module.exports = SongsHandler;