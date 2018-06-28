/**
 * Facebook Graph Api Service
 * @description This file is used for all facebook graph api call to make all codes resusable             
 */

 const axios = require('axios');
 const url = require('url')
 const converter = require('json-2-csv');
 const graphAPIBase = process.env.GRAPH_API_HOST + process.env.GRAPH_API_VERSION

 /**
 * Functiion to get page name from graph api
 */
function getPageName(pageId,pageAccessToken) {

    let graphAPIURL = graphAPIBase + "/" + pageId
    let params = {
        fields : "name",
        access_token:pageAccessToken 
    }
    return new Promise((resolve,reject)=>{
        axios.get(graphAPIURL, {
            params: params
        }).then(res => {
            if (res.data) {
                resolve(res.data)
               //console.log(res.data); 
            }
        }).catch(err => {
            //console.log('Posts per page fetching error', err.message)
            reject(err);
        })
    })
 }

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
                        'reactions.summary.viewer_reaction',
                        'shares.count'
                    ]
                };
                // convert array of object in csv type data
                // console.log(posts);
                converter.json2csv(posts, (err1, csv) => {
                    if (err) {
                        console.log('Error converting JSON to CSV: ', err1)
                        reject(err1);
                    } else {
                        
                        resolve({csv, posts});
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
    const fields = 'message,link,label,permalink_url,created_time,type,name,id,comments.limit(0).summary(true),shares.limit(0).summary(true),likes.limit(0).summary(true),reactions.limit(0).summary(true)'
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

module.exports = {
    getAllPostsFromFBPage,
    getPageName
}