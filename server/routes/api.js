const express = require('express');
const router = express.Router();
const _ = require('lodash');
const usersController = require('../controllers').users;
const weightRecordsController = require('../controllers').weightRecords;
const config = require('config');
const toml = require('toml');
var concat = require('concat-stream');
var fs = require('fs');
const axios = require('axios');
let recipesData;

fs.createReadStream('./recipes.toml', 'utf8').pipe(concat(function(data) {
  recipesData = toml.parse(data);
}));

// middleware that is specific to this router
router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//First time the user arrives
router.get('/weight/:messengerid', function(req, res) {
  usersController.get(req.params.messengerid).then(user =>
    weightRecordsController.getLastWeightRecords(user.id, 10)
  )
  .then(weightRecords => res.json({ weights: weightRecords.reverse()}))
  .catch(err => res.status(400).send(err.message))
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

module.exports = router;
