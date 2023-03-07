/* eslint-disable node/no-deprecated-api */
import url from "url";
import Logger from "@reactioncommerce/logger";
import { WebApp } from "meteor/webapp";
import config from "./config.js";
import hydra from "./hydra.js";
import connectRoute from "connect-route";
import { Accounts } from "meteor/accounts-base";

Logger.info(`MobileoauthEndpoint.js Loaded successfully `);

const {
  HYDRA_OAUTH2_ERROR_URL,
  HYDRA_SESSION_LIFESPAN,
  OAUTH2_CLIENT_DOMAINS,
} = config;

const errorHandler = (errorMessage, res) => {
  Logger.error(errorMessage, "Error while performing Hydra request");
  if (HYDRA_OAUTH2_ERROR_URL.length) {
    Logger.error(
      `Redirecting to HYDRA_OAUTH2_ERROR_URL: ${HYDRA_OAUTH2_ERROR_URL}`
    );

    res.writeHead(500, { Location: HYDRA_OAUTH2_ERROR_URL });
    return res.end();
  }
  Logger.warn("No HYDRA_OAUTH2_ERROR_URL set in ENV.");
  return res.end();
};

WebApp.connectHandlers.use(
  connectRoute(function (router) {
    router.post("/create-user", function (req, res, next) {
      var that = this;
      var body = req.body;
      let username = body.msisdn;
      let email = `${username}@test.com`;
      let password = body.password;
      try {
        let userId = Accounts.createUser({ email, username, password });
        if (userId) {
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              status: true,
              userId: userId,
              msg: "Sign Up Successfull",
            })
          );
        } else {
          res.writeHead(403, { "Content-Type": "application/json" });

          return res.end(
            JSON.stringify({ status: 500, msg: "Unable to add user" })
          );
        }
      } catch (e) {
        res.writeHead(403, { "Content-Type": "application/json" });

        return res.end(JSON.stringify({ status: e.error, msg: e.reason }));
      }
    });
    router.post("/signin-user", function (req, res, next) {
      var body = req.body;
      let username = body.msisdn;
      let password = body.password;
      let challenge = body.challenge;
      try {
        var userExists = Meteor.users.findOne({
          username: username,
        });
        if (userExists) {
          var passwordMatch = Accounts._checkPassword(userExists, password);
          if (passwordMatch.error) {
            res.writeHead(200, { "Content-Type": "application/json" });
            return res.end(JSON.stringify(passwordMatch));
          }
          Meteor.call(
            "oauth/login",
            { challenge, ...passwordMatch },
            (oauthLoginError, redirectUrl) => {
              if (oauthLoginError) {
                res.writeHead(200, { "Content-Type": "application/json" });
                return res.end(
                  JSON.stringify({
                    status: false,
                    ...passwordMatch,
                    oauthLoginError,
                  })
                );
              } else {
                // resolve(redirectUrl);
                res.writeHead(200, { "Content-Type": "application/json" });
                return res.end(
                  JSON.stringify({
                    status: true,
                    ...passwordMatch,
                    redirectUrl,
                  })
                );
              }
            }
          );
        }
      } catch (e) {
        console.log({ status: e.error, msg: e.reason });
        res.writeHead(403, { "Content-Type": "application/json" });

        return res.end(JSON.stringify({ status: e.error, msg: e.reason }));
      }
    });
  })
);
