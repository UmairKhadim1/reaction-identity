import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import queryString from "query-string";
import SimpleSchema from "simpl-schema";
import useReactoForm from "reacto-form/cjs/useReactoForm";
import Random from "@reactioncommerce/random";
import Button from "@reactioncommerce/components/Button/v1";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import InlineAlert from "@reactioncommerce/components/InlineAlert/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Grid, Typography } from "@material-ui/core";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { stubTrue } from "lodash";
//  import googleIcon from "../../public/Assets/icons/google.png"

/**
 * @summary Does `Meteor.loginWithPassword` followed by
 *   calling the "oauth/login" method.
 * @param {Object} input Input
 * @param {String} [input.challenge] Challenge to pass to the "oauth/login" method
 *   after logging in.
 * @param {String} input.email Email address to pass to `Meteor.loginWithPassword`
 * @param {String} input.password Password to pass to `Meteor.loginWithPassword`
 * @return {Promise<String|undefined>} Redirect URL or `undefined` if no
 *   `challenge` argument was passed.
 */
function callSignIn({ challenge, phoneNumber, password }) {
  let email = phoneNumber;
  return new Promise((resolve, reject) => {
    Meteor.loginWithPassword(
      (username = email),
      password,
      (meteorLoginError) => {
        if (meteorLoginError) {
          reject(meteorLoginError);
        } else {
          if (!challenge) {
            resolve();
            return;
          }
          Meteor.call(
            "oauth/login",
            { challenge },
            (oauthLoginError, redirectUrl) => {
              if (oauthLoginError) {
                reject(oauthLoginError);
              } else {
                resolve(redirectUrl);
              }
            }
          );
        }
      }
    );
  });
}

function callSignUpGoogle() {
  Meteor.loginWithGoogle(
    { requestPermissions: ["openid", "profile", "email"] },
    () => {
      Meteor.call(
        "oauth/login",
        { challenge },
        (oauthLoginError, redirectUrl) => {
          if (oauthLoginError) {
            console.log("oauthLoginError",oauthLoginError)
          } else {
            console.log("redirectUrl",redirectUrl)

            if (redirectUrl) window.location.href = redirectUrl;
          }
        }
      );
    }
  );

}


const useStyles = makeStyles(() => ({
  inlineAlert: {
    marginBottom: 16,
  },
  pageTitle: {
    marginBottom: 40,
    textAlign: "left",
    paddingLeft: "20px",
    fontFamily: "'Bebas Neue Pro' !important",
    fontStyle: "normal",
    fontWeight: "normal",
    fontSize: "24px",
    lineHeight: "29px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",

    color: "#000000",
  },
}));

const formSchema = new SimpleSchema({
  email: {
    type: String,
    min: 3,
  },
  password: {
    type: String,
  },
});
const validator = formSchema.getFormValidator();

/**
 * @summary SignIn React component
 * @param {Object} props Component props
 * @return {React.Node} Rendered component instance
 */
const { login_challenge: challenge } = queryString.parse(location.search);

function SignIn() {
  const { t } = useTranslation(); // eslint-disable-line id-length
  const uniqueId = useMemo(() => Random.id(), []);
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [signinData, setSigninData] = useState({});
  const [phoneNumber, setPhoneNumber] = useState();
  const [password, setPassword] = useState("");
  const [Errors, setErrors] = useState({});
  const { login_challenge: challenge } = queryString.parse(location.search);

  const { getErrors, getInputProps, submitForm } = useReactoForm({
    onChanging: (formData) => {
      formData.password && setPassword(formData.password);
    },
    async onSubmit(formData) {
      setIsSubmitting(true);
      let redirectUrl;
      try {
        redirectUrl = await callSignIn({ challenge, ...formData });
      } catch (error) {
        setSubmitError(error.message);
        setIsSubmitting(false);
        return { ok: false };
      }
      setIsSubmitting(false);
      if (redirectUrl) window.location.href = redirectUrl;
      return { ok: true };
      setSigninData(formData);
    },
    validator,
  });
  const customValidate = (obj) => {
    let error = {};
    let isValid = true;
    if (obj.phoneNumber) {
      if (obj.phoneNumber.length < 11) {
        isValid = false;
        error.phoneNumber = "Invalid phone number";
      }
      return { error, isValid };
    } else {
      isValid = false;
      error.phoneNumber = "Invalid phone number";
      return { error, isValid };
    }
  };
  const notify = (value, type) => {
    if (type == "error") {
      toast.error(value);
    }
    setSubmitError(null);
  };

  const handleSigninSubmit = async () => {
    const formData = {
      phoneNumber: phoneNumber,
      password: password,
    };
    const { error, isValid } = customValidate(formData);
    if (!isValid) {
      setErrors(error);
    } else {
      setIsSubmitting(true);
      let redirectUrl;
      try {
        redirectUrl = await callSignIn({ challenge, ...formData });
      } catch (error) {
        setSubmitError(error.message);
        setIsSubmitting(false);
        return { ok: false };
      }
      setIsSubmitting(false);
      if (redirectUrl) window.location.href = redirectUrl;
      return { ok: true };
      // setSigninData(formData);
    }
  };
  const goBack=()=> {
    window.history.back();
  }
  return (
    <div className="signin">
    <div className="backto" onClick={goBack} title="Back"><span> &#8249;
    </span></div>
      <header className="header">
        <img src="/Assets/icons/logo.svg" />
      </header>
      <div className={classes.pageTitle}>{t("Welcome Back!")}</div>
     
      <div className="signin__inputWrapper">
      {submitError && (
        <InlineAlert
          alertType="error"
          className={classes.inlineAlert +" error-padding"}
          message={submitError.includes("403")?"We do not recognise your mobile number and/or password. Please try again or press forgot login details below.":submitError}
        />
      )}
        {/* <Field
        isRequired
        errors={getErrors(["email"])}
        name="email"
        label={t("Phone number")}
        labelFor={`email-${uniqueId}`}
      >
        <TextInput
          type="number"
          id={`email-${uniqueId}`}
          placeholder="enter number"
          {...getInputProps("email")}
        />
        <ErrorsBlock errors={getErrors(["email"])} />
      </Field> */}
        <div className="signin__phInput">
          <Typography variant="h2" className="signin__phInputLabel">
            Phone Number
          </Typography>
          <PhoneInput
            className="signin__phInputInput"
            defaultCountry="GB"
            country="GB"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={setPhoneNumber}
          />
          <p className="signin__errors">
            <small className="inline-error">{Errors.phoneNumber}</small>
          </p>
        </div>
        <Field
          isRequired
          errors={getErrors(["password"])}
          name="password"
          label={t("password")}
          labelFor={`password-${uniqueId}`}
        >
          <TextInput
            type="password"
            placeholder="Password"
            id={`password-${uniqueId}`}
            {...getInputProps("password")}
          />
          <p className="signin__errors">
            <small className="inline-error">{Errors.password}</small>
            
          </p>
    
        </Field>
     
      </div>
      {/*submitError && notify(submitError.includes("403")?"Invalid combination. Have another go":submitError, "error")*/}
    
      <Button
        actionType="important"
        isFullWidth
        isWaiting={isSubmitting}
        onClick={handleSigninSubmit}
        className="signin__signinBtn"
      >
        {t("signIn")}
      </Button>
      <Typography
      className="signin__plainText pointer forgot-pass"
      variant="h5"
      component="h2"
      onClick={() => {
        history.push({
          pathname: "/account/forgot-password",
          search: location.search,
        });
      }}
    >
      Forgot password ?
    </Typography>
      <Typography className="signin__plainText" variant="h5" component="h2">
        Or you just can Sign in by
      </Typography>
      <Button className="signin__googleLogin" onClick={callSignUpGoogle}>
        <Grid container>
          <Grid item xs={4} sm={3} className="signin__googleLoginIcon">
            <img src="/Assets/icons/google.png" />
          </Grid>
          <Grid item xs={8} sm={9} className="signin__googleLoginText">
            Sign In with Google
          </Grid>
        </Grid>
      </Button>
      {/* <Button
        isDisabled={isSubmitting}
        isFullWidth
        isShortHeight
        isTextOnly
        onClick={() => { history.push({ pathname: "/account/forgot-password", search: location.search }); }}
      >
        {t("forgotPassword")}
      </Button> */}
      <Typography className="signin__plainText2" variant="h5" component="h2">
        Don’t have an account?
      </Typography>
      <Typography
        className="signin__signupBtn"
        variant="h5"
        component="h2"
        onClick={() => {
          history.push({
            pathname: "/account/enroll",
            search: location.search,
          });
        }}
      >
        {t("Sign Up")}
      </Typography>
      {/* <Button
        isDisabled={isSubmitting}
        isFullWidth
        isShortHeight
        isTextOnly
        className="signin__signupBtn"
        onClick={() => { history.push({ pathname: "/account/enroll", search: location.search }); }}
      >
        {t("Sign Up")}
      </Button> */}
      <div>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={stubTrue}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          theme="colored"
          pauseOnHover
        />
      </div>
    </div>
  );
}

export default SignIn;
