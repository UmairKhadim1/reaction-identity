import envalid from "envalid";

ServiceConfiguration.configurations.remove({
  service: "google",
});
ServiceConfiguration.configurations.insert({
  service: "google",
  scope: 'openid profile email',
  clientId:
    "431033151639-eb4ijrslp4kpvv6vj9956a8u6j1vh8dr.apps.googleusercontent.com",
  secret: "JbQWORGptIoDRlUt3mrNBMoH",
});
const { bool, num, str } = envalid;
export default envalid.cleanEnv(process.env, {
  API_URL: str(),
  HYDRA_ADMIN_URL: str(),
  HYDRA_TOKEN_URL: str(),
  STRIPE_PUBLIC_KEY: str(),
  STRIPE_SECRET_KEY: str(),
  HYDRA_OAUTH2_ERROR_URL: str({ default: "" }),
  HYDRA_SESSION_LIFESPAN: num({ default: 86400 }),
  MOCK_TLS_TERMINATION: bool({ default: false }),
  OAUTH2_CLIENT_DOMAINS: str({ default: "" }),
  ROOT_URL: str(),
});
