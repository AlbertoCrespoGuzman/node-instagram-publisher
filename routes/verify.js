var User = require('../models/user');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config.js');

exports.getToken = function (user) {
  return jwt.sign(user, config.secretKey, {
  });
};

/////////////////////////////////////////////////////////////////////////////////// task 1 : verifyOrdinaryUser()
exports.verifyOrdinaryUser = function (req, res, next)
{
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token)
  {
    jwt.verify(token, config.secretKey, function (err, decoded)
    {
      if (err)
      {
        console.log("verify.err = " + err);
        var err = new Error('You are not authenticated!!!! verifyOrdinaryUser');
        err.status = 401;
        return next(err);
      }
      else
      {
        req.decoded = decoded;
        next();
      }
    });
  }
  else
  {
    console.log('no token provided')
    var err = new Error('No token provided!');
    err.status = 403;
    return next(err);
  }
};

/////////////////////////////////////////////////////////////////////////////////// task 1 : verifyAdmin()
exports.verifyAdmin = function (req, res, next)
{
  if (!req.decoded) { 
    var err = new Error('You are not authorized to perform this operation!');
    err.status = 403;
    return next(err);
  }
  else{
    var id = req.decoded._id;

    if(!req.decoded.admin){
      var err = new Error('You are not authorized to perform this operation!');
      err.status = 403;
      return next(err);
    }else{
      next();
    }

  }
};
