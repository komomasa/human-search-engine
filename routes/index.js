'use strict';
const express = require('express');
const router = express.Router();
const Search = require('../models/search');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

/* GET home page. */
router.get('/',csrfProtection, (req, res, next) => {
  const title = '人力検索エンジン';
  if (req.user) {
    Search.findAll({
      where: {
        createdBy: req.user.id
      },
      order: '"updatedAt" DESC'
    }).then((searches) => {
      res.render('index', {
        title: title,
        user: req.user,
        searches: searches,
        csrfToken: req.csrfToken()
      });
    });
  } else {
    res.render('index', { title: title, user: req.user, csrfToken: req.csrfToken });
  }
});

module.exports = router;