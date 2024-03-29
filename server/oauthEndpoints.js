/* eslint-disable node/no-deprecated-api */
import url from "url";
import Logger from "@reactioncommerce/logger";
import { WebApp } from "meteor/webapp";
import config from "./config.js";
import hydra from "./hydra.js";

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

WebApp.connectHandlers.use("/login", (req, res) => {
  const challenge = req.query.login_challenge;
  // From the Hydra docs:
  // "The endpoint handler at /login must not remember previous sessions. This task is solved by ORY Hydra.
  // If the REST API call tells you to show the login ui, you must show it. If the REST API tells you to
  // not show the login ui, you must not show it. Again, do not implement any type of session here."
  hydra
    .getLoginRequest(challenge)
    .then(async (getLoginRequestRes) => {
      const requestUrl = url.parse(getLoginRequestRes.request_url, true);
      const { loginAction } = requestUrl.query;
      // If Hydra was already able to authenticate the user, skip will be true
      // we do not need to re-authenticate the user.
      if (getLoginRequestRes.skip) {
        const acceptLoginResponse = await hydra.acceptLoginRequest(challenge, {
          subject: getLoginRequestRes.subject,
        });
        Logger.debug(
          `Auth status confirmed from Hydra. Redirecting to: ${acceptLoginResponse.redirect_to}`
        );
        res.writeHead(301, { Location: acceptLoginResponse.redirect_to });
        return res.end();
      }

      if (loginAction === "signup") {
        res.writeHead(301, {
          Location: `/account/enroll?login_challenge=${challenge}`,
        });
      } else {
        res.writeHead(301, {
          Location: `/account/login?login_challenge=${challenge}`,
        });
      }

      Logger.debug("Redirecting to Login Form for user login");
      return res.end();
    })
    .catch((errorMessage) => errorHandler(errorMessage, res));
});

WebApp.connectHandlers.use("/consent", (req, res) => {
  // Here, we accept consent directly without presenting a consent form to the user
  // because this was built for a trusted Consumer client.
  // For non-trusted Consumer clients, this should be updated to present a Consent UI to
  // the user grant or deny specific scopes
  const challenge = req.query.consent_challenge;
  hydra
    .getConsentRequest(challenge)
    .then(async (response) => {
      // eslint-disable-next-line camelcase
      const options = { grant_scope: response.requested_scope };
      // if skip is true (i.e no form UI is shown, there's no need to set `remember`)
      if (!response.skip) {
        // `remember` tells Hydra to remember this consent grant and reuse it if request is from
        // the same user on the same client. Ideally, this should be longer than token lifespan.
        // Set default is 24 hrs (set in seconds). Depending on preferred setup, you can allow
        // users decide if to enable or disable
        options.remember = true;
        // eslint-disable-next-line camelcase
        options.remember_for = HYDRA_SESSION_LIFESPAN;
      }
      const consentResponse = await hydra.acceptConsentRequest(
        challenge,
        options
      );
      Logger.debug(
        `Consent call complete. Redirecting to: ${consentResponse.redirect_to}`
      );
      res.writeHead(301, { Location: consentResponse.redirect_to });
      return res.end();
    })
    .catch((errorMessage) => errorHandler(errorMessage, res));
});

WebApp.connectHandlers.use("/token/refresh", async (req, res) => {
  const { origin } = req.headers;
  const whitelist = OAUTH2_CLIENT_DOMAINS.split(",");

  if (whitelist.indexOf(origin) > -1) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  const apiRes = await hydra.refreshAuthToken(req.query);

  if (apiRes.status_code < 200 || apiRes.status_code > 302) {
    Logger.error(
      "An error occurred while calling refresh API",
      apiRes.error_description
    );
    return errorHandler(apiRes.error_description, res);
  }

  Logger.debug(`Refresh auth token call successful: ${apiRes.statusCode}`);
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(apiRes));
});

WebApp.connectHandlers.use("/logout", (req, res) => {
  const challenge = req.query.logout_challenge;
  hydra
    .getLogoutRequest(challenge)
    .then(async () => {
      const logoutResponse = await hydra.acceptLogoutRequest(challenge);
      Logger.debug(
        `Logout call complete. Redirecting to: ${logoutResponse.redirect_to}`
      );
      res.writeHead(301, { Location: logoutResponse.redirect_to });
      return res.end();
    })
    .catch((errorMessage) => errorHandler(errorMessage, res));
});
