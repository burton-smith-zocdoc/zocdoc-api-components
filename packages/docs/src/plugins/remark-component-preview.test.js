import assert from 'node:assert/strict';
import test from 'node:test';
import { remarkComponentPreview } from './remark-component-preview.js';

test('converts preview fences to a CodeBubble without rendering duplicate raw HTML', () => {
  const tree = {
    type: 'root',
    children: [
      {
        type: 'code',
        lang: 'html',
        meta: 'preview',
        value: '<zd-availability-grid days="7"></zd-availability-grid>',
      },
    ],
  };

  remarkComponentPreview()(tree);

  assert.deepEqual(tree.children[0], {
    type: 'mdxJsxFlowElement',
    name: 'ComponentPreview',
    attributes: [
      {
        type: 'mdxJsxAttribute',
        name: 'code',
        value: '<zd-availability-grid days="7"></zd-availability-grid>',
      },
      { type: 'mdxJsxAttribute', name: 'lang', value: 'html' },
    ],
    children: [],
  });
});

test('leaves ordinary code fences unchanged', () => {
  const fence = { type: 'code', lang: 'html', meta: null, value: '<div>example</div>' };
  const tree = { type: 'root', children: [fence] };

  remarkComponentPreview()(tree);

  assert.equal(tree.children[0], fence);
});
