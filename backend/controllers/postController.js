const Post = require("../models/Post");
const fs = require("fs");
const path = require("path");

exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Thiếu nội dung bài đăng." });
    }
    const authorId = req.userId;
    const authorType = req.userRole;
    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/posts/${req.file.filename}`;
    }

    const newPost = new Post({
      content,
      imageUrl,
      authorType,
      author: authorId,
    });

    await newPost.save();

    res.status(201).json({ message: "Tạo bài đăng thành công", post: newPost });
  } catch (error) {
    console.error("Lỗi tạo bài đăng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "fullName avatarUrl")
      .populate("comments.user", "fullName avatarUrl");

    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      posts,
      page,
      totalPages,
      totalPosts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author");
    if (!post)
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });

    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;
    const file = req.file;

    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({ message: "Bài đăng không tồn tại" });

    // Chỉ cho phép tác giả chỉnh sửa
    if (!post.author.equals(req.userId)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền chỉnh sửa bài đăng này." });
    }

    let updatedImage = post.imageUrl;
    if (file) {
      // Xóa hình ảnh cũ nếu có
      if (post.imageUrl) {
        const oldPath = path.join(__dirname, "../", post.imageUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updatedImage = `/uploads/posts/${file.filename}`;
    }

    post.content = content || post.content;
    post.imageUrl = updatedImage;
    await post.save();

    res
      .status(200)
      .json({ message: "Cập nhật bài đăng thành công", data: post });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({ message: "Bài đăng không tồn tại" });

    // Chỉ cho phép tác giả xóa
    if (!post.author.equals(req.userId)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa bài đăng này." });
    }

    await Post.findByIdAndDelete(postId);

    if (post.imageUrl) {
      const imagePath = path.join(__dirname, "../", post.imageUrl);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    res.status(200).json({ message: "Xóa bài đăng thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.likeOrUnlikePost = async (req, res) => {
  try {
    const userId = req.userId;
    const post = await Post.findById(req.params.id);

    if (!post)
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });

    const liked = post.likes.includes(userId);

    if (liked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).json({
      message: liked ? "Bỏ thích" : "Đã thích",
      likes: post.likes,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
exports.likePost = async (req, res) => {
  try {
    const userId = req.userId;
    const post = await Post.findById(req.params.id);

    if (!post)
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    if (post.likes.includes(userId)) {
      return res.status(400).json({ message: "Bạn đã thích bài đăng này rồi" });
    }

    post.likes.push(userId);
    await post.save();
    res.status(200).json({
      message: "Đã thích",
      likes: post.likes,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
exports.unlikePost = async (req, res) => {
  try {
    const userId = req.userId;
    const post = await Post.findById(req.params.id);

    if (!post)
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    if (!post.likes.includes(userId)) {
      return res.status(400).json({ message: "Bạn chưa thích bài đăng này" });
    }

    post.likes.pull(userId);
    await post.save();
    res.status(200).json({
      message: "Bỏ thích",
      likes: post.likes,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.checkIfLiked = async (req, res) => {
  try {
    const userId = req.userId;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }

    const liked = post.likes.includes(userId);
    res.status(200).json({ liked });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
exports.addComment = async (req, res) => {
  try {
    const userId = req.userId;
    const { content } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });

    const userType = req.userRole === "employer" ? "User" : "Candidate";

    post.comments.push({ user: userId, userType, content });
    await post.save();

    // Populate comment author info
    const updatedPost = await Post.findById(post._id).populate({
      path: "comments.user",
      // refPath sẽ tự động lấy theo userType
    });

    res.status(201).json({
      message: "Đã bình luận",
      comments: updatedPost.comments,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
exports.checkCanEditPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ canEdit: false, message: "Bài đăng không tồn tại" });
    }

    const isAuthor = post.author.equals(userId);

    if (!isAuthor) {
      return res.status(403).json({
        canEdit: false,
        message: "Bạn không có quyền chỉnh sửa bài đăng này.",
      });
    }

    res
      .status(200)
      .json({ canEdit: true, message: "Bạn có quyền chỉnh sửa bài đăng này." });
  } catch (error) {
    res
      .status(500)
      .json({ canEdit: false, message: "Lỗi server", error: error.message });
  }
};
exports.checkCanDeleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ canDelete: false });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ canDelete: false });

    const canDelete = comment.user.equals(userId);
    res.status(200).json({ canDelete });
  } catch (error) {
    res.status(500).json({ canDelete: false, error: error.message });
  }
};
exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Chỉ cho phép xóa nếu là tác giả bình luận hoặc tác giả bài đăng
    if (
      comment.user.toString() !== userId &&
      post.author.toString() !== userId
    ) {
      return res.status(403).json({ message: "Không có quyền xóa bình luận" });
    }

    // Xóa bình luận bằng cách loại bỏ khỏi mảng
    comment.deleteOne(); // hoặc comment.remove() nếu là Mongoose document

    await post.save();

    // Trả về danh sách comments mới
    const updatedPost = await Post.findById(postId).populate({
      path: "comments.user",
      select: "fullName companyName avatarUrl",
    });

    res.status(200).json({ comments: updatedPost.comments });
  } catch (err) {
    console.error("Lỗi xóa bình luận:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
exports.checkCanEditComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;

    // Tìm bài đăng theo ID
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ canEdit: false, message: "Bài đăng không tồn tại" });
    }

    // Tìm bình luận theo ID
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ canEdit: false, message: "Bình luận không tồn tại" });
    }

    // Kiểm tra quyền chỉnh sửa: Người dùng có quyền chỉnh sửa nếu là tác giả bình luận hoặc tác giả bài đăng
    const canEdit =
      comment.user.toString() === userId || post.author.toString() === userId;

    res.status(200).json({
      canEdit,
      message: canEdit
        ? "Bạn có quyền chỉnh sửa bình luận này."
        : "Bạn không có quyền chỉnh sửa bình luận này.",
    });
  } catch (err) {
    console.error("Lỗi kiểm tra quyền chỉnh sửa bình luận:", err);
    res.status(500).json({ canEdit: false, message: "Lỗi server" });
  }
};
// Chỉnh sửa bình luận
exports.editComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post không tồn tại" });

    const comment = post.comments.id(commentId);
    if (!comment)
      return res.status(404).json({ message: "Bình luận không tồn tại" });

    if (
      comment.user.toString() !== userId &&
      post.author.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền chỉnh sửa bình luận này" });
    }
    comment.content = content || comment.content;
    await post.save();
    const updatedPost = await Post.findById(postId).populate({
      path: "comments.user",
      select: "fullName companyName avatarUrl",
    });

    res.status(200).json({
      message: "Bình luận đã được chỉnh sửa",
      comments: updatedPost.comments,
    });
  } catch (error) {
    console.error("Lỗi chỉnh sửa bình luận:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
