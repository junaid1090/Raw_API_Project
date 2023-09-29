/*
 * Title: check Handler
 * Description: Handler to handle user defined checks
 * Date: 21/03/2023
 *
 */
// dependencies
const https = require("node:https");
const { twilio } = require("./environments");
const queryString = require("node:querystring");

//module scaffolding
const notifictions = {};

//send sms to userusing twilio api
notifictions.sendTwilioSms = (phone, msg, callback) => {
    //input validation
    const userPhone =
      typeof phone === "string" && phone.trim().length === 11
        ? phone.trim()
        : false;

    const usermsg =
      typeof msg === "string" &&
      msg.trim().length > 0 &&
      msg.trim().length <= 1600
        ? msg.trim()
        : false;

    if (userPhone && usermsg) {
      //configure the request payload
      const payload = {
        From: twilio.fromPhone,
        To: `+88${userPhone}`,
        Body: usermsg,
      };

      //stringify the payload
      const stringifyPayload = queryString.stringify(payload);

      //configure the request details
      const requestDeatails = {
        hostname: "api.twilio.com",
        method: "POST",
        path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
        auth: `${twilio.accountSid} : ${twilio.authToken}`,
        header: {
          "Content-Type": "application/x-www-from-urlenconded",
        },
      };

      //instantiate the request object
      const req = https.request(requestDeatails, (res) => {
        //get the status of the sent request
        const status = res.statusCode;
        //callback successfully if the request went through
        if (status === 200 || status === 201) {
          callback(false);
        } else {
          callback(`Status code return was ${status}`);
        }
      });

      req.on("error", (e) => {
        callback(e);
      });

      req.write(stringifyPayload);
      req.end();
    } else {
      callback("Given parameters were missing or invalid!");
    }
  };

//exports the module
module.exports = notifictions;
