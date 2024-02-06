const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError')


class AlbumsHandler {
    constructor(AlbumsService, AlbumsValidator) {
        this._albumsService = AlbumsService;
        this._albumsValidator = AlbumsValidator;

        this.postAlbumHandler = this.postAlbumHandler.bind(this);
        this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
        this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
        this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
        this.postAlbumLikesByIdHandler = this.postAlbumLikesByIdHandler.bind(this);
        this.getAlbumLikesByIdHandler = this.getAlbumLikesByIdHandler.bind(this);

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
            const { id, coverUrl } = request.params;
            const album = await this._albumsService.getAlbumById(id, coverUrl);
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

    async postAlbumLikesByIdHandler(request, h) {
        try {
            const { id: userId } = request.auth.credentials;
    
            // Pastikan bahwa albumId yang dikirimkan adalah nilai valid dari kolom 'id'
            const album = await this._albumsService.getAlbumById(request.params.id);
            const albumId = album.id;
    
            this._albumsValidator.validateAlbumLikesPayload({ albumId, userId });
    
            const like = await this._albumsService.searchAlbumLikeById(albumId, userId);
    
            if (!like) {
                await this._albumsService.addAlbumLike(albumId, userId);
                const response = h.response({
                    status: 'success',
                    message: 'Berhasil menyukai album.',
                });
                response.code(201);
                return response;
            }
    
            await this._albumsService.deleteAlbumLike(albumId, userId);
            const response = h.response({
                status: 'success',
                message: 'Berhasil membatalkan menyukai album.',
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
    

    async getAlbumLikesByIdHandler(request, h) {
        try {
            const { id: albumId } = request.params;
            await this._albumsService.searchAlbumById(albumId);
            const { isCache, likeCount } = await this._albumsService.getAlbumLikesById(albumId);
            const response = h.response({
                status: 'success',
                data: {
                    likes: likeCount,
                },
            });
            if (isCache) {
                response.header('X-Data-Source', 'cache');
            }
            return response;
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
}

module.exports = AlbumsHandler;
