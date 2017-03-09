'use strict';

// From hardware:
// curl -X POST -H 'x-api-key: AWS_APIKEY_HERE' -H "Content-Type: application/json" -d @body.json https://apiID1234.execute-api.us-west-2.amazonaws.com/prod/doorbell
// JSON body where
// clientID is some string
// imageData is base64 JPEG data

// imageData (compressed?) and sent to S3

// Results in this action:
// curl -X POST --data-urlencode 'payload={"channel": "#projectdoorbell", "username": "webhookbot", "text": "There is someone at th door", "icon_emoji": ":ghost:"}' https://hooks.slack.com/services/asdf/asdf/asdfasdf

exports.handler = (event, context, callback) => {

    const done = (err, res) => context.succeed({
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        }
    });

    var data = JSON.parse(event.body);

    var clientID = data.clientID;
    var imageData = new Buffer(data.imageData, 'base64');

    switch (event.httpMethod) {
        case 'POST':
        postImage(clientID, imageData, function (error) {
            done(error, {success: true});
        });
        break;
        default:
            done(new Error("Unsupported method"));
  }

};

function postImage(clientID, imgdata, completion) {

    var promise = new Promise(function(resolve, reject) {

        const filename = clientID + "-" + Math.floor( (new Date()).getTime() / 1000 ) + ".jpg";

        var AWS = require('aws-sdk');

        var s3obj = new AWS.S3({
            params: {
                Bucket: "doorbellcam-west-2",
                Key: filename,
                ACL: 'public-read',
                ContentType: 'image/jpeg',
                ContentDisposition: 'inline'
            }
        });

        s3obj.upload({Body: imgdata}).send(function(err, data) {
            if (err) {
                reject(err);
            } else if (data) {
                resolve(data.Location);
            } else {
                resolve("Image unavailable.");
            }
        });


    });

    promise.then(function (imageURL) {
        const payload = {
            "text": "Someone is at the door at 384 Van Brunt St! " + imageURL
        };

        var https = require('https');

        var options = {
            host: 'hooks.slack.com',
            path: '/services/asdf/asdf/asdfasdf',
            method: 'POST'
        };

        var callback = function(response) {
            // var str = 'Response: '

            // response.on('data', function (chunk) {
            //     str += chunk;
            // });

            response.on('end', function () {
                // console.log(str);
                completion();
            });
        }

        var req = https.request(options, callback);
        req.write(JSON.stringify(payload));
        req.end();
    });

    promise.catch(function (error) {
       completion(error);
    });

}
