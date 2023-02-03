const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET } = require('./public/constants');

module.exports = {
    'secretKey': '12345-67890-09876-54321',
    'mongoUrl': 'mongodb://localhost:27017/nucampsite',
    'facebook': {
        clientId: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET
    }
}