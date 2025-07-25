exports.up = (pgm) => {
  pgm.addColumns('songs', {
    inserted_at: {
      type: 'TEXT',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'TEXT',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('songs', ['inserted_at', 'updated_at']);
};
