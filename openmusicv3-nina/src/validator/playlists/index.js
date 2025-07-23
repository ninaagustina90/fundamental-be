const InvariantError = require('../../exceptions/invariantError');
const {
  PlaylistPayloadSchema,
  SongsPlaylistPayloadSchema,
} = require('./schema');

const PlaylistsValidator = {
  validatePlaylistPayload(payload) {
    const { error } = PlaylistPayloadSchema.validate(payload);

    if (error) {
      throw new InvariantError(error.message);
    }
  },

  validateSongPlaylistPayload(payload) {
    const { error } = SongsPlaylistPayloadSchema.validate(payload);

    if (error) {
      throw new InvariantError(error.message);
    }
  },
};

module.exports = PlaylistsValidator;
