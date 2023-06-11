/* eslint-disable max-len */
const ExportSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, {
    service, playlistSongsService, playlistsService, validator,
  }) => {
    const exportSongsHandler = new ExportSongsHandler(service, playlistSongsService, playlistsService, validator);
    server.route(routes(exportSongsHandler));
  },
};
