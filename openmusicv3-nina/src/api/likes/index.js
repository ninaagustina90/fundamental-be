const LikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'likes',
  version: '1.0.0',
  register: async function (server, options) {
    const { service, albumsService } = options;
    const handler = new LikesHandler(service, albumsService);

    server.route(routes(handler));
  },
};
