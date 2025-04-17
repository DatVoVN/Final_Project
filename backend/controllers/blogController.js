const Blog = require("../models/Blog");

exports.createBlog = async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;

    const blog = new Blog({ title, content, imageUrl });
    await blog.save();

    res.status(201).json({ message: "Tạo blog thành công", data: blog });
  } catch (error) {
    console.error("Lỗi khi tạo blog:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// 🟡 Chỉnh sửa blog
exports.updateBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const { title, content, imageUrl } = req.body;

    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { title, content, imageUrl },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ message: "Không tìm thấy blog" });
    }

    res.status(200).json({ message: "Cập nhật blog thành công", data: blog });
  } catch (error) {
    console.error("Lỗi khi cập nhật blog:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
// 🔴 Xóa blog
exports.deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    const blog = await Blog.findByIdAndDelete(blogId);

    if (!blog) {
      return res.status(404).json({ message: "Không tìm thấy blog" });
    }

    res.status(200).json({ message: "Xóa blog thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa blog:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }); // sắp xếp mới nhất trước
    res.status(200).json({ blogs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
