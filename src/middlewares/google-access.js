const createError = require('http-errors');
const { google } = require('googleapis');

module.exports = async (req, res, next) => {
  const accessToken = req.headers.authorization;
  if (!accessToken) {
    return next(createError(401, 'Access token missing!'));
  }
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });
    req.oauth2 = oauth2;
    req.oauth2Client = oauth2Client;
  } catch (e) {
    return next(createError(401, 'Not authorized for this action'));
  }

  return next();
};
