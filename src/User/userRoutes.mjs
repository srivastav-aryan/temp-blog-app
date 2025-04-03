import express from "express";
import passport from "passport";
 
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  logoutUser,
  googleAuthCallback,
} from "./userController.mjs";
 

const router = express.Router();

 

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

 

export default router;
