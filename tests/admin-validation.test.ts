import assert from 'node:assert/strict';
import { test } from 'node:test';
import { comboFormSchema } from '../src/schemas/combo.schema.ts';
import { productSchema } from '../src/schemas/product.schema.ts';
const item = { product_id: '33333333-3333-4333-8333-333333333333', quantity: 2 };
const combo = { name: ' Combo solar ', description: '', features: ['Ahorro'], is_active: false, items: [item] };
test('combos reject missing products, duplicate products and invalid quantities', () => {
 assert.equal(comboFormSchema.parse(combo).name, 'Combo solar');
 for (const items of [[], [item,item], [{...item,quantity:0}], [{...item,quantity:1.5}], [{...item,quantity:NaN}], [{...item,product_id:'prod-demo'}]]) {
  assert.equal(comboFormSchema.safeParse({...combo,items}).success,false);
 }
});
test('product images must survive a page reload', () => {
 const images = productSchema.shape.images;
 assert.equal(images.safeParse(['blob:http://localhost/temp']).success,false);
 assert.equal(images.safeParse(['https://example.com/panel.jpg']).success,true);
 assert.equal(images.safeParse([]).success,true);
});
