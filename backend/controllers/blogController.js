const Blog = require("../models/Blog");
const slugify = require("slugify");

// Thêm blog
const fs = require("fs");
const path = require("path");
const axios = require("axios");

exports.createBlog = async (req, res) => {
  try {
    const { title, content, excerpt } = req.body;
    const slug = slugify(title, { lower: true, strict: true });
    const existing = await Blog.findOne({ slug });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Blog với tiêu đề này đã tồn tại." });
    }
    let savedImagePath = "";
    if (req.file) {
      savedImagePath = `/uploads/blogs/${req.file.filename}`;
    } else {
      return res.status(400).json({ message: "Ảnh là bắt buộc." });
    }

    // Tạo mới blog
    const blog = new Blog({
      title,
      content,
      excerpt,
      imageUrl: savedImagePath,
      slug,
    });

    await blog.save(); // Lưu blog vào database

    res.status(201).json({ message: "Tạo blog thành công", data: blog });
  } catch (error) {
    console.error("Lỗi khi tạo blog:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Chỉnh sửa blog
exports.updateBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const { title, content, excerpt, slug } = req.body;
    const file = req.file;

    console.log("ID:", blogId);
    console.log("Body:", req.body);
    console.log("File:", file);

    if (!title || !content || !excerpt) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const slugified = slug || slugify(title, { lower: true, strict: true });

    const existingBlog = await Blog.findById(blogId);
    if (!existingBlog) {
      return res.status(404).json({ message: "Không tìm thấy blog" });
    }

    let updatedImageUrl = existingBlog.imageUrl;

    if (file) {
      const oldImagePath = path.join(
        __dirname,
        "../",
        existingBlog.imageUrl || ""
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      updatedImageUrl = `/uploads/blogs/${file.filename}`;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        title,
        content,
        excerpt,
        slug: slugified,
        imageUrl: updatedImageUrl,
      },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Cập nhật blog thành công", data: updatedBlog });
  } catch (error) {
    console.error("Lỗi khi cập nhật blog:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Xóa blog
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

// Lấy tất cả blog
exports.getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      blogs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: "Không tìm thấy blog" });
    }

    res.status(200).json({ data: blog });
  } catch (error) {
    console.error("Lỗi khi lấy blog:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
// Lấy top 3 blog
exports.getTopBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).limit(3);

    res.status(200).json({ blogs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
