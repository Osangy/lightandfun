module.exports = {
	up: (queryInterface, Sequelize) =>
		queryInterface.createTable('Users', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			messengerid: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true
			},
			firstName: {
				type: Sequelize.STRING
			},
			lastName: {
				type: Sequelize.STRING
			},
			weightTime: {
				type: Sequelize.STRING
			},
			size: {
				type: Sequelize.INTEGER
			},
			weight: {
				type: Sequelize.FLOAT
			},
			gender: {
				type: Sequelize.STRING
			},
			age: {
				type: Sequelize.INTEGER
			},
			activity: {
				type: Sequelize.INTEGER
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			}
		}),
	down: (queryInterface /*, Sequelize*/) => queryInterface.dropTable('Users')
};
