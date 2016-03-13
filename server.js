
var express = require('express');
var path = require('path');
var crypto = require('crypto');

var INPUT_CONTAINER = 'distart-input';
var OUTPUT_CONTAINER = 'distart-output';



var multiparty = require('multiparty');
var app = express();
var port = process.env.PORT || 1337;

var azure = require('azure-storage');

var bodyParser  = require('body-parser');

//tmp
var fs = require("fs")
var file = fs.createWriteStream("file.jpg")



app.get('/create', createSession);
app.post('/post/:token', postImage);
app.post('/pattern/:token', postPattern);
app.get('/get/:token', getImage);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

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

    // var s = new stream.Readable();


    // s._read = function noop (){};
    // s.push()

    // req.rawBody = '';
    // // req.setEncoding('utf8');

    // req.on('data', function(chunk) {
    // req.rawBody += chunk;
    // });

    // req.on('end', function() {
    //   var blobService = azure.createBlobService();
    //   blobService.createBlockBlobFromText (INPUT_CONTAINER, token + '_1', req.rawBody, function() {
    //     console.log('blob stored');
    //     fs.writeFile("file.jpg", req.rawBody);

    //   }) //should be a stream
    //   // console.log(req.rawBody);
    // });

    // req.pipe(file);
    // console.log(req);
    var blobService = azure.createBlobService();
    blobService.createBlockBlobFromStream (INPUT_CONTAINER, token + '_1', req, req.headers["content-length"], function() {
        console.log('blob stored');
    });




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

    // form.parse(req);
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
