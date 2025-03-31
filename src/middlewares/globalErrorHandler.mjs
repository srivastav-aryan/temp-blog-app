/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleError = (err, req, res, next) => {
   // Log the error for server debugging
   console.error("Global error handler caught:", err);

   // Set default status code and message
   const statusCode = err.statusCode || 500;
   const message = err.message || "Internal Server Error";

   // Check if the request is an API request
   const isApiRequest = req.originalUrl.startsWith("/api");

   if (isApiRequest) {
      // Return JSON error for API requests
      return res.status(statusCode).json({
         status: "error",
         message,
         stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
   } else {
      // Render error page for regular requests
      return res.status(statusCode).render("error", {
         message,
         error: process.env.NODE_ENV === "development" ? err : {},
         user: req.session?.user || null,
      });
   }
};

export default handleError;
