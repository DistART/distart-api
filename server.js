
var express = require('express');
var path = require('path');     //used for file path
var fs = require('fs-extra');       //File System - for file manipulation

var app = express();
var azure = require('azure-storage');

app.get('/', function(req, res) {
    res.send("blablabla");
})

/*
app.get('/create', createSession);
app.get('/post/:token', postImage);
app.get('/pattern/:token', postPattern);
app.get('/get/:token', getImage);


function createSession(req, res){
    res.send("la");
	createToken(function(token){
		res.send(token);
	});
            if (part.filename) {

                var size = part.byteCount - part.byteOffset;
                var name = part.filename;
            }


            function postImage(req, image){
                //save the image into the queue at the right job
                var token = req.params.token;

                app.post('/upload', function (req, res) {
                    var blobService = azure.createBlobService();
                    var form = new multiparty.Form();
                    form.on('part', function(part) {

                blobService.createBlockBlobFromStream('c', name, part, size, function(error) {
                    if (error) {
                        res.send({ Grrr: error });
                    }
                });
            } else {
                form.handlePart(part);
            }
        });
        form.parse(req);
        res.send('OK');
    });

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
    */