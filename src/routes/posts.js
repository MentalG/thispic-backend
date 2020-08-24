const express = require('express');
const Post = require('../models/post');
const multer = require('multer');

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`)
  }
})
const limits = {
  fileSize: 1024 * 1024 * 5
}
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true)
  } else {
    cb(null, false)
  }
} 
const upload = multer({
  storage,
  limits,
  fileFilter
})

//Get create post
router.post('/', upload.single('productImage'), async (req, res) => {
    const post = new Post({
    title: req.body.title,
    description: req.body.description,
    postImage: req.file.path
  });

  try {
    const savedPost = await post.save();
    res.json(savedPost);
  } catch (error) {
    res.json({ message: error });
  }
});

//Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.json(error);
  }
});

//Get specific post
router.get('/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    res.json(post);
  } catch (error) {
    res.json({ message: error });
  }
});

//Delete post
router.delete('/:postId', async (req, res) => {
  try {
    const post = await Post.remove({ _id: req.params.postId });
    res.json(post);
  } catch (error) {
    res.json({ message: error });
  }
});

//Update post
router.patch('/:postId', async (req, res) => {
  try {
    const post = await Post.updateOne(
      { _id: req.params.postId },
      { $set: { title: req.body.title } }
    );
    res.json(post);
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;
