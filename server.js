var express = require("express")
var request = require('request')
var app = express()
var mongo = require('mongodb').MongoClient

var base = "images"
var url = "mongodb://localhost:27017/"+base;
var db

mongo.connect(url, (err, database) => {
  if (err) return console.log(err)
  db = database
})

app.set('json spaces', 2);

app.get('/imagesearch/:id', function (req, res) {
  var urlCall;
  var term = req.params['id'];
  
  var upload = {
            "term": term,
            "stamp": new Date()
        }
  
  db.collection('searches').insert(upload)
  
  if(req.query.offset>0){
    var page = (req.query.offset-1)*10;
    urlCall = "https://www.googleapis.com/customsearch/v1?q="+term+"&cx=013282103615547498277%3Atwsly-9w_bk&searchType=image&start="+page+"&key=AIzaSyA5zmV3DPI2vrrkTJEekkVEaatyK2y8OSo" 
  }else{
    var page = "";
    urlCall = "https://www.googleapis.com/customsearch/v1?q="+term+"&cx=013282103615547498277%3Atwsly-9w_bk&searchType=image&key=AIzaSyA5zmV3DPI2vrrkTJEekkVEaatyK2y8OSo" 
  }
  var replacer = function(key, value){
    if(key=="kind"||key=="title"||key=="htmlTitle"||key=="displayLink"||key=="htmlSnippet"||key=="mime")  {
      return undefined;
    }else return value;
  }
request({url: urlCall, json: true}, function(err, response, json) {
  if (err) {
    throw err;
  }
  res.json(JSON.parse(JSON.stringify(json.items, replacer)));
});
});

app.get('/latest/imagesearch', function(req, res){
  db.collection("searches").find({},{_id:0}).sort({stamp: -1}).limit(5).toArray(function(err, result){
    if (err) throw "wrong request"
    res.send(result)
  })
})

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});