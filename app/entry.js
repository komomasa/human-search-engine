'use strict';
const $ = require('jquery');
const global = Function('return this;')();
global.jQuery = $;
const bootstrap = require('bootstrap');

$('.evaluation-toggle-button').each((i, e) => {
  const button = $(e);
  button.click(() => {
    const searchId = button.data('search-id');
    const userId = button.data('user-id');
    const answerId = button.data('answer-id');
    const evaluation = parseInt(button.data('evaluation'));
    const nextEvaluation = (evaluation + 1) % 2;
    $.post(`/searches/${searchId}/answers/${answerId}/users/${userId}/`,
      { evaluation: nextEvaluation },
      (data) => {
        button.data('evaluation', data.evaluation);
        const evaluationLabels = ['不', '良'];
        button.text(evaluationLabels[data.evaluation]);
      });
  });
});