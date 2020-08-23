const express = require('express');
const Post = require('../models/post');
const multer = require('multer');
const upload = multer({dest: 'uploads/'})

const router = express.Router();

//Get create post
router.post('/', upload.single('productImage'), async (req, res) => {
  console.log(req.file);
    const post = new Post({
    title: req.body.title,
    description: req.body.description,
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
