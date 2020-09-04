const express = require('express');
const Image = require('../models/image');
const multer = require('multer');
const parser = require('../../parser');

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
router.post('/', upload.array('productImage', 10), async (req, res) => {
  req.files.map(async (item, index) => {
      const colors = await parser.getCountOfColors(item.path);
      const image = new Image({
      name: req.body.name,
      dominant: colors.dominant,
      secondary: colors.secondary,
      imageUrl: item.path
    });
  
    try {
      const savedImage = await image.save();
      res.json(savedImage);
    } catch (error) {
      res.json({ message: error });
    }
  })
});

//Get all images
// router.get('/', async (req, res) => {
//   try {
//     const images = await Image.find();
//     res.json(images);
//   } catch (error) {
//     res.json(error);
//   }
// });

//Get specific image
// router.get('/:imageId', async (req, res) => {
//   try {
//     const image = await Image.findById(req.params.imageId);
//     res.json(image);
//   } catch (error) {
//     res.json({ message: error });
//   }
// });

//get image with dominant color
router.get('/', async (req, res) => {
  const { dominant, secondary} = req.query;
  const secondaryArr = ( typeof secondary != 'undefined' && secondary instanceof Array ) ? secondary : [secondary]
  const dominantColorName = parser.getNameOfColor(dominant)
  const secondaryColorsNames = secondaryArr.map((item) => {
    return parser.getNameOfColor(item)
  })

  try {
    if (!!Object.keys(req.query).length) {
      const image = await Image.find({dominant: dominantColorName, secondary: {$in: secondaryColorsNames}});
      return res.json(image);
    } else {
      const image = await Image.find();
      return res.json(image);
    }
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
      { $set: { title: req.body.name } }
    );
    res.json(image);
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;
