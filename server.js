
var express = require('express');
var path = require('path');
var crypto = require('crypto');

var multiparty = require('multiparty');
var app = express();
var port = process.env.PORT || 1337;

var azure = require('azure-storage');

//tmp
var fs = require("fs")
var file = fs.createWriteStream("file.jpg")



app.get('/create', createSession);
app.post('/post/:token', postImage);
app.post('/pattern/:token', postPattern);
app.get('/get/:token', getImage);

console.log("started");

app.listen(port);

function createSession(req, res){
	createToken(function(token){
		res.send(token);
	});

}


function postImage(req, res){
    //save the image into the queue at the right job
    var token = req.params.token;
    console.log("post" + token);

    var blobService = azure.createBlobService();

    console.log(req.body);
    // var form = new multiparty.Form();
    // form.on('part', function(part) {
    //     if (part.filename) {

    //         var size = part.byteCount - part.byteOffset;
    //         var name = part.filename;

    //         part.pipe(file);
    //         console.log(part);
    //         blobService.createBlockBlobFromStream('distart-input', name, part, size, function(error) {
    //             if (error) {
    //                 res.send({ Grrr: error });
    //             }
    //         });
    //     } else {
    //         form.handlePart(part);
    //     }
    // });

    form.parse(req);
    res.send('OK');
}


function getImage(req, url){
    var token = req.params.token;

}

function postPattern(req, res){
	//save the image into the job
	var token = req.params.token;
}


function start(req, res){
	//start the job

}

function getStatus(jobID){
	//get the status of the job
}

function createToken(callback){
	//gen token and all the information for the job
    var date = new Date();
    var salt = [date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds(), process.hrtime()[0], process.hrtime()[1]].join(";");
    var hash = crypto.createHmac('sha256', 'a secret')
        .update(salt)
        .digest('hex');

	callback(hash);
}
