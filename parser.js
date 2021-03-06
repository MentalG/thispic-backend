const fs = require('fs');
const pixel = require('pixel');
const COLORS = require('./src/constants/colors');
const countBy = require('lodash.countby');
const sharp = require('sharp');
const sha256 = require('js-sha256').sha256;

const getImageData = async (path) => {
  const image = fs.readFileSync(path);
  const resizedImage = await sharp(image).resize(1280, 720).toBuffer()
  .then(data => data)
  .catch( err => console.log(err));
  const resizedImageData = await pixel(resizedImage);

  return resizedImageData[0].data;
};

const getColorsNames = (data, pixels) => {
  const keys = Object.keys(COLORS);
  const nameColors = [];
  let i = 0;

  // console.time('pixels map')
  while (i < pixels) {
    const colorRgb = data.slice(i * 8, i * 8 + 3);
    const colorHex = rgbToHex(...colorRgb);
    
    keys.map((nameColor) => {
      COLORS[nameColor].map((item) => {
        if (item === colorHex) {
          nameColors.push(nameColor);
        }
      });
    });

    i = ++i;
  }
  // console.timeEnd('pixels map')

  return nameColors;
};

const rgbToHex = (r, g, b) => {
  return '' + numberToHex(r) + numberToHex(g) + numberToHex(b);
};

const numberToHex = (number) => {
  const hex = roundColor(number).toString(16);
  return hex.length == 1 ? '0' + hex : hex;
};

const roundColor = (color) => {
  return Math.round(color / 51) * 51;
};

const distributeColors = (colors) => {
  const minPixelValue = 0;
  const highColors = Object.keys(colors).filter((item) => colors[item] > minPixelValue);
  const deletedLowColors = dumpColors(colors, highColors);
  const sortedColors = [];
  const distributedColors = {
    dominant: '',
    secondary: [],
  };

  Object.keys(deletedLowColors).map((item) => {
    sortedColors.push({
      name: item,
      color: deletedLowColors[item],
    });
  });

  sortedColors.sort((a, b) => b.color - a.color);
  sortedColors.map((item, index) => {
    if (index === 0) {
      distributedColors.dominant = item.name;
    } else {
      distributedColors.secondary.push(item.name);
    }
  });

  return distributedColors;
};

const dumpColors = (data, highColors) => {
  const result = {};

  highColors.map((item) => {
    result[item] = data[item];
  });

  return result;
};

const getHash256 = async (path) => {
  const data = await getImageData(path);
  const hash = sha256.create();
  hash.update(data);
  
  return hash.hex()
}

const getCountOfColors = async (path) => {
  try {
    const data = await getImageData(path);
    const pixels = data.length / 4;
    const pixelsColors = getColorsNames(data, pixels);
    const result = distributeColors(countBy(pixelsColors));

    return result;
  } catch (error) {
    console.log(error);
  }
};

const getNameOfColor = (color) => {
  let name;

  for (let key in COLORS) {
    COLORS[key].map((item) => {
      if (item === color) {
        name = key;
      }
    });
  }

  return name;
};

const parser = {
  getCountOfColors,
  getNameOfColor,
  getHash256
};

module.exports = parser;
