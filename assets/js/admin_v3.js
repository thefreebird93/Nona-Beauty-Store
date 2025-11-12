
// admin_v3.js - manage products and tips
async function loadProducts(){ let p = JSON.parse(localStorage.getItem('nb_products')||'null'); if(p) return p; p = await fetch('assets/data/products.json').then(r=>r.json()); localStorage.setItem('nb_products', JSON.stringify(p)); return p; }
async function saveProducts(p){ localStorage.setItem('nb_products', JSON.stringify(p)); }
async function loadTips(){ let t = JSON.parse(localStorage.getItem('nb_tips')||'null'); if(t) return t; t = await fetch('assets/data/tips.json').then(r=>r.json()); localStorage.setItem('nb_tips', JSON.stringify(t)); return t; }
async function saveTips(t){ localStorage.setItem('nb_tips', JSON.stringify(t)); }

async function renderAdmin(){
  const products = await loadProducts();
  const container = document.getElementById('adminProducts'); container.innerHTML='';
  products.forEach(p=>{
    const d = document.createElement('div'); d.className='card';
    d.innerHTML = '<h4>'+p.title_en+'</h4><div>Category: '+p.category+'</div><div>Price: $'+p.price+' Old: $'+(p.old_price||'')+'</div><div style="margin-top:8px"><button class="btn" onclick="editProduct('+p.id+')">Edit</button><button class="btn" onclick="deleteProduct('+p.id+')">Delete</button></div>';
    container.appendChild(d);
  });
}

window.addEventListener('load', async ()=>{ renderAdmin(); document.getElementById('addProductBtn')?.addEventListener('click', addProduct); document.getElementById('manageTipsBtn')?.addEventListener('click', manageTips); });

async function addProduct(){
  const title = prompt('Product title (EN)'); if(!title) return;
  const price = parseFloat(prompt('Price')); const oldp = parseFloat(prompt('Old price (0 if none)'))||0; const cat = prompt('Category')||'Uncategorized'; const discount = parseInt(prompt('Discount % (0 if none)'))||0;
  const products = await loadProducts(); const id = Math.max(0,...products.map(x=>x.id))+1;
  products.push({id,title_en:title,title_ar:title,price:price,old_price:oldp,category:cat,image:'assets/images/perfume1.jpg',rating:0,ratings_count:0,discount:discount});
  await saveProducts(products); alert('Added'); renderAdmin();
}

window.editProduct = async function(id){
  const products = await loadProducts(); const p = products.find(x=> x.id===id);
  if(!p) return alert('Not found');
  p.title_en = prompt('Title EN',p.title_en) || p.title_en;
  p.title_ar = prompt('Title AR',p.title_ar) || p.title_ar;
  p.price = parseFloat(prompt('Price',p.price)) || p.price;
  p.old_price = parseFloat(prompt('Old price',p.old_price)) || p.old_price;
  p.discount = parseInt(prompt('Discount %',p.discount)) || p.discount;
  await saveProducts(products); alert('Updated'); renderAdmin();
};

window.deleteProduct = async function(id){ if(!confirm('Delete?')) return; let products = await loadProducts(); products = products.filter(x=> x.id!==id); await saveProducts(products); alert('Deleted'); renderAdmin(); };

async function manageTips(){
  const tips = await loadTips();
  const cmd = prompt('Tips:\n'+tips.map(t=> t.id+': '+t.title_en).join('\n')+'\nType new/edit:<id>/del:<id>');
  if(!cmd) return;
  if(cmd==='new'){ const title = prompt('Title EN'); const cont = prompt('Content EN'); const id = Math.max(0,...tips.map(x=>x.id))+1; tips.push({id,title_en:title,title_ar:title,content_en:cont,content_ar:cont}); await saveTips(tips); alert('Added'); }
  else if(cmd.startsWith('edit:')){ const id = parseInt(cmd.split(':')[1]); const t = tips.find(x=> x.id===id); if(!t) return alert('Not found'); t.title_en = prompt('Title',t.title_en); t.content_en = prompt('Content',t.content_en); await saveTips(tips); alert('Saved'); }
  else if(cmd.startsWith('del:')){ const id = parseInt(cmd.split(':')[1]); if(!confirm('Delete?')) return; const nt = tips.filter(x=> x.id!==id); await saveTips(nt); alert('Deleted'); }
  renderAdmin();
}
