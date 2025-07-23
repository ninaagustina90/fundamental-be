const InvariantError = require('../../exceptions/invariantError');
const { CollaborationPayloadSchema } = require('./schema');

const validate = (schema, payload) => {
  const { error } = schema.validate(payload, { abortEarly: false });
  if (error) {
    throw new InvariantError(error.message);
  }
};

const CollaborationsValidator = {
  validateCollaborationPayload: (payload) => validate(CollaborationPayloadSchema, payload),
};

module.exports = CollaborationsValidator;
