'use strict';
const express = require('express');
const router = express.Router();
const Answer = require('../models/answer');


// router.get('/searches/:searchId/answeres/:answerId', (req, res, next) => {
//   Answer.findOne({
//      where: { searchId: req.params.searchId,
//               answerId: req.params.answerId },
//      order: '"answerId" ASC'
//        }).then((answer) => { 
//          res.render('answer', {
//               user: req.user,
//               answeres: answer,
//               users: [req.user]
//             });
//       });
//     });


module.exports = router;