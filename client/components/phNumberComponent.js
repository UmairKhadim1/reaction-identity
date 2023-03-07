import React, { useState, useEffect } from 'react';
import { Typography, Button } from '@material-ui/core';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import InlineAlert from "@reactioncommerce/components/InlineAlert/v1";
import { useHistory, useLocation } from "react-router-dom";
import { Meteor } from "meteor/meteor";
// function identityVerification() {
//   return new Promise((resolve,reject)=>{
//     Meteor.call("identityVerification", (error, data) => {
//       console.log("data", data, "error", error);
//       if (data) {
//         console.log("data identity verification", data);
//         resolve(data);
//       // window.location.href=`https://api.yoti.com/idverify/v1/web/index.html?sessionID=${data.sessionId}&sessionToken=${data.clientSessionToken}`;
//       } 
//       if (error) {
//         console.log("error identityverification", error);
//         reject(error);
//       }
//     })
//   })
 
// }
//  (async ()=>{
//      const res = await identityVerification();
//      console.log("res =",res);
//      window.location.href(`https://api.yoti.com/idverify/v1/web/index.html?sessionID=${res.sessionId}&sessionToken=${res.clientSessionToken}`);
//  })();
export default function PhNumberComponent({  phoneNumber,setPhoneNumber,Errors, onSubmit,PhSubmitError}) {
    const history = useHistory();
    return (
        <div className="phNumberComponent">
            <div className="phNumberComponent__phInput">
                <Typography variant="h2" className="phNumberComponent__phInputLabel">Phone Number</Typography>
                <PhoneInput
                    className="phNumberComponent__phInputInput"
                    defaultCountry="GB"
                    country="GB"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={setPhoneNumber} />
                <p className="phNumberComponent__errors">
                <small className="inline-error">{Errors.phoneNumber}</small></p>
        
                {PhSubmitError &&
                  <InlineAlert
                    alertType="error"
                    className="phNumberComponent__inlineAlert"
                    message={PhSubmitError}
                  />
                }
              </div>
           
            <Button onClick={onSubmit} className="phNumberComponent__Btn">Next</Button>
            <Typography className="signup__plainText3" variant="h5" component="h2">Already have an account?
           
            </Typography>
             <Typography className="signup__plainText3" variant="h5" component="h2">
            <span
              onClick={() => { history.push({ pathname: "/account/login", search: location.search }); }}
            >Login</span>
          </Typography>
        </div>
    )}


// export default function PhNumberComponent({ phoneNumber, setPhoneNumber, Errors, onSubmit, PhSubmitError }) {
   
//   return (
//     <div className="phNumberComponent">
//       <div className="phNumberComponent__phInput">
//         <Typography variant="h2" className="phNumberComponent__phInputLabel">Phone Number</Typography>
//         <PhoneInput
//           className="phNumberComponent__phInputInput"
//           defaultCountry="PK"
//           country="PK"
//           placeholder="Enter phone number"
//           value={phoneNumber}
//           onChange={setPhoneNumber} />
//         <p className="phNumberComponent__errors"><small>{Errors.phoneNumber}</small></p>
//       </div>
//       {PhSubmitError &&
//         <InlineAlert
//           alertType="error"
//           className="phNumberComponent__inlineAlert"
//           message={PhSubmitError}
//         />
//       }
//       <Button onClick={onSubmit} className="phNumberComponent__Btn">Next</Button>
//     </div>
//   )
// }
