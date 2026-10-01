import { CAROUSEL_FORMATS, carouselFileName, resolveCarouselStyle, validateCarouselSlides, validateCarouselDraft } from './model.ts';
import type { CarouselResult, CarouselReference } from './model.ts';
import { readCarouselReference } from './references.ts';
interface RenderOptions { signal?: AbortSignal; onProgress?: (completed: number, total: number) => void }
interface TextBlock { size: number; lines: string[]; lineHeight: number; font: string; weight: number }
interface TextFitOptions { maxSize: number; minSize: number; width: number; height: number; font: string; weight?: number; leading?: number }
interface ZipFile { name: string; data: Uint8Array<ArrayBuffer> | Blob }
function imageCrop(sourceWidth: number, sourceHeight: number, width: number, height: number) {
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const cropWidth = width / scale, cropHeight = height / scale;
  return { x: (sourceWidth - cropWidth) / 2, y: (sourceHeight - cropHeight) / 2, width: cropWidth, height: cropHeight };
}

const imageCache = new Map<string, Promise<HTMLImageElement>>();
const MAX_CACHED_IMAGES = 4;
function abortIfNeeded(signal?: AbortSignal) { if (signal?.aborted) throw new DOMException('Generation cancelled', 'AbortError'); }

async function loadBackground(src: string | null, reference?: CarouselReference | null): Promise<HTMLImageElement> {
  if (!reference && !src) throw new Error('Изображение стиля недоступно.');
  const key = reference ? `reference:${reference.id}` : src!;
  if (!imageCache.has(key)) {
    const pending = (async () => {
      let url = src || '';
      if (reference) {
        const blob = await readCarouselReference(reference.id);
        if (!blob) throw new Error(`Фото-референс «${reference.name}» недоступно. Прикрепите его заново в настройках карусели.`);
        url = URL.createObjectURL(blob);
      }
      try { return await new Promise<HTMLImageElement>((resolve, reject) => {
      const picture = new Image();
      picture.onload = () => resolve(picture);
      picture.onerror = () => reject(new Error(reference ? `Не удалось прочитать фото «${reference.name}». Прикрепите его заново.` : 'Не удалось загрузить изображение стиля. Попробуйте ещё раз.'));
      picture.src = url;
      }); } finally { if (reference) URL.revokeObjectURL(url); }
    })().catch(error => { if (imageCache.get(key) === pending) imageCache.delete(key); throw error; });
    imageCache.set(key, pending);
    // Cached image elements release their decoded pixels when evicted and garbage-collected.
    while (imageCache.size > MAX_CACHED_IMAGES) imageCache.delete(imageCache.keys().next().value!);
  } else {
    const cached = imageCache.get(key)!;
    imageCache.delete(key); imageCache.set(key, cached);
  }
  return imageCache.get(key)!;
}

function wrapText(context: CanvasRenderingContext2D, text: string, width: number): string[] {
  const result = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(/\s+/u).filter(Boolean)) {
      if (line && context.measureText(`${line} ${word}`).width > width) { result.push(line); line = ''; }
      if (context.measureText(word).width > width) {
        if (line) { result.push(line); line = ''; }
        for (const letter of Array.from(word)) {
          if (line && context.measureText(line + letter).width > width) { result.push(line); line = ''; }
          line += letter;
        }
      } else line += `${line ? ' ' : ''}${word}`;
    }
    result.push(line);
  }
  return result;
}

function fitText(context: CanvasRenderingContext2D, text: string, { maxSize, minSize, width, height, font, weight = 500, leading = 1.25 }: TextFitOptions): TextBlock {
  let size = maxSize;
  let lines: string[] = [];
  while (size >= minSize) {
    context.font = `${weight} ${size}px "${font}", sans-serif`;
    lines = wrapText(context, text, width);
    if (lines.length * size * leading <= height) break;
    size -= 2;
  }
  if (lines.length * Math.max(minSize, size) * leading > height) throw new Error('Текст не помещается на слайд. Сократите его или выберите более высокий формат.');
  return { size: Math.max(minSize, size), lines, lineHeight: Math.max(minSize, size) * leading, font, weight };
}

function paintText(context: CanvasRenderingContext2D, block: TextBlock, x: number, y: number, color: string): number {
  context.fillStyle = color;
  context.textBaseline = 'top';
  context.font = `${block.weight} ${block.size}px "${block.font}", sans-serif`;
  for (const line of block.lines) { context.fillText(line, x, y); y += block.lineHeight; }
  return y;
}

export async function renderCarouselSlide(result: CarouselResult, index: number, { signal }: RenderOptions = {}): Promise<Blob> {
  abortIfNeeded(signal);
  if (Object.keys(validateCarouselDraft(result.request)).length || result.slides.length !== result.request.count) throw new Error('Проверьте параметры и текст слайдов перед сохранением.');
  const style = resolveCarouselStyle(result.request);
  const format = CAROUSEL_FORMATS.find(item => item.value === result.request.format);
  const slide = result.slides[index];
  if (!style || !format || !slide) throw new Error('Не удалось прочитать параметры слайда.');
  if (Object.keys(validateCarouselSlides([slide])).length) throw new Error('Проверьте заголовок и текст этого слайда перед сохранением.');
  await document.fonts.ready;
  const references = style.id === 'custom' ? result.request.references || [] : [];
  const reference = references.length ? references[(index + (result.request.revision || 0)) % references.length] : null;
  const picture = reference || style.image ? await loadBackground(style.image, reference) : null;
  abortIfNeeded(signal);
  const canvas = document.createElement('canvas');
  const { width, height } = format;
  canvas.width = width; canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) { canvas.width = 0; canvas.height = 0; throw new Error('Ваш браузер не поддерживает экспорт изображений.'); }
  try {
  context.fillStyle = style.background;
  context.fillRect(0, 0, width, height);
  if (picture) {
    const crop = imageCrop(picture.naturalWidth, picture.naturalHeight, width, height);
    context.save();
    if (style.id !== 'custom' && result.request.revision % 2) { context.translate(width, 0); context.scale(-1, 1); }
    context.drawImage(picture, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);
    context.restore();
  }
  const dark = style.dark;
  const cover = slide.kind === 'cover';
  const shade = context.createLinearGradient(0, 0, 0, height);
  if (style.id === 'custom') {
    shade.addColorStop(0, `${style.background}f5`);
    shade.addColorStop(.55, `${style.background}${cover ? 'd9' : 'ed'}`);
    shade.addColorStop(1, `${style.background}${cover && picture ? '99' : 'e8'}`);
  } else if (dark) {
    const tint = style.id === 'botanical' ? '#092117' : style.background;
    shade.addColorStop(0, `${tint}${cover ? '70' : 'da'}`);
    shade.addColorStop(.55, `${tint}${cover ? '30' : 'eb'}`);
    shade.addColorStop(1, `${tint}${cover ? '40' : 'bd'}`);
  } else {
    const tint = style.background;
    shade.addColorStop(0, `${tint}${cover ? '18' : 'ed'}`);
    shade.addColorStop(.45, `${tint}${cover ? '18' : 'f0'}`);
    shade.addColorStop(1, `${tint}${cover ? '20' : 'eb'}`);
  }
  context.fillStyle = shade;
  context.fillRect(0, 0, width, height);
  const pad = 78;
  const available = width - pad * 2;
  const kicker = fitText(context, slide.kicker.toLocaleUpperCase('ru').slice(0, 160), { maxSize: 20, minSize: 16, width: available - 100, height: 52, font: 'Geist Variable', weight: 600, leading: 1.4 });
  paintText(context, kicker, pad, pad, style.ink);
  context.strokeStyle = `${style.ink}40`;
  context.lineWidth = 1.5;
  context.beginPath(); context.moveTo(pad, pad + 83); context.lineTo(width - pad, pad + 83); context.stroke();

  const titleTop = cover ? Math.round(height * (result.request.revision % 2 ? .26 : .23)) : Math.round(Math.min(height * .235, 330));
  const titleHeight = cover ? height * .31 : Math.min(height * .26, 345);
  const title = fitText(context, slide.title, { maxSize: cover ? 108 : 73, minSize: cover ? 52 : 40, width: available, height: titleHeight, font: style.font, weight: style.font === 'Georgia' ? 400 : 750, leading: 1.1 });
  const bodyTop = paintText(context, title, pad, titleTop, style.ink) + 38;
  if (slide.body) {
    const body = fitText(context, slide.body, { maxSize: 36, minSize: 18, width: available, height: height - bodyTop - 145, font: 'Geist Variable', weight: 500, leading: 1.44 });
    paintText(context, body, pad, bodyTop, style.ink);
  }

  context.fillStyle = style.ink;
  context.font = '600 21px "Geist Variable", sans-serif';
  context.textBaseline = 'middle';
  context.fillText(`${String(index + 1).padStart(2, '0')} / ${String(result.slides.length).padStart(2, '0')}`, pad, height - 78);
  if (index < result.slides.length - 1) {
    context.strokeStyle = style.ink;
    context.lineWidth = 2.5;
    context.beginPath(); context.moveTo(width - 125, height - 78); context.lineTo(width - pad, height - 78); context.lineTo(width - pad - 12, height - 90); context.moveTo(width - pad, height - 78); context.lineTo(width - pad - 12, height - 66); context.stroke();
  } else {
    context.textAlign = 'right'; context.fillText('Сохраните идею', width - pad, height - 78);
  }
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
  abortIfNeeded(signal);
  if (!blob) throw new Error('Не удалось сохранить изображение. Попробуйте ещё раз.');
  return blob;
  } finally { canvas.width = 0; canvas.height = 0; }
}

export async function renderCarousel(result: CarouselResult, options: RenderOptions = {}): Promise<Blob[]> {
  abortIfNeeded(options.signal);
  if (Object.keys(validateCarouselDraft(result.request)).length || Object.keys(validateCarouselSlides(result.slides)).length || result.slides.length !== result.request.count) throw new Error('Проверьте параметры и текст слайдов перед сохранением.');
  const slides = [];
  // Sequential work keeps canvas memory bounded on phones and lets cancellation interrupt between slides.
  for (let index = 0; index < result.slides.length; index += 1) {
    abortIfNeeded(options.signal);
    slides.push(await renderCarouselSlide(result, index, options));
    options.onProgress?.(index + 1, result.slides.length);
  }
  return slides;
}

const crcTable = Uint32Array.from({ length: 256 }, (_, value) => {
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});
export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/** ZIP method 0: PNG is already compressed. UTF-8 names work without an extra dependency. */
export async function createCarouselZip(files: ZipFile[]): Promise<Blob> {
  const encoder = new TextEncoder();
  const localParts = [], directoryParts = [];
  let offset = 0, directorySize = 0;
  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = file.data instanceof Uint8Array ? file.data : new Uint8Array(await file.data.arrayBuffer());
    const crc = crc32(data);
    const header = new Uint8Array(30 + name.length);
    const view = new DataView(header.buffer);
    view.setUint32(0, 0x04034b50, true); view.setUint16(4, 20, true); view.setUint16(6, 0x0800, true);
    view.setUint16(12, 33, true); // 1980-01-01, a valid deterministic ZIP timestamp.
    view.setUint32(14, crc, true); view.setUint32(18, data.length, true); view.setUint32(22, data.length, true); view.setUint16(26, name.length, true);
    header.set(name, 30); localParts.push(header, data);
    const central = new Uint8Array(46 + name.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true); cv.setUint16(14, 33, true);
    cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true); cv.setUint16(28, name.length, true); cv.setUint32(42, offset, true);
    central.set(name, 46); directoryParts.push(central); directorySize += central.length; offset += header.length + data.length;
  }
  const end = new Uint8Array(22), endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true); endView.setUint16(8, files.length, true); endView.setUint16(10, files.length, true); endView.setUint32(12, directorySize, true); endView.setUint32(16, offset, true);
  return new Blob([...localParts, ...directoryParts, end], { type: 'application/zip' });
}

export function saveCarouselBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; anchor.style.display = 'none';
  document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export async function downloadCarousel(result: CarouselResult, blobs: Blob[]): Promise<void> {
  if (blobs.length !== result.slides.length) throw new Error('Дождитесь подготовки всех слайдов.');
  const archive = await createCarouselZip(blobs.map((data, index) => ({ name: carouselFileName(result, index), data })));
  saveCarouselBlob(archive, `${carouselFileName(result, 0).replace(/-01\.png$/u, '')}.zip`);
}
