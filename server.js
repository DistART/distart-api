
var express = require('express');
var path = require('path');     //used for file path
//var fs = require('fs-extra');       //File System - for file manipulation

var multiparty = require('multiparty');
var app = express();
var port = process.env.PORT || 1337;

var azure = require('azure-storage');

//tmp
var fs = require("fs")
var file = fs.createWriteStream("file.jpg")



app.get('/create', createSession);
app.get('/post/:token', postImage);
app.get('/pattern/:token', postPattern);
app.get('/get/:token', getImage);

app.listen(port);

function createSession(req, res){
    res.send("la");
	createToken(function(token){
		res.send(token);
	});
}


function postImage(req, res){
    //save the image into the queue at the right job
    var token = req.params.token;

    var blobService = azure.createBlobService();
    var form = new multiparty.Form();
    form.on('part', function(part) {
        if (part.filename) {

            var size = part.byteCount - part.byteOffset;
            var name = part.filename;

            part.pipe(file);
            console.log(part);
            blobService.createBlockBlobFromStream('distart-input', name, part, size, function(error) {
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
