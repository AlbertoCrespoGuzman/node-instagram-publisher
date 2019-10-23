var Client = require('instagram-private-api').V1;
var device = new Client.Device('mobile');
var storage = new Client.CookieFileStorage(__dirname + '/cookies/your_instagram_username.json');

let Globalsession = {}
let captionTest = 'flipa'
var Request = require('instagram-private-api').V1.Request;
let ImageComposer = require('./ImageComposer')
const politicaId = 8720278281
const SemCreteriosId = 2484011421
let totalfollowed = 0
var config = require('./config');
var Instagramuser = require('./models/instagramusers');
var errors = 0
var instagramPosts = require('./models/instagram_posts')

var mongoose = require('mongoose')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var express = require('express');
var path = require('path')
var compression = require('compression')
var cronJob = require('cron').CronJob
var https = require('https')
const fs = require('fs')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
//const timeInstagramPosting = '1 */1 * * *' 
const timeInstagramPosting = '*/80 * * * *' 

const PostSequence = require('./models/post_sequence')
const instagramAccounts = require('./models/instagram_accounts_get_feed')
const instagram = require('./instagram/instagram-app')
const log = require('log-to-file')
var shell = require('shelljs');

var User = require('./models/user')

mongoose.connect(config.mongoUrl, config.mongoOptions);
let db = mongoose.connection

let memesErrorCounter = 0

db.once('open', function() { 
	console.log('Successfully connected')
	/*
	const post = PostNextMeme()
	post.then(result => {
		memesErrorCounter = 0
	})
	.catch(err => {
		if(err === 0){
			memesErrorCounter ++
			if(memesErrorCounter < 3){
				console.log('error...posting next meme')
				PostNextMeme()
			}else{
				memesErrorCounter = 0
				return null
			}
	
		}
	})
*/
console.log(new Date().getHours())
	User.findOne({username: 'admin'}, function(err, user){
        if(err) {
          console.log(err);
        }
        var message;
        if(user) {
            message = "user exists"
        } else {
            message= "user doesn't exist";
            User.register(new User({ username : 'admin' }),
                  'palmaslab179', function(err, user) {
                      user.firstname = 'admin';
                      user.lastname = 'admin';
                      user.admin = true;
                          user.save(function(err,user) {
                      console.log('admin created successfully')
                  });
              });
        }
        

        })

	Instagramuser.count({followed : true}, function(err, count){
		console.log('followed right now', count)
	})
	Instagramuser.count({}, function(err, count){
		console.log('user in total', count)
	})
	
})


var jobHandlerPostOnInstagram = new cronJob({
    cronTime: timeInstagramPosting,
    onTick: function(){
			log('auto... -> ' + new Date().getHours() + 'hours', 'log/log.log')
			
			if(new Date().getHours() < 5 || new Date().getHours() > 11){

        log('<span style="color:blue">running  Instagram auto</span>', 'log/log.log')
		
				const post = PostNextMeme()
				post.then(result => {
					memesErrorCounter = 0
				})
				.catch(err => {
					log('error no jobCron...' + err, 'log/log.log')
					if(err.value === 0){
						memesErrorCounter ++
						if(memesErrorCounter < 3){
							log('error...posting next meme', 'log/log.log')
							PostNextMeme()
						}else{
							memesErrorCounter = 0
							return null
						}
				
					}
				})
			}
			setTimeout(function(){
				try{
				shell.rm('instagram/media/*.*')
				if(new Date().getDay() === 6 && new Date().getHours() === 3){
					shell.rm(path.resolve('log/log.log'))
				}
				}catch(err){

				}
			}, 7 * 60 * 1000)
		//instagram.postVideoFootball(null, futbol433_id, 'en')
    },
    start:true,
    timeZone:'America/Buenos_Aires'
});

//test()
function test(){
	instagramPosts.find({image: true, image_url: 'holaquetal'}, function(err, instagramPost){
		console.log(instagramPost)

	/*	if(err && instagramPost && instagramPost.video_url && instagramPost.video_url.length > 5){
			resolve('')
		}else{
			resolve(post)
		}*/
	})
}
function PostNextMeme(){
	return new Promise((resolve, reject) => {
		
	PostSequence.findOne({})
		.exec((err, postSequence) => {
			if(err){
				console.log(err)
			}else{
				if(!postSequence){
					instagramAccounts.findOne({})
					.exec((err, account) => {
							if(err){
								console.log(err)
							}else{
								let newAccount
								if(account.length >= 1){
									newAccount = account[0]
								}else{
									newAccount = account
								}
								instagram.postMemeAutomatically(newAccount)
								.then(result => {
									resolve(result)
								})
								.catch(err => {
									reject(err)
								})
							}
					})
				}else{
					instagramAccounts.find({_id: {$gt: postSequence.last}}).sort({_id: 1 }).limit(1)
					.exec((err, account) => {
						if(err){
							console.log(err)
						}else{
							let newAccount
							if(account.length >= 1){
								
									newAccount = account[0]
								
												instagram.postMemeAutomatically(newAccount)
													.then(result => {
														resolve(result)
													})
													.catch(err => {
														reject(err)
													})
								
							}else{
								if(account.name){
											newAccount = account
									
											instagram.postMemeAutomatically(newAccount)
											.then(result => {
												resolve(result)
											})
											.catch(err => {
												reject(err)
											})
								}else{
									instagramAccounts.findOne({})
											.exec((err, account2) => {
												console.log('volviendooOOOo!@!')
												instagram.postMemeAutomatically(account2)
															.then(result => {
																resolve(result)
															})
															.catch(err => {
																reject(err)
															})
											})
								}
								
						}
						}
					})
				}
			}
		})
	})
}


var users = require('./routes/users')
var apiRouter = require('./routes/apiRouter')
const statusRouter = require('./routes/statusRouter')

var app = express()
app.use(compression())
app.all('*', function(req, res, next){
    var responseSettings = {
        "AccessControlAllowOrigin": req.headers.origin,
        "AccessControlAllowHeaders": "Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name",
        "AccessControlAllowMethods": "POST, GET, PUT, DELETE, OPTIONS",
        "AccessControlAllowCredentials": true
    }
    res.header("Access-Control-Allow-Credentials", responseSettings.AccessControlAllowCredentials);
    res.header("Access-Control-Allow-Origin",  responseSettings.AccessControlAllowOrigin);
    res.header("Access-Control-Allow-Headers", (req.headers['access-control-request-headers']) ? req.headers['access-control-request-headers'] : "x-requested-with");
    res.header("Access-Control-Allow-Methods", (req.headers['access-control-request-method']) ? req.headers['access-control-request-method'] : responseSettings.AccessControlAllowMethods);

    return next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(bodyParser.json({limit: '100mb'}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())


var User = require('./models/user')


app.use(passport.initialize())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())




app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', users)
app.use('/api', apiRouter)
app.use('/status', statusRouter)



app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error',{
      message: err.message,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  
  res.render('error',{
    message: err.message,
    error: JSON.stringify(err)
  });
});
app.listen(4444, function(){
  console.info('Server listening on port ' + this.address().port);
});


searchOneAccount = () => {
	Client.Session.create(device, storage, 'your_instagram_username', 'your_instagram_password')
		.then(function(session) {
			Globalsession = session
			return [session, Client.Account.searchForUser(session, '100criterios')]
		})
		.spread(function(session, account) {
			console.log(account)
		})
	
}
startGettingPeople = () => {
	console.log('startGettingPeople')
	Client.Session.create(device, storage, 'your_instagram_username', 'your_instagram_password')
		.then(function(session) {
			Globalsession = session
			console.log('ok....')
			followingPeople( '', session)
		})
}
	startFollowingPeople = () => {
		Client.Session.create(device, storage, 'your_instagram_username', 'your_instagram_password')
			.then(function(session) {
				Globalsession = session
			//	followingPeople('', Globalsession)
				followPeople(session)
			})
	}

getPhoto = (cursor, Globalsession, accountId) => {
	let feed = new Client.Feed.UserMedia(Globalsession, accountId)
	if (cursor && cursor.length > 0) {
		console.log('updating cursor in feed...')
		feed.setCursor(cursor)
	}
	feed.all().then((res) => {
		console.log(res[0]._params.images)
	})
}




followingPeople = (cursor, Globalsession) => {
	let feed = new Client.Feed.AccountFollowers(Globalsession, SemCreteriosId, 10000)
	if (cursor && cursor.length > 0) {
		console.log('updating cursor in feed...')
		feed.setCursor(cursor)
	}
	feed.all().then((res) => {

	
		for(i in res){
			saveOneInstagramUser(res[i])
		}
		if (feed.isMoreAvailable()) {
			cursor = feed.getCursor();
			console.log('cursor ',cursor)
			Instagramuser.count({}, function(err, count){
				console.log('user in total', count)
			})
			setTimeout(() => { 
				followingPeople(cursor, Globalsession)
			}, 60 * 1000 * randomNumbers(20, 2));

		}else{
			console.log('finish!')
			Instagramuser.count({ }, function(err, c) {
				console.log('Count is ' + c);
		   });
		} 
		
	}).catch((err) => {
		setTimeout(() => { 
			followingPeople(cursor, Globalsession)
		}, 60 * 60 * 1000 * randomNumbers(20, 2));
	})
}
saveOneInstagramUser = (user) => {
	var userInstagram =  new Instagramuser({ id_instagram : user._params.id,
		username: user._params.username,
		followed: false 
	   });
		userInstagram.save(function(err, user) {
			//console.log('user saved...', JSON.stringify(user))
		});	
}
followPeople = (Globalsession) => {
	Instagramuser.findOne({followed: false}, function(err, user){
        if(err) {
		  //console.log(err);
		  console.log('error findingOne')
		}else{
			console.log(user)
			followOnePerson(Globalsession, user)
			.then((result) =>{
				totalfollowed++
				errors = 0
				console.log('following ' + user.username + ' | totalfollowed', totalfollowed)
				if(totalfollowed < 201){
					followPeople(Globalsession)
				}else{
					totalfollowed = 0
					waitInterval()
				}
				
			})
			.catch((err) => {
				console.log(JSON.stringify(err))
				// name: 'NotFoundError',
  				//message: 'Page wasn\'t found!',

				if(err.name === 'NotFoundError' && err.message === 'Page wasn\'t found!'){
					Instagramuser.findOneAndRemove({username : user.username}, function(err, nose){
						console.log('user deleted and continuing following')
						followPeople(Globalsession)
					})
				}else{
					errors++
					waitInterval()
				}
			})
		}
	})
}

waitInterval  = () => {
	let minutCounter = 0
	const wakeupTimeMinuts = 30 * errors

	let interval  = setInterval(() => {
		console.log('waiting since ' + minutCounter + ' minuts ago | remaining ' + (wakeupTimeMinuts - minutCounter) + ' minuts ')
		minutCounter++
		if(minutCounter >= wakeupTimeMinuts){
			startFollowingPeople()
			clearInterval(interval)
		}
	}, 1000 * 60);
}

followOnePerson = (Globalsession, account) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => { 
			Client.Relationship.create(Globalsession, account.id_instagram)
			.then(function(relationship) {
				account.followed = true
				Instagramuser.findByIdAndUpdate(account._id, account,
					{new: true},
					 function (err, pp) {
						if (err) console.log('error saving noticia as PostedInInstagram', err)
						resolve(true)
					});
				
			})
			.catch(err => {
				console.log('error  Relationship.create in followOnePerson', err)
				reject(err)
			})
		}, 1000 * randomNumbers(10, 2));
		
	})
}
randomNumbers = (max, min) => {
	return Math.random() * (max - min) + min
}

/*
// And go for login
Client.Session.create(device, storage, 'noticieiro.noticias', 'alberto123')
	.then(function(session) {
   		// Now you have a session, we can follow / unfollow, anything...
		// And we want to follow Instagram official profile
		//uploadPhotoTest(session)
		Globalsession = session
		return [session, Client.Account.searchForUser(session, 'instagram')]   
	})
	.spread(function(session, account) {
		return Client.Relationship.create(session, account.id);
	})
	.then(function(relationship) {
		var feed = new Client.Feed.UserMedia(Globalsession, relationship.params.accountId);
	//	storyTest(relationship.params.accountId)
		// {followedBy: ... , following: ... }
		// Yey, you just followed @instagram
		ImageComposer.processedImage('https://gazetaweb.globo.com/fotosPortal/portal_gazetaweb_com/noticias/foto_pequena/2018/10/201810241402_f8279b6f7b.jpg',
										'Governo prevê cortar mais de 25 mil funcionários de estatais neste ano - Gazetaweb.com')
	})
*/

const noticia = {
	_id: 1,
	title:'Governo prevê cortar mais de 25 mil funcionários de estatais neste ano - Gazetaweb.com',
	urlToImage: 'https://gazetaweb.globo.com/fotosPortal/portal_gazetaweb_com/noticias/foto_pequena/2018/10/201810241402_f8279b6f7b.jpg',
	source: 'globo.com'
}
const categoryName = 'general'
/*
ImageComposer.storyImage(noticia, categoryName)
		.then((imagePath) => {
			console.log('path returned by the promise: ', imagePath)
		})
		.catch((err) => {
			console.log(err)
		})
*/
function uploadPhotoTest(session){
	Client.Upload.photo(session, photoTest)
		.then(function(upload) {
			// upload instanceof Client.Upload
			// nothing more than just keeping upload id
			console.log(upload.params.uploadId);
			return Client.Media.configurePhoto(session, upload.params.uploadId, 'akward caption');
		})
		.then(function(medium) {
			// we configure medium, it is now visible with caption
			console.log(medium.params)
		})
}

function storyTest(accountId){

	Client.Upload.photo(Globalsession, photoTest).then((upload) => {
        var upload_id = upload.params.uploadId;
        return new Request(Globalsession)
            .setMethod('POST')
            .setResource('mediaConfigureStory')
            .setData({
                upload_id,
                captionTest,
                'source_type': '3',
				'configure_mode': '1',
				'story_cta': '[{"links":[{"webUri":"http://noticieiro.com"}]}]'
            })
            .generateUUID()
            .signPayload()
            .send()
            .then(function(data) {
				console.log('storytestDone')
                return data.media;
			})
		}
		)

		/*
		var stories = new Client.Feed.UserStory(Globalsession, accountId);

		stories.postPhoto(photoTest, 'optional caption').then((media) => {
			// do something with media
			console.log(media);
		}); */
}
