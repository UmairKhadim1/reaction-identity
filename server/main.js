import { Meteor } from "meteor/meteor";
import Logger from "@reactioncommerce/logger";
import config from "./config.js";
import { oauthLogin } from "./oauthMethods.js";

import { WebApp } from "meteor/webapp";
import connectRoute from "connect-route";
import "./oauth.js";
import { generate_otp,verify_otp,validate__user,fetchEmail,username_exist,updatepassword } from "./helpers.js";

// import { generate_otp,verify_otp,validate__user } from "./helpers.js";
import {identityVerification} from "./yoti/index.js";
Meteor.methods({
  "getGraphQLApiUrl": () => config.API_URL,
  "oauth/login": oauthLogin,
  "send_otp":generate_otp,
  "verify_otp":verify_otp,
  "validate__user":validate__user,
  "fetch_email":fetchEmail,
  username_exist:username_exist,
  updatepassword:updatepassword,
  "identityVerification":identityVerification
});

// Init endpoints
import "./i18n/handler.js";
import "./oauthEndpoints.js";
import "./mobileoauthEndpoints.js";
import "./stripeEndpoints.js";

Meteor.startup(() => {
  Logger.info(`Serving Reaction Identity at ${config.ROOT_URL}`);
  var connectHandler = WebApp.connectHandlers; // get meteor-core's connect-implementation

//   // attach connect-style middleware for response header injection
//     connectHandler.use(function (req, res, next) {
//       res.setHeader("Access-Control-Allow-Origin", "*");

//       res.setHeader('Strict-Transport-Security', 'max-age=2592000; includeSubDomains'); // 2592000s / 30 days
//       res.setHeader('Access-Control-Allow-Credentials', true); // 2592000s / 30 days
//         // add headers
//   res.setHeader('Access-Control-Allow-Headers', [
//     'Accept',
//     'Accept-Charset',
//     'Accept-Encoding',
//     'Accept-Language',
//     'Accept-Datetime',
//     'Authorization',
//     'Cache-Control',
//     'Connection',
//     'Cookie',
//     'Content-Length',
//     'Content-MD5',
//     'Content-Type',
//     'Date',
//     'User-Agent',
//     'X-Requested-With',
//     'Origin'
// ].join(', '));
//       res.setHeader('Access-Control-Allow-Origin', "https://store.landofsneakers.com"); // 2592000s / 30 days
//       return next();
//     })
//     WebApp.rawConnectHandlers.use( function(req, res, next) {
//       res.setHeader("Access-Control-Allow-Origin", "*");
//       res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type,Origin");

//       return next();
//     });
});
