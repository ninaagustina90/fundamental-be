const Joi = require('joi');

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.base': 'Nama playlist harus berupa string',
    'any.required': 'Nama playlist tidak boleh kosong',
  }),
});

const PostSongToPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required().messages({
    'string.base': 'ID lagu harus berupa string',
    'any.required': 'ID lagu tidak boleh kosong',
  }),
});

const DeleteSongFromPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required().messages({
    'string.base': 'ID lagu harus berupa string',
    'any.required': 'ID lagu tidak boleh kosong',
  }),
});

module.exports = {
  PostPlaylistPayloadSchema,
  PostSongToPlaylistPayloadSchema,
  DeleteSongFromPlaylistPayloadSchema,
};
