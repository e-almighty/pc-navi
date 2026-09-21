'use strict';
// パソコン相談ナビ
// 文面のルール：句読点は使わず全角スペースで区切る／お客様に負担を突きつけず店側から申し出る聞き方にする
// 質問文 lead・title・help は「文節の配列」で書く（画面では文節の切れ目でだけ改行される）
// help は行ごとの配列  [[1行目の文節…],[2行目の文節…]]   強調したい所は <strong class="warn">…</strong>
const QUESTION_COUNT=10;
const QUESTIONS = {
 // 1 入口
 start:{label:'パソコンのご購入について',title:['今回のパソコンは','どのように','選ばれましたか？'],help:[['ご購入時の状況に近い方を選んでください']],yesLabel:'ご自身で選んだ',noLabel:'スタッフのおすすめ',yes:'ご自身で選んで購入した',no:'店頭スタッフに勧められて購入した',next:{yes:'aiSelf',no:'aiStaff'}},
 // 2 AI
 aiSelf:{label:'AIという新しいパートナー',lead:['今回ご購入されたパソコンは','AIをご利用いただけるパソコンになります'],title:['AIを','「あなたのパートナー」として','活用できることを','ご存じでしたか？'],help:[['これからのパソコンは','AIと一緒に考えたり','作業を進めたりする','一台にもなります　','AIを身近な相談相手として','活用できます']],yes:'知っていた・イメージできる',no:'知らなかった・詳しく知りたい',next:{yes:'selfSetup',no:'aiSetup'}},
 aiStaff:{label:'AIという新しいパートナー',lead:['今回ご購入されたパソコンは','AIをご利用いただけるパソコンになります'],title:['AIを','「あなたのパートナー」として','活用できることを','ご存じでしたか？'],help:[['これからのパソコンは','AIと一緒に考えたり','作業を進めたりする','一台にもなります　','AIを身近な相談相手として','活用できます']],yes:'知っていた・イメージできる',no:'知らなかった・詳しく知りたい',next:{yes:'staffConcern',no:'aiSetup'}},
 // 3 使い始めの不安
 selfSetup:{label:'初期設定について',title:['使い始めるための','初期設定は','ご自身で','できそうですか？'],help:[['インターネットへの接続','アカウントの設定','更新など'],['ひとりで進めるのが不安な場合は','「いいえ」を選んでください']],yes:'自分で進められそう',no:'手伝ってほしい・不安がある',anxious:'no',next:{yes:'account',no:'account'}},
 staffConcern:{label:'ご購入後の気がかり',title:['新しいパソコンの設定や','使い始める準備に','不安はありますか？'],help:[['「何から始めたらいいかわからない」','「設定を一緒にやってほしい」など'],['小さなことでも大丈夫です']],yes:'気になることがある',no:'今のところ不安はない',anxious:'yes',next:{yes:'account',no:'account'}},
 aiSetup:{label:'AIと使い始める準備',title:['初期設定や','AIの使い始めを','一緒に確認して','ほしいですか？'],help:[['AIは調べたいことの整理や','文章づくりを手伝う','相談相手になります'],['初期設定とあわせて','基本の設定をご案内できます']],yes:'一緒に確認してほしい',no:'まずは自分で試したい',anxious:'yes',next:{yes:'account',no:'account'}},
 // 4〜8 気づきの質問（いいえ＝まだ備えができていない）
 account:{label:'Microsoftアカウント',lead:['このパソコンは','Microsoftアカウントが','すべてのカギになります'],title:['メールアドレスと','パスワードを','控えてありますか？'],summary:'Microsoftアカウントのメールアドレスとパスワードを控えてありますか？',help:[['忘れてしまうと','Officeの入れ直しや','回復キーの確認が'],['<strong class="warn">できなくなることがあります</strong>']],yes:'控えてある・すぐに言える',no:'まだ・自信がない',gap:'Microsoftアカウントの控えがまだできていません',next:{yes:'office',no:'office'}},
 office:{label:'Officeの種類と期限',lead:['Officeには「買い切り」と「定期払い」があり','使い始めの手続きに期限がある場合もあります'],title:['ご自分のOfficeの','種類と期限を','ご存じですか？'],help:[['Office 2024は買い切り','Microsoft 365は定期払いです'],['期限を過ぎると','<strong class="warn">特典が取り消される</strong>','ことがあります']],yes:'どちらも分かっている',no:'分からない・確認したい',gap:'Officeの種類と使い始めの期限が未確認です',next:{yes:'bitlocker',no:'bitlocker'}},
 bitlocker:{label:'大切なデータを守る仕組み',lead:['最近のパソコンは','中のデータが自動で','暗号化されることがあります'],title:['「BitLocker」という','仕組みを','ご存じですか？'],help:[['パソコンの中のデータを','他の人に読まれにくくする','仕組みです'],['知らないうちに','有効になっている場合があります']],yes:'だいたい分かる',no:'初めて聞いた',gap:'BitLocker（データの暗号化）をご存じありませんでした',next:{yes:'bitlockerKey',no:'bitlockerKey'}},
 bitlockerKey:{label:'BitLockerの回復キー',lead:['ある日突然','「回復キーを入力してください」と','表示されることがあります'],title:['48桁の回復キーを','すぐに用意できますか？'],help:[['回復キーが見つからないと','パソコンを初期化するしかなく'],['<strong class="warn">中のデータはすべて消えます</strong>　','Microsoftでも再発行はできません']],yes:'保管先を確認してある',no:'用意できない・分からない',gap:'回復キーをすぐに用意できる状態ではありません',next:{yes:'recovery',no:'recovery'}},
 recovery:{label:'いざというときの備え',lead:['リカバリメディアは','多くのパソコンに付属していません','使い始めにご自身で作る必要があります'],title:['パソコンを元に戻すための','「リカバリメディア」を','ご存じですか？'],help:[['パソコンを買ったときの状態に','戻すためのUSBメモリーです'],['<strong class="warn">起動しなくなってからでは作れません</strong>　','必ず必要な備えです']],yes:'知っている・作るつもりでいる',no:'初めて聞いた・分からない',gap:'リカバリメディアをご存じありませんでした　使い始めに作成が必要です',next:{yes:'homeSetup',no:'homeSetup'}},
 // 9 訪問パックの判定（はい＝来てほしい）
 homeSetup:{label:'ご自宅での接続と設定',lead:['パソコンはご自宅のインターネットや','プリンターにつないで初めて使えます'],title:['ご自宅まで伺って','すぐに使える状態まで','お手伝いさせていただきましょうか？'],summary:'ご自宅まで伺ってすぐに使える状態までのお手伝いをご希望ですか？',help:[['Wi-Fiやプリンターの接続は','つまずきやすいところです'],['ご自宅で一緒に設定できます']],yes:'来てもらえると安心',no:'自分でできそう',next:{yes:'effort',no:'effort'}},
 // 10 締め（はい＝おまかせ）
 effort:{label:'設定にかかる時間と手間',lead:['ここまでの確認と設定には','8時間から10時間かかります'],title:['その時間とお手間を','私たちに','おまかせいただけますでしょうか？'],summary:'設定の時間（8時間から10時間）とお手間をおまかせいただけますでしょうか？',help:[['おまかせいただければ','お客様のお手間はゼロ'],['動作を確かめてから','お渡しします']],yes:'まかせて手間をゼロにしたい',no:'まずは自分でやってみる',next:{yes:'result',no:'result'}}
};
const GAP_IDS=['account','office','bitlocker','bitlockerKey','recovery'];
const phr=parts=>parts.map(p=>'<span class="ph">'+p+'</span>').join('');
const plain=parts=>parts.join('').replace(/<[^>]+>/g,'');
const titleText=q=>q.summary || plain(q.title);

// サポートパック（2026-09-20 SHO指定）
// すべてのお客様に必ず3パックのどれかを提案する
// （絶対ルール：1ページ目「スタッフのおすすめ」または2ページ目「いいえ」の方には100%どれかを出す）
const PACKS = {
 visit:{name:'安心訪問バックアップパック',parts:['安心訪問','バックアップ','パック'],badge:'訪問サポート付き',headline:['ご自宅まで伺う','訪問パックがおすすめです'],desc:'ご自宅に伺う訪問サポート付きのパックです　ご自宅のインターネットや機器の設定が難しい・不安という方におすすめします'},
 backup:{name:'安心バックアップパック',parts:['安心','バックアップ','パック'],badge:'当店いちばんのおすすめ',headline:['いちばん安心できる','安心バックアップパックがおすすめです'],desc:'当店いちばんのおすすめです　3つのパックの中でいちばん安心してお使いいただけるパックです'},
 standard:{name:'スタンダードパック',parts:['スタンダード','パック'],badge:'まずはスムーズに',headline:['店頭の','スタンダードパックで十分です'],desc:'まずはスタートをスムーズに切りたいという方におすすめのパックです'}
};
const PACK_ORDER=['visit','backup','standard'];
const answerOf=id=>history.find(h=>h.id===id)?.answer;
const gapList=()=>GAP_IDS.filter(id=>answerOf(id)==='no');
const isAnxious=()=>history.some(h=>QUESTIONS[h.id].anxious===h.answer);
function packKey(){
 // ご自宅まで来てほしい → 訪問付き
 if(answerOf('homeSetup')==='yes')return 'visit';
 // まずは自分でやってみる方で 不安がなく 備えの抜けも少ない → スタンダードで十分
 if(answerOf('effort')==='no'&&!isAnxious()&&gapList().length<=2)return 'standard';
 // それ以外は当店いちばんのおすすめ
 return 'backup';
}
function recommendation(){
 const key=packKey(),pack=PACKS[key];
 const reasons=gapList().map(id=>QUESTIONS[id].gap);
 if(answerOf('homeSetup')==='yes')reasons.unshift('ご自宅での接続や設定に訪問をご希望です');
 if(answerOf('effort')==='yes')reasons.push('設定の時間とお手間はおまかせしたいとのご希望です');
 if(isAnxious())reasons.push('使い始めの設定に不安をお持ちです');
 if(!reasons.length)reasons.push('備えはしっかりできています　使い始めをスムーズにするお手伝いをします');
 return {key,pack,name:pack.name,reasons};
}

// 集計（裏メニュー）
// 回答はこのiPadの中だけに保存する（外部には送らない）　個人を特定する情報は記録しない
// 開き方：右上の「約3分・全10問」を続けて5回タップ
const STORE_KEY='pcnavi.records.v1';
const POS={start:1,aiSelf:2,aiStaff:2,selfSetup:3,staffConcern:3,aiSetup:3,account:4,office:5,bitlocker:6,bitlockerKey:7,recovery:8,homeSetup:9,effort:10};
const STAT_ROWS=[['start'],['aiSelf','aiStaff'],['selfSetup'],['staffConcern'],['aiSetup'],['account'],['office'],['bitlocker'],['bitlockerKey'],['recovery'],['homeSetup'],['effort']];
const Q3_TAG={selfSetup:'ご自身で選んだ方',staffConcern:'スタッフおすすめの方',aiSetup:'AIをご存じなかった方'};
const SETTINGS_KEY='pcnavi.settings.v1';
let sessionId=null,syncing=false,syncNote='';
const loadRecords=()=>{try{return JSON.parse(localStorage.getItem(STORE_KEY))||[];}catch(e){return [];}};
const saveRecords=list=>{try{localStorage.setItem(STORE_KEY,JSON.stringify(list));return true;}catch(e){return false;}};
// 送信先（Googleスプレッドシートの受付窓口）は最初から入れておく（2026-09-20 SHO判断：iPadでの入力の手間をなくす）
// 合言葉はプログラムの中には書かない　iPadごとに裏メニューで入力する　合言葉が合わない送信は受付窓口がすべて断る
const DEFAULT_URL='https://script.google.com/macros/s/AKfycbxvQYncrVIIjOfNPWv-6807SkNf94cQfMGKRbK21TNwXIl_e6zpe1pzaMcUsZpoZ0Y/exec';
const loadSettings=()=>{let s={};try{s=JSON.parse(localStorage.getItem(SETTINGS_KEY))||{};}catch(e){}return {device:s.device||'',url:s.url||DEFAULT_URL,pass:s.pass||''};};
const saveSettings=s=>{try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(s));}catch(e){}};
function recordSession(consult){
 if(!sessionId)sessionId=Date.now().toString(36)+Math.random().toString(36).slice(2,6);
 const list=loadRecords(),i=list.findIndex(r=>r.id===sessionId);
 const rec={id:sessionId,at:i>=0?list[i].at:new Date().toISOString(),device:loadSettings().device,answers:history.map(h=>({q:h.id,a:h.answer})),pack:packKey(),consult:consult || (i>=0?list[i].consult:null),outcome:i>=0?(list[i].outcome||null):null,sent:false};
 if(i>=0)list[i]=rec;else list.push(rec);
 saveRecords(list);
 syncRecords();
}
// 成約の結果（スタッフが記録する）　値は visit / backup / standard（そのパックで成約）・lost（未成約）・null（未記入）
function setOutcome(id,value){
 const list=loadRecords(),i=list.findIndex(r=>r.id===id);
 if(i<0)return;
 list[i].outcome=value || null;
 list[i].sent=false;
 saveRecords(list);
 syncRecords();
}
const outcomeLabel=v=>v==='lost'?'未成約':PACKS[v]?'成約':'未記入';
const outcomePack=v=>PACKS[v]?PACKS[v].name:'';
// 未送信の記録を1件ずつ受付窓口へ送る　同じお客様の記録は上書きされる　電波がないときは次の機会に送る
function toRow(r){
 const cells=Array.from({length:QUESTION_COUNT},(_,i)=>{const x=r.answers.find(v=>POS[v.q]===i+1);return x?answerLabel(x.q,x.a):'';});
 const q3=r.answers.find(v=>POS[v.q]===3);
 return {id:r.id,at:when(r.at),device:r.device || loadSettings().device,answers:cells,q3:q3?Q3_TAG[q3.q]:'',pack:PACKS[r.pack]?PACKS[r.pack].name:'',consult:consultLabel(r.consult),outcome:outcomeLabel(r.outcome),outcomePack:outcomePack(r.outcome)};
}
async function syncRecords(){
 const s=loadSettings();
 if(!s.url||!s.pass||syncing)return;
 syncing=true;
 try{
  for(const r of loadRecords().filter(v=>!v.sent)){
   const res=await fetch(s.url,{method:'POST',body:JSON.stringify({pass:s.pass,record:toRow(r)})});
   const out=await res.json();
   if(!out.ok)throw new Error(out.error || '受付窓口がエラーを返しました');
   const list=loadRecords(),i=list.findIndex(v=>v.id===r.id);
   // 送信中にお客様が最後の選択を変えた場合は未送信のままにして次に送り直す
   if(i>=0&&JSON.stringify(list[i].answers)===JSON.stringify(r.answers)&&list[i].consult===r.consult&&(list[i].outcome||null)===(r.outcome||null)){list[i].sent=true;saveRecords(list);}
  }
  syncNote='送信できました（'+when(new Date().toISOString())+'）';
 }catch(e){syncNote='送信できませんでした：'+e.message;}
 syncing=false;
 if(screen==='admin'&&!(document.activeElement&&document.activeElement.matches('input')))render(false);
}
window.addEventListener('online',syncRecords);
const answerLabel=(q,a)=>q==='start'?(a==='yes'?'ご自身':'スタッフ'):(a==='yes'?'はい':'いいえ');
const consultLabel=c=>c==='yes'?'相談したい':c==='no'?'保留':'未選択';
const when=iso=>{const d=new Date(iso),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'/'+p(d.getMonth()+1)+'/'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes());};
function adminView(){
 const list=loadRecords(),total=list.length,set=loadSettings(),unsent=list.filter(r=>!r.sent).length;
 const esc=t=>String(t).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
 const pct=(n,d)=>d?Math.round(n/d*100):0;
 const rows=STAT_ROWS.map(ids=>{
  let yes=0,no=0;
  for(const r of list)for(const x of r.answers)if(ids.includes(x.q)){if(x.a==='yes')yes++;else no++;}
  const q=QUESTIONS[ids[0]],n=yes+no,first=ids[0]==='start';
  return `<tr><th>${POS[ids[0]]}</th><td class="q">${titleText(q)}${Q3_TAG[ids[0]]?`<small>${Q3_TAG[ids[0]]}に表示</small>`:''}</td><td class="num">${n}</td><td class="num yes">${first?'ご自身 ':'はい '}${yes}<small>${pct(yes,n)}%</small></td><td class="num no">${first?'スタッフ ':'いいえ '}${no}<small>${pct(no,n)}%</small></td><td class="bar"><span style="width:${pct(yes,n)}%"></span></td></tr>`;
 }).join('');
 const packs=PACK_ORDER.map(k=>{const n=list.filter(r=>r.pack===k).length;return `<tr><td class="q">${PACKS[k].name}</td><td class="num">${n}<small>${pct(n,total)}%</small></td></tr>`;}).join('');
 const consults=['yes','no',null].map(c=>{const n=list.filter(r=>(r.consult||null)===c).length;return `<tr><td class="q">${consultLabel(c)}</td><td class="num">${n}<small>${pct(n,total)}%</small></td></tr>`;}).join('');
 const won=list.filter(r=>PACKS[r.outcome]).length,lost=list.filter(r=>r.outcome==='lost').length,blank=total-won-lost;
 const outcomes=[['成約',won],['未成約',lost],['未記入',blank]].map(v=>`<tr><td class="q">${v[0]}</td><td class="num">${v[1]}<small>${pct(v[1],total)}%</small></td></tr>`).join('')+`<tr><td class="q"><b>成約率</b>（成約 ÷ 成約と未成約の合計）</td><td class="num">${won+lost?pct(won,won+lost)+'%':'-'}</td></tr>`;
 const wonPacks=PACK_ORDER.map(k=>{const n=list.filter(r=>r.outcome===k).length;return `<tr><td class="q">${PACKS[k].name}</td><td class="num">${n}<small>${pct(n,won)}%</small></td></tr>`;}).join('');
 const people=list.slice().reverse().slice(0,300).map(r=>{
  const cells=Array.from({length:QUESTION_COUNT},(_,i)=>{const x=r.answers.find(v=>POS[v.q]===i+1);return x?`<td class="${x.a}">${answerLabel(x.q,x.a)}</td>`:'<td>-</td>';}).join('');
  return `<tr><td class="when">${when(r.at)}</td>${cells}<td class="q">${PACKS[r.pack]?PACKS[r.pack].name:'-'}</td><td>${consultLabel(r.consult)}</td><td><select class="admin-outcome" data-id="${r.id}"><option value="">未記入</option>${PACK_ORDER.map(k=>`<option value="${k}" ${r.outcome===k?'selected':''}>成約 ${PACKS[k].name}</option>`).join('')}<option value="lost" ${r.outcome==='lost'?'selected':''}>未成約</option></select></td></tr>`;
 }).join('');
 return `<section class="admin"><div class="admin-head"><div><span class="tag">スタッフ専用</span><h1>回答の集計</h1><p>このiPadで記録されたお客様 <b>${total}</b> 人　${set.pass?`未送信 <b>${unsent}</b> 件`:'合言葉が未設定のためこのiPadの中だけに保存しています'}</p></div><div class="admin-actions"><button class="admin-button" data-action="admin-csv" ${total?'':'disabled'}>CSVで書き出す</button><button class="admin-button danger" data-action="admin-clear" ${total?'':'disabled'}>記録をすべて消す</button><button class="admin-button primary" data-action="admin-close">お客様の画面に戻る</button></div></div>
 <h2>このiPadの設定</h2><div class="admin-settings"><label>iPadの名前<input id="set-device" value="${esc(set.device)}" placeholder="例 iPad 1号機"></label><label>送信先URL（入力済み・そのままでOK）<input id="set-url" value="${esc(set.url)}" placeholder="https://script.google.com/macros/s/…/exec" inputmode="url" autocapitalize="off" autocorrect="off"></label><label>合言葉<span class="pass-row"><input id="set-pass" type="password" value="${esc(set.pass)}" autocomplete="off" autocapitalize="off" autocorrect="off"><button type="button" class="admin-button small" data-action="admin-peek">見る</button></span></label><div class="admin-actions"><button class="admin-button primary" data-action="admin-save">設定を保存</button><button class="admin-button" data-action="admin-sync" ${set.pass&&unsent?'':'disabled'}>未送信を今すぐ送る</button></div><p class="admin-note">${syncNote || 'すべてのiPadの集計はGoogleスプレッドシートに集まります　この画面の集計はこのiPadの分だけです'}</p></div>
 <div class="admin-two"><div><h2>成約の結果</h2><table class="admin-table"><tbody>${outcomes}</tbody></table></div><div><h2>成約したパック</h2><table class="admin-table"><tbody>${wonPacks}</tbody></table></div></div>
 <h2>質問ごとの集計（このiPadの分）</h2><div class="admin-scroll"><table class="admin-table"><thead><tr><th>問</th><th>質問</th><th>回答数</th><th>はい</th><th>いいえ</th><th>はいの割合</th></tr></thead><tbody>${rows}</tbody></table></div>
 <div class="admin-two"><div><h2>おすすめしたパック</h2><table class="admin-table"><tbody>${packs}</tbody></table></div><div><h2>最後の選択</h2><table class="admin-table"><tbody>${consults}</tbody></table></div></div>
 <h2>お客様ごとの回答（新しい順）</h2><div class="admin-scroll"><table class="admin-table people"><thead><tr><th>日時</th>${Array.from({length:QUESTION_COUNT},(_,i)=>`<th>${i+1}</th>`).join('')}<th>おすすめパック</th><th>最後の選択</th><th>成約の結果（ここで記録・修正できます）</th></tr></thead><tbody>${people || `<tr><td colspan="${QUESTION_COUNT+4}">まだ記録がありません</td></tr>`}</tbody></table></div></section>`;
}
function exportCsv(){
 const head=['日時',...Array.from({length:QUESTION_COUNT},(_,i)=>(i+1)+'問目'),'3問目の種類','おすすめパック','最後の選択','成約','成約したパック'];
 const lines=loadRecords().map(r=>{
  const cells=Array.from({length:QUESTION_COUNT},(_,i)=>{const x=r.answers.find(v=>POS[v.q]===i+1);return x?answerLabel(x.q,x.a):'';});
  const q3=r.answers.find(v=>POS[v.q]===3);
  return [when(r.at),...cells,q3?Q3_TAG[q3.q]:'',PACKS[r.pack]?PACKS[r.pack].name:'',consultLabel(r.consult),outcomeLabel(r.outcome),outcomePack(r.outcome)];
 });
 const csv='\ufeff'+[head,...lines].map(row=>row.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\r\n');
 const d=new Date(),p=n=>String(n).padStart(2,'0'),name='pc-navi-'+d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'.csv';
 const file=new File([csv],name,{type:'text/csv'});
 if(navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],title:name}).catch(()=>{});return;}
 const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

const main=document.getElementById('main');
let history=[],screen='start';
const tick='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const cross='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke-linecap="round"/></svg>';
function aside(stage){return `<aside class="sidebar"><div class="eyebrow">PC SUPPORT GUIDE</div><h2>新しい一台を<br>安心して<br>使い始める　</h2><div class="steps">${['質問に答える','提案を見る','相談につなぐ'].map((t,i)=>`<div class="step ${stage===i?'current':stage>i?'complete':''}" ${stage===i?'aria-current="step"':''}><span class="step-index">${stage>i?'✓':i+1}</span><span>${t}</span></div>`).join('')}</div><div class="side-bottom"><strong class="reassurance"><span>難しく考えなくて</span><span>大丈夫</span></strong><br>今の気持ちに近い方を<br>選んでください　</div></aside>`;}
function choice(answer,label,sub){return `<button class="choice ${answer==='no'?'no':''}" data-answer="${answer}"><span class="choice-label">${answer==='yes'?tick:cross}${label}</span><small>${sub}</small></button>`;}
function packCards(key){return `<div class="pack-cards">${PACK_ORDER.map(k=>`<div class="pack-card ${k===key?'is-recommended':''}">${k===key?'<span class="pack-flag">あなたへのおすすめ</span>':''}<span class="pack-badge">${PACKS[k].badge}</span><h3>${phr(PACKS[k].parts)}</h3><p>${PACKS[k].desc}</p></div>`).join('')}</div>`;}
function staffBox(){
 const rec=loadRecords().find(r=>r.id===sessionId);
 if(!rec)return '';
 const cur=rec.outcome || '';
 const btn=(v,label)=>`<button class="staff-button ${cur===v?'is-on':''}" data-action="outcome" data-value="${v}">${label}</button>`;
 return `<div class="staff-box"><span class="staff-tag">スタッフ記入欄</span><p>${cur?'記録しました　押し直すと変更できます':'ご案内の結果を押してください'}</p><div class="staff-buttons">${PACK_ORDER.map(k=>btn(k,'成約　'+PACKS[k].name)).join('')}${btn('lost','未成約')}</div></div>`;
}
function render(focus=true){
 let html,stage=0;
 if(screen==='admin'){main.innerHTML=`<div class="stage admin-stage">${adminView()}</div>`;window.scrollTo({top:0,behavior:'instant'});return;}
 if(QUESTIONS[screen]){
  const q=QUESTIONS[screen],n=history.length+1;
  html=`<section class="content fade-in ${screen==='start'?'welcome':''}"><div class="topline"><span class="tag">${q.label}</span><span class="count"><b>${String(n).padStart(2,'0')}</b> / ${QUESTION_COUNT}</span></div><div class="progress" aria-label="全${QUESTION_COUNT}問中${n}問目">${Array.from({length:QUESTION_COUNT},(_,i)=>i+1).map(i=>`<span class="${i<=n?'on':''}"></span>`).join('')}</div><div class="question-area">${screen==='start'?'<p class="welcome-thanks">パソコンのお買い上げ<br>ありがとうございます　</p>':''}${q.lead?`<p class="question-lead">${phr(q.lead)}</p>`:''}<h1>${phr(q.title)}</h1><p class="helper">${q.help.map(phr).join('<br>')}</p></div><div class="choices">${choice('yes',q.yesLabel || 'はい',q.yes)}${choice('no',q.noLabel || 'いいえ',q.no)}</div><div class="navrow"><button class="text-button" data-action="back" ${history.length?'':'disabled'}>← ひとつ戻る</button><span class="navhint">どちらかをタップしてください</span></div></section>`;
 }else if(screen==='result'){
  stage=1;const r=recommendation();
  html=`<section class="content result fade-in"><div class="topline"><span class="tag">${QUESTION_COUNT}問のご回答から</span><span class="count">あなたへのご提案</span></div><h1 class="support-catchphrase">${phr(r.pack.headline)}</h1>${packCards(r.key)}<div class="recommendation is-pack"><span class="eyebrow">ご回答から見えたこと</span><ul>${r.reasons.map(t=>`<li>${t}</li>`).join('')}</ul></div><p class="micro">パックの内容と料金は担当者がご案内します　以前のパソコンからのデータ移行もあわせてご相談いただけます</p><p class="prompt">この内容で担当者に相談しますか？</p><div class="choices">${choice('yes','はい相談したい','相談内容を確認する')}${choice('no','いいえいったん保留','今回の回答を確認する')}</div><div class="navrow"><button class="text-button" data-action="back">← 回答を見直す</button><button class="text-button" data-action="restart">最初からやり直す</button></div></section>`;
 }else{
  stage=2;const r=recommendation(),interested=screen==='handoff';
  html=`<section class="content handoff fade-in"><span class="tag">${interested?'相談内容の確認':'今回の回答まとめ'}</span><h1>${interested?'この画面を担当者にお見せください　':'必要になったときにご相談ください　'}</h1><p class="helper">${interested?'ご希望を伺いパックの内容と料金をご案内するための確認画面です　':'今回の回答から次のパックをご提案しました　今すぐ決めなくても大丈夫です　'}</p><div class="recommendation is-pack"><span class="eyebrow">${interested?'相談したいパック':'今回のご提案'}</span><span class="pack-badge">${r.pack.badge}</span><h2>${r.name}</h2></div>${staffBox()}<ul class="answer-list">${history.map(h=>`<li><span>${titleText(QUESTIONS[h.id])}</span><b>${h.id==='start'?(h.answer==='yes'?'ご自身で選択':'スタッフのおすすめ'):(h.answer==='yes'?'はい':'いいえ')}</b></li>`).join('')}</ul><p class="micro">この試作では申込送信・予約は行われません　受付先は未設定です　</p><div class="navrow"><button class="text-button" data-action="result">← ご提案に戻る</button><button class="text-button" data-action="restart">最初の質問へ</button></div></section>`;
 }
 const photo=screen==='start'?'new-laptop':['selfSetup','aiSetup','account','office','bitlocker','bitlockerKey','recovery'].includes(screen)?'laptop-setup':'support-consultation';
 main.innerHTML=`<div class="stage photo-${photo}">${aside(stage)}${html}</div>`;
 if(focus){main.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
}
main.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b||b.disabled)return;
 if(b.dataset.answer){
  const a=b.dataset.answer;
  if(QUESTIONS[screen]){const target=QUESTIONS[screen].next[a];history.push({id:screen,answer:a});screen=target;if(screen==='result')recordSession();}
  else if(screen==='result'){recordSession(a);screen=a==='yes'?'handoff':'summary';}
 }else if(b.dataset.action==='back'){const prev=history.pop();if(prev)screen=prev.id;}
 else if(b.dataset.action==='restart'){history=[];screen='start';sessionId=null;}
 else if(b.dataset.action==='admin-close'){history=[];screen='start';sessionId=null;}
 else if(b.dataset.action==='outcome'){const rec=loadRecords().find(r=>r.id===sessionId);const v=b.dataset.value;setOutcome(sessionId,rec&&rec.outcome===v?null:v);const y=window.scrollY;render(false);window.scrollTo({top:y,behavior:'instant'});return;}
 else if(b.dataset.action==='admin-csv'){exportCsv();return;}
 else if(b.dataset.action==='admin-peek'){const i=document.getElementById('set-pass');i.type=i.type==='password'?'text':'password';b.textContent=i.type==='password'?'見る':'隠す';return;}
 else if(b.dataset.action==='admin-save'){const v=id=>document.getElementById(id).value.trim();saveSettings({device:v('set-device'),url:v('set-url'),pass:v('set-pass')});syncNote='設定を保存しました';syncRecords();}
 else if(b.dataset.action==='admin-sync'){syncNote='送信しています';syncRecords();}
 else if(b.dataset.action==='admin-clear'){if(!window.confirm('記録をすべて消します　元に戻せません　よろしいですか？'))return;saveRecords([]);}
 else if(b.dataset.action==='result')screen='result';
 render();
});
main.addEventListener('change',e=>{const s=e.target.closest('select.admin-outcome');if(!s)return;setOutcome(s.dataset.id,s.value);const y=window.scrollY;render(false);window.scrollTo({top:y,behavior:'instant'});});
for(const file of ['new-laptop','laptop-setup','support-consultation']){const img=new Image();img.src='photos/'+file+'.png';}
document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();history=[];screen='start';sessionId=null;render();});
// 裏メニュー：右上の「約3分・全10問」を3秒以内に5回タップ
let secretTaps=[];
document.querySelector('.header-note').addEventListener('click',()=>{const now=Date.now();secretTaps=secretTaps.filter(t=>now-t<3000);secretTaps.push(now);if(secretTaps.length>=5){secretTaps=[];screen='admin';syncNote='';render();syncRecords();}});
// アプリ化：オフラインでも動くようにする（https または localhost のときだけ）
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('sw.js').catch(()=>{});
render(false);
