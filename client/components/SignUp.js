import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { makeStyles, Typography } from "@material-ui/core";
import queryString from "query-string";
import SimpleSchema from "simpl-schema";
import useReactoForm from "reacto-form/cjs/useReactoForm";
import Random from "@reactioncommerce/random";
import Button from "@reactioncommerce/components/Button/v1";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import InlineAlert from "@reactioncommerce/components/InlineAlert/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import OTP from "./OTP";
import { validate } from "graphql";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import PhNumberComponent from "./phNumberComponent";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { stubTrue } from "lodash";
/**
 * @summary Does `Accounts.createUser` followed by
 *   calling the "oauth/login" method.
 * @param {Object} input Input
 * @param {String} [input.challenge] Challenge to pass to the "oauth/login" method
 *   after logging in.
 * @param {String} input.username username address to pass to `Accounts.createUser`
 * @param {String} input.password Password to pass to `Accounts.createUser`
 * @return {Promise<String|undefined>} Redirect URL or `undefined` if no
 *   `challenge` argument was passed.
 */
function callSignUp({ challenge, Email, phoneNumber, password, profile }) {
  const username = phoneNumber;
  return new Promise((resolve, reject) => {
    let email = Email;

    Accounts.createUser({ email, username, password, profile }, (error) => {
      if (error) {
        reject(error);
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
    });
  });
}

function callNumberValidator({ phoneNumber }) {
  return new Promise((resolve, reject) => {
    Meteor.call("validate__user", { phoneNumber }, (error, data) => {
      if (data !== undefined) {
        resolve(data);
      } else {
        resolve(data);
      }
      if (error) {
        reject();
      }
    });
  });

}
function usernameValidator(username) {
  return new Promise((resolve, reject) => {
    Meteor.call("username_exist", { username }, (error, data) => {
      if (data !== undefined) {
        resolve(data);
      } else {
        resolve(data);
      }
      if (error) {
        reject();
      }
    });
  });

}
const useStyles = makeStyles(() => ({
  inlineAlert: {
    marginBottom: 16,
  },
  pageTitle: {
    color: "#1999dd",
    fontFamily:
      "'Source Sans Pro', 'Roboto', 'Helvetica Neue', Helvetica, sans-serif",
    fontSize: 30,
    fontWeight: 400,
    marginBottom: 40,
    textAlign: "left",
    paddingLeft: "20px",
    fontFamily: "'Bebas Neue Pro' !important",
    fontStyle: "normal",
    fontWeight: "normal",
    fontSize: "24px",
    lineHeight: "29px",
    /* identical to box height */
    letterSpacing: "0.1em",
    textTransform: "uppercase",

    color: "#000000",
  },
}));

const formSchema = new SimpleSchema({
  name: {
    type: String,
  },
  email: {
    type: String,
    min: 3,
  },
  password: {
    type: String,
    min: 6,
  },
  phoneNumber: {
    type: String,
  },
  confirmPassword: {
    type: String,
  },
});
const validator = formSchema.getFormValidator();

/**
 * @summary SignUp React component
 * @param {Object} props Component props
 * @return {React.Node} Rendered component instance
 */
function SignUp() {
  const { t } = useTranslation(); // eslint-disable-line id-length
  const uniqueId = useMemo(() => Random.id(), []);
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showPhNumberScreen, setPhNumberScreen] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [Email, setEmail] = useState(" ");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [Errors, setErrors] = useState({});
  const [PhSubmitError, setPhSubmitError] = useState(false);
  const { login_challenge: challenge } = queryString.parse(location.search);
  const { getErrors, getInputProps, submitForm } = useReactoForm({
    onChanging: (formData) => {
      formData.email && setEmail(formData.email);
      formData.password && setPassword(formData.password);
      formData.confirmPassword && setConfirmPassword(formData.confirmPassword);
      formData.username && setUserName(formData.username);
    }
  });
  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
    // return true;
  };
  const customValidate = (obj) => {
    setErrors({});
    let error = {};
    let isValid = true;

    if(obj.Email&&!validateEmail(obj.Email)) {
      isValid = false;
      error.email = "Enter a valid email";

    }
    else{
      error.email=null

    }
    if (obj.profile) {
      if (!obj.profile.username || obj.profile.username.length < 3) {
        isValid = false;
        error.username = "Username should have at least 3 character";
      }else{
        error.username=null
      }
    }

    if (obj?.password?.length < 6) {
      isValid = false;
      error.password = "Password should have 6 or more character";
    }
    if(obj?.password?.length >= 6){
      error.password=null
    }

    if (obj?.password !== obj?.confirmPassword) {
      isValid = false;
      error.confirmPassword = "Password didn't match";
    }else{
      error.confirmPassword = null;

      delete error["confirmPassword"];
    }
   

    if (obj?.phoneNumber?.length < 11) {
      isValid = false;
      error.phoneNumber = "Invalid phone number";
    }
    else{
      error.phoneNumber=null
    }

    return { error, isValid };
  };
  const notify = (value, type) => {
    if (type == "error") {
      toast.error(value);
    }
    setSubmitError(null);
  };
  const handleNext = async () => {
    let profile = {
      username: userName,
    };
    const signupData = {
      Email: Email,
      phoneNumber: phoneNumber,
      password: password,
      confirmPassword: confirmPassword,
      profile: profile,
    };
    const { error, isValid } = customValidate(signupData);

    if (!isValid) {
      setErrors(error);
    } else {
      const res = await usernameValidator(userName);
      if (res !== undefined) {
        error.username="Username already exist";
        setErrors(error);
        return;
      }
      error.username=null;
      setErrors(error);
      setIsSubmitting(true);
      let redirectUrl;
      try {
        redirectUrl = await callSignUp({ challenge, ...signupData });
      } catch (error) {
        setSubmitError(error.message);
        setIsSubmitting(false);
        return { ok: false };
      }
      setIsSubmitting(false);
      //lostTest
      // window.location.href = "/account/otp";
      if (redirectUrl) window.location.href = redirectUrl;
      return { ok: true };
    }
  };
  const handleBack = () => {
    setShowSignup(true);
  };
  const handleOtpSubmit = async () => {
    setShowOtpScreen(false);
    setShowSignup(true);
  };
  const handlePhNumberSubmit = async () => {
    const userInput = {
      phoneNumber: phoneNumber,
    };
    const { error, isValid } = customValidate(userInput);
    if (!isValid) {
      setErrors(error);
    } else {
      const res = await callNumberValidator({ ...userInput });
      if (res !== undefined) {
        setPhSubmitError("Account already exist");
      } else {
        setPhNumberScreen(false);
        setShowOtpScreen(true);
      }
    }
    
 
  };
  const goBack=()=> {
    window.history.back();
  }
  return (
    <div className="signup">
    <div className="backto" onClick={goBack} title="Back"><span> &#8249;
    </span></div>
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
      <header className="header">
        <img src="/Assets/icons/logo.svg" />
      </header>
      {showPhNumberScreen ? (
        <PhNumberComponent
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          Errors={Errors}
          onSubmit={handlePhNumberSubmit}
          PhSubmitError={PhSubmitError}
        />
      ) : showOtpScreen ? (
        <>
          <OTP onComplete={() => handleOtpSubmit()} number={phoneNumber} />
        </>
      ) : (
        showSignup && (
          <>
            <div className={classes.pageTitle}>{t("Lets get you sorted!")}</div>
            <div className="signin__inputWrapper">
            {submitError && (
              <InlineAlert
                alertType="error"
                className={classes.inlineAlert +" error-padding-ntp"}
                message={submitError.split("[")[0]}
              />
            )}
              {/* <Field
              errors={getErrors(["name"])}
              isRequired
              label={t("User name")}
              labelFor={`name-${uniqueId}`}
              name="name"
            >
              <TextInput
                type="text"
                id={`name-${uniqueId}`}
                placeholder="User name"
                {...getInputProps("name")}
              />
              {Errors.name&&<p className="signup__errors"> <small className="inline-error ml-0">{Errors.name}</small></p>}
            </Field> */}
              <Field
                errors={getErrors(["email"])}
                isRequired
                label={t("emailAddress")}
                labelFor={`email-${uniqueId}`}
                name="email"
              >
                <TextInput
                  type="email"
                  id={`email-${uniqueId}`}
                  placeholder="Enter Email"
                  {...getInputProps("email")}
                />
                <p className="signup__errors">
                  {" "}
                  <small className="inline-error ml-0">{Errors.email}</small>
                </p>
              </Field>
              <Field
                errors={getErrors(["username"])}
                isRequired
                label={t("Username")}
                labelFor={`username-${uniqueId}`}
                name="username"
              >
                <TextInput
                  type="username"
                  id={`username-${uniqueId}`}
                  placeholder="Enter Username"
                  {...getInputProps("username")}
                />
                <p className="signup__errors">
                  {" "}
                  <small className="inline-error ml-0">{Errors.username}</small>
                </p>
              </Field>
              <Field
                errors={getErrors(["password"])}
                isRequired
                label={t("password")}
                labelFor={`password-${uniqueId}`}
                name="password"
              >
                <TextInput
                  type="password"
                  id={`password-${uniqueId}`}
                  placeholder="Enter Password"
                  {...getInputProps("password")}
                />
                <p className="signup__errors">
                  {" "}
                  <small className="inline-error ml-0">{Errors.password}</small>
                </p>
              </Field>
              <Field
                errors={getErrors(["confirmPassword"])}
                isRequired
                label={t("Confirm Password")}
                labelFor={`ConfirmPassword-${uniqueId}`}
                name="confirmPassword"
              >
                <TextInput
                  type="password"
                  id={`ConfirmPassword-${uniqueId}`}
                  placeholder="Enter Confirm Password"
                  {...getInputProps("confirmPassword")}
                />
             {Errors.confirmPassword&&<p className="signup__errors">
                  {" "}
                  <small className="inline-error ml-0">
                    {Errors.confirmPassword}
                  </small>
                </p>}
              </Field>
   
            </div>

          
            <Button
              actionType="important"
              isFullWidth
              isWaiting={isSubmitting}
              onClick={handleNext}
              className="signup__signupBtn"
            >
              {t("Next")}
            </Button>

            {/* <Button
        isDisabled={isSubmitting}
        isFullWidth
        isShortHeight
        isTextOnly
        onClick={() => { history.push({ pathname: "/account/login", search: location.search }); }}
      >
        {t("signIn")}
      </Button> */}
            {/* <Typography className="signup__plainText1" variant="h5" component="h2">By clicking Sign Up, you agree to our</Typography>
          <Typography className="signup__plainText2" variant="h5" component="h2">Terms and Conditions.</Typography>
          <Typography className="signup__plainText3" variant="h5" component="h2">Already have an account?
            <span
              onClick={() => { history.push({ pathname: "/account/login", search: location.search }); }}
            >Login</span>
          </Typography> */}
          </>
        )
      )}
      {/* <Button
            actionType="important"
            isFullWidth
            isWaiting={isSubmitting}
            onClick={submitForm}
            className="signup__signupBtn"
          >
            {t("Sign Up")}
          </Button> */}
      {/* <div onClick={handleBack} className="signup__backBtn"> <img src="/Assets/icons/backbtn.png" /></div> */}
    </div>
  );
}

export default SignUp;
