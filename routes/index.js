var express = require('express');
var router = express.Router();
const url = require('url')
const axios = require('axios')
const converter = require('json-2-csv');
const jwt = require('jsonwebtoken');
const {verifyToken} = require('../services/jwt');
/** Facebook Graph Api */
const graphAPIBase = process.env.GRAPH_API_HOST + process.env.GRAPH_API_VERSION




/**
 * Function to check authentication 
 */
function isAuthenticated(req, res, next) {
    let token = req.body.token || req.headers.token || req.headers.authoriztion;
    
    verifyToken(token).then(decoded => {
        next();
    }).catch(err => {
       return res.status(401).send({status: false, message : 'Unauthorized'})
    })
    next();
}

/**
 * Route to get all the posts from graph api
 * @param {object} request
 * @param {object} response
 * @param {function} next
 * @returns {object} response
 */

router.post('/posts',(request,response,next) => {

    //const urlParts = url.parse(request.url, true);
    const pageAccessToken = request.body.page_access_token
    const fbPageURL = request.body.fb_page_url
    const fbPageURLSegments = fbPageURL.split('/')
    const pageSlug = fbPageURLSegments[3] == 'pg' ? fbPageURLSegments[4] : fbPageURLSegments[3]
    let pageSlugNumber = pageSlug.match(/[\d]*$/g)
    /** Check if a page slug already has the number id or not,
     * if has then get the post else get the number id from Graph API
     */
    if (pageSlugNumber[0]) {
        pageSlugNumber = pageSlugNumber.join("")
        
        // call function to get a csv output
        getAllPostsFromFBPage(pageSlugNumber, null, [],pageAccessToken,fbPageURL).then(csv=>{
            response.send({message : 'ok', status : true, csv});
        }).catch(err => {
            response.status(500).send({message : 'Something went wrong!', status : false, error : err.message})
        })
    } else {
        const graphAPIURLForPageNumberID = graphAPIBase + '/' + pageSlug
        const params = {
            access_token: pageAccessToken
        }
        // call graph api to get page slug number
        axios.get(graphAPIURLForPageNumberID, {
            params: params
        }).then(res => {
            // getting page slug number
            getAllPostsFromFBPage(res.data.id, null, [], pageAccessToken,fbPageURL).then(csv=>{
                response.send({message : 'ok', status : true, csv});
            }).catch(err =>{
                response.status(500).send({message : 'Something went wrong!', status : false, error : err.message})
            })
        })
        .catch(err => {
            console.log('Page number ID fetching error: ', err)
            response.status(500).send({message : 'Something went wrong!', status : false, error : err.message})
        })
    }
});

/**
 * Function to get  a csv file type data from a facebook page
 * @param {string} pageId 
 * @param {string} nextPageURL 
 * @param {array} posts 
 * @param {string} pageAccessToken 
 * @returns {promise} resolve (csv) reject(error)
 */

function getAllPostsFromFBPage (pageId, nextPageURL, posts, pageAccessToken,fbPageURL) {
    
    return new Promise((resolve,reject)=> {

        recursiveGetPosts(pageId, nextPageURL, posts,pageAccessToken,fbPageURL,function(err, posts) {
            if (err){
                reject(err);
            } else {
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
                // convert array of object in csv type data
                // console.log(posts);
                converter.json2csv(posts, (err1, csv) => {
                    if (err) {
                        console.log('Error converting JSON to CSV: ', err1)
                        reject(err1);
                    } else {
                        resolve(csv);
                        console.log('Total posts fetched: ', posts.length);
                    }
                }, options)
            }
        });
    })
}
/**
 * Recursive function to get all the posts from graph api 
 * @param {string} pageId 
 * @param {string} nextPageURL 
 * @param {array} posts 
 * @param {string} pageAccessToken 
 * @param {function} cb 
 * @returns {function} cb with error or posts
 */
function recursiveGetPosts(pageId, nextPageURL, posts,pageAccessToken,fbPageURL, cb) {
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
                    //cb(null,posts)
                    recursiveGetPosts(pageId, decodeURIComponent(res.data.paging.next), posts.concat(res.data.data),pageAccessToken,fbPageURL,cb)
                } else {
                    cb(null,posts)
                }
            }
        }
    }).catch(err => {
        console.log('Posts per page fetching error', err.message)
        cb(err,null);
    })
}

module.exports = router;
