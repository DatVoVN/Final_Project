const express = require("express");
const postController = require("../controllers/postController");
const protectUser = require("../middleware/protectUser");
const upload = require("../middleware/uploadPost");
const router = express.Router();

// Tạo bài đăng (có thể có ảnh)
router.post(
  "/",
  upload.single("image"),
  protectUser,
  postController.createPost
);

// Lấy tất cả bài đăng
router.get("/", postController.getAllPosts);

// Lấy bài đăng theo ID
router.get("/:id", protectUser, postController.getPostById);

// Cập nhật bài đăng
router.put(
  "/:id",
  upload.single("image"),
  protectUser,
  postController.updatePost
);

// Xóa bài đăng
router.delete("/:id", protectUser, postController.deletePost);

// Like hoặc Unlike bài đăng
router.patch("/:id/like", protectUser, postController.likeOrUnlikePost);

// Thêm bình luận vào bài đăng
router.post("/:id/comment", protectUser, postController.addComment);
/// Kiem tra xem có được chỉnh sửa hay không
router.get("/:id/can-edit", protectUser, postController.checkCanEditPost);
// Xóa bình luận
router.delete(
  "/:postId/comment/:commentId",
  protectUser,
  postController.deleteComment
);
// Kiểm tra quyền xóa bình luận
router.get(
  "/:postId/comment/:commentId/can-delete",
  protectUser,
  postController.checkCanDeleteComment
);
// Kiem tra quyền chỉnh sửa bình luận
router.get(
  "/:postId/comment/:commentId/can-edit",
  protectUser,
  postController.checkCanEditComment
);
// Chỉnh sửa bình luận
router.put(
  "/:postId/comment/:commentId",
  protectUser,
  postController.editComment
);
// Kiểm tra đã thích bài đăng chưa
router.get("/:id/check-like", protectUser, postController.checkIfLiked);

// Like hoặc Unlike bài đăng
router.post("/:id/like", protectUser, postController.likePost);
router.post("/:id/unlike", protectUser, postController.unlikePost);
module.exports = router;
