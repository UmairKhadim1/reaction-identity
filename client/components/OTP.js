import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import InlineAlert from "@reactioncommerce/components/InlineAlert/v1";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  DialogContent,
  Typography,
  Container,
  Grid,
  IconButton,
  Icon,
  Button,
  Hidden,
  ClickAwayListener,
} from "@material-ui/core";
import OtpInput from "react-otp-input";
import { Meteor } from "meteor/meteor";

//  import OTPInput, { ResendOTP } from "otp-input-react";
const useStyles = makeStyles((theme) => ({
  paper: {
    backgroundColor: theme.palette.background.paper,
    // border: '2px solid #000',
    // boxShadow: theme.shadows[5],
    padding: theme.spacing(0),
  },
  dialogBox: {
    padding: theme.spacing(0),
    border: "none",
    paddingTop: "0px",
    "&:first-child": {
      paddingTop: "0px",
      border: "none",
    },
  },
  loginRow: {
    padding: theme.spacing(0),
  },
  loginImg: {
    width: "100%",
    height: "100%",
  },

  login__footer: {
    display: "flex",
    justifyContent: "center",
    padding: "10px 0px",
    alignItems: "center",
  },
  footer__otpText: {
    fontSize: "12px",
    color: "#D8213B",
    fontWeight: 700,
    cursor: "pointer",
  },

  login__phoneInput: {
    border: "1px solid",
    padding: "10px",
    borderRadius: "25px",
  },
  verification__verifyBtn: {
    fontFamily: "Karla",
    width: "100%",
    backgroundColor: "#D8213B",
    color: "white",
    padding: "18px 0px",
    borderRadius: "25px",
    margin: " 18px 0px 5px 0px",
    fontSize: "16px",
    lineHeight: "19px",
    textTransform: "uppercase",
    "&:hover": {
      color: "#D8213B",
    },
  },
}));

export default function TransitionsModal({ onComplete, number }) {
  const classes = useStyles();
  const [userOTP, setUserOTP] = useState(1234);
  const [OTP, setOTP] = useState("");
  const [seconds, setSeconds] = React.useState(60);
  const [isOTPValid, setIsOTPValid] = useState(true);
  const [otpError, setOtpError] = useState(false);
  const [isResendCode, setIsResendCode] = useState(false);
  useEffect(() => {
    if (seconds > 0) {
      var timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setSeconds(0);
      setIsOTPValid(false);
    }
  });
  useEffect(() => {
    Meteor.call("send_otp", number, (otpError, res) => {});
  }, []);
  const resendOTP = () => {
    setIsOTPValid(true);
    Meteor.call("send_otp", number, (otpError, res) => {});
    setSeconds(60);
    setIsResendCode(true);
    var timer = setTimeout(() => setIsResendCode(false), 5000);
    return () => clearTimeout(timer);
  };
  const handleChange = (otp) => setOTP(otp);
  const varifyCallMeteor = () => {
    return new Promise((resolve, reject) => {
      Meteor.call("verify_otp", number, OTP, (error, data) => {
        if (error) {
          reject();
        } else {
          resolve(data);
          return data;
        }
      });
    });
  };
  const notify = (value, type) => {
    if (type == "error") {
      toast.error(value);
    }
     setOtpError(null);
  };
  const handleOTP = async () => {
    const response = await varifyCallMeteor();
    if (response == true) {
      setSeconds("00");
      onComplete();
    } else if (response == false) {
      setOtpError("You have entered an incorrect OTP");
    }
  };

  return (
    <div>
      {/* <header className="header">
        <img src="/Assets/icons/logo.svg" />
      </header> */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        theme="colored"
        pauseOnHover
      />
      <Fade in={open}>
        <div className={classes.paper}>
          <Grid container className={classes.loginRow}>
            {isResendCode && (
              <Typography variant="h6" className="isResendCode">
                Code sent successfully
              </Typography>
            )}
            <Grid item xs={12} sm={12} md={12}>
              <Container className="otp__innerContainer">
                <div>
                  <Typography variant="h6" className="verificationHeading">
                    Phone Verification
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    className="verification__subtitle"
                  >
                    Please enter the 6-digit code send to you at
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    className="verification__subtitle2"
                  >
                    {number}
                  </Typography>
                  {otpError && (
                    <InlineAlert
                      alertType="error"
                      className={classes.inlineAlert +" lrp-0"}
                      message={otpError}
                    />
                  )}
                  <div className="otpRow">
                    <OtpInput
                      value={OTP}
                      onChange={handleChange}
                      numInputs={6}
                      separator={<span></span>}
                      className={`otp__input ${
                        isOTPValid ? " " : "invalidOtp__input"
                      }`}
                    />
                  </div>
                  <div className="otp__timmer">
                    <span>00:{seconds < 10 ? "0" + seconds : seconds}</span>
                  </div>
                </div>
                {/*otpError && notify(otpError, "error")*/}
             
                <Grid container justify="center">
                  <Button
                    className={classes.verification__verifyBtn}
                    onClick={handleOTP}
                  >
                    Submit
                  </Button>
                </Grid>
                <div className={classes.login__footer}>
                  <Typography
                    variation="h6"
                    className={classes.footer__otpText}
                    onClick={resendOTP}
                  >
                    Resend Code?
                  </Typography>
                </div>
              </Container>
            </Grid>
          </Grid>
        </div>
      </Fade>
    </div>
  );
}
