# SlackDoorbell
A hardware doorbell for Slack teams

The project is 2 pieces:

1. RaspberryPi Zero W (or similar hardware) creates an image (via camera) and POSTs to the cloud
2. Amazon Lambda puts the binary data of the POST in to S3 and POSTs to a Slack Webhook URL

Assertions:

* Camera hardware has permanent POST endpoint target
    ** i.e. https://whatever.execute-api.us-west-2.amazonaws.com/prod/doorbell
    ** JSON like {imageData: asdf, clientID: 1234}
* Lambda code can write to S3
* Lambda can translate clientID to some Slack Webhook (in a database?)
