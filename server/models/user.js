module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('User', {
		messengerid: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		firstName: {
			type: DataTypes.STRING
		},
		lastName: {
			type: DataTypes.STRING
		},
		weightTime: {
			type: DataTypes.STRING
		},
		size: {
			type: DataTypes.INTEGER
		},
		weight: {
			type: DataTypes.FLOAT
		},
		gender: {
			type: DataTypes.STRING
		},
		age: {
			type: DataTypes.INTEGER
		},
		activity: {
			type: DataTypes.INTEGER
		}
	});

	User.associate = models => {
		User.hasMany(models.WeightRecord, {
			foreignKey: 'userId',
			as: 'weightRecords'
		});
	};

	return User;
};
