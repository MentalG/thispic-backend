const fs = require('fs');
const pixel = require('pixel');
const COLORS = require('./src/constants/colors');
const countBy = require('lodash.countby');

const getImageData = async (path) => {
  const image = fs.readFileSync(path);
  const imageData = await pixel(image);

  return imageData[0].data;
};

const getColorsNames = (data, pixels) => {
  const keys = Object.keys(COLORS);
  const nameColors = [];
  let i = 0;
  let j = 0;
  let k = 0;

  while (i < pixels) {
    const colorRgb = data.slice(i * 4, i * 4 + 3);
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
  const highColors = Object.keys(colors).filter((item) => colors[item] > 2000);
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
};

module.exports = parser;
