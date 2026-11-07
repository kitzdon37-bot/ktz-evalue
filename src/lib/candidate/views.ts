// Pages du candidat, en HTML simple : elles doivent rester très légères (< 200 Ko,
// en pratique une dizaine de Ko), s'afficher sur de vieux Android et sur Opera Mini,
// et fonctionner même sans JavaScript (chaque réponse est un simple formulaire).
// Le JavaScript, quand il est disponible, ajoute : chronomètres, envoi automatique
// à la fin du temps, réessai si le réseau coupe, signaux anti-triche.
import type { QuestionData } from "@/lib/tests/model";

export function esc(s: string | null | undefined): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// --b : couleur de l'entreprise (orange KTZ par défaut). Pas de color-mix ni de variables
// imbriquées complexes : les teintes claires sont obtenues avec un voile semi-transparent,
// pour rester compatible avec les vieux navigateurs.
// Teinte légère de la couleur de l'entreprise : un calque ::before de couleur --b à faible opacité
// (classe .tn), qui marche partout, contrairement à color-mix().
const CSS = `*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;min-height:100vh;position:relative;overflow-x:hidden;font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-size:17px;line-height:1.55;color:#1c1917;background:#f7f5f1}
body:before,body:after{content:"";position:absolute;pointer-events:none;background:radial-gradient(closest-side,var(--b),rgba(255,255,255,0))}
body:before{left:8%;right:8%;top:-300px;height:620px;opacity:.13;-webkit-animation:breathe 9s ease-in-out infinite alternate;animation:breathe 9s ease-in-out infinite alternate}
body:after{right:-180px;bottom:-200px;width:520px;height:520px;opacity:.07;position:fixed;-webkit-animation:breathe 12s ease-in-out infinite alternate-reverse;animation:breathe 12s ease-in-out infinite alternate-reverse}
@-webkit-keyframes breathe{from{-webkit-transform:scale(1)}to{-webkit-transform:scale(1.15) translateY(20px)}}@keyframes breathe{from{transform:scale(1)}to{transform:scale(1.15) translateY(20px)}}
.w{position:relative;max-width:680px;margin:0 auto;padding:16px 14px 32px;overflow-x:clip}
.c{position:relative;background:#fff;border:1px solid #ece8e1;border-radius:24px;padding:22px;margin-bottom:14px;box-shadow:0 1px 2px rgba(28,25,23,.04),0 22px 44px -28px rgba(28,25,23,.28)}
h1{font-size:27px;line-height:1.2;margin:0 0 8px;letter-spacing:-.025em}h2{font-size:18px;margin:0 0 10px;letter-spacing:-.01em}p{margin:8px 0}.m{color:#57534e;font-size:15px}
.tn{position:relative;z-index:0}.tn:before{content:"";position:absolute;z-index:-1;top:0;right:0;bottom:0;left:0;border-radius:inherit;background:var(--b);opacity:.1;pointer-events:none}
.co{display:flex;align-items:center;gap:10px;font-weight:700;margin:0 0 16px;font-size:15px}
.lg{flex:none;height:40px;width:auto;max-width:120px;object-fit:contain;border-radius:11px;background:#fff;padding:3px;box-shadow:0 6px 16px -6px rgba(0,0,0,.45)}
.ab{font-size:14px;color:#57534e;border-left:3px solid var(--b);padding:2px 0 2px 10px;margin:10px 0 0}.ab a{color:var(--b);font-weight:600}.ab.ct{border:0;padding:0;text-align:center}
.av{flex:none;width:40px;height:40px;border-radius:13px;background:var(--b);display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;box-shadow:0 6px 16px -6px rgba(0,0,0,.45)}
.ph{position:relative;margin:-22px -22px 20px;height:190px;border-radius:23px 23px 0 0;overflow:hidden;background:#e9e3da url(/images/test/candidate.jpg) center 18%/cover no-repeat}
.ph:after{content:"";position:absolute;top:0;right:0;bottom:0;left:0;background:linear-gradient(to top,rgba(20,16,12,.72),rgba(20,16,12,0) 62%)}
.ph .co{position:absolute;z-index:1;left:18px;right:18px;bottom:14px;margin:0;color:#fff;text-shadow:0 1px 8px rgba(0,0,0,.35)}.ph .av{box-shadow:0 0 0 3px rgba(255,255,255,.9)}
.hi{display:inline-block;font-size:14px;font-weight:700;color:var(--b);padding:5px 12px;border-radius:99px;margin:0 0 10px}
.st{display:flex;margin:18px -5px 0}.st div{flex:1;margin:0 5px;background:#faf8f5;border:1px solid #f0ebe4;border-radius:18px;padding:13px 6px;text-align:center}
.st b{display:block;font-size:21px;line-height:1.2;letter-spacing:-.02em}.st span{display:block;font-size:12px;font-weight:600;color:#78716c;margin-top:2px}
.btn{display:block;width:100%;border:0;border-radius:16px;padding:17px;font:inherit;font-size:17px;font-weight:800;letter-spacing:.005em;color:#fff;cursor:pointer;background-color:var(--b);background-image:linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,0));box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 14px 26px -14px var(--b),0 2px 4px rgba(0,0,0,.1);-webkit-transition:transform .15s,opacity .2s,box-shadow .2s;transition:transform .15s,opacity .2s,box-shadow .2s}
.btn:hover{transform:translateY(-1px)}.btn:active{transform:scale(.985)}.btn[disabled]{opacity:.45;box-shadow:none;cursor:default;transform:none}
.kb{display:block;text-align:center;font-size:12px;color:#a8a29e;margin-top:10px}
.qh{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 12px}
.num{font-size:13px;font-weight:800;color:var(--b);padding:5px 11px;border-radius:99px}
.tag{font-size:12px;font-weight:700;color:#78716c;background:#f5f3ef;padding:5px 11px;border-radius:99px}
.q{user-select:none;-webkit-user-select:none;font-size:21px;font-weight:750;line-height:1.4;letter-spacing:-.015em;margin:0 0 18px;color:var(--b)}
.opt{position:relative;display:flex;gap:14px;align-items:center;border:1.5px solid #e9e5df;border-radius:18px;padding:14px 16px;margin:10px 0;background:#fff;cursor:pointer;-webkit-transition:border-color .15s,box-shadow .15s,transform .15s;transition:border-color .15s,box-shadow .15s,transform .15s}
.opt:before{content:"";position:absolute;top:0;right:0;bottom:0;left:0;border-radius:inherit;background:var(--b);opacity:0;pointer-events:none;-webkit-transition:opacity .15s;transition:opacity .15s}
.opt>span{position:relative}.opt .tx{flex:1}
.opt:hover{border-color:#d8d2c9;box-shadow:0 8px 18px -14px rgba(28,25,23,.35);transform:translateY(-1px)}.opt:active{transform:scale(.99)}
.opt input{position:absolute;opacity:0;width:1px;height:1px}
.lt{flex:none;width:36px;height:36px;border-radius:12px;border:1.5px solid #e7e3dd;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;color:#78716c;background:#faf8f5;-webkit-transition:all .15s;transition:all .15s}
.tk{flex:none;width:24px;height:24px;border-radius:50%;border:1.5px solid #e2ddd6;-webkit-transition:all .15s;transition:all .15s}
.tk:after{content:"";position:absolute;left:8px;top:4px;width:5px;height:10px;border:solid #fff;border-width:0 2.5px 2.5px 0;transform:rotate(45deg) scale(0);-webkit-transition:transform .15s;transition:transform .15s}
.opt:has(input:checked),.opt.on{border-color:var(--b);box-shadow:0 10px 24px -16px var(--b)}
.opt:has(input:checked):before,.opt.on:before{opacity:.07}
.opt:has(input:checked) .lt,.opt.on .lt{background:var(--b);border-color:var(--b);color:#fff}
.opt:has(input:checked) .tk,.opt.on .tk{background:var(--b);border-color:var(--b)}.opt:has(input:checked) .tk:after,.opt.on .tk:after{transform:rotate(45deg) scale(1)}
.opt:has(input:focus-visible){outline:3px solid var(--b);outline-offset:2px}
textarea,input[type=text]{width:100%;font:inherit;border:1.5px solid #e9e5df;border-radius:18px;padding:15px 16px;background:#faf8f5;-webkit-transition:border-color .15s,background .15s,box-shadow .15s;transition:border-color .15s,background .15s,box-shadow .15s}
textarea:focus,input[type=text]:focus{outline:0;border-color:var(--b);background:#fff;box-shadow:0 10px 24px -18px var(--b)}textarea{min-height:200px;resize:vertical}
.cnt{text-align:right;font-size:12px;color:#a8a29e;margin-top:4px}
@-webkit-keyframes bl{50%{opacity:.2}}@keyframes bl{50%{opacity:.2}}
.c.urgent{border-color:#dc2626;box-shadow:0 0 0 4px rgba(220,38,38,.16),0 22px 44px -28px rgba(28,25,23,.28)}
.urgent .q,.ring.low b{-webkit-animation:bl 1s ease-in-out infinite;animation:bl 1s ease-in-out infinite}
.urgent .q{color:#dc2626}
@-webkit-keyframes focusIn{from{opacity:0;-webkit-filter:blur(6px);-webkit-transform:translateY(6px)}to{opacity:1;-webkit-filter:none;-webkit-transform:none}}@keyframes focusIn{from{opacity:0;filter:blur(6px);transform:translateY(6px)}to{opacity:1;filter:none;transform:none}}
.qc .q{-webkit-animation:focusIn .6s .08s ease-out both;animation:focusIn .6s .08s ease-out both}.urgent.qc .q{-webkit-animation:bl 1s ease-in-out infinite;animation:bl 1s ease-in-out infinite}
@-webkit-keyframes ltPop{0%{-webkit-transform:scale(1)}45%{-webkit-transform:scale(1.22) rotate(-6deg)}to{-webkit-transform:scale(1)}}@keyframes ltPop{0%{transform:scale(1)}45%{transform:scale(1.22) rotate(-6deg)}to{transform:scale(1)}}
.opt.on .lt,.opt:has(input:checked) .lt{-webkit-animation:ltPop .35s ease-out;animation:ltPop .35s ease-out}
.bar div{position:relative;overflow:hidden}.bar div:after{content:"";position:absolute;top:0;bottom:0;width:40%;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.6),rgba(255,255,255,0));-webkit-animation:shine 2.6s ease-in-out infinite;animation:shine 2.6s ease-in-out infinite}
@-webkit-keyframes shine{from{left:-45%}to{left:110%}}@keyframes shine{from{left:-45%}to{left:110%}}
@-webkit-keyframes leave{to{opacity:0;-webkit-transform:translateX(-28px) scale(.98)}}@keyframes leave{to{opacity:0;transform:translateX(-28px) scale(.98)}}
.c.leave{-webkit-animation:leave .28s ease-in forwards!important;animation:leave .28s ease-in forwards!important}
.top{position:relative;background:#fff;border:1px solid #ece8e1;border-radius:22px;padding:12px 14px 14px;margin-bottom:14px;box-shadow:0 1px 2px rgba(28,25,23,.04),0 14px 30px -24px rgba(28,25,23,.3)}
.hd{display:flex;align-items:center;gap:12px}.hd .co{margin:0;flex:1;min-width:0}.hd .co span:last-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ring{position:relative;width:58px;height:58px;flex:none}.ring svg{display:block;transform:rotate(-90deg)}.ring circle{fill:none;stroke-width:5}.ring .bg{stroke:#f0ece6}.ring .fg{stroke:var(--b);stroke-linecap:round;-webkit-transition:stroke-dashoffset 1s linear;transition:stroke-dashoffset 1s linear}
.ring b{position:absolute;top:0;right:0;bottom:0;left:0;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.ring.low .fg{stroke:#dc2626}.ring.low b{color:#dc2626}
.pr{display:flex;justify-content:space-between;align-items:center;font-size:14px;color:#57534e;margin:10px 2px 8px}.pr b{color:#1c1917}
.t{font-weight:800;color:#1c1917;background:#f5f3ef;border-radius:99px;padding:3px 10px;display:inline-block;font-size:13px;font-variant-numeric:tabular-nums}
.bar{height:8px;background:#f0ece6;border-radius:99px;overflow:hidden}.bar div{height:8px;border-radius:99px;background-color:var(--b);background-image:linear-gradient(90deg,rgba(255,255,255,.35),rgba(255,255,255,0));-webkit-transition:width .6s;transition:width .6s}
.al{border-radius:14px;padding:12px 14px;margin:12px 0;font-size:15px}.er{background:#fef2f2;color:#991b1b}.ok{background:#f0fdf4;color:#166534}.wa{background:#fffbeb;color:#92400e}
.rl{list-style:none;padding:0;margin:6px 0 0}.rl li{display:flex;gap:14px;align-items:flex-start;margin:0;padding:13px 0;border-top:1px solid #f2efea;font-size:15px;color:#44403c}.rl li:first-child{border-top:0}.rl b{color:#1c1917}
.rl i{flex:none;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:14px;font-weight:800;color:var(--b)}
label.ck{display:flex;gap:12px;align-items:flex-start;margin:0 0 14px;font-size:14px;color:#57534e;background:#faf8f5;border:1px solid #f0ebe4;border-radius:16px;padding:13px 14px;cursor:pointer}label.ck input{width:22px;height:22px;flex:none;margin:0;accent-color:var(--b)}
label.fl{display:block;font-size:14px;font-weight:700;color:#44403c;margin:14px 0 0}label.fl input{margin-top:6px}
.big{font-size:56px;font-weight:800;letter-spacing:-.03em;margin:0;line-height:1}
.done{text-align:center}.ft{text-align:center;color:#a8a29e;font-size:13px;margin-top:8px}.ft b{color:#78716c}
.ic{position:relative;width:80px;height:80px;margin:8px auto 18px;border-radius:50%;background:var(--b);color:#fff;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:800;box-shadow:0 16px 32px -14px var(--b)}
.ic:before{content:"";position:absolute;top:-12px;right:-12px;bottom:-12px;left:-12px;border-radius:50%;background:var(--b);opacity:.12;-webkit-animation:halo 2.4s ease-out .3s both;animation:halo 2.4s ease-out .3s both}
@-webkit-keyframes halo{from{-webkit-transform:scale(.6);opacity:0}to{-webkit-transform:scale(1);opacity:.12}}@keyframes halo{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:.12}}
.ck2{stroke:#fff;stroke-width:5;fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:48;stroke-dashoffset:48;-webkit-animation:dr .7s .25s ease-out forwards;animation:dr .7s .25s ease-out forwards}
@-webkit-keyframes dr{to{stroke-dashoffset:0}}@keyframes dr{to{stroke-dashoffset:0}}
@-webkit-keyframes up{from{opacity:0;-webkit-transform:translateY(14px)}to{opacity:1;-webkit-transform:none}}@keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.c,.top{-webkit-animation:up .45s ease-out both;animation:up .45s ease-out both}.d1{-webkit-animation-delay:.08s;animation-delay:.08s}.d2{-webkit-animation-delay:.16s;animation-delay:.16s}
.sc{position:relative;width:150px;height:150px;margin:6px auto 4px}.sc svg{transform:rotate(-90deg)}.sc circle{fill:none;stroke-width:12}.sc .bg{stroke:#f0ece6}.sc .fg{stroke:var(--b);stroke-linecap:round}
.sc div{position:absolute;top:0;right:0;bottom:0;left:0;display:flex;flex-direction:column;align-items:center;justify-content:center}.sc small{color:#a8a29e;font-size:14px;font-weight:700}
.pv{position:sticky;top:0;z-index:9;display:flex;justify-content:space-between;align-items:center;gap:10px;background:#1c1917;color:#fff;font-size:14px;padding:10px 16px}.pv a{color:#fdba74;font-weight:700;text-decoration:none;white-space:nowrap}
.qc{overflow:hidden}.qc:after{content:"";position:absolute;left:0;right:0;top:0;height:5px;background-color:var(--b);background-image:linear-gradient(90deg,rgba(255,255,255,.5),rgba(255,255,255,0))}
.urgent.qc:after{background-color:#dc2626}
.wm{display:none;position:absolute;top:-6px;right:14px;font-size:104px;font-weight:900;line-height:1;letter-spacing:-.06em;color:var(--b);opacity:.045;pointer-events:none;-webkit-user-select:none;user-select:none;font-variant-numeric:tabular-nums}
.qc>*{position:relative}.qc>.wm{position:absolute}
.tag svg{width:14px;height:14px;vertical-align:-2px;margin-right:5px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.cheer{margin-left:auto;font-size:12px;font-weight:800;color:#15803d;background:#ecfdf3;padding:5px 11px;border-radius:99px}
.qc .opt{-webkit-animation:up .4s ease-out backwards;animation:up .4s ease-out backwards}
@-webkit-keyframes pop{0%{-webkit-transform:scale(.6)}60%{-webkit-transform:scale(1.18)}to{-webkit-transform:scale(1)}}@keyframes pop{0%{transform:scale(.6)}60%{transform:scale(1.18)}to{transform:scale(1)}}
.opt.on .tk,.opt:has(input:checked) .tk{-webkit-animation:pop .3s ease-out;animation:pop .3s ease-out}
.tf{display:flex;margin:0 -5px}.tf .opt{flex:1;margin:4px 5px 10px;flex-direction:column;justify-content:center;gap:10px;padding:22px 10px;text-align:center;font-size:19px;font-weight:800}
.tf .lt{width:52px;height:52px;border-radius:50%;font-size:24px}.tf .tk{position:absolute;top:12px;right:12px}
.sa{position:relative}.sa input[type=text]{font-size:22px;font-weight:700;text-align:center;padding:20px 16px;letter-spacing:.01em}
.sa input::placeholder{font-weight:500;font-size:17px;color:#a8a29e}.hint{text-align:center;font-size:13px;color:#a8a29e;margin:8px 0 0}
.ill{margin:0 0 18px;border:1px solid #f0ebe4;border-radius:18px;overflow:hidden;background:#faf8f5}.ill img{display:block;max-width:100%;max-height:360px;height:auto;margin:0 auto}
.hint2{font-size:13px;color:#78716c;margin:-6px 0 10px}
.ord{list-style:none;padding:0;margin:0}
.it{position:relative;display:flex;align-items:center;gap:10px;background:#fff;border:1.5px solid #e9e5df;border-radius:16px;padding:10px 10px 10px 6px;margin:8px 0;-webkit-user-select:none;user-select:none;-webkit-transition:box-shadow .18s,border-color .15s,transform .18s;transition:box-shadow .18s,border-color .15s,transform .18s}
.it .gr{flex:none;width:26px;height:38px;cursor:grab;touch-action:none;background-image:radial-gradient(circle,#c3bcb2 1.7px,rgba(0,0,0,0) 1.8px);background-size:8px 8px;background-position:center}
.it .rk{flex:none;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#fff;background:var(--b)}
.it .tx{flex:1;line-height:1.4}
.mv{display:none;flex:none;gap:4px}.js .mv{display:flex}
.mv button{width:36px;height:36px;border-radius:11px;border:1.5px solid #e9e5df;background:#faf8f5;font:inherit;font-size:16px;font-weight:800;color:#57534e;cursor:pointer}
.mv button:hover{border-color:var(--b);color:var(--b)}.mv button[disabled]{opacity:.3;cursor:default}
.it select{flex:none;font:inherit;font-size:14px;border:1.5px solid #e9e5df;border-radius:10px;padding:6px;background:#fff}.js .it select,.it .gr{display:none}.js .it .gr{display:block}
.it.drag{z-index:2;border-color:var(--b);box-shadow:0 18px 34px -16px rgba(28,25,23,.45);transform:scale(1.02);cursor:grabbing}
@-webkit-keyframes fl{from{background:#fff3e8}}@keyframes fl{from{background:#fff3e8}}.it.moved{-webkit-animation:fl .6s ease-out;animation:fl .6s ease-out}
.cd{border:1px solid #2a2622;border-radius:16px;overflow:hidden;background:#1c1917}
.cdh{display:flex;align-items:center;gap:6px;padding:9px 14px;font-size:12px;font-weight:700;letter-spacing:.04em;color:#a8a29e;background:#24201d}.cdh i{width:9px;height:9px;border-radius:50%;background:#57534e}.cdh span{margin-left:6px}
textarea.code{display:block;min-height:280px;border:0;border-radius:0;background:#1c1917;color:#f5f5f4;font:14px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;padding:14px 16px;tab-size:2;-moz-tab-size:2;white-space:pre;overflow:auto;caret-color:#fdba74}
textarea.code:focus{background:#1c1917;box-shadow:none;border:0}
.ex{margin:14px 0 0;border:1px solid #f0ebe4;border-radius:16px;padding:4px 14px 8px;background:#faf8f5}.ext{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#78716c;margin:10px 0 2px}
.exl{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 0;border-top:1px solid #f0ebe4;font-size:14px}.ext+.exl{border-top:0}
.exl code{font:13px ui-monospace,Menlo,Consolas,monospace;background:#fff;border:1px solid #ece8e1;border-radius:8px;padding:3px 7px;word-break:break-all}
.exl .st{margin-left:auto;font-size:13px;font-weight:700}.exl.ok .st{color:#15803d}.exl.ko .st{color:#b91c1c}.exl.ok code:last-of-type{border-color:#86efac}
.run{display:none;width:100%;margin:12px 0 0;border:1.5px solid #1c1917;border-radius:14px;padding:12px;background:#fff;color:#1c1917;font:inherit;font-weight:800;cursor:pointer;-webkit-transition:background .15s,color .15s;transition:background .15s,color .15s}.js .run{display:block}.run:hover{background:#1c1917;color:#fff}.run[disabled]{opacity:.5}
.out{display:none;white-space:pre-wrap;word-break:break-word;font:13px/1.5 ui-monospace,Menlo,Consolas,monospace;border-radius:12px;padding:10px 12px;margin:10px 0 0;background:#fef2f2;color:#991b1b}.out.lg{background:#f5f3ef;color:#44403c}
@media (min-width:600px){.wm{display:block;font-size:132px}.w{padding-top:28px}.c{padding:30px}.ph{margin:-30px -30px 22px;height:240px}h1{font-size:30px}.q{font-size:22px}}
@media (prefers-reduced-motion:reduce){*{-webkit-animation:none!important;animation:none!important;transition:none!important}.ck2{stroke-dashoffset:0}}`;

export function layout(opts: { title: string; color?: string | null; body: string; script?: string; banner?: string }) {
  const color = /^#[0-9a-fA-F]{6}$/.test(opts.color ?? "") ? opts.color : "#ea580c";
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta name="theme-color" content="${color}"><title>${esc(opts.title)}</title><style>:root{--b:${color}}${CSS}</style></head><body>${opts.banner ?? ""}<div class="w">${opts.body}</div>${opts.script ? `<script>${opts.script}</script>` : ""}</body></html>`;
}

/** Bandeau de l'aperçu recruteur (rien n'est enregistré). */
export function previewBanner(restartUrl: string) {
  return `<div class="pv"><span>👁 <b>Aperçu</b> — exactement ce que verra le candidat. Rien n'est enregistré.</span><a href="${esc(restartUrl)}">↺ Recommencer</a></div>`;
}

// Coche dessinée (animation CSS seulement, aucun fichier image).
const CHECK_SVG = `<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><path class="ck2" d="M10 21l7 7 14-15"/></svg>`;

function avatar(companyName: string, logoUrl?: string | null) {
  return logoUrl
    ? `<img class="lg" src="${esc(logoUrl)}" alt="">`
    : `<span class="av">${esc(companyName.slice(0, 1).toUpperCase())}</span>`;
}

export function messagePage(title: string, message: string, color?: string | null) {
  return layout({ title, color, body: `<div class="c done"><div class="ic">i</div><h1>${esc(title)}</h1><p class="m">${esc(message)}</p></div><p class="ft">Propulsé par <b>KTZ Évalue</b></p>` });
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.max(0, Math.floor(sec % 60));
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ───── Photo du haut de page, selon le métier du test ─────
// Photos réelles, réduites à ~20 Ko (public/images/test). Pour un métier sans photo dédiée,
// une photo « candidat » est choisie selon le test, pour varier d'un test à l'autre.
const PHOTO_RULES: [RegExp, string][] = [
  [/informati|d[ée]velopp|programmation|javascript|donn[ée]es|t[ée]l[ée]com|r[ée]seau|web/i, "informaticien"],
  [/humanitaire|programme\b|meal|suivi-[ée]valuation|protection|terrain|\bong\b|agronom/i, "humanitaire"],
  [/compta|financ|audit|caiss|banque|cr[ée]dit|\braf\b|tr[ée]sor|microfinance/i, "comptable"],
  [/commerc|vente|clientèle|marketing|communication|community/i, "commercial"],
  [/logisti|stock|magasin|achat|approvision/i, "logisticien"],
  [/chauffeur|conduct|m[ée]cani|transport/i, "chauffeur"],
  [/assistant|secr[ée]taire|r[ée]ception|saisie|administrati|ressources humaines|juriste/i, "assistant"],
];
const GENERIC_PHOTOS = ["candidate", "candidat", "entretien", "equipe"];

export function testPhoto(jobTitle: string, seed: string): string {
  const rule = PHOTO_RULES.find(([re]) => re.test(jobTitle));
  if (rule) return `/images/test/${rule[1]}.jpg`;
  // Brassage FNV-1a : deux identifiants proches donnent des photos différentes.
  let n = 2166136261;
  for (const c of seed) n = Math.imul(n ^ c.charCodeAt(0), 16777619) >>> 0;
  n = (n ^ (n >>> 15)) >>> 0; // >>> 0 : reste un nombre positif
  return `/images/test/${GENERIC_PHOTOS[n % GENERIC_PHOTOS.length]}.jpg`;
}

const photoStyle = (photo?: string) => (photo && /^\/images\/test\/[a-z]+\.jpg$/.test(photo) ? ` style="background-image:url(${photo})"` : "");

// ───── Accueil du test ─────

export type About = { description?: string | null; website?: string | null };

// Présentation courte de l'entreprise (fiche entreprise), avec son site web.
function aboutBlock(companyName: string, about?: About) {
  if (!about?.description && !about?.website) return "";
  const site = about.website && /^https?:\/\//.test(about.website)
    ? ` <a href="${esc(about.website)}" target="_blank" rel="noopener nofollow">${esc(about.website.replace(/^https?:\/\/(www\.)?/, ""))}</a>`
    : "";
  return `<p class="ab"><b>${esc(companyName)}</b>${about.description ? ` — ${esc(about.description)}` : ""}${site}</p>`;
}

export function welcomePage(v: {
  token: string;
  companyName: string;
  color: string | null;
  logoUrl: string | null;
  about?: About;
  testTitle: string;
  candidateName: string;
  durationMinutes: number;
  questionCount: number;
  extraTimePercent: number;
  expiresAt: Date;
  webcam: boolean;
  fullscreen: boolean;
  error?: string;
  /** Photo du haut de page (voir testPhoto). */
  photo?: string;
  /** Aperçu recruteur : le bouton passe à la 1re question sans rien enregistrer. */
  preview?: { startUrl: string; banner: string };
}) {
  const until = v.expiresAt.toLocaleDateString("fr-FR", { timeZone: "Africa/Bangui", day: "numeric", month: "short" });
  const duration = Math.round(v.durationMinutes * (1 + v.extraTimePercent / 100));
  const rules = [
    "<b>Une question à la fois.</b> Une réponse validée est définitive : pas de retour en arrière.",
    "<b>Connexion faible ? Pas de souci.</b> Vos réponses sont gardées sur le téléphone. Si la page se ferme, rouvrez simplement ce lien : le chronomètre, lui, continue.",
    "<b>Restez sur la page.</b> Les sorties de la page, les copier-coller et les réponses très rapides sont signalés au recruteur.",
    ...(v.fullscreen ? ["Sur ordinateur, le test s'affiche <b>en plein écran</b>."] : []),
    "Le test ne se passe <b>qu'une seule fois</b>. Installez-vous au calme.",
  ];
  const body = `<div class="c"><div class="ph"${photoStyle(v.photo)}><p class="co">${avatar(v.companyName, v.logoUrl)}<span>${esc(v.companyName)}</span></p></div>
<p class="hi tn">Bonjour ${esc(v.candidateName)} 👋</p>
<h1>${esc(v.testTitle)}</h1>
<p class="m">Voici le test de recrutement préparé pour vous. Prenez quelques secondes pour lire les règles, puis lancez-vous.</p>
${aboutBlock(v.companyName, v.about)}
<div class="st"><div><b>${duration}</b><span>minutes${v.extraTimePercent ? ` (+${v.extraTimePercent} %)` : ""}</span></div><div><b>${v.questionCount}</b><span>questions</span></div><div><b>${esc(until)}</b><span>date limite</span></div></div></div>
<div class="c d1"><h2>Avant de commencer</h2><ul class="rl">
${rules.map((r, i) => `<li><i class="tn">${i + 1}</i><span>${r}</span></li>`).join("\n")}</ul></div>
${
    v.preview
      ? `<form class="c d2" method="get" action="${esc(v.preview.startUrl.split("?")[0])}" id="f"><input type="hidden" name="q" value="1">`
      : `<form class="c d2" method="post" action="/t/${esc(v.token)}" id="f">
<input type="hidden" name="action" value="start">`
  }
${v.error ? `<p class="al er">${esc(v.error)}</p>` : ""}
<label class="ck"><input type="checkbox" name="consent" value="1" required><span>J'accepte que mes réponses et les signaux enregistrés pendant le test soient transmis à ${esc(v.companyName)} pour ce recrutement. Ils sont supprimés au plus tard 12 mois après le test.</span></label>
${v.webcam ? `<label class="ck"><input type="checkbox" name="webcam" value="1" required><span>J'accepte que des photos soient prises par la caméra pendant le test (une toutes les 30 à 60 secondes). Elles sont supprimées 90 jours après le test.</span></label>` : ""}
<button class="btn" type="submit">Commencer le test →</button></form>
<p class="ft">Test proposé avec <b>KTZ Évalue</b></p>`;
  const script = v.fullscreen && !v.preview
    ? `(function(){var f=document.getElementById('f');if(!f)return;f.addEventListener('submit',function(){try{if(!/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)){var d=document.documentElement;(d.requestFullscreen||d.webkitRequestFullscreen||function(){}).call(d)}}catch(e){}})})();`
    : undefined;
  return layout({ title: v.testTitle, color: v.color, body, script, banner: v.preview?.banner });
}

// ───── Question ─────

// Un choix de réponse : lettre, texte, puis pastille cochée à droite. Les choix apparaissent
// l'un après l'autre (délai selon leur rang).
function option(type: string, name: string, value: string, letter: string, text: string, rank: number) {
  const delay = (0.12 + rank * 0.06).toFixed(2);
  return `<label class="opt" style="-webkit-animation-delay:${delay}s;animation-delay:${delay}s"><input type="${type}" name="${name}" value="${esc(value)}"><span class="lt">${letter}</span><span class="tx">${frenchSpaces(esc(text))}</span><span class="tk"></span></label>`;
}

// Petites icônes (traits SVG, quelques octets) pour le type de question.
const ICONS: Record<string, string> = {
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.2"/><circle cx="4.5" cy="12" r="1.2"/><circle cx="4.5" cy="18" r="1.2"/>',
  checks: '<path d="M3 7l2.5 2.5L10 5M3 16l2.5 2.5L10 14M14 7h7M14 16h7"/>',
  scale: '<path d="M12 3v18M5 7h14M5 7l-3 7a3 3 0 006 0L5 7M19 7l-3 7a3 3 0 006 0l-3-7"/>',
  hash: '<path d="M5 9h14M4 15h14M10 3L8 21M16 3l-2 18"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
  sort: '<path d="M7 4v16M7 4L4 7M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3"/>',
  code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
};
// Typographie française : espace insécable avant ? ! : ; » et après «, pour qu'un « ? » ne se
// retrouve jamais seul en début de ligne. (Le texte est déjà échappé : « ; » des entités est épargné.)
function frenchSpaces(html: string) {
  return html.replace(/ ([?!:»]|;(?!\w))/g, "&nbsp;$1").replace(/« /g, "«&nbsp;");
}

const icon = (name: string) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

export function questionPage(v: {
  token: string;
  color: string | null;
  companyName: string;
  logoUrl?: string | null;
  testTitle: string;
  index: number;
  total: number;
  question: QuestionData & { id: string };
  choiceOrder: string[] | null;
  questionRemainingSec: number;
  /** Temps total accordé à cette question (pour l'anneau du chronomètre). */
  questionTotalSec?: number;
  totalRemainingSec: number;
  blockPaste: boolean;
  requireFullscreen: boolean;
  /** Aperçu recruteur : « Valider » passe à la question suivante, rien n'est enregistré. */
  preview?: { nextUrl: string; banner: string };
}) {
  const q = v.question;
  const choices = new Map((q.choices ?? []).map((c) => [c.id, c.text]));
  const letter = (i: number) => String.fromCharCode(65 + i);
  let field = "";
  let kind = "Réponse écrite";
  let ic = "pen";
  if (q.type === "MCQ_SINGLE" || q.type === "MCQ_MULTI") {
    const type = q.type === "MCQ_SINGLE" ? "radio" : "checkbox";
    kind = q.type === "MCQ_SINGLE" ? "QCM · une seule réponse" : "QCM · plusieurs réponses possibles";
    ic = q.type === "MCQ_SINGLE" ? "list" : "checks";
    field = (v.choiceOrder ?? [])
      .filter((id) => choices.has(id))
      .map((id, i) => option(type, "choice", id, letter(i), choices.get(id) ?? "", i))
      .join("");
  } else if (q.type === "TRUE_FALSE") {
    kind = "Vrai ou faux";
    ic = "scale";
    field = `<div class="tf">${option("radio", "tf", "true", "✓", "Vrai", 0)}${option("radio", "tf", "false", "✕", "Faux", 1)}</div>`;
  } else if (q.type === "SHORT_ANSWER") {
    kind = "Réponse courte";
    ic = "hash";
    field = `<div class="sa"><input type="text" name="text" autocomplete="off" maxlength="200" class="ans" aria-label="Votre réponse" placeholder="Tapez votre réponse"></div><p class="hint">Un mot, un nombre ou une heure suffit.</p>`;
  } else if (q.type === "ORDERING") {
    kind = "Remettre dans l'ordre";
    ic = "sort";
    const ids = (v.choiceOrder ?? []).filter((id) => choices.has(id));
    const ranks = (sel: number) =>
      ids.map((_, k) => `<option value="${k + 1}"${k + 1 === sel ? " selected" : ""}>${k + 1}</option>`).join("");
    field = `<p class="hint2">Faites glisser les éléments, ou utilisez les flèches, pour les ranger dans le bon ordre.</p><ol class="ord" id="ord">${ids
      .map(
        (id, i) =>
          `<li class="it" style="-webkit-animation-delay:${(0.12 + i * 0.06).toFixed(2)}s;animation-delay:${(0.12 + i * 0.06).toFixed(2)}s"><span class="gr" aria-hidden="true"></span><span class="rk">${i + 1}</span><span class="tx">${frenchSpaces(esc(choices.get(id)))}</span><span class="mv"><button type="button" class="up" aria-label="Monter">↑</button><button type="button" class="dn" aria-label="Descendre">↓</button></span><select name="pos_${esc(id)}" aria-label="Rang de cet élément">${ranks(i + 1)}</select></li>`,
      )
      .join("")}</ol>`;
  } else if (q.type === "CODE") {
    kind = "Exercice de code · JavaScript";
    ic = "code";
    const spec = q.correctAnswer?.code;
    const examples = (spec?.tests ?? []).filter((t) => !t.hidden);
    const call = (args: unknown[]) => `${spec?.functionName ?? "solution"}(${args.map((a) => JSON.stringify(a)).join(", ")})`;
    const hiddenCount = (spec?.tests ?? []).length - examples.length;
    field = `<div class="cd"><div class="cdh"><i></i><i></i><i></i><span>JavaScript</span></div><textarea name="code" class="ans code" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off" aria-label="Votre code">${esc(spec?.starter ?? "")}</textarea></div>
<div class="ex"><p class="ext">Exemples à réussir</p>${examples
      .map((t, i) => `<div class="exl" id="ex${i}"><code>${esc(call(t.args))}</code><span>→</span><code>${esc(JSON.stringify(t.expected))}</code><b class="st"></b></div>`)
      .join("")}</div>
<button type="button" class="run" id="run">▶ Exécuter les exemples</button><pre class="out" id="out"></pre>
<p class="hint">${hiddenCount > 0 ? `${hiddenCount} autre(s) test(s), cachés, vérifieront aussi votre code après l’envoi.` : "Votre code sera vérifié automatiquement après l’envoi."}</p>
<script type="text/plain" id="wk">${WORKER_JS}</script>`;
  } else {
    if (q.type === "ORAL") {
      kind = "Question orale";
      ic = "mic";
    }
    const oral = q.type === "ORAL" ? `<p class="al wa">Question orale : l'enregistrement audio arrive bientôt. Pour l'instant, répondez par écrit.</p>` : "";
    field = `${oral}<textarea name="text" maxlength="10000" class="ans" aria-label="Votre réponse" placeholder="Écrivez votre réponse ici, avec vos mots…"></textarea><p class="cnt" id="cnt"></p>`;
  }
  const left = v.total - v.index;
  const cheer = left === 0 ? "Dernière question !" : left <= 2 ? `Plus que ${left} questions` : v.index === Math.ceil(v.total / 2) && v.total >= 8 ? "Déjà la moitié 👏" : "";

  // Anneau du chronomètre de la question : circonférence 2πr avec r = 25.
  const C = 157.08;
  const qTotal = Math.max(v.questionTotalSec ?? v.questionRemainingSec, v.questionRemainingSec, 1);
  const offset = (C * (1 - v.questionRemainingSec / qTotal)).toFixed(2);
  const low = v.questionRemainingSec <= Math.max(10, qTotal * 0.2);
  const percent = Math.max(3, Math.round(((v.index - 1) / v.total) * 100));

  const body = `<div class="top"><div class="hd"><p class="co">${avatar(v.companyName, v.logoUrl)}<span>${esc(v.testTitle)}</span></p>
<div class="ring${low ? " low" : ""}" id="rg" role="timer" aria-label="Temps restant pour cette question"><svg width="58" height="58" viewBox="0 0 58 58"><circle class="bg" cx="29" cy="29" r="25"/><circle class="fg" id="rf" cx="29" cy="29" r="25" stroke-dasharray="${C}" stroke-dashoffset="${offset}"/></svg><b id="qt">${formatDuration(v.questionRemainingSec)}</b></div></div>
<div class="pr"><span>Question <b>${v.index}</b> sur ${v.total}</span><span>Temps du test <span class="t" id="tt">${formatDuration(v.totalRemainingSec)}</span></span></div>
<div class="bar" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"><div style="width:${percent}%"></div></div></div>
${
    v.preview
      ? `<form class="c qc d1${low ? " urgent" : ""}" method="get" action="${esc(v.preview.nextUrl.split("?")[0])}" id="f"><input type="hidden" name="q" value="${v.index + 1}">`
      : `<form class="c qc d1${low ? " urgent" : ""}" method="post" action="/t/${esc(v.token)}" id="f">
<input type="hidden" name="action" value="answer"><input type="hidden" name="questionId" value="${esc(q.id)}">`
  }
<span class="wm" aria-hidden="true">${String(v.index).padStart(2, "0")}</span>
<div class="qh"><span class="num tn">Question ${v.index}</span><span class="tag">${icon(ic)}${esc(kind)}</span>${cheer ? `<span class="cheer">${cheer}</span>` : ""}</div>
<p class="q">${frenchSpaces(esc(q.prompt)).replace(/\n/g, "<br>")}</p>${q.image ? `<figure class="ill"><img src="${esc(q.image)}" alt="Illustration de la question" decoding="async"></figure>` : ""}${field}
<div id="msg"></div><button class="btn" type="submit" id="b">Valider ma réponse</button><span class="kb" id="kb" style="display:none"></span></form>
<p class="ft">${esc(v.companyName)} · propulsé par <b>KTZ Évalue</b></p>`;

  const cfg = JSON.stringify({
    t: v.token,
    q: q.id,
    qs: v.questionRemainingSec,
    qt: qTotal,
    ts: v.totalRemainingSec,
    bp: v.blockPaste,
    fs: v.requireFullscreen,
    ty: q.type,
    pv: v.preview ? v.preview.nextUrl : 0,
    fn: q.type === "CODE" ? (q.correctAnswer?.code?.functionName ?? "") : undefined,
    ex: q.type === "CODE" ? (q.correctAnswer?.code?.tests ?? []).filter((t) => !t.hidden).map((t) => ({ a: t.args, e: t.expected })) : undefined,
  }).replace(/</g, "\\u003c");
  return layout({ title: `Question ${v.index} / ${v.total}`, color: v.color, body, script: `var K=${cfg};${CLIENT_JS}`, banner: v.preview?.banner });
}

// Script du candidat, écrit en JavaScript ancien (ES5) pour les vieux navigateurs.
const CLIENT_JS = `(function(){
var f=document.getElementById('f'),b=document.getElementById('b'),msg=document.getElementById('msg');
var sending=false,start=new Date().getTime(),pk='ktz_p_'+K.t,hiddenAt=null;
function fmt(s){s=Math.max(0,Math.floor(s));var m=Math.floor(s/60),r=s%60;return m+':'+(r<10?'0':'')+r}
function ev(type,extra){if(K.pv)return;try{var d={type:type,questionId:K.q,durationMs:extra||null};var x=new XMLHttpRequest();x.open('POST','/t/'+K.t+'/evenement',true);x.setRequestHeader('Content-Type','application/json');x.send(JSON.stringify(d))}catch(e){}}
function fields(){var o=[],e=f.elements;for(var i=0;i<e.length;i++){var el=e[i];if(!el.name)continue;if((el.type=='radio'||el.type=='checkbox')&&!el.checked)continue;o.push([el.name,el.value])}return o}
function body(o){var s=[];for(var i=0;i<o.length;i++){s.push(encodeURIComponent(o[i][0])+'='+encodeURIComponent(o[i][1]))}return s.join('&')}
function show(cls,t){msg.innerHTML='<p class="al '+cls+'">'+t+'</p>'}
function send(o,retry){sending=true;b.disabled=true;if(K.pv){b.innerHTML='Question suivante…';f.className+=' leave';setTimeout(function(){location.href=K.pv},240);return}b.innerHTML='Envoi…';var x=new XMLHttpRequest();x.open('POST','/t/'+K.t,true);
x.setRequestHeader('Content-Type','application/x-www-form-urlencoded');x.setRequestHeader('X-KTZ','1');x.timeout=20000;
x.onload=function(){if(x.status>=200&&x.status<300){try{localStorage.removeItem(pk)}catch(e){}var r={};try{r=JSON.parse(x.responseText)}catch(e){}f.className+=' leave';setTimeout(function(){location.replace(r.next||('/t/'+K.t))},240)}else fail(o)};
x.onerror=x.ontimeout=function(){fail(o)};x.send(body(o))}
function fail(o){try{localStorage.setItem(pk,JSON.stringify(o))}catch(e){}show('wa','Pas de réseau : votre réponse est gardée sur le téléphone et sera envoyée dès le retour de la connexion. Ne fermez pas cette page.');setTimeout(function(){send(o,true)},5000)}
try{var p=K.pv?null:localStorage.getItem(pk);if(p){var po=JSON.parse(p);var same=false;for(var i=0;i<po.length;i++){if(po[i][0]=='questionId'&&po[i][1]==K.q)same=true}if(same){send(po,true);return}else localStorage.removeItem(pk)}}catch(e){}
f.onsubmit=function(e){if(e&&e.preventDefault)e.preventDefault();if(sending)return false;send(fields());return false};
var rg=document.getElementById('rg'),rf=document.getElementById('rf'),C=157.08,lowAt=Math.max(10,K.qt*0.2);
function tick(){var el=(new Date().getTime()-start)/1000,qr=K.qs-el,tr=K.ts-el;document.getElementById('qt').innerHTML=fmt(qr);document.getElementById('tt').innerHTML=fmt(tr);
if(rf){rf.setAttribute('stroke-dashoffset',(C*(1-Math.max(0,qr)/K.qt)).toFixed(2))}if(qr<=lowAt){if(rg&&rg.className.indexOf('low')<0)rg.className+=' low';if(f.className.indexOf('urgent')<0)f.className+=' urgent'}
if((qr<=0||tr<=0)&&!sending){show('wa','Temps écoulé : votre réponse est envoyée.');send(fields())}}
setInterval(tick,1000);
var opts=f.querySelectorAll('.opt'),ins=f.querySelectorAll('.opt input'),ans=f.querySelector('.ans'),cnt=document.getElementById('cnt');
function answered(){if(K.ty=='ORDERING')return true;for(var i=0;i<ins.length;i++){if(ins[i].checked)return true}return !!(ans&&ans.value.replace(/\\s/g,''))}
function refresh(){for(var i=0;i<opts.length;i++){var on=opts[i].querySelector('input').checked;opts[i].className=on?'opt on':'opt'}
if(!sending)b.innerHTML=answered()?'Valider ma réponse':'Passer cette question';if(cnt&&ans){var n=ans.value.length;cnt.innerHTML=n?n+' caractère'+(n>1?'s':''):''}}
for(var j=0;j<ins.length;j++){ins[j].onchange=refresh}if(ans){ans.oninput=refresh;ans.onkeyup=refresh}refresh();
var touch='ontouchstart' in window;if(!touch){var kb=document.getElementById('kb');if(kb){kb.innerHTML=ins.length?'Astuce : touches A, B, C… pour choisir, Entrée pour valider':(K.ty=='SHORT_ANSWER'||K.ty=='ORDERING'?'Entrée pour valider':'Ctrl + Entrée pour valider');kb.style.display='block'}}
document.onkeydown=function(e){e=e||window.event;var k=e.keyCode||e.which,t=e.target||e.srcElement,tag=(t&&t.tagName||'').toLowerCase();
if(k==13&&(tag!='textarea'||e.ctrlKey||e.metaKey)){if(e.preventDefault)e.preventDefault();if(!sending)send(fields());return false}
if(tag=='textarea'||(tag=='input'&&t.type=='text'))return;var n=-1;if(k>=65&&k<=90)n=k-65;else if(k>=49&&k<=57)n=k-49;else if(k>=97&&k<=105)n=k-97;
if(n>=0&&n<ins.length){var inp=ins[n];inp.checked=inp.type=='checkbox'?!inp.checked:true;refresh()}};
var a=document.querySelectorAll('.ans');for(var i=0;i<a.length;i++){a[i].onpaste=function(e){ev('PASTE');if(K.bp){if(e&&e.preventDefault)e.preventDefault();show('er','Le copier-coller est désactivé pour ce test.');return false}};
if(K.bp){a[i].ondrop=function(e){if(e&&e.preventDefault)e.preventDefault();return false}}}
document.addEventListener('visibilitychange',function(){if(document.hidden){hiddenAt=new Date().getTime()}else if(hiddenAt){ev('TAB_HIDDEN',new Date().getTime()-hiddenAt);hiddenAt=null}});
if(K.fs){document.addEventListener('fullscreenchange',function(){if(!document.fullscreenElement)ev('FULLSCREEN_EXIT')})}
window.onbeforeunload=function(){if(!sending&&!K.pv)return 'Votre réponse ne sera pas enregistrée.'};
document.body.className+=' js';
var ord=document.getElementById('ord');
if(ord){
function its(){return ord.querySelectorAll('.it')}
function renum(){var l=its();for(var i=0;i<l.length;i++){l[i].querySelector('.rk').innerHTML=i+1;l[i].querySelector('select').value=String(i+1);var bs=l[i].querySelectorAll('.mv button');bs[0].disabled=i==0;bs[1].disabled=i==l.length-1}}
function flash(li){li.className='it';void li.offsetWidth;li.className='it moved'}
ord.onclick=function(e){var t=e.target||e.srcElement;if(!t||t.tagName!='BUTTON')return;var li=t.parentNode.parentNode;
if(t.className=='up'&&li.previousElementSibling)ord.insertBefore(li,li.previousElementSibling);else if(t.className=='dn'&&li.nextElementSibling)ord.insertBefore(li.nextElementSibling,li);flash(li);renum();if(!t.disabled)t.focus()};
var dg=null;
ord.addEventListener('pointerdown',function(e){var t=e.target;if(!t||t.tagName=='BUTTON'||t.tagName=='SELECT')return;var li=t.closest?t.closest('.it'):null;if(!li)return;
if(e.pointerType!='mouse'&&t.className!='gr')return;dg=li;li.className='it drag';try{ord.setPointerCapture(e.pointerId)}catch(x){}if(e.preventDefault)e.preventDefault()});
ord.addEventListener('pointermove',function(e){if(!dg)return;var l=its();for(var i=0;i<l.length;i++){if(l[i]==dg)continue;var r=l[i].getBoundingClientRect();
if(e.clientY>r.top&&e.clientY<r.bottom){if(e.clientY<r.top+r.height/2)ord.insertBefore(dg,l[i]);else ord.insertBefore(dg,l[i].nextSibling);renum();break}}});
function drop(){if(dg){dg.className='it moved';dg=null}}
ord.addEventListener('pointerup',drop);ord.addEventListener('pointercancel',drop);
renum()}
var ce=f.querySelector('textarea.code');
if(ce){
ce.onkeydown=function(e){e=e||window.event;var k=e.keyCode,s=ce.selectionStart,en=ce.selectionEnd,v=ce.value;
if(k==9){if(e.preventDefault)e.preventDefault();ce.value=v.substring(0,s)+'  '+v.substring(en);ce.selectionStart=ce.selectionEnd=s+2;return false}
if(k==13&&!e.ctrlKey&&!e.metaKey){var line=v.substring(0,s).split(String.fromCharCode(10)).pop(),ind=(line.match(/^ */)||[''])[0];if(/[{(\[] *$/.test(line))ind+='  ';
if(e.preventDefault)e.preventDefault();ce.value=v.substring(0,s)+String.fromCharCode(10)+ind+v.substring(en);ce.selectionStart=ce.selectionEnd=s+1+ind.length;return false}};
var run=document.getElementById('run'),out=document.getElementById('out'),wk=document.getElementById('wk');
function h(x){return String(x).replace(/[&<>]/g,function(c){return c=='&'?'&amp;':c=='<'?'&lt;':'&gt;'})}
function canon(x){if(x&&typeof x=='object'){if(x instanceof Array){var a=[];for(var i=0;i<x.length;i++)a.push(canon(x[i]));return '['+a.join(',')+']'}var ks=Object.keys(x).sort(),o=[];for(var j=0;j<ks.length;j++)o.push(JSON.stringify(ks[j])+':'+canon(x[ks[j]]));return '{'+o.join(',')+'}'}return JSON.stringify(x)}
function same(g,e){try{return canon(JSON.parse(g))===canon(e)}catch(x){return false}}
function done(d){run.disabled=false;run.innerHTML='▶ Exécuter à nouveau';var ok=0;
for(var i=0;i<K.ex.length;i++){var el=document.getElementById('ex'+i),r=d.r&&d.r[i],pass=!!(r&&!r.e&&same(r.g,K.ex[i].e));if(pass)ok++;
el.className='exl'+(d.r?(pass?' ok':' ko'):'');el.querySelector('.st').innerHTML=!d.r?'':pass?'✓ Réussi':(r&&r.e?'✗ '+h(r.e):'✗ obtenu : '+h(r?r.g:''))}
var m=[];if(d.err)m.push(d.err);if(d.logs&&d.logs.length)m.push('console.log :'+String.fromCharCode(10)+d.logs.join(String.fromCharCode(10)));
out.style.display=m.length?'block':'none';out.className=d.err?'out':'out lg';out.textContent=m.join(String.fromCharCode(10,10));
if(d.r)show(ok==K.ex.length?'ok':'wa',ok==K.ex.length?'Bravo : tous les exemples sont réussis. Vous pouvez valider, ou améliorer votre code.':ok+' exemple(s) réussi(s) sur '+K.ex.length+'. Corrigez votre code puis exécutez à nouveau.')}
run.onclick=function(){if(!window.Worker||!window.Blob||!wk){show('wa','Votre navigateur ne peut pas exécuter le code ici : il sera vérifié après l’envoi.');return}
run.disabled=true;run.innerHTML='Exécution…';var w;
try{w=new Worker(URL.createObjectURL(new Blob([wk.textContent],{type:'text/javascript'})))}catch(x){run.disabled=false;show('wa','Exécution impossible sur ce navigateur : votre code sera vérifié après l’envoi.');return}
var to=setTimeout(function(){w.terminate();done({err:'Temps dépassé : votre code tourne trop longtemps (boucle infinie ?).'})},3000);
w.onmessage=function(e){clearTimeout(to);w.terminate();done(e.data||{})};w.postMessage({code:ce.value,fn:K.fn,ex:K.ex})}}
})();`;

// Exécution des exemples dans le navigateur du candidat (Web Worker : pas d'accès à la page).
// Ce n'est qu'une aide : la note est calculée sur le serveur, dans un bac à sable, avec les tests cachés.
const WORKER_JS = `self.onmessage=function(e){var d=e.data,res=[],logs=[];
self.console={log:function(){var a=[];for(var i=0;i<arguments.length;i++){var x=arguments[i];a.push(typeof x==='string'?x:JSON.stringify(x))}if(logs.length<20)logs.push(a.join(' '))}};
try{var f=(new Function(d.code+String.fromCharCode(10)+';return typeof '+d.fn+'==="function"?'+d.fn+':null;'))();
if(!f){self.postMessage({err:'La fonction '+d.fn+' est introuvable : gardez son nom tel quel.'});return}
for(var i=0;i<d.ex.length;i++){try{var g=f.apply(null,JSON.parse(JSON.stringify(d.ex[i].a)));res.push({g:g===undefined?'undefined':JSON.stringify(g)})}catch(x){res.push({e:String(x)})}}
self.postMessage({r:res,logs:logs})}catch(x){self.postMessage({err:String(x),logs:logs})}};`;

// ───── Fin du test ─────

function contactBlock(c?: { email?: string | null; phone?: string | null }) {
  if (!c?.email && !c?.phone) return "";
  const parts = [
    c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : "",
    c.phone ? `<a href="tel:${esc(c.phone.replace(/[^+0-9]/g, ""))}">${esc(c.phone)}</a>` : "",
  ].filter(Boolean);
  return `<p class="ab ct">Une question sur votre candidature ? ${parts.join(" · ")}</p>`;
}

export function donePage(v: {
  color: string | null;
  companyName: string;
  testTitle: string;
  timedOut: boolean;
  score: number | null;
  showScore: boolean;
  pending: boolean;
  banner?: string;
  contact?: { email?: string | null; phone?: string | null };
}) {
  let scoreBlock = "";
  if (v.showScore) {
    if (v.score !== null) {
      const s = Math.max(0, Math.min(100, Math.round(v.score)));
      const C = 427.26; // 2π × 68
      scoreBlock = `<div class="c done"><h2>Votre score</h2><div class="sc"><svg width="150" height="150" viewBox="0 0 150 150"><circle class="bg" cx="75" cy="75" r="68"/><circle class="fg" cx="75" cy="75" r="68" stroke-dasharray="${C}" stroke-dashoffset="${(C * (1 - s / 100)).toFixed(2)}"/></svg><div><p class="big">${s}</p><small>sur 100</small></div></div></div>`;
    } else if (v.pending) {
      scoreBlock = `<p class="al ok">Certaines réponses sont en cours de correction. Votre score vous sera communiqué par ${esc(v.companyName)}.</p>`;
    }
  }
  scoreBlock = scoreBlock.replace('class="c done"', 'class="c done d1"');
  const body = `<div class="c done"><div class="ic">${CHECK_SVG}</div><h1>Test terminé, merci !</h1>
${v.timedOut ? `<p class="al wa">Le temps du test est écoulé. Les réponses validées avant la fin ont bien été enregistrées.</p>` : `<p class="al ok">✓ Toutes vos réponses ont bien été enregistrées.</p>`}
<p class="m">${esc(v.companyName)} a été prévenu et reviendra vers vous pour la suite du recrutement « ${esc(v.testTitle)} ». Bonne chance !</p>${contactBlock(v.contact)}</div>${scoreBlock}
<p class="ft">Vous pouvez fermer cette page · <b>KTZ Évalue</b></p>`;
  return layout({ title: "Test terminé", color: v.color, body, banner: v.banner });
}

// ───── Lien public : inscription du candidat ─────

export function publicSignupPage(v: {
  publicToken: string;
  color: string | null;
  companyName: string;
  logoUrl?: string | null;
  about?: About;
  testTitle: string;
  durationMinutes: number;
  photo?: string;
  error?: string;
  values?: { name?: string; email?: string; phone?: string };
}) {
  const body = `<div class="c"><div class="ph"${photoStyle(v.photo)}><p class="co">${avatar(v.companyName, v.logoUrl)}<span>${esc(v.companyName)}</span></p></div>
<p class="hi tn">Test de recrutement</p><h1>${esc(v.testTitle)}</h1>
<p class="m">À passer sur téléphone ou ordinateur, sans créer de compte.</p>
${aboutBlock(v.companyName, v.about)}
<div class="st"><div><b>${v.durationMinutes}</b><span>minutes</span></div><div><b>0</b><span>compte à créer</span></div><div><b>3G</b><span>suffit</span></div></div></div>
<form class="c d1" method="post" action="/p/${esc(v.publicToken)}">
<h2>Vos coordonnées</h2>
${v.error ? `<p class="al er">${esc(v.error)}</p>` : ""}
<label class="fl">Nom et prénom<input type="text" name="name" required maxlength="100" autocomplete="name" value="${esc(v.values?.name)}"></label>
<label class="fl">Email<input type="text" name="email" inputmode="email" autocomplete="email" maxlength="200" value="${esc(v.values?.email)}"></label>
<label class="fl">ou numéro de téléphone (WhatsApp)<input type="text" name="phone" inputmode="tel" autocomplete="tel" maxlength="30" value="${esc(v.values?.phone)}"></label>
<p class="m" style="font-size:13px">Un même email ou numéro ne peut passer le test qu'une fois.</p>
<button class="btn" type="submit">Continuer →</button></form>
<p class="ft">Propulsé par <b>KTZ Évalue</b></p>`;
  return layout({ title: v.testTitle, color: v.color, body });
}
