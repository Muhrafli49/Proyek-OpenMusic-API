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
            this._uploadsValidator.validateImageSize(cover._data.length);
    
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
            throw error;
        }
    }
}

module.exports = UploadsHandler;