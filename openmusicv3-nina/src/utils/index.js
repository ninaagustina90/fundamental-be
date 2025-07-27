
const mapSongsDBToModel = ({
  inserted_at,
  updated_at,
  ...rest
}) => ({
  ...rest,
  insertedAt: inserted_at,
  updatedAt: updated_at,
});

module.exports = { mapSongsDBToModel };
