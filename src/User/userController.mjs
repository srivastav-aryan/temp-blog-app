import User from "./userModel.mjs";
import appwriteService from "../config/appwriteConfig.mjs";
import jwt from "jsonwebtoken";
import appConfig from "../config/appConfig.mjs";

/**
 * Register a new user
 */
export const registerUser = async (req, res, next) => {
   try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
         $or: [{ email }, { username }],
      });
      if (existingUser) {
         if (existingUser.email === email) {
            return res.status(400).json({ message: "Email already in use" });
         }
         return res.status(400).json({ message: "Username already taken" });
      }

      // Create user in database
      const user = await User.create({
         username,
         email,
         password,
         displayName: username,
      });

      // Create user in Appwrite
      try {
         await appwriteService.createUser(email, password, username);
      } catch (appwriteError) {
         console.error("Appwrite user creation failed:", appwriteError);
         // Continue with local user creation, we'll sync later if needed
      }

      // Store user in session
      req.session.user = {
         _id: user._id,
         username: user.username,
         email: user.email,
         displayName: user.displayName,
         avatarUrl: user.avatarUrl,
      };

      res.status(201).json({
         message: "User registered successfully",
         user: {
            id: user._id,
            username: user.username,
            email: user.email,
         },
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Login user
 */
export const loginUser = async (req, res, next) => {
   try {
      const { email, password } = req.body;

      // Find user in database with password (since password field has select: false)
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
         return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if this is a Google user
      if (user.isGoogleUser) {
         return res.status(400).json({
            message:
               "This account uses Google authentication. Please sign in with Google.",
         });
      }

      // Check if password matches
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
         return res.status(401).json({ message: "Invalid email or password" });
      }

      // Try to login with Appwrite
      try {
         await appwriteService.loginUser(email, password);
      } catch (appwriteError) {
         console.error("Appwrite login failed:", appwriteError);
         // Continue with local login since we have our own session management
      }

      // Store user in session
      req.session.user = {
         _id: user._id,
         username: user.username,
         email: user.email,
         displayName: user.displayName || user.username,
         avatarUrl: user.avatarUrl,
      };

      res.status(200).json({
         message: "Login successful",
         user: {
            id: user._id,
            username: user.username,
            email: user.email,
         },
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Get current user
 */
export const getCurrentUser = async (req, res, next) => {
   try {
      if (!req.session.user) {
         return res.status(401).json({ message: "Not authenticated" });
      }

      // Get user from database
      const user = await User.findById(req.session.user._id);
      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
         user: {
            id: user._id,
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
         },
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (req, res, next) => {
   try {
      if (!req.session.user) {
         return res.status(401).json({ message: "Not authenticated" });
      }

      const { displayName, bio } = req.body;

      // Update user in database
      const user = await User.findByIdAndUpdate(
         req.session.user._id,
         {
            displayName: displayName || req.session.user.displayName,
            bio: bio || "",
         },
         { new: true }
      );

      // Update session with new info
      req.session.user = {
         ...req.session.user,
         displayName: user.displayName,
      };

      res.status(200).json({
         message: "Profile updated successfully",
         user: {
            id: user._id,
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
         },
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Logout user
 */
export const logoutUser = async (req, res, next) => {
   try {
      // Try to logout from Appwrite
      try {
         await appwriteService.logoutUser();
      } catch (appwriteError) {
         console.error("Appwrite logout failed:", appwriteError);
         // Continue with local logout
      }

      // Destroy session
      req.session.destroy((err) => {
         if (err) {
            return next(err);
         }

         res.status(200).json({ message: "Logout successful" });
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Google OAuth callback handler
 */
export const googleAuthCallback = async (req, res, next) => {
   try {
      // This function will be called after successful Google authentication
      // The user data will be available in req.user (from Passport.js)
      const { id, displayName, emails, photos } = req.user;

      // Check if user already exists
      let user = await User.findOne({ googleId: id });

      if (!user) {
         // Check if email is already used by a non-Google user
         const existingUser = await User.findOne({ email: emails[0].value });

         if (existingUser) {
            // Link Google ID to existing account
            existingUser.googleId = id;
            existingUser.isGoogleUser = true;
            if (photos && photos[0] && !existingUser.avatarUrl) {
               existingUser.avatarUrl = photos[0].value;
            }
            user = await existingUser.save();
         } else {
            // Create new user
            const username =
               emails[0].value.split("@")[0] + Date.now().toString().slice(-4);
            user = await User.create({
               googleId: id,
               username,
               email: emails[0].value,
               displayName: displayName || username,
               avatarUrl: photos && photos[0] ? photos[0].value : "",
               isGoogleUser: true,
            });
         }
      }

      // Store user in session
      req.session.user = {
         _id: user._id,
         username: user.username,
         email: user.email,
         displayName: user.displayName,
         avatarUrl: user.avatarUrl,
      };

      // Redirect to home page
      res.redirect("/");
   } catch (error) {
      next(error);
   }
};
