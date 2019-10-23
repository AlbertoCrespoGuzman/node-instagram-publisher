let Jimp = require('jimp')
let simplifyText = require('./utils/simplifyText')

const fontPath = 'fonts/9.fnt'

const imageWidth = 432
const imageHeight =  768

const colorsByCategory = {
    general: '#51b8f6',
    nerd: '#fdec36',
    sports: '#cefe7e',
    health:'#fb7c86',
    business: '#ec3c86',
    entertainment: '#ffb735'
}
let noticia = {}
let categoryName = ''

module.exports.storyImage = (noticiaAntes, categoryNameAntes) => 
    {
     noticia = noticiaAntes
     categoryName = categoryNameAntes

     return new Promise((resolve, reject) => {
        console.log('processingImage')
        
        Jimp.read(noticia.urlToImage)
        .then(image => {
            image.resize(imageWidth, Jimp.AUTO)
            let imageUrl = image
            new Jimp(imageWidth, imageHeight, colorsByCategory[categoryName], (err, background) => {
                    background.composite(imageUrl, 0, imageHeight/2 - imageUrl.bitmap.height / 2 /*, [Jimp.BLEND_MULTIPLY, 0.2, 0.2] */);
                    let blendedImage = background
                    Jimp.loadFont(fontPath).then(font => {
                        blendedImage.print(
                        font,
                        0,
                        imageHeight/3,
                        {
                            text: simplifyText.convertString(noticia.title + ' | fonte:' + noticia.source),
                            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                        },
                        imageWidth,
                        imageHeight
                        
                        ); // prints 'Hello world!' on an image, middle and center-aligned, when x = 0 and y = 0
                        Jimp.read('media/static/' + categoryName + '-300x100.png')
                                    .then(imageLogo => {
                                        blendedImage.composite(imageLogo, imageWidth/2 - imageLogo.bitmap.width / 2,
                                                                            imageLogo.bitmap.height / 2);
                                        blendedImage.writeAsync('media/' + noticia._id + '.jpg')
                                        .then(finalImage =>{
                                            console.log('finished !!!')
                                            resolve('media/' + noticia._id + '.jpg')
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
            });
        })
        .catch(err => {
            reject(err)
        });
    
  })
}
module.exports.processedImage = (imageUrl, text) => {
    console.log('processingImage')
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
    new Jimp(imageWidth, imageHeight, colorsByCategory.general, (err, background) => {
            background.composite(imageUrl, 0, imageHeight/2 - imageUrl.bitmap.height / 2 /*, [Jimp.BLEND_MULTIPLY, 0.2, 0.2] */);
            writeTitle(background)
      });
}

writeTitle = (image) => {
    let blendedImage = image
    Jimp.loadFont(fontPath).then(font => {
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
        Jimp.read('media/static/general-300x100.png')
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

