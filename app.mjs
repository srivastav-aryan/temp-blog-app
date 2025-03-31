import express from "express";
import expressEjsLayouts from "express-ejs-layouts";
import path from "path";
import { fileURLToPath } from "url";
import userRouter from "./src/User/userRoutes.mjs";
import postRouter from "./src/Posts/postRouter.mjs";
import handleError from "./src/middlewares/globalErrorHandler.mjs";
import session from "express-session";
import MongoStore from "connect-mongo";
import appConfig from "./src/config/appConfig.mjs";
import methodOverride from "method-override";
import Post from "./src/Posts/postModel.mjs";
import User from "./src/User/userModel.mjs";
import AuthUser from "./src/middlewares/AuthUser.mjs";
import passport from "passport";

// Setup __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// View engine setup
app.set("view engine", "ejs");
app.use(expressEjsLayouts);
app.set("layout", "layouts/main");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Session configuration
app.use(
   session({
      secret: appConfig.sessionSignatureKey,
      resave: false,
      saveUninitialized: false,
      cookie: {
         maxAge: 1000 * 60 * 60 * 24, // 1 day
         httpOnly: true,
      },
      store: MongoStore.create({
         mongoUrl: appConfig.dbString,
         dbName: "pro-blog",
      }),
   })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Make user data available to all views
app.use((req, res, next) => {
   res.locals.user = req.session.user || null;
   next();
});

// Routes for rendering HTML pages
app.get("/", async (req, res) => {
   try {
      const blogs = await Post.find()
         .sort({ createdAt: -1 })
         .populate("author", "username displayName avatarUrl");

      res.render("home", {
         blogs,
         user: req.session.user || null,
      });
   } catch (error) {
      console.error(error);
      res.render("home", {
         blogs: [],
         user: req.session.user || null,
      });
   }
});

// Login page route
app.get("/login", (req, res) => {
   if (req.session.user) {
      return res.redirect("/");
   }
   res.render("login", { user: null });
});

// Register page route
app.get("/register", (req, res) => {
   if (req.session.user) {
      return res.redirect("/");
   }
   res.render("register", { user: null });
});

// Logout route
app.get("/logout", (req, res) => {
   req.session.destroy();
   res.redirect("/");
});

// Create post page (auth required)
app.get("/create-post", AuthUser, (req, res) => {
   res.render("create-post", { user: req.session.user });
});

// View single post page
app.get("/post/:id", async (req, res, next) => {
   try {
      const post = await Post.findById(req.params.id).populate(
         "author",
         "username displayName avatarUrl"
      );

      if (!post) {
         return res.status(404).render("error", {
            message: "Post not found",
            user: req.session.user || null,
         });
      }

      res.render("post", {
         post,
         user: req.session.user || null,
      });
   } catch (error) {
      next(error);
   }
});

// Edit post page (auth required)
app.get("/edit-post/:id", AuthUser, async (req, res, next) => {
   try {
      const post = await Post.findById(req.params.id);

      if (!post) {
         return res.status(404).render("error", {
            message: "Post not found",
            user: req.session.user,
         });
      }

      // Check if the user is authorized to edit this post
      if (post.author.toString() !== req.session.user._id.toString()) {
         return res.status(403).render("error", {
            message: "You are not authorized to edit this post",
            user: req.session.user,
         });
      }

      res.render("edit-post", { post, user: req.session.user });
   } catch (error) {
      next(error);
   }
});

// API routes
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);

// 404 Error page
app.use((req, res, next) => {
   res.status(404).render("error", {
      message: "Page not found",
      user: req.session.user || null,
   });
});

// Global error handler
app.use(handleError);

export default app;
