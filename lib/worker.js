/*
 *title: Workers library
 *Description: worker related flie
 *Date: 22-03-2023
 *
 */

// dependencies
const { parseJson } = require("../helpers/Utilities");
const data = require("./data");
const url = require("node:url");
const http = require('node:http');
const https = require('node:https');
const { sendTwilioSms } = require('./../helpers/notifications');

// Worker-object Module saffolding
const worker = {};

//lookup the checks
worker.gatherAllChecks = () => {
  //get all the checks
  data.list("checks", (err1, checks) => {
    if (!err1 && checks && checks.length > 0) {
      checks.forEach((check) => {
        //read the check data
        data.read("checks", check, (err2, originalCheckData) => {
          if (!err2 && originalCheckData) {
            //pass the data to check validator
            worker.validateCheckData(parseJson(originalCheckData));
          } else {
            console.log("Error: reading one of the checks data!");
          }
        });
      });
    } else {
      console.log("Error: could not find any checks to process");
    }
  });
};

//validate individual check data
worker.validateCheckData = (originalCheckData) => {
  const originalData = originalCheckData;
  if (originalCheckData && originalCheckData.id) {
    originalData.state =
      typeof originalCheckData.state === "string" &&
      ["up", "down"].indexOf(originalCheckData.state) > -1
        ? originalCheckData.state
        : false;
    originalData.lastChecked =
      typeof originalCheckData.lastChecked === "number" &&
      originalCheckData.lastChecked
        ? originalCheckData.lastChecked
        : false;

    //pass to the next process
    worker.performCheck(originalData);
  } else {
    console.log("Error: check was invalid or not properly formatted!");
  }
};

//perform check
worker.performCheck = (originalCheckData) => {
  const checkOutCome = {
    error: false,
    responseCode: false,
  };

  //mark the outcome has not been sent yet
  let outComeSent = false;

  const parsedUrl = url.parse(
    `${originalCheckData.protocol}://${originalCheckData.url}`,
    true
  );
  const hostName = parsedUrl.hostname;
  const { path } = parsedUrl;

  //construct the request
  const requestDetails = {
    protocol: `${originalCheckData.protocol}:`,
    hostname: hostName,
    method: originalCheckData.method.toUpperCase(),
    timeOut: originalCheckData.timeoutSeconds * 1000,
  };

  const protocolToUse = originalCheckData.protocol === "http" ? http : https;

  const req = protocolToUse.request(requestDetails, (res) => {
    //grap the status of the response
    const status = res.statusCode;

    //update the checck outcome and pass to next process
    checkOutCome.responseCode = status;
    if (!outComeSent) {
      worker.processCheckOutCome(originalCheckData, checkOutCome);
      outComeSent = true;
    }
  });

  req.on("timeOut", () => {
    const checkOutCome = {
      error: true,
      value: "timeout",
    };

    if (!outComeSent) {
      worker.processCheckOutCome(originalCheckData, checkOutCome);
      outComeSent = true;
    }
  });

  req.on("error", (e) => {
    const checkOutCome = {
      error: true,
      value: e,
    };

    if (!outComeSent) {
      worker.processCheckOutCome(originalCheckData, checkOutCome);
      outComeSent = true;
    }
  });

  //request sent
  req.end();
};

//save check outcome to database and send to next process
worker.processCheckOutCome = (originalCheckData, checkOutCome) => {
  //check if check outcome is up or down
  const state =
    !checkOutCome.error &&
    checkOutCome.responseCode &&
    originalCheckData.successCode.indexOf(checkOutCome.responseCode) > -1
      ? "up"
      : "down";

  //decide weather we should alert the user or not
  const alertWanted =
    originalCheckData.lastChecked && originalCheckData.state !== state
      ? true
      : false;

  //update the check data
  const newCheckedData = originalCheckData;

  newCheckedData.state = state;
  newCheckedData.lastChecked = Date.now();

  //update the check to disk
  data.update("checks", newCheckedData.id, newCheckedData, (err) => {
    if (!err) {
      if (alertWanted) {
        //send the check data to next process
        worker.alertUserToStateChange(newCheckedData);
      } else {
        console.log("Alert is not need as there is no state change!");
      }
    } else {
      console.log("Error trying to check data of one of another checks!");
    }
  });
};

//send notification sms to user if state changes
worker.alertUserToStateChange = (newCheckedData) => {
  const msg = `Alert: Your check for ${newCheckedData.method.toUpperCase()} ${
    newCheckedData.protocol
  }://${newCheckedData.url} is currently ${newCheckedData.state}`;

  sendTwilioSms(newCheckedData.userPhone, msg, (err)=> {
    if(!err){
      console.log(`User was alerted to a status change via sms: ${msg}`);
    } else{
      console.log('There was a problem sending sms to one of the user');
    }
  })

};

//timer to execute the worker process once per minute
worker.loop = () => {
  setInterval(() => {
    worker.gatherAllChecks();
  }, 8000 );
};

worker.init = () => {
  //execute all the checks
  worker.gatherAllChecks();

  //call the loop so that checks contiue
  worker.loop();
};

//export
module.exports = worker;
