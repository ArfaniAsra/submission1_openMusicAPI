/* eslint-disable camelcase */
const mapDBToModel = ({
  id,
  name,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
  playlist_id,
  song_id,
}) => ({
  id,
  name,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
  playlistId: playlist_id,
  songId: song_id,
});

module.exports = { mapDBToModel };
