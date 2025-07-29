const ExportPlaylistPayloadSchema = require('./schema');
const InvariantError = require('../../exceptions/invariantError');

const ExportsValidator = {
  validateExportPlaylistPayload(payload) {
    const { error } = ExportPlaylistPayloadSchema.validate(payload);
    if (error) throw new InvariantError(error.message);
  },
};

module.exports = ExportsValidator;
