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
const config = require('./../config')

router.route('/')
  .get(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next)
  {
    User.find({}, function (err, user)
    {
      if (err) throw err;
      res.json(user);
    });
  });

router.post('/register', function(req, res) {
  console.log('req.body.username',req.body.username);
  /*  User.register(new User({ username : req.body.username }),
        req.body.password, function(err, user) {
        if (err) {
            return res.status(500).json({err: err});
        }
                if(req.body.firstname) {
            user.firstname = req.body.firstname;
        }
        if(req.body.lastname) {
            user.lastname = req.body.lastname;
        }
                user.save(function(err,user) {
            passport.authenticate('local')(req, res, function () {
                return res.status(200).json({status: 'Registration Successful!'});
            });
        });
    }); */
});

router.get('/login', function(req, res, next){
  res.render('login', {  });
})
router.route('/log/')
  .get(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next){
    if (!fs.existsSync(path.resolve('log/log.log'))) {
      fs.writeFile(path.resolve('log/log.log'),'',function (err, result){
        
      })
    }
    res.sendFile(path.resolve('log/log.log'))
  })

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
              res.render('admin', {
                  status: 'Login successful!',
                  success: true,
                  token: token,
                  iduser: iduser
              })
    });
  })(req, res, next);
})

router.route('/log/')
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
    fs.unlinkSync(  path.resolve('log/log.log'), function(data, error){
      if(error)
        return res.status(500).json({err: error })
      
      return res.json({'success' : true})
        
        
    })
})
  router.route('/instagram/publish/video/')
  .post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
      log('/instagram/publish/video/ -> ' + req.body, 'log/log.log')
      InstagramAccountsGetFeed.find({instagram_id: req.body.instagram_account_id})
      .limit(1)
      .exec((err, doc) => {
          instagram.postMemeVideo(req.body, doc[0])
            .then((success) => {
                return res.json({'success' : true});
            })
            .catch(err => {
              return res.status(500).json({err: err });
            })
      })
  })
  router.route('/instagram/publish/image/')
  .post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
    log('/instagram/publish/image/ -> ' + req.body, 'log/log.log')
      InstagramAccountsGetFeed.find({instagram_id: req.body.instagram_account_id})
      .limit(1)
      .exec((err, doc) => {
          instagram.postMemeImage(req.body, doc[0])
            .then((success) => {
                return res.json({'success' : true});
            })
            .catch(err => {
              return res.status(500).json({err: err });
            })
      })
  })
  router.route('/instagram/search/:accountName')
  .post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
      instagram.seachAccountByName(req.params.accountName)
      .then(resInsta => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({id : resInsta.id}))
      })
      .catch(err => {
        res.setHeader('Content-Type', 'application/json');
        res.json(err)
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
          insta.index = item._params.id
          insta.videos = item._params.videos,
          insta.video_height = item._params.video ? item._params.videos[0].height : 0,
          insta.video_width = item._params.video ? item._params.videos[0].width : 0,
          insta.images = item._params.images
          insta.caption  = item._params.caption
          insta.instagram_id = item._params.id
          insta.cursor = restInsta[0].cursor
          insta.video_duration = item._params.video ? item._params.video.duration : 0,
          insta.likesCount = item._params.likeCount
          arrays.push(insta)
      })
      res.send(arrays)
  })
  router.route('/instagram/accounts_get_feed')
  .get(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next)
  {
    InstagramAccountsGetFeed.find({}, function (err, instagramAccountsGetFeeds)
    {
      if (err) throw err;
      res.json({instagramAccountsGetFeeds: instagramAccountsGetFeeds});
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
  router.route("/instagram/accounts_get_feed/:hashtagId")
  .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    InstagramAccountsGetFeed.findByIdAndRemove(req.params.hashtagId, function (err, resp) {
        if (err) next(err)
        res.json(resp)
    });
    })
  router.route('/videofootball/:accountId/:languageName')
  .post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
      instagram.postVideoFootball(null, req.params.accountId, req.params.languageName)
      .then(res => {
        res.setHeader('Content-Type', 'application/json');
        res.json(res)
      })
      .catch(err => {
        res.json(err)
      })
  })
  router.route('/hashtags')
  .get(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next)
  {
    Hashtag.find({}, function (err, hashtags)
    {
      if (err) throw err;
      res.json({hashtags: hashtags});
    });
  })
  .post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
    var hashtag = req.body
    Hashtag.findByIdAndUpdate( hashtag._id, {$set: hashtag}, { new: true }, function(err, doc){
        if (err) {
          Hashtag.create({name: hashtag.name, color: hashtag.color},function(err, newHashtag){
            if (err) throw err
            return res.json({'success' : true})
          })
        }else{
          return res.json({'success' : true})
        }
    })
  })
  router.route("/hashtags/:hashtagId")
  .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    Hashtag.findByIdAndRemove(req.params.hashtagId, function (err, resp) {
        if (err) next(err)
        res.json(resp)
    });
    })
  
router.get('/logout', function (req, res) {
  req.logout();
  res.status(200).json({
    status: 'Bye!'
  });
})
router.route('/search/:userName')
.get(function (req, res, next) {

    User.find({ username: { "$regex": req.params.userName, "$options": "i" }  } )
        .exec(function (err, taskgroup) {
        if (err) next(err)
        res.json(taskgroup);
    });

});

module.exports = router;
