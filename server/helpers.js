import { fetch } from "meteor/fetch";
import { Meteor } from "meteor/meteor";
import { func } from "prop-types";
import { Mongo } from "meteor/mongo";
const Groups = new Mongo.Collection("Groups");
const AccountsMongo = new Mongo.Collection("Accounts");

import { Accounts } from "meteor/accounts-base";
twilio = Twilio(
  "ACce78b155f83fd47af5d1571274676a43",
  "cde85cabd918df5ea9ee384f1590597b"
);
var dict = {};
async function generate_otp(number) {
  try {
    // const random = require("random");
    let min = 100000;
    let max = 999999;
    let my_otp = Math.floor(Math.random() * (max - min + 1) + min); // () => [ min, max );
    // let my_otp =  "0000";
    dict[number] = my_otp;
    const res = await send_message(
      number,
      "Your one time password for Land of Sneakers is " + my_otp
    );
    return res;
  } catch (err) {
    return err;
  }
}
function username_exist(obj) {
  try {

    let rest = Meteor.users.findOne({ "profile.username": obj.username });
    let rest1 = AccountsMongo.findOne({ "profile.username": obj.username });
    return !rest && !rest1 ? undefined : rest ? rest : rest1;
  } catch (err) {
    return err;
  }
}
function send_message(msisdn, body) {
  //     var url = "http://203.215.164.132:13013/cgi-bin/sendsms";
  //     var requestOptions = {
  //         method: 'GET',
  //         redirect: 'follow'
  //       };
  //     const response = await

  //       fetch(`http://203.215.164.132:13013/cgi-bin/sendsms?username=ideation&password=ideation123&text=${body}&to=${msisdn}&from=1203&smsc=deikho`, requestOptions)
  //         .then(response => response.text())
  //         .then(result => console.log(result))
  //         .catch(error => console.log('error', error));
  return new Promise((resolve, reject) => {
    twilio.sendSms(
      {
        to: msisdn, // msisdn Any number Twilio can deliver to
        from: "+447897022293", // A number you bought from Twilio and can use for outbound communication
        body: body, // body of the SMS message
      },
      function (err, responseData) {
        //this function is executed when a response is received from Twilio
        if (!err) {
          resolve(responseData);
          // "err" is an error received during the request, if any
          // "responseData" is a JavaScript object containing data received from Twilio.
          // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
          // http://www.twilio.com/docs/api/rest/sending-sms#example-1
        }
        if (err) {
          console.log("twillio error", err);
          reject(err);
        }
      }
    );
  });
}
function verify_otp(number, otp) {
  var res = dict[number] == otp;
  if (res == true) {
    delete dict[number];
  }
  return res;
}
async function validate__user(phoneNumber) {
  const res = Meteor.users.findOne({ username: phoneNumber.phoneNumber });
  if (res) {
    return res;
  }
}
function addSellerPermission(groupId, userId) {
  if (groupId) {
    let ccd = AccountsMongo.findOne({ _id: userId._id }).groups;
    ccd.indexOf(groupId) == -1 && ccd.push(groupId);
    AccountsMongo.update(userId._id, {
      $set: {
        groups: ccd,
      },
    });
  }
}
function getSellerPermissionGroup(userId) {
  Meteor.users.update(userId, {
    $set: {
      identityVerified: true,
    },
  });
  AccountsMongo.update(userId._id, {
    $set: {
      "profile.identityVerified": true,
    },
  });

  let group = Groups.findOne({ name: "seller" });
  let groupid = group._id;
  addSellerPermission(groupid, userId);
  return group;
}
function processYoti(report, isComplete, userId) {
  let results = {};
  let score = 0;
  let verification_status = false;
  try {
    report.map((check) => {
      results[check.type] = {};
      results[check.type] = check.report.recommendation;
      if (check.report.recommendation.value != "APPROVE") {
        verification_status = false;
      } else {
        score++;
      }
    });

    if (score == 3) {
      verification_status = true;
      getSellerPermissionGroup(userId);
    }
    return { verification_status, results };
  } catch (err) {
    verification_status = false;
    console.log("err", err);
  }

  // return getSellerPermissionGroup();
}
function fetchEmail() {
  // console.log("1123",Meteor.user())

  return Meteor.user();
}
async function updatepassword({ password, userId }) {
  try {
    await Accounts.setPassword(userId, password);
    let res = {
      status: true,
      msg: "Password updated successfully",
    };
  } catch (err) {
    return {
      status: false,
      msg: err.reason ? err.reason : "something went wrong",
    };
  }
  return {
    status: true,
    msg: "Password updated successfully",
  };
}

export {
  send_message,
  generate_otp,
  verify_otp,
  validate__user,
  fetchEmail,
  username_exist,
  updatepassword,
  processYoti,
};
