const OFFICIAL="https://zeta.kz";
let products=[];
const shops=[
{name:"ZETA — Сатпаева 18",address:"ул. Сатпаева, 18",hours:"09:00–20:00"},
{name:"ZETA — Кенесары 4",address:"ул. Кенесары, 4",hours:"09:00–20:00"},
{name:"ZETA — Бараева 2Б «Z-Home»",address:"ул. Бараева, 2Б",hours:"09:00–20:00"},
{name:"ZETA — ш. Алаш 15",address:"шоссе Алаш, 15",hours:"10:00–20:00"},
{name:"ZETA — Коргалжынское шоссе 13/3",address:"Коргалжынское шоссе 13/3",hours:"10:00–20:00"},
{name:"ZETA — Бирлик 55",address:"пос. Жибек Жолы, ул. Бирлик 55",hours:"10:00–19:00"}
];
let allProducts=false, allShops=false;
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
 const q=$("#search").value.toLowerCase().trim();
 const filtered=products.filter(p=>!q||[p.name,p.sku].join(' ').toLowerCase().includes(q));
 $("#products").innerHTML=(filtered.slice(0,allProducts?99:6)).map(p=>{
   const inStock=p.stock?.filter(x=>x.qty>0) || [];
   const total=inStock.reduce((a,x)=>a+x.qty,0);
   return `<article class="product"><div class="p-top"><div class="pic">${p.image?`<img src="${esc(p.image)}" alt="">`:'🛍️'}</div><div><div class="p-name">${esc(p.name)}</div><div class="price">${esc(p.price||'Цена на ZETA.kz')}</div><span class="badge">Артикул: ${esc(p.sku||'—')}</span></div></div><div class="stock-summary">${total?`🟢 Есть: ${total} шт. суммарно`:'⚪ Нет данных по магазинам'}</div><div class="stock-list">${inStock.slice(0,6).map(x=>`<div><span>${esc(x.store||x.address)}</span><b>${x.qty} шт.</b></div>`).join('') || '<div>Откройте карточку товара для проверки на ZETA.kz</div>'}</div><div class="p-actions"><a class="primary" href="${esc(p.url)}" target="_blank" rel="noopener">Открыть на ZETA.kz</a></div></article>`
 }).join("") || `<div class="empty">Ничего не нашли.<br>Попробуйте название или артикул.</div>`;
 $("#shops").innerHTML=shops.slice(0,allShops?99:3).map(s=>`<article class="shop"><div class="shop-icon">📍</div><div class="shop-info"><div class="shop-name">${s.name}</div><div class="shop-address">${s.address}</div><div class="meta">🕐 ${s.hours}</div></div></article>`).join('');
}
async function loadData(){
 try{const r=await fetch('data.json?'+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error();const d=await r.json();products=d.products||[];if(d.updatedAt&&d.updatedAt!=='demo')$('#updated').textContent='Данные обновлены: '+new Date(d.updatedAt).toLocaleString('ru-RU');render();}
 catch(e){products=[];$('#updated').textContent='Не удалось загрузить данные — запустите GitHub Action обновления';render();}
}
function openZeta(){window.open(OFFICIAL,"_blank","noopener")}
function focusShops(){$("#shops").scrollIntoView({behavior:"smooth"})}
$("#search").addEventListener("input",render);
$("#allProducts").onclick=()=>{allProducts=!allProducts;$("#allProducts").textContent=allProducts?"Скрыть":"Все";render()};
$("#allShops").onclick=()=>{allShops=!allShops;$("#allShops").textContent=allShops?"Скрыть":"Все";render()};
$("#official").onclick=openZeta;
const serviceModal=$("#serviceModal"); function openService(){serviceModal.classList.add("open")} function closeService(){serviceModal.classList.remove("open")} $("#serviceOpen").onclick=openService; $("#serviceClose").onclick=closeService; $("#serviceX").onclick=closeService;
$("#geo").onclick=()=>{if(!navigator.geolocation){alert("Геолокация не поддерживается");return}navigator.geolocation.getCurrentPosition(()=>alert("Геолокация разрешена. Автоматический расчёт расстояния подключим следующим этапом."),()=>alert("Разрешите доступ к геолокации в браузере."));};
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");const a=b.dataset.action;if(a==="catalog")openZeta();if(a==="shops")focusShops();if(a==="service")openService();if(a==="home")window.scrollTo({top:0,behavior:"smooth"})});
loadData();
