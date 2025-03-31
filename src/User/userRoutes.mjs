import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  logoutUser,
  googleAuthCallback,
} from "./userController.mjs";
import appConfig from "../config/appConfig.mjs";

const router = express.Router();

// Configure Passport with Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: appConfig.google.clientId,
      clientSecret: appConfig.google.clientSecret,
      callbackURL: appConfig.google.callbackURL,
    },
    (accessToken, refreshToken, profile, done) => {
      // Add detailed logging
      console.log("Google OAuth callback received");
      console.log("Profile:", JSON.stringify(profile, null, 2));

      // Pass the profile to the callback
      return done(null, profile);
    }
  )
);

// Serialize and deserialize user (required for Passport)
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Regular auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", getCurrentUser);
router.put("/profile", updateUserProfile);
router.post("/logout", logoutUser);

// Google OAuth routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleAuthCallback
);

export default router;
