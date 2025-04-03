import Post from "./postModel.mjs";
import User from "../User/userModel.mjs";

/**
 * Create a new post
 */
export const createPost = async (req, res, next) => {
   try {
      if (!req.session.user) {
         return res.status(401).json({ message: "Not authenticated" });
      }

      const { title, content } = req.body;
      const userId = req.session.user._id;

      // Validate input
      if (!title || !content) {
         return res
            .status(400)
            .json({ message: "Title and content are required" });
      }

      let imageUrl = "";

      // Handle file upload if present
      if (req.file) {
         imageUrl = `/uploads/${req.file.filename}`;
      }

      // Create post in MongoDB
      const post = await Post.create({
         title,
         content,
         imageUrl,
         author: userId,
      });

      res.status(201).json({
         message: "Post created successfully",
         post,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Get all posts
 */
export const getAllPosts = async (req, res, next) => {
   try {
      const posts = await Post.find()
         .sort({ createdAt: -1 })
         .populate("author", "username displayName avatarUrl");

      res.status(200).json({ posts });
   } catch (error) {
      next(error);
   }
};

/**
 * Get single post by ID
 */
export const getPostById = async (req, res, next) => {
   try {
      const { id } = req.params;
      
      const post = await Post.findById(id).populate(
         "author",
         "username displayName avatarUrl"
      );

      if (!post) {
         return res.status(404).json({ message: "Post not found" });
      }

      res.status(200).json({ post });
   } catch (error) {
      next(error);
   }
};

/**
 * Update a post
 */
export const updatePost = async (req, res, next) => {
   try {
      if (!req.session.user) {
         return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const { title, content } = req.body;
      const userId = req.session.user._id;

      // First check if post exists and user is the author
      const post = await Post.findById(id);

      if (!post) {
         return res.status(404).json({ message: "Post not found" });
      }

      if (post.author.toString() !== userId.toString()) {
         return res
            .status(403)
            .json({ message: "Not authorized to update this post" });
      }

      // Update image if there is a new file
      let updateData = { title, content };
      if (req.file) {
         updateData.imageUrl = `/uploads/${req.file.filename}`;
      }

      // Update in MongoDB
      const updatedPost = await Post.findByIdAndUpdate(id, updateData, {
         new: true,
      }).populate("author", "username displayName avatarUrl");

      res.status(200).json({
         message: "Post updated successfully",
         post: updatedPost,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Delete a post
 */
export const deletePost = async (req, res, next) => {
   try {
      if (!req.session.user) {
         return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const userId = req.session.user._id;

      // First check if post exists and user is the author
      const post = await Post.findById(id);

      if (!post) {
         return res.status(404).json({ message: "Post not found" });
      }

      if (post.author.toString() !== userId.toString()) {
         return res
            .status(403)
            .json({ message: "Not authorized to delete this post" });
      }

      // Delete from MongoDB
      await Post.findByIdAndDelete(id);

      res.status(200).json({ message: "Post deleted successfully" });
   } catch (error) {
      next(error);
   }
};

/**
 * Get posts by user
 */
export const getUserPosts = async (req, res, next) => {
   try {
      const { userId } = req.params;

      const posts = await Post.find({ author: userId })
         .sort({ createdAt: -1 })
         .populate("author", "username displayName avatarUrl");

      res.status(200).json({ posts });
   } catch (error) {
      next(error);
   }
};