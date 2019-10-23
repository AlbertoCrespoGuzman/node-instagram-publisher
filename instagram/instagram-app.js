var Client = require('instagram-private-api').V1;
var device = new Client.Device('noticieiro.noticias');
let Globalsession = {}

var Request = require('instagram-private-api').V1.Request;
let ImageComposer = require('./ImageComposer')
var fs = require('fs')
let writeHashtags = require('./utils/writeHashtags')
var instagramPosts = require('../models/instagram_posts')
const PostSequence = require('../models/post_sequence')

var path = require('path')
const futbol433_id = '253625977'
const cabrodeportesId = '4220148528'
const tumejorjugada = '4716023562'

const download = require('download')
const translate = require('translate-google')

//const rootPath = '/home/ubuntu/news-flow-angular-app/instagram/'
//const rootPath = '/Users/macbookpro4/develop/memes-node-instagram/instagram/'
const rootPath = '/home/ubuntu/memes-node-instagram/instagram/'
const logins ={
	memesland: {
		user: 'your_instagram_username',
		password: 'your_instagram_password'
	}
}
const storages = {
	memesland: new Client.CookieFileStorage(__dirname + '/cookies/your_instagram_username.json')
}
const devices = {
	memesland: new Client.Device('your_instagram_username.bq')
}

const log = require('log-to-file')
var ffmpeg = require('ffmpeg')


// And go for login
module.exports.postStoryInInstagram = (noticia) => {

	ImageComposer.storyImage(noticia)
	.then((imagePath) => {
		loginAndPostStory(imagePath, noticia)
	})
	.catch((err) => {
		console.log(err)
	})

}
module.exports.postPhotoInInstagram = (noticia) => {

	ImageComposer.postImage(noticia)
	.then((imagePath) => {
		loginAndPostPhoto(imagePath, noticia)
	})
	.catch((err) => {
		console.log(err)
	})

}
module.exports.seachAccountByName = (accountName) =>{
	return new Promise((resolve, reject) => {
		Client.Session.create(devices.memesland, storages.memesland, logins.memesland.user, logins.memesland.password)
		.then(function(session) {
			console.log('session got')
			return [session, Client.Account.searchForUser(session, accountName)]   
		})
		.spread(function(session, account) {
					resolve(account)	
		})
		.catch(err => {
			reject(err)
		})
	})
}
module.exports.getFeedByAccountId = async function (accountId, cursor){
	return new Promise((resolve, reject) => {
		Client.Session.create(devices.memesland, storages.memesland, logins.memesland.user, logins.memesland.password)
			.then(function(session) {
							let feed = new Client.Feed.UserMedia(session, accountId)
							if (cursor && cursor.length > 0) {
								feed.setCursor(cursor)
							}
							feed.get().then((res) => {
								if (feed.isMoreAvailable()) {
									cursor = feed.getCursor();
									res[0].cursor = cursor
									console.log('cursor available in instagram-app ->', res[0].cursor)
								}
								resolve(res)
							})
							.catch(err => {
								reject(err)
							})
				})
			})
}
module.exports.postImage = (item, language) => {
	Client.Upload.photo(session, imagePath)
			.then(function(upload) {
				return Client.Media.configurePhoto(session, upload.params.uploadId, noticia.title + 
					' | fonte: ' + noticia.source + ' | link na bio. \n\r' + writeHashtags.getHashtags(noticia) );
			})
			.then(function(medium) {
				deleteImage(noticia)
			})


			return new Promise((resolve, reject) => {
				Client.Session.create(devices[item.category], storages[item.category], logins[item.category].user,
					 logins[item.category].password)
					.then(function(session) {
						let video = ''
						let image = ''
		
						Promise.all([
							item.imageUrl
					].map(x => {
						if(x.indexOf('.jpg') != -1){
							image = x.split('?')[0].split('/')[x.split('?')[0].split('/').length -1]
						}
						
						download(x, rootPath + '/media')})).then((res) => {
							if(!item.translate){
								setTimeout(function(){
									Client.Upload.photo(session,  rootPath +  '/media/' + image )
										.then(function(upload) {
											setTimeout(function(){
												return Client.Media.configurePhoto(session, upload.uploadId, item.caption);
											}, 10000)
										})
										.then(algo => {
		
											setTimeout(function(){
												deleteFootballFiles(image)
												resolve(true)
											}, 12000)
											
										}).catch(err => {
											console.error(err)
											deleteFootballFiles(image)
											reject(err)
										}) 
									}, 1500)
							}else{
								translate(item.caption, {from: language, to: 'pt'}).then(resTranslated => {
									setTimeout(function(){
											Client.Upload.photo(session, rootPath + '/media/' + image )
												.then(function(upload) {
													setTimeout(function(){
														return Client.Media.configurePhoto(session, 
															upload.uploadId, resTranslated + getHashtags(item.instagram_account_id));
													}, 10000)
												})
												.then(algo => {
			
													setTimeout(function(){
														deleteFootballFiles(image)
														resolve(true)
													}, 12000)
													
												}).catch(err => {
													console.error(err)
													deleteFootballFiles(image)
													reject(err)
												}) 
											}, 1500)
								}).catch(err => {
									console.error(err)
									deleteFootballFiles(image)
									reject(err)
								})
							}
							
							
					}).catch(err => {console.log(err);reject(err);
						deleteFootballFiles(image)})
					})
				})	
}
module.exports.postVideo = (item, language) => {
	return new Promise((resolve, reject) => {
		Client.Session.create(devices[item.category], storages[item.category], logins[item.category].user,
			 logins[item.category].password)
			.then(function(session) {
				let video = ''
				let image = ''

				Promise.all([
					item.imageUrl,
					item.videoUrl
			].map(x => {
				if(x.indexOf('.jpg') != -1){
					image = x.split('?')[0].split('/')[x.split('?')[0].split('/').length -1]
				}else{
					video = x.split('?')[0].split('/')[x.split('?')[0].split('/').length -1]
				}
				
				download(x, rootPath + '/media')})).then((res) => {
					if(!item.translate){
						setTimeout(function(){
							Client.Upload.video(session,  rootPath +  '/media/' + video,  rootPath + '/media/' + image )
								.then(function(upload) {
									setTimeout(function(){
										return Client.Media.configureVideo(session, upload.uploadId, item.caption, upload.durationms);
									}, 30000)
								})
								.then(algo => {

									setTimeout(function(){
										deleteFootballFiles(image)
										deleteFootballFiles(video)
										const instavideo = {
											video: true,
											video_url: item.videoUrl,
											image_url: item.imageUrl
										}
										instagramPosts.create(instavideo)
										resolve(instavideo)
									}, 60000)
									
								}).catch(err => {
									console.error(err)
									deleteFootballFiles(image)
									deleteFootballFiles(video)
									reject(err)
								}) 
							}, 1500)
					}else{
						translate(item.caption, {from: language, to: 'pt'}).then(resTranslated => {
							setTimeout(function(){
									Client.Upload.video(session,  rootPath +  '/media/' + video,  rootPath + '/media/' + image )
										.then(function(upload) {
											setTimeout(function(){
												return Client.Media.configureVideo(session, 
													upload.uploadId, resTranslated + getHashtags(item.instagram_account_id), upload.durationms);
											}, 30000)
										})
										.then(algo => {
	
											setTimeout(function(){
												deleteFootballFiles(image)
												deleteFootballFiles(video)
												const instavideo = {
													video: true,
													video_url: item.videoUrl,
													image_url: item.imageUrl
												}
												instagramPosts.create(instavideo)
												resolve(instavideo)
											}, 600000)
											
										}).catch(err => {
											console.error(err)
											deleteFootballFiles(image)
											deleteFootballFiles(video)
											reject(err)
										}) 
									}, 1500)
						}).catch(err => {
							console.error(err)
							deleteFootballFiles(image)
							deleteFootballFiles(video)
							reject(err)
						})
					}
					
					
			}).catch(err => {console.log(err);reject(err);
				deleteFootballFiles(image)
				deleteFootballFiles(video)})
			})
		})
}
module.exports.postMemeAutomatically = async function(account, cursor){

	let posts = []
	log('<span style="color:blue">posting AutomaticMeme </span>' + account.name, 'log/log.log')
	
	return new Promise((resolve, reject) => {
		
	Client.Session.create(devices.memesland, storages.memesland, logins.memesland.user, logins.memesland.password)
		.then(function(session) {
						let feed = new Client.Feed.UserMedia(session, account.instagram_id.toString())
						if (cursor && cursor.length > 0) {
							feed.setCursor(cursor)
						}
						feed.get().then((res) => {
							
							let doSomething = true
							let isImage = null
							if(account.get_images && account.get_videos){
								let numRan = Math.floor(randomNumbers(0,7))
								isImage = numRan % 2 === 0 ? true : false
							}else if(account.get_images && !account.get_videos){
								isImage = true
							}else if(!account.get_images && account.get_videos){
								isImage = false
							}else{
								doSomething = false
							}
							
							if(doSomething){
								log('<span style="color:orange">posting ' + (isImage ? ' Image ' : ' Video ')  + ' </span>' + account.name, 'log/log.log')
								res.forEach(item => {
									if(typeof item._params.carouselMediaCount === "undefined"){
										let onepost = {
											video: {},
											image: {},
											caption: '',
											location: '',
											likeCount: 0,
											viewCount: 0,
											isImage: isImage,
											instagram_id: 0,
											video_duration: 0
										}
										if(isImage){
											if(!item._params.videos
												&& item._params.images && item._params.images.length > 0){
													let pushed = false
													item._params.images.forEach( video =>{
													//	if(video.width === video.height){
															if(!pushed){
																onepost.video = null
																onepost.image = item._params.images[0].url
																onepost.caption = account.get_caption ? (item._params.caption ? item._params.caption : '') : ''
																onepost.likeCount = item._params.likeCount
																onepost.viewCount = 0
																onepost.instagram_id = item._params.id
																posts.push(onepost)
																pushed = true
															}
												//		}
													})
											}

										}else{
											if(item._params.videos && item._params.videos.length > 0
												&& item._params.images && item._params.images.length > 0){
													let pushed = false
													item._params.videos.forEach( video =>{
															if(!pushed){
																onepost.video = video.url
																onepost.video_height = video.height,
																onepost.video_width = video.width,
																onepost.image = item._params.images[item._params.images.length -1].url
																onepost.caption = account.get_caption ? item._params.caption : ''
																onepost.likeCount = item._params.likeCount
																onepost.viewCount = item._params.viewCount
																onepost.instagram_id = item._params.id
																onepost.video_duration = item._params.video.duration
																posts.push(onepost)
																pushed = true
															}
													})
											}
										}
									}
								})

								let superPost = {
									video: {},
									image: {},
									caption: '',
									location: '',
									likeCount: 0,
									viewCount: 0,
									instagram_id: 0,
									video_duration: 0,
									video_height: 0,
									video_width: 0
								}
								if(posts.length === 0){
									let error = {
										value: 0,
										account: account.instagram_id
									}
									if(account && account._id){
										savePost_sequence(account)
									}
									reject(error)
									log('<span style="color:red">no posts availables ' + (isImage ? ' images' : ' videos') + '</span>', 'log/log.log')
									return null
								}

								if(isImage){
									checkInstagramImages(posts).then(checkedPosts =>{
										for(var i in checkedPosts){
											if(superPost.likeCount < checkedPosts[i].likeCount){
												superPost = checkedPosts[i]
											}
										}
										if( typeof superPost.image != "string"){
											log('<span style="color:green">post gotten malformed </span>' + JSON.stringify(superPost), 'log/log.log')
											if(account && account._id){
												savePost_sequence(account)
											}
											let error = {
												value: 0,
												account: account.instagram_id
											}
											reject(error)
										}	else{
											postMemeImage(superPost, account)
												.then(result => {
													log('<span style="color:green">postMemeImage ok</span>', 'log/log.log')
												})
												.catch(err => {
													if(account && account._id){
														savePost_sequence(account)
													}
													log('<span style="color:red">postMemeImage error' + err +  '</span>', 'log/log.log')
												})
										}
										


									})
								}else{
									checkInstagramVideosAuto(posts).then(checkedPosts =>{
										for(var i in checkedPosts){
											if(superPost.likeCount < checkedPosts[i].likeCount){
												superPost = checkedPosts[i]
											}
										}	
										if( typeof superPost.image != "string"){
											if(account && account._id){
												savePost_sequence(account)
											}
											let error = {
												value: 0,
												account: account.instagram_id
											}
											reject(error)
										}
										postMemeVideo(superPost, account)
										.then(result => {
											log('<span style="color:green">postMemeVideo ok </span>', 'log/log.log')
										})
										.catch(err => {
											if(account && account._id){
												savePost_sequence(account)
											}
											log('<span style="color:red">postMemeVideo error' + err + '</span>', 'log/log.log')
										})
									

									})
								}
								
							}else{
								log('<span style="color:yellow">account no get image either video!!, so call the next</span>', 'log/log.log')
								let error = {
									value: 0,
									account: account.instagram_id
								}
								if(account && account._id){
									savePost_sequence(account)
								}
								reject(error)
							}
							
						})
						.catch( err => {
							log( '<span style="color:red">Pagina ' + account.name +  ' no encontrada</span>', 'log/log.log')
							let error = {
								value: 0,
								account: account.instagram_id
							}
							if(account && account._id){
								savePost_sequence(account)
							}
							reject(error)
						})
	
		})
		
		.catch( err => {
				log('<span style="color:red">err getting Feed ' + JSON.stringify(err) + '</span>', 'log/log.log')
				if(account && account._id){
					savePost_sequence(account)
				}
			//	deleteFootballFiles(image)
			//	deleteFootballFiles(video)
				reject(err)
		})

	})
}
postMemeVideo = (superPost, account) => {
	return new Promise((resolve, reject) => {
		let video = ''
		let image = ''
			log('postMemeVideo from : '+ JSON.stringify(account.name), 'log/log.log')
			log('postMemeVideo: '+ JSON.stringify(superPost), 'log/log.log')
			
			Promise.all([
					superPost.image,
					superPost.video
			].map(x => {
				if(x.indexOf('.jpg') != -1){
					image = x.split('?')[0].split('/')[x.split('?')[0].split('/').length -1]
				}else{
					video = x.split('?')[0].split('/')[x.split('?')[0].split('/').length -1]
				}
				
				download(x, rootPath + '/media')})).then((res) => {
						log('-downloading video and image..', 'log/log.log')
						setTimeout(function(){
								log('--timeout for downloading finished', 'log/log.log')
								processVideo(superPost, rootPath +  '/media/' + video).then(hasBeenProcessed =>{
									log('square, <span style="color:green">video processed </span>', 'log/log.log')
							
								Client.Session.create(devices.memesland, storages.memesland, logins.memesland.user, logins.memesland.password)
								.then(function(session) {
										Client.Upload.video(session,  rootPath +  '/media/' + 
											(hasBeenProcessed ? video.split('.')[0] + '_.' + video.split('.')[1]: video),  rootPath +  '/media/' +  image )
											.then(function(upload) {
												log('---sending video, waiting for timeout 50 secs...', 'log/log.log')
												setTimeout(function(){
													log('----timeout Finished...', 'log/log.log')
													const instavideo = {
														video: true,
														video_url: superPost.instagram_id,
														image_url: superPost.image.split('?')[0]
													}
													instagramPosts.create(instavideo, function(err, novo){})
													log('-----sending configureVideo to instagram', 'log/log.log')
													console.log('6')
													const caption = getHashtagsMeme(account, superPost.caption)
													console.log('6.2')
													return Client.Media.configureVideo(session, upload.uploadId, caption , upload.durationms).catch(err => {
																	log('<span style="color:red">err configureVideo...  ' + err + '</span>', 'log/log.log')
																})
													
												}, 60000)
											})
											.catch(err => {
												log('<span style="color:red">err Upload.video...  ' + err + '</span>', 'log/log.log')
											})
											.then(algo => {
												log('------video response from instagram' + algo, 'log/log.log')
												if(account && account._id){
													savePost_sequence(account)
												}
												setTimeout(function(){
													deleteFootballFiles(image)
													deleteFootballFiles(video)
													
													resolve(true)
												}, 120000)
												
											}).catch(err => {
												log('<span style="color:red">err uploading video ' + err + '</span>', 'log/log.log')
												if(account && account._id){
													savePost_sequence(account)
												}
												deleteFootballFiles(image)
												deleteFootballFiles(video)
												reject(err)
											}) 
										}).catch(err => {
											log('<span style="color:red">err getting Instagram Session ' + err + '</span>', 'log/log.log')
										})

								})
								.catch(err=> {
									log('square, <span style="color:red">Error processing Video ' + +' </span>', 'log/log.log')
									reject(err)
								})
								}, superPost.video_duration ? Math.floor(superPost.video_duration) * 3 * 1000 : 30000)
					


				}).catch(err => {
					log('<span style="color:red">err DOWNLOADING video ' + err + '</span>', 'log/log.log')
				})
	})
}
postMemeImage = (superPost, account) => {
	return new Promise((resolve, reject) => {
			let video = ''
			let image = ''
			log('postmemeImage  -> ', JSON.stringify(superPost), 'log/log.log')
			Promise.all([
					superPost.image
			].map(x => {
				if(x.indexOf('.jpg') != -1){
					image = x.split('?')[0].split('/')[x.split('?')[0].split('/').length -1]
				}
				
				download(x, rootPath + '/media')})).then((res) => {
					log('-downloading image', 'log/log.log')
						setTimeout(function(){
							Client.Session.create(devices.memesland, storages.memesland, logins.memesland.user, logins.memesland.password)
							.then(function(session) {
								Client.Upload.photo(session,  rootPath + '/media/' + image )
									.then(function(upload) {
										setTimeout(function(){
											const instavideo = {
												image: true,
												video_url: '',
												image_url: superPost.instagram_id
											}
											instagramPosts.create(instavideo, function(err, novo){console.log(novo)})
											log('--sending configurePhoto to instagram', 'log/log.log')
											const caption = getHashtagsMeme(account, superPost.caption)
											return Client.Media.configurePhoto(session,  upload.params.uploadId, caption);
										}, 30000)
									})
									.then(algo => {
										log('---repsonse instagram ' + algo, 'log/log.log')
										if(account && account._id){
											savePost_sequence(account)
										}
										setTimeout(function(){
											deleteFootballFiles(image)
											
											resolve(true)
										}, 60000)
										
									}).catch(err => {
										log('<span style="color:red">error sending image' + err + '</span>', 'log/log.log')
										if(account && account._id){
											savePost_sequence(account)
										}
										console.error(err)
										deleteFootballFiles(image)
										deleteFootballFiles(video)
										reject(err)
									}) 
								})
								}, 3000)
					


				})
	})
}
processVideo = (superPost, file) => {
	return new Promise((resolve, reject) => {
		if(superPost.video_height === superPost.video_width){
			log('square, no processed', 'log/log.log')
			resolve(false)
		}else{
			let maxSize = superPost.video_height > superPost.video_width ? superPost.video_height : superPost.video_width
			let newFile = file.split(".")[0] + '_.' + file.split(".")[1]
			
			log('new file name: will be: ' + newFile , 'log/log.log')
			log('processing video new size: ' + maxSize.toString() + 'x' + maxSize.toString(), 'log/log.log')
			try {
				var process = new ffmpeg(file)
				process.then(function (video) {
					video
					.setVideoSize(maxSize.toString() + 'x' + maxSize.toString(), true, true, '#ffffff')
					
					.save( newFile, function (error, file) {
						console.log(error)
						if (!error){
							log('new file...' + file, 'log/log.log')
							resolve(true)
						}else{
							reject(error)
						}
							console.log('Video file: ' + file);
					})
			
				}, function (err) {
					console.log('Error: ' + err);
					reject(err)
				});
			} catch (e) {
				console.log(e.code);
				console.log(e.msg);
				reject(e)
			}
		}
	})
}
module.exports.postMemeVideo = (superPost, account) => {
	return new Promise((resolve, reject) => {
		let video = ''
		let image = ''
		console.log('eeeee')
		console.log(JSON.stringify(superPost))
		console.log(JSON.stringify(account))
			log('postMemeVideo from : '+ JSON.stringify(account.name), 'log/log.log')
			log('postMemeVideo: '+ JSON.stringify(superPost), 'log/log.log')
			Promise.all([
					superPost.image,
					superPost.video
			].map(x => {
				if(x.indexOf('.jpg') != -1){
					image = x.split('?')[0].split('/')[x.split('?')[0].split('/').length -1]
				}else{
					video = x.split('?')[0].split('/')[x.split('?')[0].split('/').length -1]
				}
				console.log('1')
				download(x, rootPath + '/media')})).then((res) => {
					console.log('2')
			//			log('-downloaded video and image..', 'log/log.log')
						setTimeout(function(){
			//					log('--timeout for downloading finished', 'log/log.log')
								processVideo(superPost, rootPath +  '/media/' + video).then(hasBeenProcessed =>{
									console.log('3')
									log('square, <span style="color:green">video processed </span>', 'log/log.log')
							
								Client.Session.create(devices.memesland, storages.memesland, logins.memesland.user, logins.memesland.password)
								.then(function(session) {
									console.log('4')
										Client.Upload.video(session,  rootPath +  '/media/' + 
											(hasBeenProcessed ? video.split('.')[0] + '_.' + video.split('.')[1]: video),  rootPath +  '/media/' +  image )
											.then(function(upload) {
												console.log('5')
			//									log('---sending video, waiting for timeout 50 secs...', 'log/log.log')
			//									setTimeout(function(){
													log('----timeout Finished...', 'log/log.log')
													const instavideo = {
														video: true,
														video_url: superPost.instagram_id,
														image_url: superPost.image.split('?')[0]
													}
													instagramPosts.create(instavideo, function(err, novo){})
													log('-----sending configureVideo to instagram', 'log/log.log')
													const caption = getHashtagsMeme(account, superPost.caption)
												 Client.Media.configureVideo(session, upload.uploadId, caption, upload.durationms)
															.then(response => {
																console.log('7')
																resolve(response)
															}).catch(err => {
																reject(err)
																log('<span style="color:red">err configureVideo...  ' + err + '</span>', 'log/log.log')
															})
													
												}, 10000)
											})
											.catch(err => {
												log('<span style="color:red">err Upload.video...  ' + err + '</span>', 'log/log.log')
											})
											.then(algo => {
												log('------video response from instagram' + algo, 'log/log.log')
												if(account && account._id){
													savePost_sequence(account)
												}
												setTimeout(function(){
													deleteFootballFiles(image)
													deleteFootballFiles(video)
													
													resolve(true)
												}, 120000)
												
											}).catch(err => {
												log('<span style="color:red">err uploading video ' + err + '</span>', 'log/log.log')
												if(account && account._id){
													savePost_sequence(account)
												}
												deleteFootballFiles(image)
												deleteFootballFiles(video)
												reject(err)
											}) 
										}).catch(err => {
											log('<span style="color:red">err getting Instagram Session ' + err + '</span>', 'log/log.log')
										})

								}, superPost.video_duration ? Math.floor(superPost.video_duration) * 2 * 1000 : 10000)
								.catch(err=> {
									log('square, <span style="color:red">Error processing Video ' + +' </span>', 'log/log.log')
									reject(err)
								})
			//		}, superPost.video_duration ? Math.floor(superPost.video_duration) * 2 * 1000 : 10000)
					


				}).catch(err => {
					log('<span style="color:red">err DOWNLOADING video ' + err + '</span>', 'log/log.log')
				})
	})
}
module.exports.postMemeImage = (superPost, account) => {
	return new Promise((resolve, reject) => {
			let video = ''
			let image = ''
			log('-postingImage from account ' + account.name, 'log/log.log')
			Promise.all([
					superPost.image
			].map(x => {
				if(x.indexOf('.jpg') != -1){
					image = x.split('?')[0].split('/')[x.split('?')[0].split('/').length -1]
				}
				download(x, rootPath + '/media')})).then((res) => {
					log('--downloading image', 'log/log.log')
						setTimeout(function(){
							Client.Session.create(devices.memesland, storages.memesland, logins.memesland.user, logins.memesland.password)
							.then(function(session) {
								Client.Upload.photo(session,  rootPath + '/media/' + image )
									.then(function(upload) {
										setTimeout(function(){
											const instavideo = {
												image: true,
												video_url: '',
												image_url: superPost.instagram_id
											}
											instagramPosts.create(instavideo, function(err, novo){console.log(novo)})
											log('---photo theorically updated... sending configurePhoto to isntagram', 'log/log.log')
											const caption = getHashtagsMeme(account, superPost.caption)
											//return Client.Media.configurePhoto(session,  upload.params.uploadId, "test");
											Client.Media.configurePhoto(session,  upload.params.uploadId, caption).then(response => {
												
											})
											.catch(err =>{
												console.log('!!!!!!! ->error ' + JSON.stringify(err))
												console.log('!!!!!!! ->  error ' + err + '.')
											})
										}, 30000)
									})
									.then(algo => {
										log('----instagram response' + algo, 'log/log.log')
										if(account && account._id){
											savePost_sequence(account)
										}
										setTimeout(function(){
											deleteFootballFiles(image)
											
											resolve(true)
										}, 60000)
										
									}).catch(err => {
										log('<span style="color:red">error uploading image to instagram ' + err + '</span>', 'log/log.log')
										if(account && account._id){
											savePost_sequence(account)
										}
										console.error(err)
										deleteFootballFiles(image)
										deleteFootballFiles(video)
										reject(err)
									}) 
								})
								}, 3000)
					


				})
	})
}
function savePost_sequence(account){
	PostSequence.findOne({})
			.exec((err, postSequence) => {
				if(err){
					console.log(err)
				}else{
					const postSequenceNew = {
						last: account._id
					}
					if(!postSequence){
						PostSequence.create(postSequenceNew)
					}else{
						PostSequence.findByIdAndUpdate( postSequence._id, {$set: postSequenceNew}, 
														{ new: true }, function(err, doc){
															
						})
					}
				}
			})
}
module.exports.postVideoFootball = async function(cursor, accountId, language){

	let posts = []
	return new Promise((resolve, reject) => {
	Client.Session.create(devices.sports, storages.sports, logins.sports.user, logins.sports.password)
		.then(function(session) {
						let feed = new Client.Feed.UserMedia(session, accountId)
						if (cursor && cursor.length > 0) {
							feed.setCursor(cursor)
						}
						feed.get().then((res) => {
							for(var i in res){
								let onepost = {
									video: {},
									image: {},
									caption: '',
									location: '',
									likeCount: 0,
									viewCount: 0
								}
								
								if(res[i]._params.videos && res[i]._params.videos.length > 0
									&& res[i]._params.images && res[i]._params.images.length > 0){
										let pushed = false
										res[i]._params.videos.forEach( video =>{
											if(video.width === video.height){
												if(!pushed){
													onepost.video = video
													onepost.image = res[i]._params.images[res[i]._params.images.length -1]
													onepost.caption = res[i]._params.caption
													onepost.likeCount = res[i]._params.likeCount
													onepost.viewCount = res[i]._params.viewCount
													posts.push(onepost)
													pushed = true
												}
											}
										})
								}
								
							}
							let superPost = {
								video: {},
								image: {},
								caption: '',
								location: '',
								likeCount: 0,
								viewCount: 0
							}
							console.log('antes del check')
						checkInstagramVideos(posts).then(checkedPosts =>{
							console.log('despues del check')
											for(var i in checkedPosts){
												
												if(superPost.likeCount < checkedPosts[i].likeCount){
													superPost = checkedPosts[i]
												}
											}	
										//	onepost.location = res[i].location._params.title
										let video = ''
										let image = ''

										Promise.all([
											superPost.image.url,
											superPost.video.url
									].map(x => {
										if(x.indexOf('.jpg') != -1){
											image = x.split('?')[0].split('/')[x.split('?')[0].split('/').length -1]
										}else{
											video = x.split('?')[0].split('/')[x.split('?')[0].split('/').length -1]
										}
										
										download(x, rootPath + '/media')})).then((res) => {
											translate(superPost.caption, {from: language, to: 'pt'}).then(resTranslated => {
												setTimeout(function(){
														Client.Upload.video(session,  rootPath +  '/media/' + video,  rootPath + '/media/' + image )
															.then(function(upload) {
																setTimeout(function(){
																	return Client.Media.configureVideo(session, upload.uploadId, resTranslated.replace('Esse dia foi foda','') + getHashtags(accountId), upload.durationms);
																}, 30000)
															})
															.then(algo => {

																setTimeout(function(){
																	deleteFootballFiles(image)
																	deleteFootballFiles(video)
																	const instavideo = {
																		video: true,
																		video_url: superPost.video.url,
																		image_url: superPost.image.url
																	}
																	instagramPosts.create(instavideo)
																	resolve(instavideo)
																}, 60000)
																
															}).catch(err => {
																console.error(err)
																deleteFootballFiles(image)
																deleteFootballFiles(video)
																reject(err)
															}) 
														}, 1500)
											}).catch(err => {
												console.error(err)
												deleteFootballFiles(image)
												deleteFootballFiles(video)
												reject(err)
											})
											
									}).catch(err => {console.log(err);reject(err);
										deleteFootballFiles(image)
										deleteFootballFiles(video)})
						})	
						.catch(err => {console.log(err); reject(err)
							deleteFootballFiles(image)
							deleteFootballFiles(video)})
						
						 
						})
		})
		.catch( err => {
				console.log(JSON.stringify(err))

				deleteFootballFiles(image)
				deleteFootballFiles(video)
				reject(err)
		})
	})
}
function getHashtags(accountId){
	let text = ' '
	switch(accountId){
		case futbol433_id:
			text += '⚽ #futebol #football '
			break
		case cabrodeportesId:
			text += '#esportes #sports'
			break
		case tumejorjugada:
			text += '⚽ #futebol #football'
			break
	}
	return text
}
function getHashtagsMeme(account, caption){
	let text = ''
		if(caption){
			if(caption.indexOf('#') != -1){
				text = caption.split('#')[0]
			}else{
				text = caption
			}
		
	}
	let numRan = Math.floor(randomNumbers(0,5))
		
		if(numRan === 1){
			text += '😵😂'
		}else if(numRan === 2){
			text += '😱🤪'
		}else if(numRan === 3){
			text += '🤣😂😅'
		}else if(numRan === 4){
			text += '🤦‍♂🤭'
		}else{
			text += '😎🙂🤭'
		}
	text = text.replace("Esse dia foi foda.", "")
	text += '\n.\n.\n.\n Una-se à tribo 🗿👉@memesland.br👈 #memesland #memesbrasil #memesdobrasil #brasilmemes #memesbrasileiros #memes #risos #risadas #risadasbr #videosengracados #zuera'
	//	text += 'Una-se à tribo '
	return text
}
const  checkInstagramVideos = async function(posts){
	let checkedPosts = []
		for (const item of posts) {
			var onePost = await checkOneInstagramVideo(item).catch(err => console.log(err))
			if(onePost && onePost.video && onePost.video.url && onePost.video.url.length > 5){
				checkedPosts.push(onePost)
			}
		}
		return checkedPosts
}
const  checkInstagramVideosAuto = async function(posts){
	let checkedPosts = []
		for (const item of posts) {
			var onePost = await checkOneInstagramVideo(item).catch(err => console.log(err))
			if(onePost && onePost.video && onePost.video && onePost.video.length > 5){
				checkedPosts.push(onePost)
			}
		}
		return checkedPosts
}
const  checkOneInstagramVideo = async function (post) {

	return new Promise((resolve, reject) => {
		instagramPosts.find({video: true, video_url: post.instagram_id}, function(err, instagramPost){
			if(instagramPost.length > 0){
				resolve('')
			}else{
				resolve(post)
			}
		})
	})
}
const  checkInstagramImages = async function(posts){
	let checkedPosts = []
		for (const item of posts) {
			var onePost = await checkOneInstagramImage(item).catch(err => console.log(err))
			if(onePost && onePost.image && onePost.image && onePost.image.length > 5){
				checkedPosts.push(onePost)
			}
		}
		return checkedPosts
}

const  checkOneInstagramImage = async function (post) {

	return new Promise((resolve, reject) => {
		instagramPosts.find({image: true, image_url: post.instagram_id}, function(err, instagramPost){
			if(instagramPost.length > 0){
				resolve('')
			}else{
				resolve(post)
			}
		})
	})
}



loginAndPostStory = (imagePath, noticia) => {

		Client.Session.create(devices[noticia.category.name], storages[noticia.category.name],
								 logins[noticia.category.name].user, logins[noticia.category.name].password)
		.then(function(session) {
			Globalsession = session
			storyTest(imagePath, noticia)  
		})
}
loginAndPostPhoto = (imagePath, noticia) => {

	Client.Session.create(devices[noticia.category.name], storages[noticia.category.name], 
		logins[noticia.category.name].user, logins[noticia.category.name].password)
	.then(function(session) {
		Globalsession = session
		uploadPhotoTest(Globalsession, noticia, imagePath ) 
	})
}
function uploadPhotoTest(session, noticia, imagePath){
			Client.Upload.photo(session, imagePath)
			.then(function(upload) {
				return Client.Media.configurePhoto(session, upload.params.uploadId, noticia.title + 
					' | fonte: ' + noticia.source + ' | link na bio. \n\r' + writeHashtags.getHashtags(noticia) );
			})
			.then(function(medium) {
				deleteImage(noticia)
			})
	
}

function storyTest(imagePath, noticia){

	Client.Upload.photo(Globalsession, imagePath).then((upload) => {
        var upload_id = upload.params.uploadId;
        return new Request(Globalsession)
            .setMethod('POST')
            .setResource('mediaConfigureStory')
            .setData({
				upload_id,
				 imagePath,
									'source_type': '3',
									'configure_mode': '1',
									'story_cta': '[{"links":[{"webUri":"http://noticieiro.com/lnoticias/' + noticia._id + '/category/' + noticia.category.name + '"}]}]'
            })
            .generateUUID()
            .signPayload()
            .send()
            .then(function(data) {
							console.log('storytestDone')
							deleteImage(noticia)
							return data.media;
			
				}
		)

		/*
		var stories = new Client.Feed.UserStory(Globalsession, accountId);

		stories.postPhoto(photoTest, 'optional caption').then((media) => {
			// do something with media
			console.log(media);
		}); */
	});
}


deleteFootballFiles = (file) => {
	try{
		fs.unlinkSync(  path.resolve('instagram/media/'+ file), function(data, error){
			if(error)
				log('error deleting file '+ file, 'log/log.log')
			
				log(' file '+ file + ' deleted', 'log/log.log')
		}) 
	}catch(err){
		log(err, 'log/log.log')
	}
	
}

deleteImage = (noticia) => {
	fs.unlink( rootPath + 'instagram/media/'+ noticia._id + '.jpg', function(data, error){
		console.log(error)
		return null
	})
}
randomNumbers = (max, min) => {
	let num = parseInt(Math.random()*(max-min+1)+min)
	console.log('num random conho', num)
	return num;
}