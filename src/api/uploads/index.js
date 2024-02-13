const UploadsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'uploads',
    version: '1.0.0',
    register: async (server, { albumsService, uploadValidator, storageService }) => {
        const uploadHandler = new UploadsHandler(albumsService, uploadValidator, storageService);
        server.route(routes(uploadHandler));
    },
};

