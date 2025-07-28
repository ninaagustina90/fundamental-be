const InvariantError = require('../../exceptions/invariantError');
const {
  PostPlaylistPayloadSchema,
  PostSongToPlaylistPayloadSchema,
  DeleteSongFromPlaylistPayloadSchema,
} = require('./schema');

const PlaylistsValidator = {
  validatePostPlaylistPayload(payload) {
    const { error } = PostPlaylistPayloadSchema.validate(payload);
    if (error) throw new InvariantError(error.message);
  },

  validatePostSongToPlaylistPayload(payload) {
    const { error } = PostSongToPlaylistPayloadSchema.validate(payload);
    if (error) throw new InvariantError(error.message);
  },

  validateDeleteSongFromPlaylistPayload(payload) {
    const { error } = DeleteSongFromPlaylistPayloadSchema.validate(payload);
    if (error) throw new InvariantError(error.message);
  },
};

module.exports = PlaylistsValidator;
