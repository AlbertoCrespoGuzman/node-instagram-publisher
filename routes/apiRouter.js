var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Verify = require('./verify')
var Hashtag = require('../models/hashtag')
let instagram = require('../instagram/instagram-app')
let InstagramAccountsGetFeed = require('../models/instagram_accounts_get_feed')
const futbol433_id = '253625977'
const log = require('log-to-file')
var path = require('path')
const fs = require('fs')
router.use(bodyParser.json());
const config = require('../config')

router.post('/login', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) { 
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function (err) {
      if (err) {
          console.log("err", err);
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }

      var token = Verify.getToken({"username":user.username, "_id":user._id, "admin":user.admin});
      var iduser = user._id
              res.json({
                user: {
                  username: user.username,
                  password: user.password,
                  token : token
                },
                error: false})
    });
  })(req, res, next);
})
router.route('/instagram/accounts_get_feed')
  .get(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next){
    InstagramAccountsGetFeed.find({}, function (err, instagramAccountsGetFeeds)
    {
      if (err) {
        console.log('err', err)
        throw err;
      }
      
      res.json({instagram_accounts: instagramAccountsGetFeeds,
                    error: false});
    });
  })
  .post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
    var instagramAccountsGetFeed = req.body
    InstagramAccountsGetFeed.findByIdAndUpdate( instagramAccountsGetFeed._id, {$set: instagramAccountsGetFeed}, { new: true }, function(err, doc){
        if (err) {
          InstagramAccountsGetFeed.create({name: instagramAccountsGetFeed.name,
                                             language: instagramAccountsGetFeed.language,
                                            instagram_id: instagramAccountsGetFeed.instagram_id,
                                            get_images: instagramAccountsGetFeed.get_images,
                                            get_videos: instagramAccountsGetFeed.get_videos,
                                            get_caption: instagramAccountsGetFeed.get_caption},
                                            function(err, newHashtag){
                                                if (err) throw err
                                                return res.json({'success' : true})
                                              })
                                            }else{
                                              return res.json({'success' : true})
                                            }
    })
  })
  router.route('/instagram/feed/:accountId/cursor/:cursor')
  .get(Verify.verifyOrdinaryUser, Verify.verifyAdmin, async function(req, res, next){
      if(req.params.cursor === 0){
        restInsta = await instagram.getFeedByAccountId(req.params.accountId, null)
      }else{
        restInsta = await instagram.getFeedByAccountId(req.params.accountId, req.params.cursor)
      }
      
      res.setHeader('Content-Type', 'application/json');
      let arrays = []
      restInsta.forEach(item => {
          let insta ={}
          insta.video = item._params.videos ? item._params.videos[0].url :  '',
          insta.video_height = item._params.video ? item._params.videos[0].height : 0,
          insta.video_width = item._params.video ? item._params.videos[0].width : 0,
          insta.image = item._params.images[0].url
          insta.caption  = item._params.caption
          insta.instagram_id = item._params.id
          insta.cursor = restInsta[0].cursor
          insta.video_duration = item._params.video ? item._params.video.duration : 0
          insta.instagram_account_id = req.params.accountId,
          insta.likesCount = item._params.likeCount
          arrays.push(insta)
      })
      console.log('todo perfect enviando ...', arrays.length)
      res.json({instagram_feed: arrays,
                  error: false})
  })
  router.route('/instagram/publish/video/')
  .post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
      log('/instagram/publish/video/ -> ' + JSON.stringify(req.body), 'log/log.log')
      
      InstagramAccountsGetFeed.find({instagram_id: req.body.instagram_account_id})
      .limit(1)
      .exec((err, doc) => {
          if(err){
            console.log('err ->' + JSON.stringify(err))
            res.status(500).json({err: err });
          }
          instagram.postMemeVideo(req.body, doc[0])
            .then((success) => {
                return res.json({'success' : true,
                                  'error' : false});
            })
            .catch(err => {
              console.log('err 2->' + JSON.stringify(err))
              return res.status(500).json({err: err });
            })
      })
      
  })
  router.route('/instagram/publish/image/')
  .post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
    log('/instagram/publish/image/ -> ' + JSON.stringify(req.body), 'log/log.log')
    
      InstagramAccountsGetFeed.find({instagram_id: req.body.instagram_account_id})
      .limit(1)
      .exec((err, doc) => {
          instagram.postMemeImage(req.body, doc[0])
            .then((success) => {
              console.log('published') 
              return res.json({'success' : true,
                                  'error' : false});
                                             
            })
            .catch(err => {
              return res.status(500).json({err: err });
            })
      })
      
  })
module.exports = router;