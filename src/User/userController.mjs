import User from "./userModel.mjs";
 

 
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


 