/* eslint-disable node/no-deprecated-api */
import url from "url";
import Logger from "@reactioncommerce/logger";
import { WebApp } from "meteor/webapp";
import { Meteor } from "meteor/meteor";
import connectRoute from "connect-route";
import config from "./config.js";
import Stripe from "stripe";
import { identityVerification, fetchResults } from "./yoti/index.js";
import { processYoti } from "./helpers.js";
var nodemailer = require("nodemailer");
import {
  generate_otp,
  verify_otp,
  validate__user,
  fetchEmail,
  username_exist,
  updatepassword,
} from "./helpers.js";
const YOUR_EMAIL_ADDRESS = "info@landofsneakers.com";
const transporter = nodemailer.createTransport({
  service: "SendinBlue", // no need to set host or port etc.
  auth: {
    user: "info@landofsneakers.com",
    pass: "0b8pEBjPtFRK2Txy",
  },
});

const { STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY } = config;
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
  typescript: true,
});
Logger.info(`StripeEndpoints.js Loaded successfully `);

WebApp.connectHandlers.use(
  connectRoute(function (router) {
    router.post("/contact-us", function (req, res, next) {
      res.setHeader("Access-Control-Allow-Origin", "*");

      let to = req.body.email;
      let message = req.body.message;
      let name = req.body.name;
      let phone = req.body.phone;
      let subject = req.body.subject;

      let userResBody =
        "We will review the information you have given us and get back to you within 5 working days.";
      var objToUser = {
        from: "Land Of Sneakers" + "<" + YOUR_EMAIL_ADDRESS + ">",
        to: to,
        subject: "Thanks for contacting us. ",
        title: "LOS",
        html: `<p>Hi ${name},</p><p>Thanks for contacting us.</p><p>${userResBody}</p><br/><p>Kind Regards,</p><p>Land of Sneakers</p> `,
      };

      var objToAdmin = {
        from: "Land Of Sneakers" + "<" + YOUR_EMAIL_ADDRESS + ">",
        to: YOUR_EMAIL_ADDRESS,
        replyTo: to,
        subject: subject,
        title: "Contact Us",
        html: `<p>Hi Land of Sneakers,</p><br/><p>${message}</p><br/><p>Regards,</p><p>${name}, Phone: ${phone}, Email: ${to}</p> `,
      };
      try {
        transporter.sendMail(objToUser, function (error, info) {});
      } catch (err) {
        console.log(err);
      }

      transporter.sendMail(objToAdmin, function (error, info) {
        if (error) {
          res.writeHead(200, { "Content-Type": "application/json" });

          return res.end(
            JSON.stringify({
              status: false,
              api_msg: error,
            })
          );
        } else {
          console.log("Email sent: " + info.response);
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              status: true,
              api_msg: info.response,
            })
          );
        }
      });
    });
    router.post("/magic-link", function (req, res, next) {
      res.setHeader("Access-Control-Allow-Origin", "*");

      let to = req.body.to;
      let link = req.body.link;
      let name = req.body.name;
    

          var objToUser = {
        from: "Land Of Sneakers" + "<" + YOUR_EMAIL_ADDRESS + ">",
        to: to,
        subject: " You are one step closer to becoming a LOS seller! ",
        title: "LOS",
        html: `<p>Hello ${name},</p><p>Please complete the ID verfication by clicking the link: <a href=${link}>${link}</a></p>
        <p>Once your ID is verified, you can begin selling on our platform. This usually takes as
        little as 10mins but can take an hour or more on some occasions. Please let us know if this 
        process takes more than a day.
        </p><br/><p>Kind Regards,</p><p>Land of Sneakers</p> `,
      };

      transporter.sendMail(objToUser, function (error, info) {
        if (error) {
          res.writeHead(200, { "Content-Type": "application/json" });
          console.log("Err",error)
          return res.end(
            JSON.stringify({
              status: false,
              api_msg: error,
            })
          );
        } else {
          console.log("Email sent: " + info.response);
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              status: true,
              api_msg: info.response,
            })
          );
        }
      });
    });

    router.get("/identityVerification", async function (req, res, next) {
      try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        console.log(" req.query.data", req.query.data)
        let userId = Meteor.users.findOne({ _id: req.query.data });

        if (userId) {
          res.writeHead(200, { "Content-Type": "application/json" });
          const resultOfIdentity = await identityVerification();
          Meteor.users.update(userId, {
            $set: {
              yoti: resultOfIdentity,
            },
          });
          return res.end(
            JSON.stringify({
              status: true,
              data: resultOfIdentity,
            })
          );
        } else {
          return res.end(
            JSON.stringify({
              status: false,
              msg: "User not found",
            })
          );
        }
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });

        return res.end(
          JSON.stringify({
            status: false,
            error,
          })
        );
      }
    });

    router.get("/identity-report", async function (req, res, next) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.writeHead(200, { "Content-Type": "application/json" });
      let user = Meteor.users.findOne({ _id: req.query.data });
      if (user) {
        if (user.yoti) {
          let data = await fetchResults(user.yoti.sessionId);
          let isComplete = data.state == "COMPLETED" ? true : false;
          let yotIResults = processYoti(data.checks, isComplete, user);
          return res.end(
            JSON.stringify({
              status: true,
              isComplete: data.state,
              data: yotIResults,
            })
          );
        } else {
          return res.end(
            JSON.stringify({
              status: false,
              message: "No session found",
            })
          );
        }
      } else {
        return res.end(
          JSON.stringify({
            status: false,
            message: "No user found",
          })
        );
      }
    });
    router.get("/ping", function (req, res, next) {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          data: {ver:1.0},
          api_msg: `Server Reachable at ${new Date().toISOString()}`,
        })
      );
    });

    router.post("/create-payment-intent", async function (req, res, next) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: parseFloat(req.body.amount) * 100,
          currency: req.body.currency,
        });
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ clientSecret: paymentIntent.client_secret })
        );
      } catch (e) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            error: e,
          })
        );
      }
    });

    router.post("/publishedKey", async function (req, res, next) {
      try {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            publishKey: STRIPE_PUBLIC_KEY,
          })
        );
      } catch (e) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            error: e,
          })
        );
      }
    });
    router.post("/sendCode", async function (req, res, next) {
      res.writeHead(200, { "Content-Type": "application/json" });
      let user_number = req.body.no;
      let Otp = await generate_otp(user_number);
      if (Otp.status != "queued") {
        return res.end(
          JSON.stringify({
            status: false,
            msg: `Unable to send otp at ${user_number}`,
          })
        );
      } else {
        return res.end(
          JSON.stringify({
            status: true,
            msg: `Otp sent at ${user_number}`,
          })
        );
      }
    });
    router.post("/verifyCode", function (req, res, next) {
      res.writeHead(200, { "Content-Type": "application/json" });
      let user_otp = req.body.no;
      let msisdn = req.body.phone;
      let verification = verify_otp(msisdn, user_otp);
      console.log("verification", verification);
      return res.end(
        JSON.stringify({
          status: verification,
        })
      );
    });
    router.post("/update-account", function (req, res, next) {
      res.writeHead(200, { "Content-Type": "application/json" });
      let phoneNumber = req.body.no;
      let password = req.body.payload;
      let user = Meteor.users.findOne({ username: phoneNumber });
      let userId = user._id;
      try {
        let dodo = Meteor.users.update(userId, {
          $set: { "services.password.bcrypt": password },
        });
        return res.end(
          JSON.stringify({
            status: dodo ? true : false,
          })
        );
      } catch (error) {
        console.log("error", error);
        return res.end(
          JSON.stringify({
            status: false,
            error: error,
          })
        );
      }
    });
  })
);

// var Fiber = Npm.require("fibers");
// WebApp.connectHandlers.use("/ping", (req, res) => {
//   var that = this;
//   Fiber(function () {
//    console.log(req.body)
//    res.writeHead(200, { "Content-Type": "application/json" });
//    return res.end(`Server Reachable at ${new Date().toISOString()}`);

//   }).run();
// });
