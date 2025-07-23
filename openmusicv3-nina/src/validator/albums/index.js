const InvariantError = require('../../exceptions/invariantError');
const { AlbumPayloadSchema } = require('./schema');

const AlbumsValidator = {
  validateAlbumPayload(payload) {
    const { error } = AlbumPayloadSchema.validate(payload);

    if (error) {
      throw new InvariantError(error.message);
    }
  },
};

module.exports = AlbumsValidator;
