// Mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');


const ClientError = require('./exceptions/ClientError');

// albums
const albums = require('./api/albums');
const albumsValidator = require('./validator/albums');
const AlbumsService = require('./services/postgres/AlbumsService');

// songs
const songs = require('./api/songs');
const songsValidator = require('./validator/songs');
const SongsService = require('./services/postgres/SongsService');

// users
const users = require('./api/users');
const UserService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// playlist
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistValidator = require('./validator/playlists');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

// playlistsongs
const playlistsongs = require("./api/playlistsongs");
const PlaylistsongsService = require("./services/postgres/PlaylistsongsService");
const PlaylistsongsValidator = require("./validator/playlistsongs");

// Exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// uploads
const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

// cache
const CacheService = require('./services/redis/CacheService');

const init = async () => {
    const cacheService = new CacheService();
    const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));
    const albumsService = new AlbumsService(cacheService, storageService);
    const songsService = new SongsService();
    const usersService = new UserService();
    const authenticationsService = new AuthenticationsService();
    const collaborationsService = new CollaborationsService();
    const playlistsService = new PlaylistsService(collaborationsService);
    const playlistsongsService = new PlaylistsongsService();

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

      // registrasi plugin eksternal
    await server.register([
        {
            plugin: Jwt,
        },
        {
            plugin: Inert,
        },
    ]);

    // mendefinisikan strategy autentikasi jwt
    server.auth.strategy('songsapp_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });
    
    await server.register([
        {
            plugin: albums,
            options: {
                service: albumsService,
                storageService,
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
        {
            plugin: users,
            options: {
                service: usersService,
                validator: UsersValidator,
            },
        },
        {
            plugin: authentications,
            options: {
                authenticationsService,
                usersService,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator,
            },
        },
        {
            plugin: playlists,
            options: {
                service: playlistsService,
                validator: PlaylistValidator,
            },
        },
        {
            plugin: collaborations,
            options: {
                collaborationsService,
                playlistsService,
                validator: CollaborationsValidator,
            },
        },
        {
            plugin: playlistsongs,
            options: {
                playlistsongsService,
                playlistsService,
                validator: PlaylistsongsValidator,
            },
        },
        {
            plugin: _exports,
            options: {
                service: ProducerService,
                playlistsService,
                validator: ExportsValidator,
            },
        },
        {
            plugin: uploads,
            options: {
                albumsService,
                uploadValidator: UploadsValidator,
            },
        },
    ]);

    server.ext('onPreResponse', (request, h) => {
        const { response } = request;

        if (response instanceof Error) {
            if (response instanceof ClientError) {
            const newResponse = h.response({
                status: 'fail',
                message: response.message,
            });
            newResponse.code(response.statusCode);
            return newResponse;
        }

        if (!response.isServer) {
            return h.continue;
        }

          // Handle other errors
        console.log(response);
        const newResponse = h.response({
            status: 'error',
            message: 'Something went wrong',
        });
        newResponse.code(500);
        return newResponse;
        }

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
