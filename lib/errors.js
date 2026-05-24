class AuthorizationError extends Error {
  constructor(...args) {
    super(...args);

    this.name = "AuthorizationError";
    this.message = "Incorrect username or password";
  }
}

class NotAuthorizedError extends Error {
  constructor(...args) {
    super(...args);

    this.name = "NotAuthorizedError";
    this.message = `Try to call 'login' method first`;
  }
}

class ServerError extends Error {}

class ValidationError extends Error {}

class CaptchaRequiredError extends Error {
  constructor(...args) {
    super(...args);

    this.name = "CaptchaRequiredError";
    this.message =
      "RuTracker requires a captcha on login. Log in in the browser and pass the session cookie via cookie option or useSessionCookie().";
  }
}

module.exports = {
  AuthorizationError,
  CaptchaRequiredError,
  NotAuthorizedError,
  ServerError,
  ValidationError
};
