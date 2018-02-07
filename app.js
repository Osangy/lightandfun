// tutorial : https://scotch.io/tutorials/getting-started-with-node-express-and-postgres-using-sequelize#express-setup
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const usersController = require('./server/controllers').users;
const chatfuelRouter = require('./server/routes').chatfuel;
const apiRouter = require('./server/routes').api;
const cloudinary = require('cloudinary');
const config = require('config');

//Staging

cloudinary.config({
	cloud_name: config.get('cloudinary.cloud_name'),
	api_key: config.get('cloudinary.api_key'),
	api_secret: config.get('cloudinary.api_secret')
});

// Log requests to the console.
app.use(logger('dev'));

// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/chatfuel', chatfuelRouter);
app.use('/api', apiRouter);

module.exports = app;
