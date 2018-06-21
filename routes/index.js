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

router.post('/posts', function (request, response) {

    const pageAccessToken = request.body.page_access_token
    const fbPageURLs = request.body.fb_page_url

    const graphAPIBase = process.env.GRAPH_API_HOST + process.env.GRAPH_API_VERSION

    for(var i=0; i < fbPageURLs.length; i++) {

        console.log(fbPageURLs[i])

        const getAllPostsFromFBPage = (pageId, nextPageURL, posts) => {
            const graphAPIURLForPostsOfAPage = nextPageURL ? nextPageURL : graphAPIBase + '/'+ pageId +'/posts'
            const fields = 'message,link,permalink_url,created_time,type,name,id,comments.limit(0).summary(true),shares,likes.limit(0).summary(true),reactions.limit(0).summary(true)'
            const params = nextPageURL ? {} : {
                access_token: pageAccessToken,
                fields: fields,
                limit: 100
            }

            axios.get(graphAPIURLForPostsOfAPage, {
                params: params
            }).then(res => {
                if (res.data) {
                    if (res.data.paging) {
                        if (res.data.paging.next) {
                            getAllPostsFromFBPage(pageId, decodeURIComponent(res.data.paging.next), posts.concat(res.data.data))
                        } else {
                            posts.concat(res.data.data)
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
                            converter.json2csv(posts, (err, csv) => {
                                if (err) {
                                    console.log('Error converting JSON to CSV: ', err)
                                    response.status(500).send(err)
                                } else {
                                    console.log('Total posts fetched: ', posts.length)
                                    response.send(csv)
                                }
                            }, options)
                        }
                    }
                }
            })
            .catch(err => {
                console.log('Posts per page fetching error', err)
                response.status(500).send(err.message)
            })
        }

        const fbPageURLSegments = fbPageURLs[i].split('/')
        const pageSlug = fbPageURLSegments[3] == 'pg' ? fbPageURLSegments[4] : fbPageURLSegments[3]
        let pageSlugNumber = pageSlug.match(/[\d]*$/g)
        /** Check if a page slug already has the number id or not,
         * if has then get the post else get the number id from Graph API
         */
        if (pageSlugNumber[0]) {
            pageSlugNumber = pageSlugNumber.join("")
            getAllPostsFromFBPage(pageSlugNumber, null, [])
        } else {
            const graphAPIURLForPageNumberID = graphAPIBase + '/' + pageSlug
            const params = {
                access_token: pageAccessToken
            }

            axios.get(graphAPIURLForPageNumberID, {
                params: params
            }).then(res => {
                getAllPostsFromFBPage(res.data.id, null, [])
            })
            .catch(err => {
                console.log('Page number ID fetching error: ', err)
                response.status(500).send(err.message)
            })
        }
    }
});

/*router.get('/posts',(request,response,next) => {
  const urlParts = url.parse(request.url, true)
    const pageAccessToken = urlParts.query.page_access_token
    const fbPageURL = urlParts.query.fb_page_url

    const graphAPIBase = process.env.GRAPH_API_HOST + process.env.GRAPH_API_VERSION

    const getAllPostsFromFBPage = (pageId, nextPageURL, posts) => {
        const graphAPIURLForPostsOfAPage = nextPageURL ? nextPageURL : graphAPIBase + '/'+ pageId +'/posts'
        const fields = 'message,link,permalink_url,created_time,type,name,id,comments.limit(0).summary(true),shares,likes.limit(0).summary(true),reactions.limit(0).summary(true)'
        const params = nextPageURL ? {} : {
            access_token: pageAccessToken,
            fields: fields,
            limit: 100
        }

        axios.get(graphAPIURLForPostsOfAPage, {
            params: params
        }).then(res => {
            if (res.data) {
                if (res.data.paging) {
                    if (res.data.paging.next) {
                        getAllPostsFromFBPage(pageId, decodeURIComponent(res.data.paging.next), posts.concat(res.data.data))
                    } else {
                        posts.concat(res.data.data)
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
                        converter.json2csv(posts, (err, csv) => {
                            if (err) {
                                console.log('Error converting JSON to CSV: ', err)
                                response.status(500).send(err)
                            } else {
                                console.log('Total posts fetched: ', posts.length)
                                response.send(csv)
                            }
                        }, options)
                    }
                }
            }
        })
        .catch(err => {
            console.log('Posts per page fetching error', err)
            response.status(500).send(err.message)
        })
    }

    const fbPageURLSegments = fbPageURL.split('/')
    const pageSlug = fbPageURLSegments[3] == 'pg' ? fbPageURLSegments[4] : fbPageURLSegments[3]
    let pageSlugNumber = pageSlug.match(/[\d]*$/g)
    /// Check if a page slug already has the number id or not,
      if has then get the post else get the number id from Graph API
    ///
    if (pageSlugNumber[0]) {
        pageSlugNumber = pageSlugNumber.join("")
        getAllPostsFromFBPage(pageSlugNumber, null, [])
    } else {
        const graphAPIURLForPageNumberID = graphAPIBase + '/' + pageSlug
        const params = {
            access_token: pageAccessToken
        }

        axios.get(graphAPIURLForPageNumberID, {
            params: params
        }).then(res => {
            getAllPostsFromFBPage(res.data.id, null, [])
        })
        .catch(err => {
            console.log('Page number ID fetching error: ', err)
            response.status(500).send(err.message)
        })
    }
});*/

module.exports = router;
