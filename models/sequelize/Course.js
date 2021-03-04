module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "course",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: null,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tablename: "teacher",
      timestamps: false,
    }
  );
};
