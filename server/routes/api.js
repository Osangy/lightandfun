const express = require('express');
const router = express.Router();
const _ = require('lodash');
const usersController = require('../controllers').users;
const weightRecordsController = require('../controllers').weightRecords;
const plumesController = require('../controllers').plumes;
const config = require('config');
const toml = require('toml');
var concat = require('concat-stream');
var fs = require('fs');
const axios = require('axios');
const moment = require('moment');
const utils = require('../../utils');
const analytics = require('../analytics');
let recipesData;

moment.locale('en');

fs.createReadStream('./recipes.toml', 'utf8').pipe(concat(function(data) {
  recipesData = toml.parse(data);
}));

// middleware that is specific to this router
router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//Get last 10 weights of a user
router.get('/weight/:messengerid', function(req, res) {
  let userWeight;

  analytics.send({
    messenger_id: req.params.messengerid
  },
  'weight_graph',
  {});

  usersController.get(req.params.messengerid).then(user => {
    userWeight = utils.calculateIBM(user.size, user.age, user.frame);
    return weightRecordsController.getLastWeightRecords(user.id, 10);
  })
  .then(weightRecords => res.json({ weights: weightRecords.reverse(), user_weight: userWeight}))
  .catch(err => {
    console.error(err.message);
    res.status(400).send(err.message)
  })
});

//Get the infos about the plumes of a user
router.get('/plumeviometre/:messengerid', function(req, res) {
  let userPlumes;
  let user;
  let plumesThisMonth = 0;
  let plumesLastMonth = 0;
  const thisMonth =  moment().subtract(0, 'months').format('MMMM');
  const thisMonthFr = moment().locale('fr').subtract(0, 'months').format('MMMM');
  const lastMonth =  moment().subtract(1, 'months').format('MMMM');
  const lastMonthFr = moment().locale('fr').subtract(1, 'months').format('MMMM');

  analytics.send({
    messenger_id: req.params.messengerid
  },
  'pluviometre',
  {});

  usersController.get(req.params.messengerid).then(userObj => {
    user = userObj;
    userPlumes = user.plumes;
    return plumesController.getPlumesFromMonth(user.id, thisMonth);
  })
  .then(plumes => {
    plumes.forEach(p => {
      plumesThisMonth += p.plumes;
    });
    return plumesController.getPlumesFromMonth(user.id, lastMonth);
  }).then(plumes => {
    plumes.forEach(p => {
      plumesLastMonth += p.plumes;
    });

    res.json({
      plumes: userPlumes,
      this_month_plumes: {month: thisMonthFr, plumes: plumesThisMonth},
      last_month_plumes: {month: lastMonthFr, plumes: plumesLastMonth}
    })
  })
  .catch(err => {
    console.error(err.message);
    res.status(400).send(err.message)
  })
});


//First time the user arrives
router.get('/recipes', function(req, res) {
  res.json({
    recipes: recipesData.recipes
  })
});

//Send a video to the messenger discussion
router.post('/sendvideo', function(req, res) {
  const recipe_id = req.body['recipe_id'];
  const messengerid = req.body['messengerid'];
  const block_name = "list_recipes_video";
  const url = `https://api.chatfuel.com/bots/${config.get('bot_id')}/users/${messengerid}/send?chatfuel_token=${config.get('bot_token')}&chatfuel_block_name=${block_name}&recipe_want=${recipe_id}`
  console.log(url);
  axios.post(url, {}).then(() => {
    res.json({})
  }).catch((err) => {
    console.error(err.message);
    res.status(400).send(err.message)
  })
});

//Send a recipe card to the messenger discussion
router.post('/sendrecipecard', function(req, res) {
  const recipe_id = req.body['recipe_id'];
  const messengerid = req.body['messengerid'];
  const block_name = "list_recipes_card";
  const url = `https://api.chatfuel.com/bots/${config.get('bot_id')}/users/${messengerid}/send?chatfuel_token=${config.get('bot_token')}&chatfuel_block_name=${block_name}&recipe_want=${recipe_id}`
  console.log(url);
  axios.post(url, {}).then(() => {
    res.json({})
  }).catch((err) => {
    console.error(err.message);
    res.status(400).send(err.message)
  })
});

router.get('/sumplumes', function(req, res) {
  plumesController.getPlumesSumsForMonth('May').then(sums => {
    let onlySums = [];
    sums.forEach(sumObj => {
      onlySums.push(parseInt(sumObj.sum));
    })
    console.log(onlySums);
    res.json({ sums, onlySums, percentile: utils.calculatePercentiles(onlySums) })
  })
  .catch(err => {
    console.error(err.message);
    res.status(400).send(err.message)
  });
});


module.exports = router;
