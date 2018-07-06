'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const Search = require('../models/search');
const Answer = require('../models/answer');
const User = require('../models/user');

router.post('/searches/:searchId', (req, res, next) => {
  Answer.create({
    answerId: answerId,
    answerName: req.body.answerName, //ここ匿名化の処置してもいいかも
    answerText: req.body.answerText,
    searchId: req.params.searchId
  }).then((answer) => {
    res.redirect('/searches/' + answer.searchId); 
    console.log(req.body); // TODO 予定と候補を保存する実装をする
  });
});

// 7/5ここまで
router.get('/answers', (req, res, next) => {
  Search.findAll({
    include: [
      {
        model: User,
        attributes: ['userId', 'username']
      }],
    where: {
      searchId: req.body.searchId
    },
    order: '"updatedAt" DESC'
  }).then((search) => {
    if (search) {
      Answer.findAll({
        where: { searchId: search.searchId },
        order: '"answerId" ASC'
      }).then((answeres) => { 
         res.render('search', {
              user: req.user,
              search: search,
              answeres: answeres,
              users: [req.user]
            });
      });
    } else {
      const err = new Error('指定された予定は見つかりません');
      err.status = 404;
      next(err);
    }
  });
});


module.exports = router;