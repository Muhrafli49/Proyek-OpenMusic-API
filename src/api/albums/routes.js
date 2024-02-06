const path = require('path');

const routes = (handler) => [
    {
        method: 'POST',
        path: '/albums',
        handler: (request, h) => handler.postAlbumHandler(request, h),
    },
    {
        method: 'GET',
        path: '/albums',
        handler: () => handler.getAlbumsHandler(),
    },
    {
        method: 'GET',
        path: '/albums/{id}',
        handler: (request, h) => handler.getAlbumByIdHandler(request, h),
    },
    {
        method: 'PUT',
        path: '/albums/{id}',
        handler: (request, h) => handler.putAlbumByIdHandler(request, h),
    },
    {
        method: 'DELETE',
        path: '/albums/{id}',
        handler: (request, h) => handler.deleteAlbumByIdHandler(request, h),
    },
    {
        method: 'POST',
        path: '/albums/{id}/likes',
        handler: (request, h) => handler.postAlbumLikesByIdHandler(request, h),
        options: {
            auth: 'songsapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/albums/cover/{param*}',
        handler: {
            directory: {
                path: path.join(__dirname, '/../uploads/file/images'),
            },
        },
    },
];

module.exports = routes;