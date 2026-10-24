// Pages du candidat, en HTML simple : elles doivent rester très légères (< 200 Ko,
// en pratique une dizaine de Ko), s'afficher sur de vieux Android et sur Opera Mini,
// et fonctionner même sans JavaScript (chaque réponse est un simple formulaire).
// Le JavaScript, quand il est disponible, ajoute : chronomètres, envoi automatique
// à la fin du temps, réessai si le réseau coupe, signaux anti-triche.
import type { QuestionData } from "@/lib/tests/model";

export function esc(s: string | null | undefined): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

const CSS = `*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;font-size:17px;line-height:1.5;color:#1c1917;background:#f5f5f0}
.w{max-width:620px;margin:0 auto;padding:16px}.c{background:#fff;border:1px solid #e7e5e4;border-radius:18px;padding:20px;margin-bottom:14px;box-shadow:0 1px 2px rgba(0,0,0,.03),0 6px 18px -8px rgba(0,0,0,.08)}
h1{font-size:23px;line-height:1.25;margin:0 0 8px;letter-spacing:-.01em}h2{font-size:17px;margin:0 0 10px}p{margin:8px 0}.m{color:#57534e;font-size:15px}
.hero{background:var(--b);background-image:linear-gradient(135deg,var(--b),#062a24);color:#fff;border:0}.hero .m{color:rgba(255,255,255,.8)}
.co{display:flex;align-items:center;gap:10px;font-weight:700;margin:0 0 14px}.av{width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-weight:800}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.chip{background:rgba(255,255,255,.15);border-radius:999px;padding:6px 12px;font-size:14px;font-weight:600}
.btn{display:block;width:100%;border:0;border-radius:14px;padding:16px;font-size:18px;font-weight:700;color:#fff;background:var(--b);cursor:pointer;box-shadow:0 4px 12px -4px rgba(0,0,0,.3)}
.btn[disabled]{opacity:.6}.opt{display:flex;gap:12px;align-items:flex-start;border:2px solid #e7e5e4;border-radius:14px;padding:14px;margin:10px 0;background:#fff;cursor:pointer}
.opt:has(input:checked),.opt.on{border-color:var(--b);background:#effcf8}.opt input{width:22px;height:22px;flex:none;margin:1px 0 0;accent-color:var(--b)}
textarea,input[type=text]{width:100%;font:inherit;border:2px solid #e7e5e4;border-radius:14px;padding:13px;background:#fff}textarea:focus,input[type=text]:focus{outline:0;border-color:var(--b)}
textarea{min-height:180px}.q{user-select:none;-webkit-user-select:none;font-size:19px;font-weight:600;line-height:1.4}.bar{height:8px;background:#e7e5e4;border-radius:99px;margin:10px 0 16px;overflow:hidden}
.bar div{height:8px;background:var(--b);border-radius:99px}.top{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:14px;color:#57534e}
.t{font-weight:800;color:#1c1917;background:#fff;border:1px solid #e7e5e4;border-radius:99px;padding:3px 10px;display:inline-block}.al{border-radius:12px;padding:12px 14px;margin:10px 0;font-size:15px}.er{background:#fef2f2;color:#991b1b}
.ok{background:#effcf8;color:#12473e}.wa{background:#fffbeb;color:#92400e}ul{padding-left:20px;margin:8px 0}li{margin:6px 0}
label.ck{display:flex;gap:12px;align-items:flex-start;margin:12px 0;font-size:15px}label.ck input{width:22px;height:22px;flex:none;accent-color:var(--b)}.big{font-size:52px;font-weight:800;letter-spacing:-.02em;margin:4px 0}
.done{text-align:center}.ic{width:64px;height:64px;border-radius:50%;background:#effcf8;color:var(--b);display:flex;align-items:center;justify-content:center;font-size:34px;margin:6px auto 12px}.ft{text-align:center;color:#a8a29e;font-size:13px}`;

export function layout(opts: { title: string; color?: string | null; body: string; script?: string }) {
  const color = /^#[0-9a-fA-F]{6}$/.test(opts.color ?? "") ? opts.color : "#136b5a";
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(opts.title)}</title><style>:root{--b:${color}}${CSS}</style></head><body><div class="w">${opts.body}</div>${opts.script ? `<script>${opts.script}</script>` : ""}</body></html>`;
}

export function messagePage(title: string, message: string, color?: string | null) {
  return layout({ title, color, body: `<div class="c done"><div class="ic">i</div><h1>${esc(title)}</h1><p class="m">${esc(message)}</p></div><p class="ft">KTZ Évalue</p>` });
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
<p class="co">${v.logoUrl ? `<img src="${esc(v.logoUrl)}" alt="" style="max-height:38px;max-width:120px;border-radius:8px;background:#fff">` : `<span class="av">${esc(v.companyName.slice(0, 1).toUpperCase())}</span>`}${esc(v.companyName)}</p>
<h1>${esc(v.testTitle)}</h1>
<p class="m">Bonjour ${esc(v.candidateName)}, voici le test de recrutement préparé pour vous.</p>
<div class="chips"><span class="chip">⏱ ${duration} min${v.extraTimePercent ? ` (+${v.extraTimePercent} %)` : ""}</span><span class="chip">${v.questionCount} questions</span><span class="chip">Avant le ${esc(until)}</span></div></div>
<div class="c"><h2>Règles</h2><ul>
<li>Pas de retour en arrière : une réponse validée est définitive.</li>
<li>Le chronomètre continue même si vous fermez la page ou perdez le réseau. Rouvrez simplement ce lien pour reprendre.</li>
<li>Les sorties de la page, les copier-coller et les réponses très rapides sont enregistrés et signalés au recruteur.</li>
${v.fullscreen ? "<li>Sur ordinateur, le test s'affiche en plein écran.</li>" : ""}
<li>Le test ne se passe qu'une seule fois.</li></ul></div>
<form class="c" method="post" action="/t/${esc(v.token)}" id="f">
<input type="hidden" name="action" value="start">
${v.error ? `<p class="al er">${esc(v.error)}</p>` : ""}
<label class="ck"><input type="checkbox" name="consent" value="1" required><span>J'accepte que mes réponses et les signaux enregistrés pendant le test soient transmis à ${esc(v.companyName)} pour ce recrutement. Ils sont supprimés au plus tard 12 mois après le test.</span></label>
${v.webcam ? `<label class="ck"><input type="checkbox" name="webcam" value="1" required><span>J'accepte que des photos soient prises par la caméra pendant le test (une toutes les 30 à 60 secondes). Elles sont supprimées 90 jours après le test.</span></label>` : ""}
<button class="btn" type="submit">Commencer le test</button></form>
<p class="ft">Test proposé avec KTZ Évalue</p>`;
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
  totalRemainingSec: number;
  blockPaste: boolean;
  requireFullscreen: boolean;
}) {
  const q = v.question;
  const choices = new Map((q.choices ?? []).map((c) => [c.id, c.text]));
  let field = "";
  if (q.type === "MCQ_SINGLE" || q.type === "MCQ_MULTI") {
    const type = q.type === "MCQ_SINGLE" ? "radio" : "checkbox";
    field =
      (q.type === "MCQ_MULTI" ? `<p class="m">Plusieurs réponses possibles.</p>` : "") +
      (v.choiceOrder ?? [])
        .filter((id) => choices.has(id))
        .map((id) => `<label class="opt"><input type="${type}" name="choice" value="${esc(id)}"><span>${esc(choices.get(id))}</span></label>`)
        .join("");
  } else if (q.type === "TRUE_FALSE") {
    field = `<label class="opt"><input type="radio" name="tf" value="true"><span>Vrai</span></label><label class="opt"><input type="radio" name="tf" value="false"><span>Faux</span></label>`;
  } else if (q.type === "SHORT_ANSWER") {
    field = `<input type="text" name="text" autocomplete="off" maxlength="200" class="ans" aria-label="Votre réponse">`;
  } else {
    const oral = q.type === "ORAL" ? `<p class="m">Question orale : l'enregistrement audio arrive bientôt. Pour l'instant, répondez par écrit.</p>` : "";
    field = `${oral}<textarea name="text" maxlength="10000" class="ans" aria-label="Votre réponse"></textarea>`;
  }

  const body = `<div class="top"><b>Question ${v.index} / ${v.total}</b><span>⏱ <span class="t" id="qt">${formatDuration(v.questionRemainingSec)}</span> · test <span class="t" id="tt">${formatDuration(v.totalRemainingSec)}</span></span></div>
<div class="bar"><div style="width:${Math.max(3, Math.round(((v.index - 1) / v.total) * 100))}%"></div></div>
<form class="c" method="post" action="/t/${esc(v.token)}" id="f">
<input type="hidden" name="action" value="answer"><input type="hidden" name="questionId" value="${esc(q.id)}">
<p class="q">${esc(q.prompt).replace(/\n/g, "<br>")}</p>${field}
<div id="msg"></div><button class="btn" type="submit" id="b">Valider</button></form>
<p class="ft">${esc(v.companyName)} · ${esc(v.testTitle)}</p>`;

  const cfg = JSON.stringify({
    t: v.token,
    q: q.id,
    qs: v.questionRemainingSec,
    ts: v.totalRemainingSec,
    bp: v.blockPaste,
    fs: v.requireFullscreen,
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
setInterval(function(){var el=(new Date().getTime()-start)/1000,qr=K.qs-el,tr=K.ts-el;document.getElementById('qt').innerHTML=fmt(qr);document.getElementById('tt').innerHTML=fmt(tr);
if((qr<=0||tr<=0)&&!sending){show('wa','Temps écoulé : votre réponse est envoyée.');send(fields())}},1000);
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
    scoreBlock =
      v.score !== null
        ? `<div class="c done"><p class="m">Votre score</p><p class="big">${Math.round(v.score)}<span style="font-size:22px;color:#a8a29e">/100</span></p></div>`
        : v.pending
          ? `<p class="al ok">Certaines réponses sont en cours de correction. Votre score vous sera communiqué par ${esc(v.companyName)}.</p>`
          : "";
  }
  const body = `<div class="c done"><div class="ic">✓</div><h1>Test terminé, merci !</h1>
${v.timedOut ? `<p class="al wa">Le temps du test est écoulé. Les réponses validées avant la fin ont bien été enregistrées.</p>` : `<p class="al ok">Toutes vos réponses ont bien été enregistrées.</p>`}
<p>${esc(v.companyName)} a été prévenu et reviendra vers vous pour la suite du recrutement « ${esc(v.testTitle)} ».</p></div>${scoreBlock}
<p class="ft">Vous pouvez fermer cette page.</p>`;
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
  const body = `<div class="c hero"><p class="co"><span class="av">${esc(v.companyName.slice(0, 1).toUpperCase())}</span>${esc(v.companyName)}</p><h1>${esc(v.testTitle)}</h1>
<p class="m">Test de recrutement de ${v.durationMinutes} minutes, à passer sur téléphone ou ordinateur, sans créer de compte. Un même email ou numéro ne peut passer le test qu'une fois.</p></div>
<form class="c" method="post" action="/p/${esc(v.publicToken)}">
${v.error ? `<p class="al er">${esc(v.error)}</p>` : ""}
<p><label>Nom et prénom<br><input type="text" name="name" required maxlength="100" value="${esc(v.values?.name)}"></label></p>
<p><label>Email<br><input type="text" name="email" inputmode="email" maxlength="200" value="${esc(v.values?.email)}"></label></p>
<p><label>ou numéro de téléphone (WhatsApp)<br><input type="text" name="phone" inputmode="tel" maxlength="30" value="${esc(v.values?.phone)}"></label></p>
<button class="btn" type="submit">Continuer</button></form>`;
  return layout({ title: v.testTitle, color: v.color, body });
}
