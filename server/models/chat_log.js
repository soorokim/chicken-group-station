/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes){
  return sequelize.define('chat_log', {
    idx: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
    },
    k_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'chat_user',
        key: 'k_id'
      }
    },
    ip: {
      type: DataTypes.STRING(16),
      allowNull: false
    },
    reson: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false
    },
  }, {
    tableName: 'chat_log',
    timestamps: false
  });
};
