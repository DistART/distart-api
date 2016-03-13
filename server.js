
var express = require('express');
var crypto = require('crypto');
var azure = require('azure-storage');
var tableJob = require('./azure-table.js');
var queueJob = require('./azure-queue.js');

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
app.get('/start/:token/:size', start);


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
            status: 'INCOMPLETE'
        };
        tableJob.updateJob(job, function(error, result, response){
            console.log(result + " "+ response);
            if(!error){
                res.status(200).send(token);
            } else{
                res.status(400).send(error);
            }
        });
	});
}

function postContent(req, res){
    //save the image into the queue at the right job
    var token = req.params.token;
    console.log("postContent token: " + token);

    var blobService = azure.createBlobService();
    blobService.createBlockBlobFromStream (INPUT_CONTAINER, token + '_1', req, req.headers["content-length"], function(error, result, response) {
        if(!error){
            console.log('blob stored: '+result + " "+response);
            tableJob.updateJobProperty(token, 'imageBlobName', token + '_1', function(error, result, response){
                console.log('Job property updated');
                res.status(200).send('OK: '+result + " "+response);
            });
        } else{
            res.status(400).send(error);
        }
    });
}

function postStyle(req, res){
    //save the style into the queue at the right job
    var token = req.params.token;
    console.log("postStyle token: " + token);

    var blobService = azure.createBlobService();
    blobService.createBlockBlobFromStream (INPUT_CONTAINER, token + '_2', req, req.headers["content-length"], function(error, result, response) {
        if(!error){
            tableJob.updateJobProperty(token, 'patternBlobName', token + '_2', function(){
                res.status(200).send('OK: '+result + " "+response);
            });
        }else{
            res.status(400).send(error);
        }
    });
}

function getImage(req, res){
    var token = req.params.token;
    var blobSvc = azure.createBlobService();

    tableJob.getJob(token, function(error, result, response, job){
        if(job){
            res.status(200);
       //     job.updateJobProperty(token, "outputBlobName", job.outputBlobName+".jpeg", function(error, result, response){
                blobSvc.getBlobToStream(OUTPUT_CONTAINER, job.outputBlobName, res, function(error, result, response){
                });
        //    })
        } else {
            res.status(404).send("Job not found");
        }
    })
}

function start(req, res){
	//start the job
    var token = req.params.token;

    console.log('starting job id:', token);

    tableJob.getJob(token, function(error, result, response, job) {
        // let's check that all the data is here:
        if (!job || !job.imageBlobName || !job.patternBlobName) {
            res.status(400).send("pattern or image file is missing");
        } else {
            tableJob.updateJobProperty(token, 'status', 'WAITING', function(){ //don't give a shit about this callback.
                tableJob.updateJobProperty(token, 'params', JSON.stringify({imageSize: req.params.size}), function(){
                    queueJob.pushJob(token, function(){
                        res.status(200).send("Job started");
                    })
                });
            });
        }
    });
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