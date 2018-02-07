module.exports = (sequelize, DataTypes) => {
	const WeightRecord = sequelize.define('WeightRecord', {
		weight: {
			type: DataTypes.FLOAT,
			allowNull: false
		},
		loss_photo_url: {
			type: DataTypes.STRING
		}
	});

	WeightRecord.associate = models => {
		WeightRecord.belongsTo(models.User, {
			foreignKey: 'userId',
			onDelete: 'CASCADE'
		});
	};

	return WeightRecord;
};
