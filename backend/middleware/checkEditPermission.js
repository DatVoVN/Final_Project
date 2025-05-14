const Post = require("../models/Post");

const checkEditPermission = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Bài đăng không tồn tại" });
    }

    // Kiểm tra xem người dùng có phải là tác giả của bài đăng không
    if (!post.author.equals(req.userId)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền chỉnh sửa bài đăng này." });
    }

    // Nếu có quyền chỉnh sửa, tiếp tục vào xử lý tiếp theo
    next();
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
module.exports = checkEditPermission;
