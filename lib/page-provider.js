const { URL, URLSearchParams } = require("url");
const {
  AuthorizationError,
  CaptchaRequiredError,
  NotAuthorizedError
} = require("./errors");
const {
  orderMiddleware,
  queryMiddleware,
  sortMiddleware
} = require("./middlewares");
const { cookiesFromSetCookieHeaders, decodeWindows1251 } = require("./utils");
const axios = require("axios");

const DEFAULT_HOST = "https://rutracker.org";

class PageProvider {
  constructor(options = {}) {
    this.authorized = false;
    this.request = axios;
    this.cookie = null;
    this.host = options.host || DEFAULT_HOST;

    if (options.cookie) {
      this.setSessionCookie(options.cookie);
    }
    this.loginUrl = `${this.host}/forum/login.php`;
    this.searchUrl = `${this.host}/forum/tracker.php`;
    this.threadUrl = `${this.host}/forum/viewtopic.php`;
    this.downloadUrl = `${this.host}/forum/dl.php`;

    this.searchMiddlewares = [queryMiddleware, sortMiddleware, orderMiddleware];
  }

  setSessionCookie(cookie) {
    const value = cookie.includes("bb_session=") ? cookie : `bb_session=${cookie}`;
    this.cookie = value.includes("bb_ssl=") ? value : `bb_ssl=1; ${value}`;
    this.authorized = true;
  }

  login(username, password) {
    const body = new URLSearchParams();

    body.append("login_username", username);
    body.append("login_password", password);
    body.append("login", "Вход");

    return this.request({
      url: this.loginUrl,
      method: "POST",
      data: body.toString(),
      maxRedirects: 0,
      validateStatus(status) {
        return status < 500;
      }
    })
      .then(response => {
        if (response.status === 302) {
          const cookie = cookiesFromSetCookieHeaders(
            response.headers["set-cookie"]
          );

          if (!cookie || !cookie.includes("bb_session=")) {
            throw new AuthorizationError();
          }

          this.cookie = cookie;
          this.authorized = true;

          return true;
        }

        const html = decodeWindows1251(response.data);

        if (html.includes("cap_sid") || html.includes("cap_code_")) {
          throw new CaptchaRequiredError();
        }

        throw new AuthorizationError();
      })
      .catch(err => {
        if (
          err instanceof AuthorizationError ||
          err instanceof CaptchaRequiredError
        ) {
          throw err;
        }

        throw new AuthorizationError();
      });
  }

  search(params) {
    if (!this.authorized) {
      return Promise.reject(new NotAuthorizedError());
    }

    const url = new URL(this.searchUrl);
    const body = new URLSearchParams();

    try {
      this.searchMiddlewares.forEach(middleware => {
        middleware(params, body, url);
      });
    } catch (err) {
      return Promise.reject(err);
    }

    return this.request({
      url: url.toString(),
      data: body.toString(),
      method: "POST",
      responseType: "arraybuffer",
      headers: {
        Cookie: this.cookie
      }
    }).then(response => decodeWindows1251(response.data));
  }

  thread(id) {
    if (!this.authorized) {
      return Promise.reject(new NotAuthorizedError());
    }

    const url = `${this.threadUrl}?t=${encodeURIComponent(id)}`;

    return this.request({
      url,
      method: "GET",
      responseType: "arraybuffer",
      headers: {
        Cookie: this.cookie
      }
    }).then(response => decodeWindows1251(response.data));
  }

  torrentFile(id) {
    if (!this.authorized) {
      return Promise.reject(new NotAuthorizedError());
    }

    const url = `${this.downloadUrl}?t=${encodeURIComponent(id)}`;

    return this.request({
      url,
      method: "GET",
      responseType: "stream",
      headers: {
        Cookie: this.cookie
      }
    }).then(response => response.data);
  }
}

module.exports = PageProvider;
