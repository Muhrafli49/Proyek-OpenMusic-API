const autoBind = require('auto-bind');

class UploadsHandler {
        
    constructor(albumsService, storageService, uploadsValidator) {
        this._albumsService = albumsService;
        this._storageService = storageService;
        this._uploadsValidator = uploadsValidator;

        autoBind(this);
    }

    async postCoverAlbumByIdHandler(request, h) {
        try {
            const { cover } = request.payload;
            const { id: albumId } = request.params;
    
            this._uploadsValidator.validateImageHeaders(cover.hapi.headers);
            
    
            const filename = await this._albumsService.addAlbumCover({
                albumId,
                file: cover,
                meta: cover.hapi,
            });
    
            const response = h.response({
                status: 'success',
                message: 'Cover album berhasil diupload',
                data: {
                    cover: `http://${process.env.HOST}:${process.env.PORT}/uploads/images/${filename}`,
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
            // Server ERROR!
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

module.exports = UploadsHandler;