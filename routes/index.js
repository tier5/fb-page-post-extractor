var express = require('express');
var router = express.Router();
const url = require('url')
const axios = require('axios')
const converter = require('json-2-csv')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/login',{data: {email: '', password: ''}, message : ''});
});
router.get('/dashboard', function(req, res, next) {
  res.render('pages/index');
});

router.get('/posts', (request, response) => {


    const urlParts = url.parse(request.url, true)
    const pageAccessToken = urlParts.query.page_access_token
    const fbPageURL = urlParts.query.fb_page_url

    const options = {
        delimiter: {
            wrap: '"',
            field: ',',
            array: ';',
            eol: '\n'
        },
        prependHeader: true,
        sortHeader: false,
        trimHeaderValues: true,
        trimFieldValues:  true,
        keys: [
            'message',
            'link',
            'permalink_url',
            'created_time',
            'type',
            'id',
            'comments.data',
            'comments.summary.order',
            'comments.summary.total_count',
            'comments.summary.can_comment',
            'likes.data',
            'likes.summary.total_count',
            'likes.summary.can_like',
            'likes.summary.has_liked',
            'reactions.data',
            'reactions.summary.total_count',
            'reactions.summary.viewer_reaction'
        ]
    };
    axios.post('https://v6rdpdaiye.execute-api.us-east-1.amazonaws.com/development/page-extractor', {
        page_access_token: pageAccessToken,
        fb_page_url: fbPageURL
      })
      .then(function (res) {
        console.log("data arrived");
        converter.json2csv(res.data.posts, (err, csv) => {
            if (err) {
                console.log('Error converting JSON to CSV: ', err)
                response.status(500).send("Something went wrong!");
            } else {
                console.log('Total posts fetched: ', res.data.posts.length)
                response.send(csv)
                var dataToWrite = csv;
                var fs = require('fs');

                fs.writeFile('post.csv', dataToWrite, 'utf8', function (err) {
                    if (err) {
                        console.log('Some error occured - file either not saved or corrupted file saved.');
                    } else{
                        console.log('It\'s saved!');
                    }
                });
            }
        }, options)
        //response.send(data)
      })
      .catch(function (error) {
        response.status(500).send("Server Internal Error");
      });
})
module.exports = router;
