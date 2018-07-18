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

 function getPageStatsOverall(req,res,next){
    let pageurl = req.query.pageurl || 'testingdata21';
    console.log(req.query)
    let year = req.query.year || false; // undefind , null , year , blank 
    if (!pageurl){
        return res.status(400).send({message : 'Bad Request', status: false})
    }
    if (year){
        /** 
         * This query will work if the count is of type number/integer 
         * for that if your using cvs for data insert ,then before insert change the datatype to number 
         */
        Pages.aggregate([
            {
                $match: {
                    pageUrl : pageurl
                }
            },
            {
                $project:{
                    "posts": 1,
                    "_id": 0
                }
            },
            {
                $unwind : "$posts",
            },
            {
                $project : {
                    comments : "$posts.comments.summary.total_count",
                    likes : "$posts.likes.summary.total_count",
                    reactions :"$posts.reactions.summary.total_count",
                    year : "$posts.year"
                }
            },
            {
                $group : {
                    _id : {  year : "$year" },
                    total_comments: {
                        $sum : "$comments"
                    },
                    total_likes: {
                        $sum : "$likes"
                    },
                    total_reactions: {
                        $sum : "$reactions"
                    }
                }
            },
            {
                $project : {
                    _id : 0,
                    year : "$_id.year",
                    total_comments: 1,
                    total_likes: 1,
                    total_reactions: 1,
                    total_engagement: {
                        $sum : ["$total_comments", "$total_likes", "$total_reactions"]
                    }

                }
            }
        ]).then(docs=>{
            if (!docs) {
                return res.status(400).send({message : 'Bad Request', status : false})
            }
            return res.status(200).send({message : "ok", status : true, data : docs})
        }).catch(err=>{
            res.send(err)
            return res.status(500).send({ message : 'Something went wrong!', status : false})
        })
    } else {
        Pages.aggregate([
            {
                $match: {
                    pageUrl : pageurl
                }
            },
            {
                $project : {
                    "posts": {$size : "$posts"},
                    "comments" : "$posts.comments.summary.total_count",
                    "reactions": "$posts.reactions.summary.total_count",
                    "likes": "$posts.likes.summary.total_count"
                }
            }
    
        ]).then(docs=>{
            if (!docs) {
                
                return res.status(400).send({message : 'Bad Request', status : false})
            }
            docs[0].comments = docs[0].comments.filter(cm =>{
                if (cm !== 'null'){ return cm}
            }).reduce((sum,val)=>sum+val)
            docs[0].reactions = docs[0].reactions.filter(cm =>{
                if (cm !== 'null'){ return cm}
            }).reduce((sum,val)=>sum+val)
            docs[0].likes = docs[0].likes.filter(cm =>{
                if (cm !== 'null'){ return cm}
            }).reduce((sum,val)=>sum+val)
            return res.status(200).send({data : docs[0], status : true, message :'ok'})
        }).catch(err=>{
            console.log(err);
            return res.status(500).send({ message : 'Something went wrong!', status : false})
        })
    }
    /**
     * if data in db are stored from facebook
     * {
            $match: {
                pageUrl : pageurl
            }
        },
        {
            $project : {
                "posts": {$size : "$posts"},
                "comments" : {$sum : "$posts.comments.summary.total_count"},
                "reactions": {$sum : "$posts.reactions.summary.total_count"},
                "likes": {$sum : "$posts.likes.summary.total_count"}
            }
        }
     */
    // these lines of code is only needed when your data is copied from csv
    
    
 }
 module.exports = {
    getPagePosts,
    getPageStatsOverall,
 }