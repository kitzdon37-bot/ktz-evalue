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
const CSS = `*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;font-size:17px;line-height:1.5;color:#1c1917;background:#f6f5f2}
.w{max-width:640px;margin:0 auto;padding:14px 14px 28px}
.c{position:relative;background:#fff;border:1px solid #ebe8e3;border-radius:22px;padding:22px;margin-bottom:14px;box-shadow:0 1px 2px rgba(28,25,23,.04),0 10px 30px -14px rgba(28,25,23,.18)}
h1{font-size:25px;line-height:1.2;margin:0 0 8px;letter-spacing:-.02em}h2{font-size:17px;margin:0 0 12px}p{margin:8px 0}.m{color:#57534e;font-size:15px}
.hero{color:#fff;border:0;overflow:hidden;background:#1c1917;background-image:radial-gradient(circle at 100% 0,var(--b) 0,transparent 55%),linear-gradient(160deg,#2a2622,#13110f)}
.hero:before{content:"";position:absolute;right:-60px;bottom:-80px;width:220px;height:220px;border-radius:50%;background:var(--b);opacity:.35;filter:blur(40px)}
.hero>*{position:relative}.hero .m{color:rgba(255,255,255,.78)}
.co{display:flex;align-items:center;gap:10px;font-weight:700;margin:0 0 16px;font-size:15px}.av{width:40px;height:40px;border-radius:13px;background:var(--b);display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;box-shadow:0 6px 16px -6px rgba(0,0,0,.5)}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.chip{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.16);border-radius:999px;padding:6px 12px;font-size:14px;font-weight:600}
.btn{display:block;width:100%;border:0;border-radius:16px;padding:17px;font-size:18px;font-weight:800;color:#fff;background:var(--b);cursor:pointer;box-shadow:0 10px 22px -10px var(--b),0 2px 4px rgba(0,0,0,.12);-webkit-transition:transform .15s,opacity .2s;transition:transform .15s,opacity .2s}
.btn:active{transform:scale(.98)}.btn[disabled]{opacity:.45;box-shadow:none;cursor:default}.kb{display:block;text-align:center;font-size:12px;color:#a8a29e;margin-top:8px}
.opt{position:relative;display:flex;gap:12px;align-items:center;border:2px solid #ebe8e3;border-radius:16px;padding:13px 14px;margin:10px 0;background:#fff;cursor:pointer;-webkit-transition:border-color .15s,box-shadow .15s,transform .15s;transition:border-color .15s,box-shadow .15s,transform .15s}
.opt:hover{border-color:#d6d3d1}.opt:active{transform:scale(.99)}
.opt input{position:absolute;opacity:0;width:1px;height:1px}
.lt{flex:none;width:34px;height:34px;border-radius:11px;border:2px solid #e7e5e4;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;color:#78716c;background:#fafaf9}
.opt:has(input:checked),.opt.on{border-color:var(--b);box-shadow:0 0 0 4px rgba(0,0,0,.035),0 8px 20px -12px var(--b)}
.opt:has(input:checked) .lt,.opt.on .lt{background:var(--b);border-color:var(--b);color:#fff}
.opt:has(input:focus-visible){outline:3px solid var(--b);outline-offset:2px}
textarea,input[type=text]{width:100%;font:inherit;border:2px solid #ebe8e3;border-radius:16px;padding:14px;background:#fafaf9;-webkit-transition:border-color .15s,background .15s;transition:border-color .15s,background .15s}
textarea:focus,input[type=text]:focus{outline:0;border-color:var(--b);background:#fff}textarea{min-height:190px;resize:vertical}
.cnt{text-align:right;font-size:12px;color:#a8a29e;margin-top:4px}
.q{user-select:none;-webkit-user-select:none;font-size:20px;font-weight:700;line-height:1.4;letter-spacing:-.01em;margin:4px 0 14px}
.tag{display:inline-block;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--b);margin:0 0 6px}
.hd{display:flex;align-items:center;gap:12px;margin:2px 2px 14px}.hd .co{margin:0;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ring{position:relative;width:58px;height:58px;flex:none}.ring svg{display:block;transform:rotate(-90deg)}.ring circle{fill:none;stroke-width:6}.ring .bg{stroke:#ebe8e3}.ring .fg{stroke:var(--b);stroke-linecap:round;-webkit-transition:stroke-dashoffset 1s linear;transition:stroke-dashoffset 1s linear}
.ring b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;letter-spacing:-.02em}
.ring.low .fg{stroke:#dc2626}.ring.low b{color:#dc2626}
.pr{display:flex;justify-content:space-between;align-items:center;font-size:14px;color:#57534e;margin:0 2px 8px}.pr b{color:#1c1917}
.t{font-weight:800;color:#1c1917;background:#fff;border:1px solid #ebe8e3;border-radius:99px;padding:3px 10px;display:inline-block;font-size:13px}
.bar{height:8px;background:#ebe8e3;border-radius:99px;margin:0 2px 14px;overflow:hidden}.bar div{height:8px;background:var(--b);border-radius:99px;-webkit-transition:width .6s;transition:width .6s}
.al{border-radius:14px;padding:12px 14px;margin:12px 0;font-size:15px}.er{background:#fef2f2;color:#991b1b}.ok{background:#f0fdf4;color:#166534}.wa{background:#fffbeb;color:#92400e}
.rl{list-style:none;padding:0;margin:4px 0 0}.rl li{display:flex;gap:12px;align-items:flex-start;margin:0;padding:12px 0;border-top:1px solid #f0eeea;font-size:15px}.rl li:first-child{border-top:0}
.rl i{flex:none;width:32px;height:32px;border-radius:10px;background:#f6f5f2;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:16px}
label.ck{display:flex;gap:12px;align-items:flex-start;margin:14px 0;font-size:15px;color:#44403c}label.ck input{width:22px;height:22px;flex:none;margin-top:1px;accent-color:var(--b)}
label.fl{display:block;font-size:14px;font-weight:700;color:#44403c;margin:14px 0 0}label.fl input{margin-top:6px}
.big{font-size:56px;font-weight:800;letter-spacing:-.03em;margin:0;line-height:1}
.done{text-align:center}.ft{text-align:center;color:#a8a29e;font-size:13px;margin-top:6px}.ft b{color:#78716c}
.ic{width:76px;height:76px;margin:6px auto 14px;border-radius:50%;background:var(--b);color:#fff;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:800;box-shadow:0 14px 30px -12px var(--b)}
.ck2{stroke:#fff;stroke-width:5;fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:48;stroke-dashoffset:48;-webkit-animation:dr .7s .25s ease-out forwards;animation:dr .7s .25s ease-out forwards}
@-webkit-keyframes dr{to{stroke-dashoffset:0}}@keyframes dr{to{stroke-dashoffset:0}}
@-webkit-keyframes up{from{opacity:0;-webkit-transform:translateY(14px)}to{opacity:1;-webkit-transform:none}}@keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.c,.hd,.pr,.bar{-webkit-animation:up .45s ease-out both;animation:up .45s ease-out both}
.sc{position:relative;width:150px;height:150px;margin:6px auto 4px}.sc svg{transform:rotate(-90deg)}.sc circle{fill:none;stroke-width:12}.sc .bg{stroke:#f0eeea}.sc .fg{stroke:var(--b);stroke-linecap:round}
.sc div{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}.sc small{color:#a8a29e;font-size:14px;font-weight:700}
@media (prefers-reduced-motion:reduce){*{-webkit-animation:none!important;animation:none!important;transition:none!important}.ck2{stroke-dashoffset:0}}`;

export function layout(opts: { title: string; color?: string | null; body: string; script?: string }) {
  const color = /^#[0-9a-fA-F]{6}$/.test(opts.color ?? "") ? opts.color : "#ea580c";
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta name="theme-color" content="${color}"><title>${esc(opts.title)}</title><style>:root{--b:${color}}${CSS}</style></head><body><div class="w">${opts.body}</div>${opts.script ? `<script>${opts.script}</script>` : ""}</body></html>`;
}

// Coche dessinée (animation CSS seulement, aucun fichier image).
const CHECK_SVG = `<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><path class="ck2" d="M10 21l7 7 14-15"/></svg>`;

function avatar(companyName: string, logoUrl?: string | null) {
  return logoUrl
    ? `<img src="${esc(logoUrl)}" alt="" style="max-height:40px;max-width:120px;border-radius:10px;background:#fff;padding:2px">`
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

// ───── Accueil du test ─────

export function welcomePage(v: {
  token: string;
  companyName: string;
  color: string | null;
  logoUrl: string | null;
  testTitle: string;
  candidateName: string;
  durationMinutes: number;
  questionCount: number;
  extraTimePercent: number;
  expiresAt: Date;
  webcam: boolean;
  fullscreen: boolean;
  error?: string;
}) {
  const until = v.expiresAt.toLocaleDateString("fr-FR", { timeZone: "Africa/Bangui", day: "numeric", month: "long", year: "numeric" });
  const duration = Math.round(v.durationMinutes * (1 + v.extraTimePercent / 100));
  const body = `<div class="c hero">
<p class="co">${avatar(v.companyName, v.logoUrl)}${esc(v.companyName)}</p>
<p class="m" style="margin:0 0 4px">Bonjour ${esc(v.candidateName)} 👋</p>
<h1>${esc(v.testTitle)}</h1>
<p class="m">Voici le test de recrutement préparé pour vous. Prenez quelques secondes pour lire les règles, puis lancez-vous.</p>
<div class="chips"><span class="chip">⏱ ${duration} min${v.extraTimePercent ? ` (+${v.extraTimePercent} %)` : ""}</span><span class="chip">📝 ${v.questionCount} questions</span><span class="chip">📅 Avant le ${esc(until)}</span></div></div>
<div class="c"><h2>Avant de commencer</h2><ul class="rl">
<li><i>➡️</i><span><b>Une question à la fois.</b> Une réponse validée est définitive : pas de retour en arrière.</span></li>
<li><i>📶</i><span><b>Connexion faible ? Pas de souci.</b> Vos réponses sont gardées sur le téléphone. Si la page se ferme, rouvrez simplement ce lien : le chronomètre, lui, continue.</span></li>
<li><i>🛡️</i><span><b>Restez sur la page.</b> Les sorties de la page, les copier-coller et les réponses très rapides sont signalés au recruteur.</span></li>
${v.fullscreen ? "<li><i>🖥️</i><span>Sur ordinateur, le test s'affiche <b>en plein écran</b>.</span></li>" : ""}
<li><i>1️⃣</i><span>Le test ne se passe <b>qu'une seule fois</b>. Installez-vous au calme.</span></li></ul></div>
<form class="c" method="post" action="/t/${esc(v.token)}" id="f">
<input type="hidden" name="action" value="start">
${v.error ? `<p class="al er">${esc(v.error)}</p>` : ""}
<label class="ck"><input type="checkbox" name="consent" value="1" required><span>J'accepte que mes réponses et les signaux enregistrés pendant le test soient transmis à ${esc(v.companyName)} pour ce recrutement. Ils sont supprimés au plus tard 12 mois après le test.</span></label>
${v.webcam ? `<label class="ck"><input type="checkbox" name="webcam" value="1" required><span>J'accepte que des photos soient prises par la caméra pendant le test (une toutes les 30 à 60 secondes). Elles sont supprimées 90 jours après le test.</span></label>` : ""}
<button class="btn" type="submit">Commencer le test →</button></form>
<p class="ft">Test proposé avec <b>KTZ Évalue</b></p>`;
  const script = v.fullscreen
    ? `(function(){var f=document.getElementById('f');if(!f)return;f.addEventListener('submit',function(){try{if(!/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)){var d=document.documentElement;(d.requestFullscreen||d.webkitRequestFullscreen||function(){}).call(d)}}catch(e){}})})();`
    : undefined;
  return layout({ title: v.testTitle, color: v.color, body, script });
}

// ───── Question ─────

export function questionPage(v: {
  token: string;
  color: string | null;
  companyName: string;
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
}) {
  const q = v.question;
  const choices = new Map((q.choices ?? []).map((c) => [c.id, c.text]));
  const letter = (i: number) => String.fromCharCode(65 + i);
  let field = "";
  let kind = "Réponse écrite";
  if (q.type === "MCQ_SINGLE" || q.type === "MCQ_MULTI") {
    const type = q.type === "MCQ_SINGLE" ? "radio" : "checkbox";
    kind = q.type === "MCQ_SINGLE" ? "QCM · une seule réponse" : "QCM · plusieurs réponses possibles";
    field = (v.choiceOrder ?? [])
      .filter((id) => choices.has(id))
      .map((id, i) => `<label class="opt"><input type="${type}" name="choice" value="${esc(id)}"><span class="lt">${letter(i)}</span><span>${esc(choices.get(id))}</span></label>`)
      .join("");
  } else if (q.type === "TRUE_FALSE") {
    kind = "Vrai ou faux";
    field = `<label class="opt"><input type="radio" name="tf" value="true"><span class="lt">A</span><span>Vrai</span></label><label class="opt"><input type="radio" name="tf" value="false"><span class="lt">B</span><span>Faux</span></label>`;
  } else if (q.type === "SHORT_ANSWER") {
    kind = "Réponse courte";
    field = `<input type="text" name="text" autocomplete="off" maxlength="200" class="ans" aria-label="Votre réponse" placeholder="Votre réponse…">`;
  } else {
    if (q.type === "ORAL") kind = "Question orale";
    const oral = q.type === "ORAL" ? `<p class="al wa">Question orale : l'enregistrement audio arrive bientôt. Pour l'instant, répondez par écrit.</p>` : "";
    field = `${oral}<textarea name="text" maxlength="10000" class="ans" aria-label="Votre réponse" placeholder="Écrivez votre réponse ici…"></textarea><p class="cnt" id="cnt"></p>`;
  }

  // Anneau du chronomètre de la question : circonférence 2πr avec r = 25.
  const C = 157.08;
  const qTotal = Math.max(v.questionTotalSec ?? v.questionRemainingSec, v.questionRemainingSec, 1);
  const offset = (C * (1 - v.questionRemainingSec / qTotal)).toFixed(2);
  const low = v.questionRemainingSec <= Math.max(10, qTotal * 0.2);
  const percent = Math.max(3, Math.round(((v.index - 1) / v.total) * 100));

  const body = `<div class="hd"><p class="co"><span class="av">${esc(v.companyName.slice(0, 1).toUpperCase())}</span>${esc(v.testTitle)}</p>
<div class="ring${low ? " low" : ""}" id="rg" role="timer" aria-label="Temps restant pour cette question"><svg width="58" height="58" viewBox="0 0 58 58"><circle class="bg" cx="29" cy="29" r="25"/><circle class="fg" id="rf" cx="29" cy="29" r="25" stroke-dasharray="${C}" stroke-dashoffset="${offset}"/></svg><b id="qt">${formatDuration(v.questionRemainingSec)}</b></div></div>
<div class="pr"><span>Question <b>${v.index}</b> sur ${v.total}</span><span>Test : <span class="t" id="tt">${formatDuration(v.totalRemainingSec)}</span></span></div>
<div class="bar" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"><div style="width:${percent}%"></div></div>
<form class="c" method="post" action="/t/${esc(v.token)}" id="f">
<input type="hidden" name="action" value="answer"><input type="hidden" name="questionId" value="${esc(q.id)}">
<p class="tag">${esc(kind)}</p>
<p class="q">${esc(q.prompt).replace(/\n/g, "<br>")}</p>${field}
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
  });
  return layout({ title: `Question ${v.index} / ${v.total}`, color: v.color, body, script: `var K=${cfg};${CLIENT_JS}` });
}

// Script du candidat, écrit en JavaScript ancien (ES5) pour les vieux navigateurs.
const CLIENT_JS = `(function(){
var f=document.getElementById('f'),b=document.getElementById('b'),msg=document.getElementById('msg');
var sending=false,start=new Date().getTime(),pk='ktz_p_'+K.t,hiddenAt=null;
function fmt(s){s=Math.max(0,Math.floor(s));var m=Math.floor(s/60),r=s%60;return m+':'+(r<10?'0':'')+r}
function ev(type,extra){try{var d={type:type,questionId:K.q,durationMs:extra||null};var x=new XMLHttpRequest();x.open('POST','/t/'+K.t+'/evenement',true);x.setRequestHeader('Content-Type','application/json');x.send(JSON.stringify(d))}catch(e){}}
function fields(){var o=[],e=f.elements;for(var i=0;i<e.length;i++){var el=e[i];if(!el.name)continue;if((el.type=='radio'||el.type=='checkbox')&&!el.checked)continue;o.push([el.name,el.value])}return o}
function body(o){var s=[];for(var i=0;i<o.length;i++){s.push(encodeURIComponent(o[i][0])+'='+encodeURIComponent(o[i][1]))}return s.join('&')}
function show(cls,t){msg.innerHTML='<p class="al '+cls+'">'+t+'</p>'}
function send(o,retry){sending=true;b.disabled=true;b.innerHTML='Envoi…';var x=new XMLHttpRequest();x.open('POST','/t/'+K.t,true);
x.setRequestHeader('Content-Type','application/x-www-form-urlencoded');x.setRequestHeader('X-KTZ','1');x.timeout=20000;
x.onload=function(){if(x.status>=200&&x.status<300){try{localStorage.removeItem(pk)}catch(e){}var r={};try{r=JSON.parse(x.responseText)}catch(e){}location.replace(r.next||('/t/'+K.t))}else fail(o)};
x.onerror=x.ontimeout=function(){fail(o)};x.send(body(o))}
function fail(o){try{localStorage.setItem(pk,JSON.stringify(o))}catch(e){}show('wa','Pas de réseau : votre réponse est gardée sur le téléphone et sera envoyée dès le retour de la connexion. Ne fermez pas cette page.');setTimeout(function(){send(o,true)},5000)}
try{var p=localStorage.getItem(pk);if(p){var po=JSON.parse(p);var same=false;for(var i=0;i<po.length;i++){if(po[i][0]=='questionId'&&po[i][1]==K.q)same=true}if(same){send(po,true);return}else localStorage.removeItem(pk)}}catch(e){}
f.onsubmit=function(e){if(e&&e.preventDefault)e.preventDefault();if(sending)return false;send(fields());return false};
var rg=document.getElementById('rg'),rf=document.getElementById('rf'),C=157.08,lowAt=Math.max(10,K.qt*0.2);
function tick(){var el=(new Date().getTime()-start)/1000,qr=K.qs-el,tr=K.ts-el;document.getElementById('qt').innerHTML=fmt(qr);document.getElementById('tt').innerHTML=fmt(tr);
if(rf){rf.setAttribute('stroke-dashoffset',(C*(1-Math.max(0,qr)/K.qt)).toFixed(2))}if(rg&&qr<=lowAt&&rg.className.indexOf('low')<0)rg.className+=' low';
if((qr<=0||tr<=0)&&!sending){show('wa','Temps écoulé : votre réponse est envoyée.');send(fields())}}
setInterval(tick,1000);
var opts=f.querySelectorAll('.opt'),ins=f.querySelectorAll('.opt input'),ans=f.querySelector('.ans'),cnt=document.getElementById('cnt');
function answered(){for(var i=0;i<ins.length;i++){if(ins[i].checked)return true}return !!(ans&&ans.value.replace(/\\s/g,''))}
function refresh(){for(var i=0;i<opts.length;i++){var on=opts[i].querySelector('input').checked;opts[i].className=on?'opt on':'opt'}
if(!sending)b.innerHTML=answered()?'Valider ma réponse':'Passer cette question';if(cnt&&ans){var n=ans.value.length;cnt.innerHTML=n?n+' caractère'+(n>1?'s':''):''}}
for(var j=0;j<ins.length;j++){ins[j].onchange=refresh}if(ans){ans.oninput=refresh;ans.onkeyup=refresh}refresh();
var touch='ontouchstart' in window;if(!touch){var kb=document.getElementById('kb');if(kb){kb.innerHTML=ins.length?'Astuce : touches A, B, C… pour choisir, Entrée pour valider':(K.ty=='SHORT_ANSWER'?'Entrée pour valider':'Ctrl + Entrée pour valider');kb.style.display='block'}}
document.onkeydown=function(e){e=e||window.event;var k=e.keyCode||e.which,t=e.target||e.srcElement,tag=(t&&t.tagName||'').toLowerCase();
if(k==13&&(tag!='textarea'||e.ctrlKey||e.metaKey)){if(e.preventDefault)e.preventDefault();if(!sending)send(fields());return false}
if(tag=='textarea'||(tag=='input'&&t.type=='text'))return;var n=-1;if(k>=65&&k<=90)n=k-65;else if(k>=49&&k<=57)n=k-49;else if(k>=97&&k<=105)n=k-97;
if(n>=0&&n<ins.length){var inp=ins[n];inp.checked=inp.type=='checkbox'?!inp.checked:true;refresh()}};
var a=document.querySelectorAll('.ans');for(var i=0;i<a.length;i++){a[i].onpaste=function(e){ev('PASTE');if(K.bp){if(e&&e.preventDefault)e.preventDefault();show('er','Le copier-coller est désactivé pour ce test.');return false}};
if(K.bp){a[i].ondrop=function(e){if(e&&e.preventDefault)e.preventDefault();return false}}}
document.addEventListener('visibilitychange',function(){if(document.hidden){hiddenAt=new Date().getTime()}else if(hiddenAt){ev('TAB_HIDDEN',new Date().getTime()-hiddenAt);hiddenAt=null}});
if(K.fs){document.addEventListener('fullscreenchange',function(){if(!document.fullscreenElement)ev('FULLSCREEN_EXIT')})}
window.onbeforeunload=function(){if(!sending)return 'Votre réponse ne sera pas enregistrée.'};
})();`;

// ───── Fin du test ─────

export function donePage(v: {
  color: string | null;
  companyName: string;
  testTitle: string;
  timedOut: boolean;
  score: number | null;
  showScore: boolean;
  pending: boolean;
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
  const body = `<div class="c done"><div class="ic">${CHECK_SVG}</div><h1>Test terminé, merci !</h1>
${v.timedOut ? `<p class="al wa">Le temps du test est écoulé. Les réponses validées avant la fin ont bien été enregistrées.</p>` : `<p class="al ok">✓ Toutes vos réponses ont bien été enregistrées.</p>`}
<p class="m">${esc(v.companyName)} a été prévenu et reviendra vers vous pour la suite du recrutement « ${esc(v.testTitle)} ». Bonne chance !</p></div>${scoreBlock}
<p class="ft">Vous pouvez fermer cette page · <b>KTZ Évalue</b></p>`;
  return layout({ title: "Test terminé", color: v.color, body });
}

// ───── Lien public : inscription du candidat ─────

export function publicSignupPage(v: {
  publicToken: string;
  color: string | null;
  companyName: string;
  testTitle: string;
  durationMinutes: number;
  error?: string;
  values?: { name?: string; email?: string; phone?: string };
}) {
  const body = `<div class="c hero"><p class="co">${avatar(v.companyName)}${esc(v.companyName)}</p><h1>${esc(v.testTitle)}</h1>
<p class="m">Test de recrutement à passer sur téléphone ou ordinateur, sans créer de compte.</p>
<div class="chips"><span class="chip">⏱ ${v.durationMinutes} min</span><span class="chip">📱 Sans compte</span><span class="chip">📶 Marche en 3G</span></div></div>
<form class="c" method="post" action="/p/${esc(v.publicToken)}">
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
