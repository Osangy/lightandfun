'use strict';
module.exports = (sequelize, DataTypes) => {
  var Plume = sequelize.define('Plume', {
    plumes: DataTypes.INTEGER,
    month: DataTypes.STRING,
    type: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Plume.belongsTo(models.User, {
    			foreignKey: 'userId',
    			onDelete: 'CASCADE'
    		});
      }
    }
  });

  return Plume;
};
