const mapDBToModel = ({
  id,
  name,
  year,
  genre,
  performer,
  duration,
  albumId,
}) => ({
  id,
  name,
  year,
  genre,
  performer,
  duration,
  albumId,
});

module.exports = { mapDBToModel };