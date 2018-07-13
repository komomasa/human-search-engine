'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const Search = require('../models/search');
const User = require('../models/user');
const Comment = require('../models/comment');
const Evaluation = require('../models/evaluation');

router.get('/:userId', authenticationEnsurer, (req, res, next) => {
    Search.findAll({
      include: [
        {
          model: User,
          attributes: ['userId','username','sitename']
        }],
        where: {
        createdBy: req.params.userId
      },
      order: '"updatedAt" DESC'
    }).then((searches) => {
      User.findOne({
        where: { userId: req.params.userId }
      }).then((user) => {
        if (searches) {
          res.render('user', {
            accessUser: req.user,
            searches: searches,
            paramsUser: req.params.userId,
            user: user
          });
        } else {
          const err = new Error('指定された予定は見つかりません');
          err.status = 404;
          next(err);
        }
      });
    });
  });

router.get('/:userId/edit', authenticationEnsurer, (req, res, next) => {
  User.findOne({
    where: {
      userId: req.params.userId
    }
  }).then((user) => {
    if (isMine(req, user)) { //そのユーザーのみが編集できる
      res.render('edit', {
        accessUser: req.user,
        user: user,
      });
    } else {
      const err = new Error('あなたはこのユーザーではありません');
      err.status = 404;
      next(err);
    }
  });
});

router.post('/:userId', authenticationEnsurer, (req, res, next) => {
  if (parseInt(req.query.edit) === 1) {
    User.findOne({
      where: {
        userId: req.params.userId
      }
    }).then((user) => {
      if (isMine(req, user)) {
        user.update({
          sitename: req.body.sitename,
          username: req.body.username,
          userId: req.params.userId
        }).then((user) => {
          res.redirect('/users/' + user.userId); 
        });
      } else {
        const err = new Error('あなたはこのユーザーではありません');
      }
    });
  } else if (parseInt(req.query.delete) === 1) {
    deleteUser(req.params.userId, () => {
      res.redirect('/logout');
    });
  } else {
    const err = new Error('不正なリクエストです');
    err.status = 400;
    next(err);
  }
});

function deleteUser(userId, done, err) {
  const promiseCommentDestroy = Comment.findAll({
    where: { userId: userId }
  }).then((comments) => {
    return Promise.all(comments.map((c) => { return c.destroy(); }));
  });
  Evaluation.findAll({
    where: { userId: userId }
  }).then((evaluationes) => {
    const promises = evaluationes.map((a) => { return a.destroy(); });
    return Promise.all(promises);
  }).then(() => {
    Search.findAll({
      where: { createdBy: userId }
    }).then((searches) => {
      const finishpromises = searches.map((b) => { return b.destroy(); });
    }).then(() => {
      User.findOne({
        where: { userId: userId }
      }).then((user) => {
        user.destroy(); 
        if (err) return done(err);
        done();
      });
    });
  });
};

function isMine(req, user) {
  return parseInt(user.userId) === parseInt(req.user.id);
}

module.exports = router;