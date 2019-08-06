var express = require('express');
var router = express.Router();
var apn = require('apn');
const fs = require('fs');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('apns router is ready');
});

router.post('/test', async function(req, res, next) {
  let response = {
    isSuccess: false,
    data: '',
    errorMsg: ''
  }
  try {
    const certificateFileName =  req.body.certificateFileName
    const certData = await fs.readFileSync('certificate/' + certificateFileName)
    const password = req.body.password
    const production = req.body.production == 1
    const deviceToken =  req.body.deviceToken

    const options = {
      pfx: certData,
      passphrase: password,
      production: production,
      proxy: null
    };

    const apnProvider = new apn.Provider(options);

    const note = new apn.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 second from now.
    note.badge = 3;
    note.sound = "ping.aiff";
    note.compiled = false;
    note.priority = 10;
    note.alert = req.body.alert ? JSON.parse(req.body.alert): {
      "body": "Test: 42",
      "title": "Notification"
    };
    note.payload = req.body.payload ? JSON.parse(req.body.payload) : {'notificationType':'INT_GetNewCom','interactionId':[6326907]};
    // note.topic = "<your-app-bundle-id>";
    console.log('/test: note=', note , '\n,deviceToken=' + deviceToken)
    apnProvider.send(note, deviceToken).then( (result) => {
      // see documentation for an explanation of result
      response.isSuccess = true
      response.data = result
      return res.send(JSON.stringify(response));
    });
  } catch (error) {
    response.errorMsg = JSON.stringify(error)
    console.log(error)
    return res.send(response);
  }
});

module.exports = router;
