'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('node-uuid');
const Search = require('../models/search');
const Answer = require('../models/answer');
const User = require('../models/user');
const Evaluation = require('../models/evaluation');
const Comment = require('../models/comment');
const Admin_User_Id = parseInt(process.env.ADMIN_USER_ID);

router.get('/:page', (req, res, next) => {
  let limit = 10;   // number of records per page
  let offset = 0;
  Search.findAndCountAll().then((data) => { 
    let page = req.params.page;      // page number
    let pages = Math.ceil(data.count / limit);
    offset = limit * (page - 1);
    Search.findAll({
      include:  {
        model: User,
        attributes: ['userId', 'username', 'sitename']
      },
      limit: limit,
      offset: offset,
      order: '"updatedAt" DESC'
    }).then((searches) => {
       if (req.user) {
         if (parseInt(req.user.id) === Admin_User_Id) {
           res.render('searches', {
             searches: searches,
             page: req.params.page,
             user: req.user,
             count: data.count,
             pages: pages,
             admin: true
           });
         } else { res.render('searches', {
          searches: searches,
          page: req.params.page,
          user: req.user,
          count: data.count,
          pages: pages
        })};
     } else {
      res.render('searches', {
        searches: searches,
        page: req.params.page,
        user: 0,
        count: data.count,
        pages: pages
      });
    }
    }).catch(function (error) {
    res.status(500).send('Internal Server Error');
	});
});
});

router.post('/', authenticationEnsurer, (req, res, next) => {
  const searchId = uuid.v4();
  const updatedAt = new Date();
  Search.create({
    searchId: searchId,
    searchText: req.body.searchText,
    createdBy: req.user.id,
    updatedAt: updatedAt
  }).then((search) => {
    res.redirect('/searches/1'); //usersの個別ページに飛ばす
    console.log(req.body); // TODO 予定と候補を保存する実装をする
  });
});

router.post('/:searchId', (req, res, next) => {
  if (parseInt(req.query.delete) === 1) {
    if (req.user) {
    deleteSearch(req.params.searchId, () => {
      res.redirect('/users/searches');
    });
    } else {
      const err = new Error('削除権限がありません');
      err.status = 404;
      next(err);
    };
  } else {
  const updatedAt = new Date();
  Answer.create({
    answerName: req.body.answerName, //ここ匿名化の処置してもいいかも
    answerText: req.body.answerText,
    searchId: req.params.searchId,
    updatedAt: updatedAt
  }).then((answer) => {
    res.redirect('/searches/req/' + answer.searchId); 
    console.log(req.body); // TODO 予定と候補を保存する実装をする
  });
  }
});

router.get('/req/:searchId', (req, res, next) => {
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
        Evaluation.findAll({
          include: [
            {
              model: User,
              attributes: ['userId', 'username']
            }
          ],
          where: { searchId: search.searchId },
          order: '"user.username" ASC, "answerId" ASC'
        }).then((evaluationes) => {
           if (req.user) { //ログインしている場合
            res.render('search', {
                 user: req.user,
                 search: search,
                 answeres: answeres,
                 users: [req.user],
                 evaluationes: evaluationes
               });
             } else { //ログインしていないユーザーの場合userに0を渡している
               res.render('search', {
                 user: 0,
                 search: search,
                 answeres: answeres,
                 users: [req.user],
                 evaluationes: evaluationes
               });
             }
        });
      });
    } else {
      const err = new Error('指定された予定は見つかりません');
      err.status = 404;
      next(err);
    }
  });
});


router.get('/req/:searchId/answers/:answerId', (req, res, next) => {
  Answer.findOne({
     where: { searchId: req.params.searchId,
              answerId: req.params.answerId },
     order: '"answerId" ASC'
       }).then((answer) => { 
         if (answer) {
           res.render('answer', {
             answer: answer
           });
         } else {
           const err = new Error('その検索結果は存在しません');
           err.status = 404;
           next(err);
         }
      });
    });

function deleteSearch(searchId, done, err) {

  const promiseCommentDestroy = Comment.findAll({
    where: { searchId: searchId }
  }).then((comments) => {
    return Promise.all(comments.map((c) => { return c.destroy(); }));
  });
  Evaluation.findAll({
    where: { searchId: searchId }
  }).then((evaluationes) => {
    const promises = evaluationes.map((a) => { return a.destroy(); });
    return Promise.all(promises);
  }).then(() => {
    Answer.findAll({
      where: { searchId: searchId }
    }).then((answeres) => {
      const finishpromises = answeres.map((b) => { return b.destroy(); });
    }).then(() => {
      Search.findOne({
        where: { searchId: searchId }
      }).then((search) => {
        search.destroy(); 
        if (err) return done(err);
        done();
      });
    });
  });
};


function isAdmin(req) {
  return parseInt(req.userId) === process.env.ADMIN_USER_ID;
}
  
module.exports = router;