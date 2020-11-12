const express = require('express');
const Image = require('../models/image');
const multer = require('multer');
const parser = require('../../parser');
const jwt = require('jsonwebtoken');
const verifyToken = require('../verify')
const secretKey = process.env.SECRET_KEY

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
const limits = { fileSize: 1024 * 1024 * 5 }
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true)
  } else {
    cb(null, false)
  }
} 
const upload = multer({ storage, limits, fileFilter })

//Post create image
router.post('/add', verifyToken, upload.array('productImage', 10), async (req, res) => {
    try {
          const token = req.headers.authorization.split('"').join('');
          const user = jwt.verify(token, secretKey)
          
          const imagesPromise = req.files.map(async (item) => {
          const colors = await parser.getCountOfColors(item.path);
          const hash = await parser.getHash256(item.path);
          const isUnique = !(await Image.find({hash: hash })).length;
  
          if (!isUnique) throw new Error('Image like this is already exist')
  
          const image = new Image({
            name: req.body.name,
            dominant: colors.dominant,
            secondary: colors.secondary,
            imageUrl: item.path,
            addedBy: user.email,
            hash: hash
          });

          return image
        })

        const images = await Promise.all(imagesPromise)
        const savedImages = await Image.insertMany(images);

        res.send({message: {primary: 'Upload Successfully', secondary: `${savedImages[0].name} was successfully uploaded`}, type: 'success'})

        } catch (error) {
        res.send({message: {primary: `Upload failed`, secondary: error.toString()}, type: 'error'});
    }
});

//GET download image by hash 
router.get('/:imageHash', async (req, res) => {
  try {
    const image = (await Image.find({hash: req.params.imageHash}))[0]

    res.download(image.imageUrl)
  } catch (error) {
    res.json({message: error})
  }
});

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