var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var jwt = require('jwt-simple');
var app = express();

var JWT_SECRET ='cockatoochirp';

var db = null;

MongoClient.connect("mongodb://localhost:27017/cockatoo", function(err, dbconn){
	if(!err){
		console.log("we are connected");
		db =dbconn;
	}
});

app.use(bodyParser.json());

app.use(express.static('public'));

app.get('/chirps', function(req, res, next){

	db.collection('chirps', function(err, chirpsCollection){
		chirpsCollection.find().toArray(function(err, chirps){
		return res.send(chirps);
	});
});
	
	
});

app.post('/chirps', function(req, res, next){

	var token = req.headers.authorization;
	var user = jwt.decode(token, JWT_SECRET);

	db.collection('chirps', function(err, chirpsCollection){
		var newChirp ={
			text: req.body.newChirp,
			user : user._id,
			username: user.username
		};

	chirpsCollection.insert(newChirp, {w:1}, function(err){
       return res.send();
	});
		
	});
});

app.put('/chirps/remove', function(req, res, next){

   var token = req.headers.authorization;
	var user = jwt.decode(token, JWT_SECRET);

	db.collection('chirps', function(err, chirpsCollection){
		var chirpId = req.body.chirp._id;
		

	chirpsCollection.remove({_id: ObjectId(chirpId), username: user.username},{w:1}, function(err){
       return res.send();
	});
	});

});

app.post('/users', function(req, res, next){
console.log(req.body);
res.send();

	db.collection('users', function(err, usersCollection){
      
bcrypt.genSalt(10, function(err, salt){
	
	bcrypt.hash(req.body.password, salt, function(err, hash){
       

      var newUser = {
      	username: req.body.username,
      	password: hash
      };
  usersCollection.insert(newUser, {w:1}, function(err){
       return res.send();


	});
});

      

		
	});
		
	});
});

app.put('/users/signin', function(req, res, next){

	db.collection('users', function(err, usersCollection){

		usersCollection.findOne({username: req.body.username}, function(err, user){
        
         bcrypt.compare(req.body.password, user.password, function(err, result){
         	if(result) {
         		var token = jwt.encode(user,JWT_SECRET);
         		return res.json({token: token});
         	}else {
         		return res.status(400).send();
         	}
         });
		});
      
		


	});
});

 
app.listen(3000, function(){
	console.log('listening on port 3000!');
});