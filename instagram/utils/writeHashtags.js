module.exports.getHashtags = (noticia) => {
    var text = ' '
    if(noticia.hashtags.length > 0){
        noticia.hashtags.forEach(hashtag => {
            if(hashtag && hashtag.name){
                text +=  ' #' + hashtag.name.toString().replace(/\s/g,'')
            }
        })
    }
    return text
    
}