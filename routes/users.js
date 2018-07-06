'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const Search = require('../models/search');
const Answer = require('../models/answer');
const User = require('../models/user');

router.get('/:userId', authenticationEnsurer, (req, res, next) => {
    Search.findAll({
      include: [
        {
          model: User,
          attributes: ['userId','username']
        }],
        where: {
        createdBy: req.params.userId
      },
      order: '"updatedAt" DESC'
    }).then((searches) => {
      if (searches) {
          res.render('user', {
            accessUser: req.user,
             searches: searches,
             paramsUser: req.params.userId
            });
          } else {
        const err = new Error('指定された予定は見つかりません');
        err.status = 404;
        next(err);
      }
    });
  });

//  router.get('/:userId', authenticationEnsurer, (req, res, next) => {
//    User.findAll({
//      include: [
//        {
//          model: Search,
//          attributes: ['searchId','searchName', 'searchText', 'createdBy', 'updatedAt']
//        }],
//      where: {
//        createdBy: req.params.userId
//      },
//      order: '"updatedAt" DESC'
//    }).then((searches) => {
//      if (searches) {
//           res.render('user', {
//             accessUser: req.user,
//             searches: searches
//        });
//      } else {
//        const err = new Error('指定された予定は見つかりません');
//        err.status = 404;
//        next(err);
//      }
//    });
//  });


module.exports = router;