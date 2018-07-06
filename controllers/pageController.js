/**
 * Facebook Page Controller
 * 
 */
const axios = require('axios');
const moment = require('moment');
const graphAPIBase = process.env.GRAPH_API_HOST + process.env.GRAPH_API_VERSION
const {verifyToken} = require('../services/jwt');
const {getAllPostsFromFBPage , getPageName}  = require('../services/facebook');
const {Pages} = require('../models/index');


 function getPagePosts(request,response,next){
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
        getAllPostsFromFBPage(pageSlugNumber, null, [],pageAccessToken,fbPageURL).then(data=>{
            getPageName(pageSlugNumber, pageAccessToken).then(pagename => {
                let resPosts = data.posts.map(elem=>{
                        
                            elem.page_name = pagename.name
                            elem.shares_count = elem.shares ? elem.shares.count : 0;
                            elem.month = moment(elem.current_time).format('M');
                            elem.year = moment(elem.current_time).format('YYYY');
                            elem.day   = moment(elem.current_time).format('D');
                            return elem
                        })
                Pages.create({
                    user : request.user._id,
                    pageUrl : fbPageURL,
                    pageId: pageSlugNumber,
                    posts : data.posts
                }).then( created=>{
                    return response.send({message : 'ok', status : true, csv : data.csv, posts: data.posts});
                }).catch(err=>{
                    return response.status(500).send({message : 'Something went wrong!', status : false, error : err.message})
                })
                
            }).catch(err=>{
                response.status(500).send({message : 'Something went wrong!', status : false, error : err.message})
            })
            
            
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
            getAllPostsFromFBPage(res.data.id, null, [], pageAccessToken,fbPageURL).then(data=>{
                getPageName(res.data.id, pageAccessToken).then(pagename => {
                    let posts = data.posts ;
                    let resPosts = posts.map(elem=>{
                        
                            elem.page_name = pagename.name
                            elem.shares_count = elem.shares ? elem.shares.count : 0;
                            elem.month = moment(elem.current_time).format('M');
                            elem.year = moment(elem.current_time).format('YYYY');
                            elem.day   = moment(elem.current_time).format('D');
                            return elem
                        })
                        Pages.create({
                            user : request.user._id,
                            pageUrl : fbPageURL,
                            pageId: res.data.id,
                            posts : resPosts
                        }).then( created=>{
                            return response.send({message : 'ok', status : true, csv : data.csv, posts: resPosts});
                        }).catch(err=>{
                            return response.status(500).send({message : 'Something went wrong!', status : false, error : err.message})
                        })
                }).catch(err=>{
                    response.status(500).send({message : 'Something went wrong!', status : false, error : err.message})
                })  
            }).catch(err =>{
                response.status(500).send({message : 'Something went wrong!', status : false, error : err.message})
            })
        })
        .catch(err => {
            console.log('Page number ID fetching error: ', err)
            response.status(500).send({message : 'Something went wrong!', status : false, error : err.message})
        })
    }
 }

 function getPageStats(req,res,next){
    let pageurl = req.query.pageurl;
    let year = req.query.year; // undefind , null , year , blank
    if (!pageurl){
        return res.status(400).send({message : 'Bad Request', status: false})
    }
    Pages.aggregate([
        {
            $match: {
                pageUrl : pageurl
            }
        },
        {
            $project : {
                "comments" : {$sum : "$posts.comments.summary.total_count"},
                "shares": {$sum : "$posts.shares.count"},
                "likes": {$sum : "$posts.likes.summary.total_count"},
                "reactions": {$sum : "$posts.likes.reactions.total_count"},
                "total_engagement" : { $sum : ["$$comments", "$$shares", "$$likes", "$reactions"]}
            }
        }

    ]).then(docs=>{
        if (!docs) {
            return res.status(400).send({message : 'Bad Request', status : false})
        }
        return res.status(200).send(docs)
    }).catch(err=>{
        console.log(err);
        return res.status(500).send({ message : 'Something went wrong!', status : false})
    })
    
 }
 module.exports = {
    getPagePosts,
    getPageStats
 }