const express = require('express');
const router = express.Router();
const _ = require('lodash');
const usersController = require('../controllers').users;
const weightRecordsController = require('../controllers').weightRecords;
const utils = require('../../utils');
const cloudinary = require('cloudinary');
const config = require('config');

// middleware that is specific to this router
// router.use(function timeLog(req, res, next) {
// 	console.log('Time: ', Date.now());
// 	next();
// });

//First time the user arrives
router.post('/welcome', function(req, res) {
	console.log('welcome');

	const messengerId = req.body['messenger user id'];
	const firstName = req.body['first name'];
	const lastName = req.body['last name'];

	usersController
		.create(messengerId, firstName, lastName)
		.then(() => res.json({}))
		.catch(() => res.json({}));
});

//When we ask the user his size and when he want to send his weight
router.post('/weighttime', function(req, res) {
	console.log('weighttime');

	const messengerId = req.body['messenger user id'];
	const weightTime = req.body['weight_time'];

	usersController.setWeightTime(messengerId, weightTime);

	res.json({});
});

//Give the user the number of calories he is supposed to eat each day
router.post('/calories', function(req, res) {
	console.log('calories');

	const messengerid = req.body['messenger user id'];
	const weight = req.body['weight'];
	const age = req.body['age'];
	const activity = req.body['activity_type'];
	const size = req.body['height'];
	const gender = req.body['gender'];

	const calories_limit = utils.calculateCalories(
		gender,
		size,
		weight,
		age,
		activity
	);

	usersController.initInfos(messengerid, gender, age, weight, size, activity).then(update =>
		weightRecordsController.create(update[1][0].id, weight)
	).then(() => {
		res.json({
			set_attributes: {
				calories_limit: calories_limit,
				loss_calories_limit: utils.calculateLooseCalories(calories_limit)
			},
			redirect_to_blocks: ['give_max_calories']
		});
	}).catch(() => {
		res.json({
			set_attributes: {
				calories_limit: calories_limit,
				loss_calories_limit: utils.calculateLooseCalories(calories_limit)
			},
			redirect_to_blocks: ['give_max_calories']
		});
	})


});

//Get the last weight of the user
router.post('/lastweight', function(req, res) {
	console.log('lastweight');

	const messengerid = req.body['messenger user id'];
	const newWeight = req.body['last_weight'];

	const newWeightFloat = parseFloat(_.replace(newWeight, ',', '.'));
	let previousWeight;

	usersController
		.get(messengerid)
		.then(user => {
			previousWeight = user.weight;
			return weightRecordsController.create(user.id, newWeightFloat);
		})
		.then(() => usersController.updateWeight(messengerid, newWeightFloat))
		.then(() => {
			let weight_dif;
			if(!previousWeight){
				res.json({
					redirect_to_blocks: ['first_weight_reaction']
				});
			}
			else if (newWeightFloat > previousWeight) {
				weight_dif = (newWeightFloat * 10 - previousWeight * 10) / 10;
				res.json({
					set_attributes: {
						weight_dif,
						previousWeight
					},
					redirect_to_blocks: ['encouragement_weekly']
				});
			} else {
				weight_dif = (previousWeight * 10 - newWeightFloat * 10) / 10;
				res.json({
					set_attributes: {
						weight_dif
					},
					redirect_to_blocks: ['happy_weekly']
				});
			}
		})
		.catch(err => {
			console.error(err.message);
			res.status(400).send('error');
		});
});

//Give the user the number of calories he is supposed to eat each day
router.post('/lastphoto', function(req, res) {
	console.log('lastphoto');

	const messengerid = req.body['messenger user id'];
	const last_photo = req.body['last_photo'];

	cloudinary.v2.uploader.upload(last_photo, (error, result) => {
		if (error) {
			console.error(error.message);
			res.json({});
		} else {
			usersController
				.get(messengerid)
				.then(user =>
					weightRecordsController.addPhotoToLastWeight(
						user.id,
						result.secure_url
					)
				)
				.then(() => res.json({}))
				.catch(err => {
					console.error(err.message);
					res.json({});
				});
		}
	});
});


//Give the user a link to see his weight chart
router.get('/viewchart', function(req, res) {
	console.log('viewchart');

	const messengerid = req.query['messenger user id'];

	res.json({
		"messages": [
    {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": "Retrouve l'évolution de poids ici 👇",
          "buttons": [
            {
              "type": "web_url",
              "url": `${config.get('client_url')}weight/${messengerid}`,
              "title": "Mon poids 📉"
            }
          ]
        }
      }
    }
  ]
	})
});

module.exports = router;
