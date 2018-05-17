'use strict';
module.exports = (sequelize, DataTypes) => {
  const Plume = sequelize.define('Plume', {
    plumes: DataTypes.INTEGER,
    month: DataTypes.STRING,
    type: DataTypes.INTEGER
  }, {
    hooks: {
      afterBulkCreate: (plumes, options) => {
        console.log(plumes[0].userId);
        sequelize.models.User.findById(plumes[0].userId).then(user => {
          plumes.forEach((p) => {
            user.plumes += p.plumes;
          });
          user.save();
        })
      }
    }
  });

  Plume.associate = models => {
		Plume.belongsTo(models.User, {
			foreignKey: 'userId',
			onDelete: 'CASCADE'
		});
	};

  return Plume;
};
