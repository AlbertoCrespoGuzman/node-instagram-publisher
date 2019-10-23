module.exports.convertString = (phrase) =>
{
    var maxLength = 97;
    var returnString = phrase
/*
    var returnString = phrase.toLowerCase();
    //Convert Characters
*/
    returnString = returnString.replace(/ö/g, 'o');
    returnString = returnString.replace(/ç/g, 'c');
    returnString = returnString.replace(/ş/g, 's');
    returnString = returnString.replace(/ı/g, 'i');
    returnString = returnString.replace(/ğ/g, 'g');
    returnString = returnString.replace(/ü/g, 'u');  
    returnString = returnString.replace(/ã/g, 'a'); 
    returnString = returnString.replace(/á/g, 'a'); 
    returnString = returnString.replace(/ê/g, 'e');
    returnString = returnString.replace(/é/g, 'e'); 
    returnString = returnString.replace(/è/g, 'e');
    returnString = returnString.replace(/é/g, 'e'); 
    returnString = returnString.replace(/í/g, 'i'); 
    returnString = returnString.replace(/ó/g, 'o'); 
    returnString = returnString.replace(/ò/g, 'o'); 
    returnString = returnString.replace(/ô/g, 'o'); 
    returnString = returnString.replace(/õ/g, 'o'); 
    returnString = returnString.replace(/ú/g, 'u'); 
 
    returnString = returnString.replace(/Ã/g, 'A'); 
    returnString = returnString.replace(/Á/g, 'A');
    returnString = returnString.replace(/Á/g, 'A'); 
    returnString = returnString.replace(/Ê/g, 'E');
    returnString = returnString.replace(/É/g, 'E'); 
    returnString = returnString.replace(/È/g, 'E');
    returnString = returnString.replace(/Í/g, 'I'); 
    returnString = returnString.replace(/Ó/g, 'O'); 
    returnString = returnString.replace(/Ò/g, 'O'); 
    returnString = returnString.replace(/Õ/g, 'O'); 
    returnString = returnString.replace(/Ô/g, 'O');
    returnString = returnString.replace(/Ú/g, 'U'); 
    returnString = returnString.replace(/'/g, '"'); 
    returnString = returnString.replace(/°/g, 'U'); 
    // if there are other invalid chars, convert them into blank spaces
 //   returnString = returnString.replace(/[^a-z0-9\s-]/g, "");
    // convert multiple spaces and hyphens into one space       
 //   returnString = returnString.replace(/[\s-]+/g, " ");
    // trims current string
//    returnString = returnString.replace(/^\s+|\s+$/g,"");
    // cuts string (if too long)
    if(returnString.length > maxLength)
    returnString = returnString.substring(0,maxLength) + '[...]'
    // add hyphens
//    returnString = returnString.replace(/\s/g, " ");  

    return returnString;
}