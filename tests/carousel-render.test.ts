import test from 'node:test';
import assert from 'node:assert/strict';
import { createCarouselResult, DEFAULT_CAROUSEL_DRAFT, snapshotCarouselRequest, updateCarouselSlide } from '../src/lib/carousel/model.ts';
import { renderCarousel, renderCarouselSlide } from '../src/lib/carousel/export.ts';

function canvasFixture() {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const painted: string[] = [];
  const canvases: { width: number; height: number }[] = [];
  const sizes: [number, number][] = [];
  let font = '';
  const context = {
    set font(value: string) { font = value; },
    get font() { return font; },
    fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
    fillText(value: string) { painted.push(value); },
    measureText(value: string) { return { width: value.length * Number(font.match(/(\d+)px/)?.[1] || 20) * .52 }; },
    createLinearGradient() { return { addColorStop() {} }; },
  };
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    fonts: { ready: Promise.resolve() },
    createElement() {
      const canvas = { width: 0, height: 0, getContext: () => context, toBlob(callback: (blob: Blob) => void) { sizes.push([this.width, this.height]); callback(new Blob(['PNG'], { type: 'image/png' })); } };
      canvases.push(canvas);
      return canvas;
    },
  } });
  return { painted, canvases, sizes, restore() { if (previous) Object.defineProperty(globalThis, 'document', previous); else delete globalThis.document; } };
}

const draft = { ...DEFAULT_CAROUSEL_DRAFT, template: 'custom', styleDescription: 'Бежевый минимализм', topic: 'Собственная история', audience: 'Авторы', count: 3 };

test('export paints edited text at requested dimensions and releases canvas buffers', async () => {
  const fixture = canvasFixture();
  try {
    let result = createCarouselResult(snapshotCarouselRequest(draft));
    result = updateCarouselSlide(result, 1, 'title', 'Свой заголовок');
    result = updateCarouselSlide(result, 1, 'body', 'Сохранённый текст');
    const progress = [];
    const blobs = await renderCarousel(result, { onProgress: (current, total) => progress.push([current, total]) });
    assert.equal(blobs.length, 3);
    assert.ok(blobs.every(blob => blob.type === 'image/png'));
    assert.ok(fixture.painted.includes('Свой заголовок'));
    assert.ok(fixture.painted.includes('Сохранённый текст'));
    assert.deepEqual(fixture.sizes, [[1080, 1350], [1080, 1350], [1080, 1350]]);
    assert.ok(fixture.canvases.every(canvas => canvas.width === 0 && canvas.height === 0));
    assert.deepEqual(progress, [[1, 3], [2, 3], [3, 3]]);
  } finally { fixture.restore(); }
});

test('cancelling between slides prevents later canvas work', async () => {
  const fixture = canvasFixture();
  try {
    const controller = new AbortController();
    const result = createCarouselResult(snapshotCarouselRequest(draft));
    await assert.rejects(renderCarousel(result, { signal: controller.signal, onProgress: () => controller.abort() }), { name: 'AbortError' });
    assert.equal(fixture.sizes.length, 1);
  } finally { fixture.restore(); }
});

test('export refuses invalid or overflowing text without silently clipping user copy', async () => {
  const fixture = canvasFixture();
  try {
    const original = createCarouselResult(snapshotCarouselRequest({ ...draft, format: '1:1' }));
    const invalid = updateCarouselSlide(original, 1, 'body', '');
    await assert.rejects(renderCarousel(invalid), /Проверьте параметры/u);
    assert.equal(fixture.canvases.length, 0);
    const overflow = updateCarouselSlide(original, 1, 'body', Array.from({ length: 90 }, () => 'Полная строка').join('\n'));
    await assert.rejects(renderCarousel(overflow), /Текст не помещается/u);
    assert.equal(overflow.slides[1].body.split('\n').length, 90);
    assert.ok(fixture.canvases.every(canvas => canvas.width === 0 && canvas.height === 0));
  } finally { fixture.restore(); }
});

test('a valid selected slide previews while another slide has oversized unfinished copy', async () => {
  const fixture = canvasFixture();
  try {
    const original = createCarouselResult(snapshotCarouselRequest(draft));
    const invalid = updateCarouselSlide(original, 1, 'title', 'С'.repeat(161));
    const cover = await renderCarouselSlide(invalid, 0);
    assert.equal(cover.type, 'image/png');
    assert.equal(fixture.sizes.length, 1);
    await assert.rejects(renderCarouselSlide(invalid, 1), /Проверьте заголовок/u);
    await assert.rejects(renderCarousel(invalid), /Проверьте параметры/u);
    assert.equal(fixture.sizes.length, 1, 'full export rejects unfinished copy before rendering any new canvas');
  } finally { fixture.restore(); }
});
