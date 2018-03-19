const express = require('express');
const router = express.Router();
const _ = require('lodash');
const usersController = require('../controllers').users;
const weightRecordsController = require('../controllers').weightRecords;
const utils = require('../../utils');
const cloudinary = require('cloudinary');
const config = require('config');
const analytics = require('../analytics');
const moment = require('moment');

// middleware that is specific to this router
// router.use(function timeLog(req, res, next) {
// 	console.log('Time: ', Date.now());
// 	next();
// });

// //First time the user arrives
// router.post('/welcome', function(req, res) {
// 	console.log('welcome');
//
// 	const messenger_id = req.body['messenger user id'];
// 	const first_name = req.body['first name'];
// 	const last_name = req.body['last name'];
// 	const ref = req.body['ref'];
//
// 	usersController
// 		.create(messenger_id, first_name, last_name)
// 		.then(() => {
// 			analytics.send({
// 				messenger_id,
// 				first_name,
// 				last_name,
// 				ref
// 			},
// 			'new_user',
// 			{});
// 			res.json({})
// 		})
// 		.catch(() => res.json({}));
// });

//First time the user arrives
router.post('/welcome', function(req, res) {
	console.log('welcome');

	const messenger_id = req.body['messenger user id'];
	const first_name = req.body['first name'];
	const last_name = req.body['last name'];
	const gender = req.body['gender'];
	const ref = req.body['ref'];
	const ref_card = req.body['ref_card'];
	const source = req.body['source'];
	console.log(gender);

	usersController
		.create(messenger_id, first_name, last_name)
		.then(() => {
			//If the user arrives after an automatic message after a comment on a post
			if(ref_card){
				analytics.send({
					messenger_id,
					first_name,
					last_name,
					ref,
					ref_card,
					source,
					gender,
					from_comment: true
				},
				'new_user',
				{
					ref_card,
					ref,
					source,
					from_comment: true
				});
			}
			else{
				analytics.send({
					messenger_id,
					first_name,
					last_name,
					ref,
					source,
					gender,
					from_comment: false
				},
				'new_user',
				{
					from_comment: false,
					ref,
					source
				});
			}

			res.json({})
		})
		.catch(() => res.json({}));
});

//When we ask the user his size and when he want to send his weight
router.post('/weighttime', function(req, res) {
	console.log('weighttime');

	const messengerId = req.body['messenger user id'];
	const weightTime = req.body['weight_time'];

	//Send data to amplitude
	analytics.send({
		messenger_id: messengerId,
		weight_time: weightTime
	},
	'set_weight_time',
	{
		weight_time: weightTime
	});

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
	let gender = req.body['gender'];
	if(!gender) gender = 'female';

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
		//Send data to amplitude
		analytics.send({
			messenger_id: messengerid,
			weight,
			age,
			activity,
			size,
			gender
		},
		'calculate_calories',
		{
			calories_limit
		});

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
	let weight_dif = 0;
	let next_block = 'flat_weekly';

	usersController
		.get(messengerid)
		.then(user => {
			previousWeight = user.weight;
			return weightRecordsController.create(user.id, newWeightFloat);
		})
		.then(() => usersController.updateWeight(messengerid, newWeightFloat))
		.then(() => {


			let evolution = 'flat';
			if(!previousWeight){
				next_block = 'first_weight_reaction';
				evolution = 'first';
			}
			else if (newWeightFloat > previousWeight) {
				next_block = 'encouragement_weekly';
				weight_dif = (newWeightFloat * 10 - previousWeight * 10) / 10;
				evolution = 'take_weight';
			} else if (newWeightFloat < previousWeight) {
				weight_dif = (previousWeight * 10 - newWeightFloat * 10) / 10;
				next_block = 'happy_weekly';
				evolution = 'lose_weight'
			}
			else {
				weight_dif = 0;
				next_block = 'flat_weekly';
			}

			//Track the event
			return analytics.send({
				messenger_id: messengerid,
				weight: newWeightFloat,
				previous_weight: previousWeight,
				last_weight_date: moment()
			},
			'new_weight',
			{
				weight: newWeight,
				weight_evolution: evolution
			});

		})
		.then(() =>
			analytics.incrementWeightTime(messengerid)
		)
		.then(() => {
			//Send response to Chatfuel
			res.json({
				set_attributes: {
					weight_dif,
					previousWeight
				},
				redirect_to_blocks: [next_block]
			});
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

			//Send data to amplitude
			analytics.send({
				messenger_id: messengerid,
			},
			'upload_photo',
			{});

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

//Calculate ideal weight of the user depending of its height, its sex and its frame
router.post('/frame', function(req, res) {
	console.log('frame');

	const messengerid = req.body['messenger user id'];
	const frame = req.body['frame'];
	const size = req.body['size'];
	const age = req.body['age'];
	const weight = req.body['weight'];

		usersController.get(messengerid).then(user => {
			let ibm;
			if(age && size && weight){
				user.size = size;
				user.age = age;
				user.weight = weight;
				user.save();
			}

			//calculate ideal weight
			ibm = utils.calculateIBM(user.size, user.age, frame);

			//User needs to loose some weight
			let toLooseWeight;
			let nextBlock;
			if(ibm < user.weight){
				toLooseWeight = (user.weight * 10 - ibm * 10) / 10;
				nextBlock = 'weight_goal_loose';
			}
			//User does not need to loose some weight
			else{
				nextBlock = 'weight_goal_no_need';
			}

			//Send data to amplitude
			analytics.send({
				messenger_id: messengerid,
				frame,
				size,
				age,
				weight,
				ideal_weight: ibm
			},
			'calculate_ideal_weight',
			{
				ideal_weight: ibm,
				toLooseWeight
			});

			//Send infos to chatfuel
			res.json({
				set_attributes: {
					weight_goal: ibm,
					toLooseWeight
				},
				redirect_to_blocks: [nextBlock]
			})


		}).catch(error => res.status(400).send(error.message))
});


//Give the user a link to see his weight chart
router.get('/viewchart', function(req, res) {
	console.log('viewchart');

	const messengerid = req.query['messenger user id'];

	//Send data to amplitude
	analytics.send({
		messenger_id: messengerid
	},
	'view_evolution_chart',
	{});

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

//The user says if he wants or not get the weekly best recipe
router.get('/bestweekly', function(req, res) {
	console.log('answer to weekly sub');

	const messengerid = req.query['messenger user id'];
	const want_weekly = req.query['want_weekly'];

	analytics.send({
		messenger_id: messengerid,
		best_weekly_sub : want_weekly
	},
	'subscribe_best_weekly',
	{
		want_weekly
	});

	if(want_weekly == 'yes'){
		usersController.subWeekly(messengerid).then(() => res.json({})).catch(err => {
			console.error(err.message);
			res.json({})
		});
	}
	else {
		res.json({});
	}
});

//The user clicks to see the recipe card of the best recipe of the week
router.get('/seerecipecard', function(req, res) {
	console.log('see recipe card');

	const messengerid = req.query['messenger user id'];

	analytics.send({
		messenger_id: messengerid,
	},
	'see_recipe_card',
	{});

	res.json({});
});

//The user needs to start again a block because he didn't press a button but entered free text
router.get('/startagain', function(req, res) {
	console.log('Start again');

	const messengerid = req.query['messenger user id'];
	const block_name = req.query['block_name'];

	console.log('Last block visited :\n');
	console.log(block_name);

	res.json({
		redirect_to_blocks: [block_name]
	});
});


//The user needs to start again a block because he didn't press a button but entered free text
router.get('/satisfaction', function(req, res) {
	console.log('Satisfaction');

	const messengerid = req.query['messenger user id'];
	const user_satisfaction = req.query['user_satisfaction']
	const satisfaction_type = req.query['satisfaction_type']

	analytics.send({
		messenger_id: messengerid,
		user_satisfaction,
		satisfaction_type
	},
	'satisfaction',
	{
		user_satisfaction,
		satisfaction_type
	});

	res.json({});
});

//The user needs to start again a block because he didn't press a button but entered free text
router.get('/askshare', function(req, res) {
	console.log('Ask Share');

	const messengerid = req.query['messenger user id'];

	analytics.send({
		messenger_id: messengerid
	},
	'ask_share',
	{});

	res.json({});
});

module.exports = router;
