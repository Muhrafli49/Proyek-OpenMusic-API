const InvariantError = require('./../../exceptions/InvariantError');
const { AlbumPayloadSchema, AlbumLikesPayloadSchema } = require('./schema');

module.exports = {
    validateAlbumsPayload: (payload) => {
        const validationResult = AlbumPayloadSchema.validate(payload);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },

    validateAlbumLikesPayload: (payload) => {
        const validationResult = AlbumLikesPayloadSchema.validate(payload);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};