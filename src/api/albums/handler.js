const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError')


class AlbumsHandler {
    constructor(AlbumsService, AlbumsValidator ) {
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

    async getAlbumByIdHandler(request) {
            const { id } = request.params;
            const album = await this._albumsService.getAlbumById(id);

            const coverUrl = (album.cover) ? `http://${process.env.HOST}:${process.env.PORT}/uploads/images/${album.cover}` : album.cover;


            const data = {
                id: album.id,
                name: album.name,
                year: album.year,
                coverUrl,
            }
        
            return {
                status: 'success',
                data: {
                    album: {
                        ...data,
                    },
                },
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

    // likes albums

    async postAlbumLikesByIdHandler(request, h) {

        const { id: albumId } = request.params
        const { id: credentialId } = request.auth.credentials
    
        await this._albumsService.addAlbumLike(albumId, credentialId)
    
        const response = h.response({
            status: 'success',
            message: 'Anda menyukai album ini',
        })
    
        response.code(201)
    
        return response

    }
    

    async getAlbumLikesByIdHandler(request, h) {
        const { id: albumId } = request.params

        const { like, source} = await this._albumsService.getAlbumLikesById(albumId)
    
        const response = h.response({
            status: 'success',
            data: {
                likes: like,
            },
        })
    
        response.code(200)
        response.header('X-Data-Source', source)
    
        return response
        
    }
    async deleteLikeAlbumByIdHandler(request) {
        const { id: albumId } = request.params
        const { id: credentialId } = request.auth.credentials
    
        await this._albumsService.deleteAlbumLike(albumId, credentialId)
    
        return {
            status: 'success',
            message: 'Anda berhasil menghapus like',
        }
    }
}

module.exports = AlbumsHandler;
