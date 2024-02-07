const autoBind = require('auto-bind');

class UploadsHandler {
    constructor(albumsService, storageService, validator) {
        this._albumsService = albumsService;
        this._storageService = storageService;
        this._validator = validator;

        autoBind(this);
    }

    async postCoverAlbumByIdHandler(request, h) {
        const { cover } = request.payload;
        this._validator.validateImageHeaders(cover.hapi.headers);
        this._validator.validateImageSize(cover._data.length);

    
        const { id } = request.params;
        const filename = await this._albumsService.addAlbumCover({
            albumId: id,
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
    }
    
    //     const { cover } = request.payload;

    //     try {
    //         // Validate Image Headers
    //         this._validator.validateImageHeaders(cover.hapi.headers);

    //         // Validate Image Size
    //         this._validator.validateImageSize(cover._data.length);

    //         const { id } = request.params;
    //         const filename = await this._albumsService.addAlbumCover({file: cover, meta: cover.hapi, albumId: id});

    //         // // Construct Cover URL
    //         // const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/${albumId}/cover/${filename}`;

    //         // // Update Cover URL in AlbumsService
    //         // await this._albumsService.editCoverAlbumById(albumId, coverUrl);

    //         const response = h.response({
    //             status: 'success',
    //             message: 'Sampul berhasil diunggah',
    //             data: {
    //                 filename,
    //             },
    //         });
    //         response.code(201);
    //         return response;
    //     } catch (error) {
    //         if (error instanceof ClientError || error instanceof InvariantError) {
    //             // Handle ClientError or InvariantError
    //             const response = h.response({
    //                 status: 'fail',
    //                 message: error.message,
    //             });
    //             response.code(error.statusCode || 400); // Default status code for client errors
    //             return response;
    //         } else {
    //             // Handle other errors
    //             console.error(error);
    //             const response = h.response({
    //                 status: 'error',
    //                 message: 'Terjadi kesalahan pada server kami',
    //             });
    //             response.code(500);
    //             return response;
    //         }
    //     }
    // }
}

module.exports = UploadsHandler;
