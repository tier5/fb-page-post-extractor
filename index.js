const express = require('express')
const url = require('url')
const axios = require('axios')
const converter = require('json-2-csv')
require('dotenv').config()

const app = express()

app.use(express.static('public'))

app.get('/', (request, response) => {
    response.sendFile(__dirname + '/public/index.html')
})

app.get('/posts', (request, response) => {
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
                        var csv = converter.json2csv(posts, (err, csv) => {
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
})
app.get('/latest/posts', (request, response) => {
    const urlParts = url.parse(request.url, true)
    const pageAccessToken = urlParts.query.page_access_token
    const fbPageURL = urlParts.query.fb_page_url
    const graphAPIBase = process.env.GRAPH_API_HOST + process.env.GRAPH_API_VERSION

    const getLatestFBPost = (pageId) => {
        const graphAPIURLForLatestPostsOfAPage = graphAPIBase + '/'+ pageId +'/posts'
        const fields = 'message,link,permalink_url,created_time,type,name,id,comments.limit(0).summary(true),shares,likes.limit(0).summary(true),reactions.limit(0).summary(true)'
        const latestParams = {
            access_token: pageAccessToken,
            fields: fields,
            limit: 5
        }
        axios.get(graphAPIURLForLatestPostsOfAPage, {
            params: latestParams
        }).then(resLatest => {
            if (resLatest.data) {
                response.send(resLatest.data.data)
            }
        })
        .catch(errLatest => {
            console.log('Posts per page fetching error', errLatest)
            response.status(500).send(errLatest.message)
        })
    }


    const fbPageURLSegments = fbPageURL.split('/')
    const pageSlug = fbPageURLSegments[3] == 'pg' ? fbPageURLSegments[4] : fbPageURLSegments[3]
    let pageSlugNumber = pageSlug.match(/[\d]*$/g)
    /** Check if a page slug already has the number id or not,
     * if has then get the post else get the number id from Graph API
     */
    const graphAPIURLForPageNumberID = graphAPIBase + '/' + pageSlug
    const params = {
        access_token: pageAccessToken
    }

    axios.get(graphAPIURLForPageNumberID, {
        params: params
    }).then(res => {
        if (pageSlugNumber[0]) {
            pageSlugNumber = pageSlugNumber.join("")
            getLatestFBPost(pageSlugNumber)
        } else {
            getLatestFBPost(res.data.id)
        }

    })
    .catch(err => {
        console.log('Page number ID fetching error: ', err)
        response.status(500).send(err.message)
    })

})
app.listen(process.env.APP_PORT, () => console.log(`App is listening on port ${process.env.APP_PORT}`))
