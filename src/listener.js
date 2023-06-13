/* eslint-disable max-len */
class Listener {
  constructor(exportSongsService, mailSender) {
    this._exportSongsService = exportSongsService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { userId, playlistId, targetEmail } = JSON.parse(message.content.toString());

      const exportSongs = await this._exportSongsService.getExportSongs(playlistId, userId);
      const result = this._mailSender.sendEmail(targetEmail, JSON.stringify(exportSongs));
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;
