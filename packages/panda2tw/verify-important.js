const { extractTailwindClassesFromPandaCss } = require('./dist/index.cjs');

const cssObj = {
  '& div.activityRoomEventContainer': {
    paddingY: '0 !important',
  }
};

const result = extractTailwindClassesFromPandaCss(cssObj);
console.log('Input: & div.activityRoomEventContainer with paddingY: "0 !important"');
console.log('Output:', result);
console.log('Expected: [&_div.activityRoomEventContainer]:!py-0');
console.log('Match:', result[0] === '[&_div.activityRoomEventContainer]:!py-0');
