import { Meteor } from "meteor/meteor";
import Logger from "@reactioncommerce/logger";
import config from "./config.js";
import { oauthLogin } from "./oauthMethods.js";
import { Accounts } from "meteor/accounts-base";

// function callSignUp({ challenge, username, email, password }) {
//   return new Promise((resolve, reject) => {
//     let userId = Accounts.createUser({ username, email, password });
//     resolve(userId);
//   });
// }

// Meteor.method(
//   "create-user",
//   function (req,res) {
//     console.log("request",req)
//     let username = `${Math.floor(100000 + Math.random() * 900000)}`;
//     let email = `${username}@test.com`;
//     let password = "password123";
//     try {
//       let userId = Accounts.createUser({ email, username, password });
//       console.log(userId);
//       if (userId) {
//         // console.log((oauthLogin({challenge,userId})))
//       return { status: 200, userId , username, password};

//       }
//     } catch (e) {
//       console.log(e);
//       console.log({ status: e.error, msg: e.reason });
//       return { status: e.error, msg: e.reason };
//     }
//   },
//   { url: "create-user" }
// );
