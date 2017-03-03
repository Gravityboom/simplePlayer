var express = require('express');
var router = express.Router();
var path = require("path");
var media = path.join(__dirname,"../public/media");
/* GET home page. */
var fs = require("fs");
router.get('/', function(req, res, next) {
	fs.readdir(media,function(err,names){
		if(err){
			console.log(err);
		}else{
			res.render('index',{title:'Passionate Music', music: names })
		}
	});//异步读取
  //res.render('index', { title: 'Express' });
});

module.exports = router;
