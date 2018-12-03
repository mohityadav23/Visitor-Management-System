var express = require('express');
var router = express.Router();

//Calling html Pages

router.get('/', function(req, res, next){
    res.render('index.html');
  });

router.get('/aboutyou.html', function(req, res, next){
    res.render('aboutyou.html');
  });

router.get('/index2.html', function(req, res, next){
    res.render('index2');
  });

router.get('/index3.html', function(req, res, next){
    res.render('index3.html');
  });
  
router.get('/pre', function(req, res, next){
    res.render('prere-conf',{alert: false});
  });
  
router.get('/logoff', function(req, res, next){
    res.render('logoff_num',{alert: false});
  });
  
router.get('/kii',function(req, res, next){
    res.render("cam.html");
})

module.exports = router;