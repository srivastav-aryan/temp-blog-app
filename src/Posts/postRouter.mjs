import express from "express";
import multer from "multer";
import path from "path";
import {
   createPost,
   getAllPosts,
   getPostById,
   updatePost,
   deletePost,
   getUserPosts,
} from "./postController.mjs";
import AuthUser from "../middlewares/AuthUser.mjs";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, path.join(process.cwd(), "public", "uploads"));
   },
   filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
   },
});

const upload = multer({
   storage: storage,
   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
   fileFilter: function (req, file, cb) {
      const filetypes = /jpeg|jpg|png|gif/;
      const extname = filetypes.test(
         path.extname(file.originalname).toLowerCase()
      );
      const mimetype = filetypes.test(file.mimetype);

      if (mimetype && extname) {
         return cb(null, true);
      } else {
         cb(new Error("Error: Images only!"));
      }
   },
});

// Post routes
router.post("/", AuthUser, upload.single("image"), createPost);
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.put("/:id", AuthUser, upload.single("image"), updatePost);
router.delete("/:id", AuthUser, deletePost);
router.get("/user/:userId", getUserPosts);

export default router;
