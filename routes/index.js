'use strict';
const express = require('express');
const router = express.Router();
const Search = require('../models/search');

/* GET home page. */
router.get('/', (req, res, next) => {
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
        searches: searches
      });
    });
  } else {
    res.render('index', { title: title, user: req.user });
  }
});

module.exports = router;