'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const Search = require('../models/search');
const User = require('../models/user');
const Comment = require('../models/comment');
const Evaluation = require('../models/evaluation');
const moment = require('moment-timezone');

router.get('/', authenticationEnsurer, (req, res, next) => {
    Search.findAll({
      include: [
        {
          model: User,
          attributes: ['userId','username','sitename']
        }],
        where: {
        createdBy: req.user.id
      },
      order: '"updatedAt" DESC'
    }).then((searches) => {
        searches.forEach((search) => {
          search.formattedUpdatedAt = moment(search.updatedAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
        });
      User.findOne({
        where: { userId: req.user.id }
      }).then((user) => {
        if (searches) {
          res.render('user', {
            accessUser: req.user,
            searches: searches,
            paramsUser: req.user.id,
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

  router.get('/searches', authenticationEnsurer, (req, res, next) => {
    Search.findAll({
      include: [
        {
          model: User,
          attributes: ['userId','username','sitename']
        }],
        where: {
        createdBy: req.user.id
      },
      order: '"updatedAt" DESC'
    }).then((searches) => {
        searches.forEach((search) => {
          search.formattedUpdatedAt = moment(search.updatedAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
        });
      User.findOne({
        where: { userId: req.user.id }
      }).then((user) => {
        if (searches) {
          res.render('usersearch', {
            accessUser: req.user,
            searches: searches,
            paramsUser: req.user.id,
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

router.get('/edit', authenticationEnsurer, (req, res, next) => {
  User.findOne({
    where: {
      userId: req.user.id
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

router.post('/', authenticationEnsurer, (req, res, next) => {
  if (parseInt(req.query.edit) === 1) {
    User.findOne({
      where: {
        userId: req.user.id
      }
    }).then((user) => {
      if (isMine(req, user)) {
        user.update({
          sitename: req.body.sitename,
          username: req.body.username,
          userId: req.user.id
        }).then((user) => {
          res.redirect('/users'); 
        });
      } else {
        const err = new Error('あなたはこのユーザーではありません');
      }
    });
  } else if (parseInt(req.query.delete) === 1) {
    deleteUser(req.user.id, () => {
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

function isAdmin(req, user) {
  return parseInt(req.userId) === process.env.ADMIN_USER_ID;
}

module.exports = router;