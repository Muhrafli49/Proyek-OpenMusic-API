// Mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');

const albums = require('./api/albums');
const albumsValidator = require('./validator/albums');
const AlbumsService = require('./services/postgres/AlbumsService');

const songs = require('./api/songs');
const songsValidator = require('./validator/songs');
const SongsService = require('./services/postgres/SongsService');

const init = async () => {
    const albumsService = new AlbumsService();
    const songsService = new SongsService();

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register([
        {
            plugin: albums,
            options: {
                service: albumsService,
                validator: albumsValidator,
            },
        },
        {
            plugin: songs,
            options: {
                service: songsService,
                validator: songsValidator,
            },
        },
    ]);

    // Menambahkan extension function onPreResponse
    server.ext('onPreResponse', (request, h) => {
        // Mendapatkan konteks response dari request
        const { response } = request;

        // Memeriksa apakah response merupakan instance dari Error
        if (response instanceof Error) {
            // Penanganan client error secara internal.
            const newResponse = h.response({
                status: 'fail',
                message: response.message,
            });
            newResponse.code(response.statusCode);
            return newResponse;
        }

        // Jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
        return h.continue;
    });

    try {
        await server.start();
        console.log(`Server berjalan pada ${server.info.uri}`);
    } catch (err) {
        console.error('Error starting server:', err);
    }
};

init();
