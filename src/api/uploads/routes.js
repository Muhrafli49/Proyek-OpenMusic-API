const path = require('path');


const routes = (handler) => [
    {
        method: 'POST',
        path: '/albums/{id}/covers',
        handler: (request, h) => handler.postCoverAlbumByIdHandler(request, h),
        options: {
            payload: {
            allow: 'multipart/form-data',
            multipart: true,
            output: 'stream',
            },
        },
    },
    {
        method: 'GET',
        path: '/albums/{param*}',
        handler: {
            directory: {
                path: path.resolve(__dirname, 'file'),
            },
        },  
    },
];

module.exports = routes;