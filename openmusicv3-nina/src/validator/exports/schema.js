const Joi = require('joi');

const ExportPlaylistPayloadSchema = Joi.object({
  targetEmail: Joi.string()
    .email({ tlds: { allow: false } }) // Optional: avoid TLD strictness
    .required()
    .messages({
      'string.base': 'Email harus berupa string',
      'string.email': 'Format email tidak valid',
      'any.required': 'Email tujuan tidak boleh kosong',
    }),
});

module.exports = ExportPlaylistPayloadSchema;
