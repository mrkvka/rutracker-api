const windows1251 = require("windows-1251");

function cookiesFromSetCookieHeaders(setCookie) {
  if (!setCookie) {
    return null;
  }

  const headers = Array.isArray(setCookie) ? setCookie : [setCookie];

  if (headers.length === 0) {
    return null;
  }

  return headers.map(header => header.split(";")[0]).join("; ");
}

module.exports = {
  cookiesFromSetCookieHeaders,

  decodeWindows1251: string =>
    windows1251.decode(string.toString("binary"), { mode: "html" }),

  formatSize: sizeInBytes => {
    const sizeInMegabytes = sizeInBytes / (1000 * 1000 * 1000);
    return `${sizeInMegabytes.toFixed(2)} GB`;
  }
};
