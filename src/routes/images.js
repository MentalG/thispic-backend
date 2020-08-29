const express = require('express');
const Image = require('../models/image');
const multer = require('multer');
const getCountOfColors = require('../../parser');

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/')
  },
  filename: (req, file, cb) => {
    const date = new Date().toISOString().split(':').join('-');
    const name = date + file.originalname;
    cb(null, name)
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

//Get create image
router.post('/', upload.single('productImage'), async (req, res) => {
  console.log(req.file.path);
    console.log(await getCountOfColors(req.file.path));
    const image = new Image({
    title: req.body.title,
    description: req.body.description,
    postImage: req.file.path
  });

  try {
    const savedImage = await image.save();
    res.json(savedImage);
  } catch (error) {
    res.json({ message: error });
  }
});

//Get all images
router.get('/', async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (error) {
    res.json(error);
  }
});

//Get specific image
router.get('/:imageId', async (req, res) => {
  try {
    const image = await Image.findById(req.params.imageId);
    res.json(image);
  } catch (error) {
    res.json({ message: error });
  }
});

//Delete image
router.delete('/:imageId', async (req, res) => {
  try {
    const image = await Image.remove({ _id: req.params.imageId });
    res.json(image);
  } catch (error) {
    res.json({ message: error });
  }
});

//Update image
router.patch('/:imageId', async (req, res) => {
  try {
    const image = await Image.updateOne(
      { _id: req.params.imageId },
      { $set: { title: req.body.title } }
    );
    res.json(image);
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;
