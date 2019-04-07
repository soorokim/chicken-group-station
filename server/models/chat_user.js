/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes){
  return sequelize.define('chat_user', {
    k_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
    },
    k_nick: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    k_img: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    perm: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
  }, {
    tableName: 'chat_user',
    timestamps: false
  });
};
