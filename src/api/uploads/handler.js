const ClientError = require('../../exceptions/ClientError');

class UploadsHandler {
    constructor(service, validator,  albumsService) {
        this._service = service;
        this._validator = validator;
        this._albumsService = albumsService;

        this.postCoverAlbumByIdHandler = this.postCoverAlbumByIdHandler.bind(this);


    }

    async postCoverAlbumByIdHandler(request, h) {
        try {
        const { cover } = request.payload;
        const { id } = request.params;

        this._validator.validateImageHeaders(cover.hapi.headers);

        const fileName = await this._service.writeFile(cover, cover.hapi, id);

        await this._albumsService.editCoverAlbumById(id, filename);

        const response = h.response({
            status: 'success',
            message: 'Sampul berhasil diunggah',
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