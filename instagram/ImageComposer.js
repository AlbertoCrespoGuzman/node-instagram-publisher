let Jimp = require('jimp')
let simplifyText = require('./utils/simplifyText')
const rootPath = '/home/ubuntu/news-flow-angular-app/instagram/'

const imageWidth = 432
const imageHeight =  768

const imageHeightFeed = 540

const colorsByCategory = {
    general: '#51b8f6',
    science: '#fdec36',
    technology: '#fdec36',
    sports: '#cefe7e',
    health:'#fb7c86',
    business: '#ec3c86',
    entertainment: '#ffb735'
}
let noticia = {}
let categoryName = ''
let fontColorType = ''
let backgroundType = ''


const fontPaths = [rootPath + 'fonts/anton-',rootPath + 'fonts/news-',rootPath + 'fonts/playground-',
rootPath + 'fonts/sympathy-', rootPath + 'fonts/open-', rootPath + 'fonts/oswald-']

    
module.exports.storyImage = (noticiaAntes) => 
{
 noticia = noticiaAntes
 
    
    
 return new Promise((resolve, reject) => {
    
    Jimp.read(noticia.urlToImage)
    .then(image => {
        image.resize(imageWidth, Jimp.AUTO)
        let imageUrl = image

        Jimp.read(rootPath + 'media/static/' + noticia.category.name + '/' + randomNumbers(0,6) + '.png')
        .then(background => {


                background.composite(imageUrl, 0, imageHeight/2 - imageUrl.bitmap.height / 2 - 90/*, [Jimp.BLEND_MULTIPLY, 0.2, 0.2] */);
                let blendedImage = background
                const bubble = rootPath + 'media/static/' + 'bubble-background.png'
                
                
                Jimp.read(bubble)
                .then(bubbleImage => {
                    blendedImage.composite(bubbleImage, 20, imageHeight/3 + 240/*, [Jimp.BLEND_MULTIPLY, 0.2, 0.2] */)
                    const randomFont = fontPaths[2]
                    console.log(randomFont)
                    Jimp.loadFont(randomFont + 'black.fnt').then(font => {
                        blendedImage.print(
                        font,
                        40,
                        imageHeight/3 -40,
                        {
                            text: simplifyText.convertString(noticia.title + ' | fonte: ' + noticia.source),
                            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE 
                        },
                        imageWidth -100,
                        imageHeight
                        
                        )          
                        Jimp.read(rootPath + 'media/static/' + noticia.category.name + '-300x100.png')
                                    .then(imageLogo => {
                                        blendedImage.composite(imageLogo, imageWidth/2 - imageLogo.bitmap.width / 2,
                                                                            imageLogo.bitmap.height / 2 -20);
                                        blendedImage.writeAsync(rootPath + 'media/' + noticia._id + '.jpg')
                                        .then(finalImage =>{
                                            resolve(rootPath + 'media/' + noticia._id + '.jpg')
                                        })
                                        .catch(err => {
                                            reject(err)
                                        })
                                    })
                                    .catch(err => {
                                        reject(err)
                                    });
                            
                    })
                    .catch(err => {
                        reject(err)
                        })
                    
                    
                    
                    .catch(err => {
                        console.log(JSON.stringify(err))
                    })
                })
                


                
        })
        .catch(err => {
            reject(err)
        });


    })
    .catch(err => {
        console.log(err)
        reject(err)
    });

})
}



module.exports.postImage = (noticiaAntes) => 
    {
     noticia = noticiaAntes
     console.log('noticia cateogry -> ', noticia.category.name)
        
        
     return new Promise((resolve, reject) => {
        
        Jimp.read(noticia.urlToImage)
        .then(image => {
            image.resize(imageWidth, Jimp.AUTO)
            let imageUrl = image

            Jimp.read(rootPath + 'media/static/' + noticia.category.name + '/' + randomNumbers(0,6) + '-feed.png')
            .then(background => {


                    background.composite(imageUrl, 0, imageHeightFeed/2 - imageUrl.bitmap.height / 2 - 90/*, [Jimp.BLEND_MULTIPLY, 0.2, 0.2] */);
                    let blendedImage = background
                    const bubble = rootPath + 'media/static/' + 'bubble-background.png'
                    
                    
                    Jimp.read(bubble)
                    .then(bubbleImage => {
                        blendedImage.composite(bubbleImage, 20, imageHeightFeed/3 + 130/*, [Jimp.BLEND_MULTIPLY, 0.2, 0.2] */)
                        const randomFont = fontPaths[2]
                        console.log(randomFont)
                        Jimp.loadFont(randomFont + 'black.fnt').then(font => {
                            blendedImage.print(
                            font,
                            40,
                            imageHeightFeed/3 -40,
                            {
                                text: simplifyText.convertString(noticia.title + ' | fonte: ' + noticia.source),
                                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE 
                            },
                            imageWidth -100,
                            imageHeightFeed
                            
                            )          
                            Jimp.read(rootPath + 'media/static/' + noticia.category.name + '-300x100.png')
                                        .then(imageLogo => {
                                            blendedImage.composite(imageLogo, imageWidth/2 - imageLogo.bitmap.width / 2,
                                                                                imageLogo.bitmap.height / 2 -50);
                                            blendedImage.writeAsync(rootPath + 'media/' + noticia._id + '.jpg')
                                            .then(finalImage =>{
                                                resolve(rootPath + 'media/' + noticia._id + '.jpg')
                                            })
                                            .catch(err => {
                                                reject(err)
                                            })
                                        })
                                        .catch(err => {
                                            reject(err)
                                        });
                                
                        })
                        .catch(err => {
                            reject(err)
                            })
                        
                        
                        
                        .catch(err => {
                            console.log(JSON.stringify(err))
                        })
                    })
                    


                    
            })
            .catch(err => {
                reject(err)
            });


        })
        .catch(err => {
            console.log(err)
            reject(err)
        });
    
  })
}

module.exports.resizeImageAndWrite = (imageUrl) => {
    console.log('resizeImageAndWrite' , imageUrl)
    return new Promise((resolve, reject) => {
        Jimp.read(imageUrl)
            .then(image => {
                image.resize(imageWidth, imageHeightFeed)
                image.writeAsync(imageUrl)
                        .then(finalImage =>{
                            resolve(imageUrl)
                        })
                        .catch(err => {
                            reject(err)
                        })
            })
            .catch(err => {
                reject(err)
            })
    })
    
}
module.exports.processedImage = (imageUrl, text) => {
    title = text
    Jimp.read(imageUrl)
    .then(image => {
        resizeImageUrl(image)
    })
    .catch(err => {
        console.log('error reading imageUrl', imageUrl)
        console.log(err)
    });


}

resizeImageUrl = (imageUrl) => {
    imageUrl.resize(imageWidth, Jimp.AUTO)
    createBackground(imageUrl)
}

createBackground = (resizedImage) => {
    let imageUrl = resizedImage
    new Jimp(imageWidth, imageHeight, colorsByCategory[noticia.category.name], (err, background) => {
            background.composite(imageUrl, 0, imageHeight/2 - imageUrl.bitmap.height / 2 /*, [Jimp.BLEND_MULTIPLY, 0.2, 0.2] */);
            writeTitle(background)
      });
}

writeTitle = (image) => {
    let blendedImage = image
    Jimp.loadFont(fontPaths[randomNumbers(1,4)]).then(font => {
        blendedImage.print(
          font,
          0,
          imageHeight/3,
          {
            text: simplifyText.convertString(title),
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
          },
          imageWidth,
          imageHeight
          
        ); // prints 'Hello world!' on an image, middle and center-aligned, when x = 0 and y = 0
        Jimp.read('media/static/' + noticia.category.name + '-300x100.png')
                    .then(imageLogo => {
                        blendedImage.composite(imageLogo, imageWidth/2 - imageLogo.bitmap.width / 2,
                                                            imageLogo.bitmap.height / 2);
                        blendedImage.writeAsync('media/final.jpg')
                        .then(finalImage =>{
                            console.log('finished !!!')
                        })
                        .catch(err => {
                            console.log('resizeImageUrl Error', err)
                        })
                    })
                    .catch(err => {
                        
                    });
             
      })
      .catch(err => {
            console.log('font Error', err)
        })
}

randomNumbers = (max, min) => {
	return Math.floor(Math.random()*(max-min+1)+min);
}


