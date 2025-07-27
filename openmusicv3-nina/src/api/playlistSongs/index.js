const PlaylistSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistSongs',
  version: '1.0.0',
  register: async (server, {
    playlistSongsService,
    playlistsService,
    songsService,
    validator,
  }) => {
    const handler = new PlaylistSongsHandler(
      playlistSongsService,
      playlistsService,
      songsService,
      validator
    );

    server.route(routes(handler));
  },
};
