const autoBind = require('auto-bind').default; // ✅ akses fungsi dengan .default jika pakai require

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this); // ✅ pastikan semua method terikat dengan instance
  }

  async postUserHandler(request, h) {
    try {
      this._validator.validateUserPayload(request.payload);
      const { username, password, fullname } = request.payload;

      const userId = await this._service.addUser({ username, password, fullname });

      return h.response({
        status: 'success',
        message: 'User berhasil ditambahkan',
        data: { userId },
      }).code(201);
    } catch (error) {
      console.error('postUserHandler error:', error);
      throw error;
    }
  }

  async getUserByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const user = await this._service.getUserById(id);

      return h.response({
        status: 'success',
        data: { user },
      }).code(200);
    } catch (error) {
      console.error('getUserByIdHandler error:', error);
      throw error;
    }
  }

  // async getUsersByUsernameHandler(request, h) {
  //   try {
  //     const { username = '' } = request.query;
  //     const users = await this._service.getUsersByUsername(username);

  //     return h.response({
  //       status: 'success',
  //       data: { users },
  //     }).code(200);
  //   } catch (error) {
  //     console.error('getUsersByUsernameHandler error:', error);
  //     throw error;
  //   }
  // }
}

module.exports = UsersHandler;
