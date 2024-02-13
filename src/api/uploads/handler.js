const autoBind = require('auto-bind');


class UploadsHandler {
    constructor(albumsService, uploadsValidator, storageService) {
        this._albumsService = albumsService;
        this._uploadsValidator = uploadsValidator;
        this._storageService = storageService;

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
            // Tambahkan penanganan kesalahan di sini jika diperlukan
            console.error(error);
            const response = h.response({
                status: 'error',
                message: 'Terjadi kesalahan pada server kami.',
            });
            response.code(500);
            return response;
        }
    }
}

module.exports = UploadsHandler;
