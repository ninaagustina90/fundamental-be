const autoBind = require('auto-bind').default; // Perbaikan penting

class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    autoBind(this); // agar semua handler tetap bound ke instance
  }

  async postAuthenticationHandler(request, h) {
    try {
      this._validator.validatePostAuthenticationPayload(request.payload);

      const { username, password } = request.payload;
      const userId = await this._usersService.verifyUserCredential(username, password);

      const accessToken = this._tokenManager.generateAccessToken({ id: userId });
      const refreshToken = this._tokenManager.generateRefreshToken({ id: userId });

      await this._authenticationsService.addRefreshToken(refreshToken);

      return h.response({
        status: 'success',
        message: 'Authentication berhasil ditambahkan',
        data: { accessToken, refreshToken },
      }).code(201);
    } catch (error) {
      console.error('postAuthenticationHandler error:', error);
      throw error;
    }
  }

  async putAuthenticationHandler(request, h) {
    try {
      this._validator.validatePutAuthenticationPayload(request.payload);

      const { refreshToken } = request.payload;
      await this._authenticationsService.verifyRefreshToken(refreshToken);
      const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

      const accessToken = this._tokenManager.generateAccessToken({ id });

      return h.response({
        status: 'success',
        message: 'Access token berhasil diperbarui',
        data: { accessToken },
      }).code(200);
    } catch (error) {
      console.error('putAuthenticationHandler error:', error);
      throw error;
    }
  }

  async deleteAuthenticationHandler(request, h) {
    try {
      this._validator.validateDeleteAuthenticationPayload(request.payload);

      const { refreshToken } = request.payload;

      await this._authenticationsService.verifyRefreshToken(refreshToken);
      await this._authenticationsService.deleteRefreshToken(refreshToken);

      return h.response({
        status: 'success',
        message: 'Refresh token berhasil dihapus',
      }).code(200);
    } catch (error) {
      console.error('deleteAuthenticationHandler error:', error);
      throw error;
    }
  }
}

module.exports = AuthenticationsHandler;
