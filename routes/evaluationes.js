'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const Evaluation = require('../models/evaluation');

router.post('/:searchId/answers/:answerId/users/:userId', authenticationEnsurer, (req, res, next) => {
  const searchId = req.params.searchId;
  const userId = req.params.userId;
  const answerId = req.params.answerId;
  let evaluation = req.body.evaluation;
  evaluation = evaluation ? parseInt(evaluation) : 0;

  Evaluation.upsert({
    searchId: searchId,
    userId: userId,
    answerId: answerId,
    evaluation: evaluation
  }).then(() => {
    res.json({ status: 'OK', evaluation: evaluation });
  });
});

module.exports = router;