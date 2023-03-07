const {
  DocScanClient,
  SessionSpecificationBuilder,
  RequestedDocumentAuthenticityCheckBuilder,
  RequestedLivenessCheckBuilder,
  RequestedTextExtractionTaskBuilder,
  RequestedFaceMatchCheckBuilder,
  SdkConfigBuilder,
} = require("yoti");
const path = require("path");
const fs = require("fs");
const {
  SandboxDocScanClientBuilder,
  SandboxBreakdownBuilder,
  SandboxRecommendationBuilder,
  SandboxDocumentAuthenticityCheckBuilder,
  SandboxCheckReportsBuilder,
  SandboxResponseConfigBuilder,
  SandboxDocumentTextDataCheckBuilder,
  SandboxTaskResultsBuilder,
  SandboxZoomLivenessCheckBuilder,
  SandboxDocumentFaceMatchCheckBuilder,
  SandboxDocumentTextDataExtractionTaskBuilder,
  SandboxLive,
} = require("@getyoti/sdk-sandbox");
const SANDBOX_CLIENT_SDK_ID = "84aaac5e-4a60-48f2-9947-b03b68574fa2";
const PEM_File = fs.readFileSync(
  process.cwd().split(".meteor")[0] +
    "/server/yoti/landOfSneakers-access-security.pem",
  "utf8"
);
const docScanClient = new DocScanClient(SANDBOX_CLIENT_SDK_ID, PEM_File);
// const sandboxClient = new SandboxDocScanClientBuilder()
// .withClientSdkId(SANDBOX_CLIENT_SDK_ID)
// .withPemString(PEM_File)
// .build();

async function identityVerification() {
  console.log("indentity sVerification initilize");
  const documentAuthenticityCheck =
    new RequestedDocumentAuthenticityCheckBuilder().build();

  //Liveness check with 3 retries
  const livenessCheck = new RequestedLivenessCheckBuilder()
    .forZoomLiveness()
    .withMaxRetries(3)
    .build();

  //Face Match Check with manual check set to fallback
  const faceMatchCheck = new RequestedFaceMatchCheckBuilder()
    .withManualCheckFallback()
    .build();

  //ID Document Text Extraction Task with manual check set to fallback
  const textExtractionTask = new RequestedTextExtractionTaskBuilder()
    .withManualCheckFallback()
    .build();

  //Configuration for the client SDK (Frontend)
  const sdkConfig = new SdkConfigBuilder()
    .withAllowsCameraAndUpload()
    .withPresetIssuingCountry("GBR")
    .withSuccessUrl("https://store.landofsneakers.com/en/success")
    .withErrorUrl("https://store.landofsneakers.com/en/verificationError")
    .build();

  //Buiding the Session with defined specification from above
  const sessionSpec = new SessionSpecificationBuilder()
    .withClientSessionTokenTtl(86400)
    .withResourcesTtl(604800)
    .withUserTrackingId("some-user-tracking-id")
    .withRequestedCheck(documentAuthenticityCheck)
    .withRequestedCheck(livenessCheck)
    .withRequestedCheck(faceMatchCheck)
    .withRequestedTask(textExtractionTask)
    .withSdkConfig(sdkConfig)
    .build();

  //Create Session
  const session = await docScanClient.createSession(sessionSpec);
  if (session) {
    const sessionId = session.getSessionId();
    const clientSessionToken = session.getClientSessionToken();
    const clientSessionTokenTtl = session.getClientSessionTokenTtl();
    return { sessionId, clientSessionToken };
  } else {
  }

  // await docScanClient
  //     .createSession(sessionSpec)
  //     .then((session) => {
  //         const sessionId = session.getSessionId();
  //         const clientSessionToken = session.getClientSessionToken();
  //         const clientSessionTokenTtl = session.getClientSessionTokenTtl();
  //         console.log("session Id = ",sessionId,"session Token = ", clientSessionToken );
  //         const content = "session Id = "+sessionId+ " session Token = "+ clientSessionToken;
  //         fs.writeFileSync(process.cwd().split('.meteor')[0] +"server/yoti/test.txt", content);
  //          return {sessionId, clientSessionToken}
  //     })
  //     .catch((err) => {
  //         // handle err
  //     });
}
 function fetchResults(sessionId) {
     return new Promise((resolve,reject)=>{
  docScanClient
    .getSession(sessionId)
    .then((session) => {
      // Returns the session state
      const state = session.getState();

      // Returns session resources
      const resources = session.getResources();

      // Returns all checks on the session
      const checks = session.getChecks();

      // Return specific check types
      const authenticityChecks = session.getAuthenticityChecks();

      const faceMatchChecks = session.getFaceMatchChecks();

      const textDataChecks = session.getTextDataChecks();

      const livenessChecks = session.getLivenessChecks();
      resolve({
        state,checks
      })
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
})
}
export { identityVerification ,fetchResults};
