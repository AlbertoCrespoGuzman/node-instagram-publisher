var express = require('express')
var bodyParser = require('body-parser')
var router = express.Router()
router.use(bodyParser.json())

router.route('/')
.get(function (req, res, next){
  res.status(200).send('{"status": "ok"}')
})



  module.exports = router