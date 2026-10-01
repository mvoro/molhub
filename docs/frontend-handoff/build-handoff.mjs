import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Documentation only: no application changes, networking or deployment.
const dir = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(dir, '../..')
const sha = data => createHash('sha256').update(data).digest('hex')
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const slug = s => String(s).toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-')
const git = (...args) => execFileSync('git', args, {cwd: root, encoding: 'utf8'}).trim()
const exists = async p => { try { await fs.access(p); return true } catch { return false } }
const priorManifest = await exists(path.join(dir, 'source-manifest.json')) ? JSON.parse(await fs.readFile(path.join(dir, 'source-manifest.json'),'utf8')) : null
let commit = priorManifest?.sourceCommit ?? 'not-recorded'
let sourceStatus = 'source snapshot without Git metadata'
try {
  commit = git('rev-parse', 'HEAD')
  sourceStatus = git('status', '--short', '--', 'src', 'public', 'tests', 'package.json', 'package-lock.json', 'CLAUDE.md', 'AGENTS.md', '.storybook', 'vite.config.ts') || 'clean'
} catch { /* Portable handoff ZIP intentionally excludes .git. */ }

async function filesIn(base) {
  const files = []
  for (const entry of await fs.readdir(base, {withFileTypes:true})) {
    if (entry.name === '.DS_Store') continue
    const absolute = path.join(base, entry.name)
    if (entry.isDirectory()) files.push(...await filesIn(absolute))
    else if (entry.isFile()) files.push(absolute)
  }
  return files.sort()
}

const publicFiles = await filesIn(path.join(root, 'public'))
const rows = ['path,bytes,sha256,kind,width,height']
for (const file of publicFiles) {
  const data = await fs.readFile(file)
  const png = data.length > 24 && data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
  const rel = path.relative(root, file).replaceAll(path.sep, '/')
  rows.push([rel, data.length, sha(data), path.extname(file).slice(1), png ? data.readUInt32BE(16) : '', png ? data.readUInt32BE(20) : ''].map(v=>'"'+String(v).replaceAll('"','""')+'"').join(','))
}
await fs.writeFile(path.join(dir, 'assets-manifest.csv'), rows.join('\n')+'\n')

const sourceFiles = []
for (const folder of ['src','tests','.storybook']) sourceFiles.push(...await filesIn(path.join(root, folder)))
for (const file of ['package.json','package-lock.json','CLAUDE.md','AGENTS.md','components.json','vite.config.ts','tsconfig.json','tsconfig.app.json','tsconfig.node.json','index.html']) sourceFiles.push(path.join(root,file))
const sourceRecords = []
for (const file of sourceFiles.sort()) {
  const data = await fs.readFile(file)
  sourceRecords.push({path:path.relative(root,file).replaceAll(path.sep,'/'), bytes:data.length, sha256:sha(data)})
}
const pkg = JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'))
const lock = JSON.parse(await fs.readFile(path.join(root,'package-lock.json'),'utf8'))
const dependencies = Object.entries({...pkg.dependencies,...pkg.devDependencies}).sort(([a],[b])=>a.localeCompare(b)).map(([name, declared])=>({name,declared,locked:lock.packages?.['node_modules/'+name]?.version??null,kind:pkg.devDependencies?.[name]?'dev':'runtime'}))
await fs.writeFile(path.join(dir,'source-manifest.json'),JSON.stringify({format:'ai-hub-handoff-source-v1',sourceCommit:commit,generatedAt:new Date().toISOString(),sourceStatus,publicContentFileCount:publicFiles.length,publicManifest:'assets-manifest.csv',dependencies,files:sourceRecords},null,2)+'\n')

const css = await fs.readFile(path.join(root,'src/index.css'),'utf8')
const stripped = css.replace(/\/\*[\s\S]*?\*\//g,'')
const declarations = selector => {
  const pattern = new RegExp('^'+selector+'\\s*\\{([\\s\\S]*?)^\\}', 'gm')
  const values = {}
  for (const block of stripped.matchAll(pattern)) for (const declaration of block[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) values[declaration[1]]=declaration[2].trim()
  return values
}
const light = declarations(':root'), dark = declarations('\\.dark'), theme = declarations('@theme inline')
if (Object.keys(light).length<50 || Object.keys(dark).length<30) throw Error('Token extraction found fewer declarations than expected; inspect CSS before regenerating.')
await fs.writeFile(path.join(dir,'design-tokens.json'),JSON.stringify({format:'ai-hub-css-custom-properties-v1',source:'src/index.css',sourceCommit:commit,sourceSha256:sha(css),scope:'Top-level :root, .dark overrides, @theme inline. CSS expressions are preserved verbatim; darkEffective merges declarations without resolving var(), calc(), color-mix(). Component-scoped CSS variables are excluded.',root:light,darkOverrides:dark,darkEffective:{...light,...dark},themeInline:theme},null,2)+'\n')

await fs.mkdir(path.join(dir,'references/icons'),{recursive:true})
for (const name of ['photo','video','text-primary','audio','carousel','trends']) await fs.copyFile(path.join(root,`public/icons/${name}.png`),path.join(dir,`references/icons/${name}.png`))
await fs.mkdir(path.join(dir,'references/illustrations'),{recursive:true})
await fs.copyFile(path.join(root,'public/illustrations/file-drop-fan.png'),path.join(dir,'references/illustrations/file-drop-fan.png'))

const chapters = ['README.md',...(await fs.readdir(dir)).filter(n=>/^\d\d-.*\.md$/.test(n)).sort()]
const chapterIds = new Map(chapters.map(file=>[file,file==='README.md'?'start':file.replace(/\.md$/,'')]))
const search = []
const nav = []
const sections = []
let broken = []
for (const file of chapters) {
  const source = await fs.readFile(path.join(dir,file),'utf8')
  const id = chapterIds.get(file)
  const title = source.match(/^# (.+)$/m)?.[1] ?? file
  nav.push(`<a href="#${id}">${escape(title)}</a>`)
  const headingCounts = new Map()
  const heading = level => ({children}) => {
    const label = React.Children.toArray(children).map(x=>typeof x==='string'?x:x?.props?.children??'').join('')
    const base = level===1?id:id+'--'+slug(label)
    const count=headingCounts.get(base)??0; headingCounts.set(base,count+1)
    const hid=count?base+'-'+count:base
    search.push({label:String(label),id:hid,chapter:title})
    return React.createElement('h'+level,{id:hid},children)
  }
  const components={h1:heading(1),h2:heading(2),h3:heading(3),h4:heading(4),
    a:({href,children})=>{
      let url=href??''
      const [target,anchor]=url.split('#')
      if(chapterIds.has(target)) url='#'+chapterIds.get(target)+(anchor?'--'+anchor:'')
      return React.createElement('a',{href:url},children)
    },
    img:({src,alt})=>React.createElement('img',{src,alt:alt??'',loading:'lazy',decoding:'async'}),
    table:({children})=>React.createElement('div',{className:'table-scroll'},React.createElement('table',{},children)),
  }
  sections.push(`<article data-chapter="${id}"><a class="source-link" href="${file}">Markdown ↗</a>${renderToStaticMarkup(React.createElement(Markdown,{remarkPlugins:[remarkGfm],components},source))}</article>`)
  // Validate file links in Markdown (ignore code fences, external URLs and pure anchors).
  const prose=source.replace(/```[\s\S]*?```/g,'')
  for(const match of prose.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)){
    const target=match[1].split('#')[0].replace(/^<|>$/g,'')
    if(!target || /^[a-z]+:/i.test(target)) continue
    const resolved=path.resolve(dir,decodeURIComponent(target))
    if(!await exists(resolved) && path.basename(resolved)!=='index.html') broken.push({file,target})
  }
}
if(broken.length) throw Error('Broken documentation links: '+JSON.stringify(broken))

const html=`<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>AI Hub — frontend handoff</title>
<style>
:root{--ink:#202025;--muted:#666671;--line:#e5e5eb;--accent:#6b37d7;--wash:#f7f6fa;--paper:#fff}*{box-sizing:border-box}html{scroll-behavior:auto;scroll-padding-top:24px}body{margin:0;color:var(--ink);background:var(--paper);font:15px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:var(--accent);text-underline-offset:3px}a:hover{text-decoration-thickness:2px}.skip{position:fixed;top:-100px;left:12px;z-index:5;background:white;padding:12px}.skip:focus{top:10px}.sidebar{position:fixed;inset:0 auto 0 0;width:284px;padding:30px 23px;background:var(--wash);border-right:1px solid var(--line);overflow:auto}.brand{font-size:24px;letter-spacing:-1px;font-weight:750}.eyebrow{font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:var(--accent);font-weight:700}.meta{color:var(--muted);font-size:12px;margin:5px 0 24px}.sidebar nav{display:grid;gap:4px}.sidebar nav a{padding:8px 10px;border-radius:8px;text-decoration:none;color:var(--ink);font-size:13px;line-height:1.45}.sidebar nav a:hover{background:#ebe5f6;color:var(--accent)}.search-label{display:block;font-size:12px;color:var(--muted);margin-bottom:5px}#search{width:100%;font:inherit;font-size:13px;padding:10px;border:1px solid #cbcbd4;border-radius:8px;background:white;margin-bottom:14px}#search:focus{outline:2px solid var(--accent);outline-offset:2px}#results{display:grid;gap:6px;margin:0 0 20px}#results a{font-size:12px;line-height:1.4}#results:empty{display:none}.sidebar-footer{font-size:11px;color:var(--muted);margin-top:30px}.content{margin-left:284px;max-width:1450px;padding:50px 55px 100px}.cover{padding:0 0 40px;border-bottom:2px solid var(--ink);margin-bottom:35px}.cover h1{font-size:48px;line-height:1.1;letter-spacing:-2px;margin:14px 0 20px}.cover p{max-width:620px;font-size:17px;color:var(--muted)}.pills{display:flex;flex-wrap:wrap;gap:8px}.pills span{border:1px solid var(--line);border-radius:99px;padding:4px 11px;font-size:12px}article{border-bottom:1px solid var(--line);padding:20px 0 55px;margin-bottom:40px;overflow-wrap:anywhere}article h1{font-size:32px;line-height:1.2;letter-spacing:-.8px;margin:18px 0 25px}h2{font-size:23px;line-height:1.3;margin:40px 0 18px}h3{font-size:18px;margin:30px 0 14px}h4{font-size:16px;margin:25px 0 12px}p,ul,ol{margin:15px 0}li{margin:6px 0}code{background:#f1eef6;padding:2px 5px;border-radius:4px;font:12.5px/1.5 ui-monospace,SFMono-Regular,monospace}pre{padding:18px;background:#f6f5f9;border:1px solid var(--line);border-radius:10px;overflow:auto;white-space:pre}pre code{padding:0;background:none}blockquote{margin:24px 0;border-left:3px solid var(--accent);padding:4px 20px;background:var(--wash)}.table-scroll{overflow:auto;border:1px solid var(--line);border-radius:8px;margin:22px 0}table{border-collapse:collapse;width:100%;font-size:13px;line-height:1.5}th,td{text-align:left;vertical-align:top;padding:12px;border-bottom:1px solid var(--line);min-width:110px}th{background:var(--wash);font-weight:650}tr:last-child td{border-bottom:0}td code{font-size:12px}article img{display:block;max-width:100%;height:auto;max-height:760px;object-fit:contain;margin:20px auto;border:1px solid var(--line);border-radius:12px}img[src*="references/"]{max-width:420px;width:100%;background:linear-gradient(45deg,#eee 25%,transparent 25%,transparent 75%,#eee 75%),linear-gradient(45deg,#eee 25%,#fafafa 25%,#fafafa 75%,#eee 75%);background-size:24px 24px;background-position:0 0,12px 12px}img[src*="mobile"]{max-width:375px}.source-link{font-size:12px;float:right}.notice{padding:14px 18px;background:#f7f3ff;border:1px solid #e5d8fa;border-radius:10px;font-size:13px;margin:25px 0}.backtop{display:block;margin:20px 0;font-size:12px}input[type=checkbox]{accent-color:var(--accent)}
@media(max-width:1000px){.sidebar{width:238px;padding:24px 15px}.content{margin-left:238px;padding:35px 28px}.cover h1{font-size:40px}}
@media(max-width:720px){.sidebar{position:static;width:100%;border-right:0;border-bottom:1px solid var(--line)}.sidebar nav{grid-template-columns:1fr 1fr}.sidebar-footer{display:none}.meta{margin-bottom:15px}.content{margin:0;padding:28px 18px}.cover h1{font-size:36px}article h1{font-size:27px}h2{font-size:21px}th,td{padding:9px}article{padding-bottom:30px}}
@media print{.sidebar,.source-link,.skip,.backtop{display:none}.content{margin:0;padding:0;max-width:none}.cover{break-after:page}article{break-before:page}h1,h2,h3{break-after:avoid}pre,blockquote{break-inside:avoid}pre{white-space:pre-wrap}a{color:inherit;text-decoration:underline}article img{max-height:650px}.table-scroll{overflow:visible}table{font-size:10px}th,td{min-width:0;padding:6px}body{font-size:11px}@page{size:A4;margin:18mm}}
</style></head><body><a class="skip" href="#main">К документации</a>
<aside class="sidebar"><div class="eyebrow">Design → Development</div><div class="brand">AI Hub</div><div class="meta">Frontend handoff · v1.0<br>29 сентября 2026 · ${escape(commit.slice(0,7))}</div><label class="search-label" for="search">Найти раздел</label><input id="search" type="search" placeholder="Например, композер"><div id="results" aria-live="polite"></div><nav aria-label="Разделы документации">${nav.join('')}</nav><p class="sidebar-footer">Точные правила, реальные исходники,<br>сценарии и визуальные референсы.<br>Markdown доступен в каждой главе.</p></aside>
<main class="content" id="main"><header class="cover"><div class="eyebrow">Спецификация интерфейса</div><h1>Всё для реализации<br>нового AI Hub.</h1><p>UI, пользовательские сценарии, компоненты и правила графики — в одном проверяемом пакете для команды фронтенда.</p><div class="pills"><span>19 экранов и слоёв</span><span>67 UI-компонентов</span><span>Light + dark</span><span>Desktop + mobile</span><span>2 гайда генерации</span></div><div class="notice">Эталон — локальный прототип ${escape(commit.slice(0,7))}. Реализованное поведение, правила и требования к production явно разделены. Реальных backend API в прототипе нет.</div></header>${sections.join('')}<a class="backtop" href="#main">↑ Вернуться к началу</a></main>
<script>const entries=${JSON.stringify(search).replaceAll('<','\\u003c')};const search=document.querySelector('#search'),results=document.querySelector('#results');search.addEventListener('input',()=>{results.replaceChildren();const q=search.value.toLocaleLowerCase().trim();if(!q)return;const found=entries.filter(e=>(e.label+' '+e.chapter).toLocaleLowerCase().includes(q)).slice(0,20);if(!found.length){results.textContent='Раздел не найден. Для поиска по всему тексту используйте Ctrl/⌘F.';return}for(const e of found){const a=document.createElement('a');a.href='#'+e.id;a.textContent=e.label;results.append(a)}});</script></body></html>`
await fs.writeFile(path.join(dir,'index.html'),html)
console.log(JSON.stringify({chapters:chapters.length,headings:search.length,publicFiles:publicFiles.length,sourceFiles:sourceRecords.length,tokens:{root:Object.keys(light).length,dark:Object.keys(dark).length,theme:Object.keys(theme).length},sourceCommit:commit,sourceStatus,htmlBytes:Buffer.byteLength(html),links:'all local Markdown file targets exist'},null,2))
