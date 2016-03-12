
var express = require('./express');
var path = require('path');     //used for file path
var fs = require('fs-extra');       //File System - for file manipulation

var app = express();


app.get('/create', createSession);
app.get('/post/:token', postImage);
app.get('/pattern/:token', postPattern);
app.get('/get/:token', getImage);


function createSession(req, res){
	createToken(function(token){
		res.send(token);
	});
}


function postImage(req, image){
	//save the image into the queue at the right job
	var token = req.params.token;
}


function getImage(req, url){
    var token = req.params.token;

}

function postPattern(pattern){
	//save the image into the job 
	var token = req.params.token; 
}


function start(jobID){
	//start the job

}

function getStatus(jobID){
	//get the status of the job
}

function createToken(callback){
	//gen token and all the information for the job
	callback(token);
}