const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError')
const AlbumsValidator = require('../../validator/albums')


class AlbumsHandler {
    constructor(AlbumsService, AlbumsValidator) {
        this._albumsService = AlbumsService;
        this._albumsValidator = AlbumsValidator;

        this.postAlbumHandler = this.postAlbumHandler.bind(this);
        this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
        this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
        this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);

        autoBind(this);
    }

    async postAlbumHandler(request, h) {
        try {
            this._albumsValidator.validateAlbumsPayload(request.payload);
            const { name, year } = request.payload;

            const albumId = await this._albumsService.addAlbum({ name, year });

            const response = h.response({
                status: 'success',
                message: 'Album berhasil ditambahkan',
                data: {
                    albumId,
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

    async getAlbumByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const album = await this._albumsService.getAlbumById(id);
            return {
                status: 'success',
                data: {
                    album,
                },
            };
        } catch (error) {
            if (error instanceof ClientError) {
                return h.response({
                    status: 'fail',
                    message: error.message,
                }).code(error.statusCode);
            }
    
            console.error(error);
            return h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            }).code(500);
        }
    }
    
    async putAlbumByIdHandler(request, h) {
        try {
            this._albumsValidator.validateAlbumsPayload(request.payload);
            const { id } = request.params;

            await this._albumsService.editAlbumById(id, request.payload);

            return {
                status: 'success',
                message: 'Album berhasil diperbarui',
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

    async deleteAlbumByIdHandler(request, h) {
        try {
            const { id } = request.params;
            await this._albumsService.deleteAlbumById(id);
            return {
                status: 'success',
                message: 'Album berhasil dihapus',
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

module.exports = AlbumsHandler;
