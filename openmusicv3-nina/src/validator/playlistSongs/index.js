const InvariantError = require('../../exceptions/invariantError');
const {
  PostSongToPlaylistPayloadSchema,
  DeleteSongFromPlaylistPayloadSchema,
} = require('./schema');

const PlaylistSongsValidator = {
  validatePostSongToPlaylistPayload(payload) {
    const { error } = PostSongToPlaylistPayloadSchema.validate(payload);
    if (error) throw new InvariantError(error.message);
  },

  validateDeleteSongFromPlaylistPayload(payload) {
    const { error } = DeleteSongFromPlaylistPayloadSchema.validate(payload);
    if (error) throw new InvariantError(error.message);
  },
};

module.exports = PlaylistSongsValidator;
