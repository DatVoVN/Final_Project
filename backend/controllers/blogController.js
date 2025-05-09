const Blog = require("../models/Blog");
const slugify = require("slugify"); // Cần cài thư viện này: npm install slugify

// Thêm blog
const fs = require("fs");
const path = require("path");
const axios = require("axios");

exports.createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, imageUrl } = req.body;
    const slug = slugify(title, { lower: true, strict: true });

    const existing = await Blog.findOne({ slug });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Blog với tiêu đề này đã tồn tại." });
    }

    let savedImagePath = "";

    // Nếu có imageUrl, thì tải ảnh về server
    if (imageUrl) {
      const imageExt = path.extname(imageUrl).split("?")[0];
      const imageName = `${slug}-${Date.now()}${imageExt}`;
      const imagePath = path.join(__dirname, "../uploads", imageName);

      const response = await axios({
        url: imageUrl,
        method: "GET",
        responseType: "stream",
      });

      const writer = fs.createWriteStream(imagePath);
      response.data.pipe(writer);

      // Đợi file được ghi xong
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      savedImagePath = `/uploads/${imageName}`;
    }

    const blog = new Blog({
      title,
      content,
      excerpt,
      imageUrl: savedImagePath, // Lưu đường dẫn ảnh local
      slug,
    });

    await blog.save();

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
    const { title, content, excerpt, imageUrl } = req.body;

    const slug = slugify(title, { lower: true, strict: true });

    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { title, content, excerpt, imageUrl, slug },
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

    const total = await Blog.countDocuments();
    const blogs = await Blog.find()
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
    const blogId = req.params.id; // Lấy ID từ params

    // Tìm blog theo ID
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
