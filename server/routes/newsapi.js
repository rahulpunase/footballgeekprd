const express = require('express');
const router = express.Router();
const NewsApi = require('newsapi');

router.get('/fetchrecentnewsfp', (req, res) => {
  const newsapi = new NewsApi('80234a47077f487499f2295b7aca51ce');
  newsapi.v2.topHeadlines({
    category: 'sport',
    language: 'en',
    q: "football"
  }).then(response => {
    res.json({success: true, data: response});
  }).catch(err=>{
    res.json({success: false, error: err});
  });
});

module.exports = router;
