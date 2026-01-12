import { extractTailwindClassesFromPandaCss } from './dist/index.js';

console.log('Test 1: textStyle only');
const result1 = extractTailwindClassesFromPandaCss({ textStyle: 'body' });
console.log('Result:', result1);

console.log('\nTest 2: textStyle with other property');
const result2 = extractTailwindClassesFromPandaCss({ textStyle: 'body', display: 'flex' });
console.log('Result:', result2);

console.log('\nTest 3: Just display');
const result3 = extractTailwindClassesFromPandaCss({ display: 'flex' });
console.log('Result:', result3);
