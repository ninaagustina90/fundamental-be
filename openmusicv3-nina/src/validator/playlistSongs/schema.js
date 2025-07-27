const Joi = require('joi');

// ✅ Validasi penambahan lagu ke playlist
const PostSongToPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required().messages({
    'string.base': 'ID lagu harus berupa string',
    'any.required': 'ID lagu tidak boleh kosong',
  }),
});

// ✅ Validasi penghapusan lagu dari playlist
const DeleteSongFromPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required().messages({
    'string.base': 'ID lagu harus berupa string',
    'any.required': 'ID lagu tidak boleh kosong',
  }),
});

module.exports = {
  PostSongToPlaylistPayloadSchema,
  DeleteSongFromPlaylistPayloadSchema,
};
