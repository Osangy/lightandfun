const express = require('express');
const router = express.Router();
const _ = require('lodash');
const usersController = require('../controllers').users;
const weightRecordsController = require('../controllers').weightRecords;
const config = require('config');

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

module.exports = router;
