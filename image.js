const fs = require('fs');
const pixel = require('pixel');
const COLORS = require('./src/constants/colors');
const countBy = require('lodash.countby');

const getImageData = async () => {
    const image = fs.readFileSync('./src/materials/test.jpg');
    const imageData = await pixel(image);

    return imageData[0].data
}

const getPixelColors = (data, pixels) => {
  const sortedColors = [];

  for (let i = 0; i < pixels; i++) {
    let result = data.slice(i * 4, i * 4 + 3);
    sortedColors.push(result);
  }

  return sortedColors;
}

const getClosestColor = (pixelsColors) => {
  const closestColors = [];

  pixelsColors.map((color) => {
    const result = rgbToHex(...color)
    for (let key in COLORS) {
      COLORS[key].map((item) => {
        if(item === result) return closestColors.push(key)
      })
    }
  });

  return closestColors;
}

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

const getCountOfColors = async () => {
  try {
    const data = await getImageData();
    const pixels = data.length / 4;
    const pixelsColors = getPixelColors(data, pixels);
    const closestColors = getClosestColor(pixelsColors);

    return countBy(closestColors);
  } catch (error) {
    console.log(error);
  }
}