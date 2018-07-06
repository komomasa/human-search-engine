'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('node-uuid');
const Search = require('../models/search');
const Answer = require('../models/answer');
const User = require('../models/user');

router.post('/', authenticationEnsurer, (req, res, next) => {
  const searchId = uuid.v4();
  const updatedAt = new Date();
  Search.create({
    searchId: searchId,
    searchText: req.body.searchText,
    createdBy: req.user.id,
    updatedAt: updatedAt
  }).then((search) => {
    res.redirect('/users/' + search.createdBy); //usersの個別ページに飛ばす
    console.log(req.body); // TODO 予定と候補を保存する実装をする
  });
});

router.get('/:searchId', (req, res, next) => {
  Search.findOne({
    include: [
      {
        model: User,
        attributes: ['userId', 'username']
      }],
    where: {
      searchId: req.params.searchId
    },
    order: '"updatedAt" DESC'
  }).then((search) => {
    if (search) {
      Answer.findAll({
        where: { searchId: search.searchId },
        order: '"answerId" ASC'
      }).then((answeres) => { 
        if (req.user) { //req.userが存在する場合
         res.render('search', {
              user: req.user,
              search: search,
              answeres: answeres,
              users: [req.user]
            });
          } else { //ログインしていないユーザーの場合userに0を渡している
            res.render('search', {
              user: 0,
              search: search,
              answeres: answeres,
              users: [req.user]
            });
          }
      });
    } else {
      const err = new Error('指定された予定は見つかりません');
      err.status = 404;
      next(err);
    }
  });
});


module.exports = router;