/**
 * Middleware to check if a user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const AuthUser = (req, res, next) => {
   // Check if user exists in session
   if (!req.session.user) {
      // If not authenticated, redirect to login page
      return res.redirect("/login");
   }

   // User is authenticated, proceed to the next middleware/route handler
   next();
};

export default AuthUser;
