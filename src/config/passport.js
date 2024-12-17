const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/UserModel');
const dotenv = require("dotenv");
dotenv.config();

const serverUrl = process.env.SERVER_URL;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${serverUrl}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
          // Thông tin từ profile Google
          const { emails, displayName, photos } = profile;
    
          // Gắn thông tin người dùng vào req.user để Passport sử dụng
          const user = {
            id: profile.id,
            email: emails[0].value,
            name: displayName,
            avatar: photos[0].value, // Lấy avatar từ profile Google
            accessToken,
            refreshToken,
          };
    
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
    }
  )
);

module.exports = passport;
