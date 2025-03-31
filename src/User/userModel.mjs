import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
   {
      googleId: {
         type: String,
         sparse: true,
      },
      username: {
         type: String,
         required: [true, "Username is required"],
         unique: true,
         trim: true,
      },
      email: {
         type: String,
         required: [true, "Email is required"],
         unique: true,
         lowercase: true,
         trim: true,
      },
      password: {
         type: String,
         select: false, // Don't return password by default in queries
      },
      displayName: {
         type: String,
         trim: true,
      },
      bio: {
         type: String,
         default: "",
      },
      avatarUrl: {
         type: String,
         default: "",
      },
      isGoogleUser: {
         type: Boolean,
         default: false,
      },
   },
   {
      timestamps: true,
   }
);

// Hash password before saving (not for Google users)
userSchema.pre("save", async function (next) {
   // Only hash the password if it has been modified (or is new) and not a Google user
   if (this.isModified("password") && !this.isGoogleUser) {
      try {
         const salt = await bcrypt.genSalt(10);
         this.password = await bcrypt.hash(this.password, salt);
         next();
      } catch (error) {
         next(error);
      }
   } else {
      next();
   }
});

// Method to compare provided password with stored password
userSchema.methods.matchPassword = async function (enteredPassword) {
   if (this.isGoogleUser) {
      return false; // Google users shouldn't use password login
   }
   return await bcrypt.compare(enteredPassword, this.password);
};

// Create model
const User = mongoose.model("User", userSchema);

export default User;
