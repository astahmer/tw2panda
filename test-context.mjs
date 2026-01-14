import { createPandaContext } from './packages/panda2tw/src/panda-context.ts';

const ctx = createPandaContext();
console.log('Context keys:', Object.keys(ctx).slice(0, 20));
console.log('\nHas utility:', !!ctx.utility);
console.log('Has conditions:', !!ctx.conditions);
console.log('Has config:', !!ctx.config);

if (ctx.utility) {
  console.log('\nUtility class has:', Object.keys(ctx.utility).slice(0, 10));
}
