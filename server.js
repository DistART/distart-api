
var express = require('express');
var path = require('path');
var crypto = require('crypto');
var azure = require('azure-storage');
var tableJob = require('azure-table');
var fs = require('fs');

var INPUT_CONTAINER = 'distart-input';
var OUTPUT_CONTAINER = 'distart-output';

var app = express();
var port = process.env.PORT || 1337;
var bodyParser  = require('body-parser');

app.get('/create', createSession);
app.post('/content/:token', postContent);
app.post('/style/:token', postStyle);
app.get('/get/:token', getImage);
app.get('/status/:token', getStatus);
app.get('/start/:token', start);


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

console.log("started");

app.listen(port);

function createSession(req, res){
	createToken(function(token){
        var job = {
            jobID: token,
            status: 'INCOMPLETE',
            outputBlobName: token+'_3'
        };
        tableJob.updateJob(job, function(error, result, response){
            /* nothing to do yet*/
        });
		res.status(200).send(token);
	});
}

function postContent(req, res){
    //save the image into the queue at the right job
    var token = req.params.token;
    console.log("postContent token: " + token);

    var blobService = azure.createBlobService();
    blobService.createBlockBlobFromStream (INPUT_CONTAINER, token + '_1', req, req.headers["content-length"], function() {
        console.log('blob stored');
    });

    tableJob.updateJobProperty(token, 'imageBlobName', token + '_1', function(){
        //Nothing to do
    });

    res.status(200).send('OK');
}

function postStyle(req, res){
    //save the style into the queue at the right job
    var token = req.params.token;
    console.log("postStyle token: " + token);

    var blobService = azure.createBlobService();
    blobService.createBlockBlobFromStream (INPUT_CONTAINER, token + '_2', req, req.headers["content-length"], function() {
        console.log('blob stored');
    });

    tableJob.updateJobProperty(token, 'patternBlobName', token + '_2', function(){
        //Nothing to do
    });

    res.status(200).send('OK');
}

function getImage(req, url){
    var token = req.params.token;
    var blobSvc = azure.createBlobService().withFilter(retryOperations);


    tableJob.getJob(token, function(error, result, response, job){
        if(job){
            blobSvc.getBlobToStream('OUTPUT_CONTAINER', job.outputBlobName, fs.createWriteStream('final.jpg'), function(error, result, response){
                if(!error){
                   res.status(200).send("Job retrieved");
                }
            });
        } else {
            res.status(404).send("Job not found");
        }
    })
}

function start(req, res){
	//start the job
    var token = req.params.token;
    tableJob.updateJobProperty(token, 'status', 'WAITING', function(){
        //Nothing to do
    });
    res.status(200).send("Job started");
}

function getStatus(req, res){
	//get the status of the job
    var token = req.params.token;
    tableJob.getJob(token, function(error, result, response, job){
        if(job){
            res.status(200).send(job.status);
        } else {
            res.status(404).send("Job not found");
        }
    })
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