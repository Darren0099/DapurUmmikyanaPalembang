
const J=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const uid=()=>crypto.randomUUID();
const sha=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(x=>x.toString(16).padStart(2,'0')).join('');
async function hashPass(pass,salt){const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:180000,hash:'SHA-256'},base,256);return Array.from(new Uint8Array(bits)).map(x=>x.toString(16).padStart(2,'0')).join('');}
function wrong(m,status=400){return J({error:m},status);}
async function user(req,db){const h=req.headers.get('Authorization')||'';if(!h.startsWith('Bearer '))return null;const token=h.slice(7);if(!/^[0-9a-f]{64}$/.test(token))return null;return await db.prepare("SELECT u.id,u.name,u.email,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at > ?").bind(await sha(token),new Date().toISOString()).first();}
const admin=async(req,db)=>{let u=await user(req,db);return u?.role==='admin'?u:null;};
const allowedSlug=/^[a-z0-9-]{2,80}$/;
const validPhone=p=>/^\+?\d{9,16}$/.test(String(p||'').replace(/[\s-]/g,''));
const eligibleDate=t=>{const d=new Date(t);return Number.isFinite(d.getTime()) && d.getTime()>Date.now()+3600000;};
async function parse(req){try{return await req.json()}catch{return {}}}
async function handle(req,env){
 const db=env.DB;const url=new URL(req.url);const path=url.pathname;const method=req.method;
 if(method==='GET'&&path==='/health')return J({status:'ok',database:'cloudflare-d1'});
 if(method==='GET'&&path==='/products'){
   const r=await db.prepare("SELECT id,slug,name,description,category,price_idr,active,featured,image_url,'amber' AS accent FROM products WHERE active=1 ORDER BY featured DESC,created_at DESC LIMIT 200").all();
   return J({products:r.results||[],live:true,demo:true});
 }
 if(method==='POST'&&path==='/auth/register'){
   const b=await parse(req);const email=String(b.email||'').trim().toLowerCase();const name=String(b.name||'').trim();const password=String(b.password||'');
   if(!/^\S+@\S+\.\S+$/.test(email)||name.length<3||name.length>100||password.length<10||password.length>128)return wrong('Nama, email, atau kata sandi tidak valid (minimal 10 karakter).');
   if(await db.prepare('SELECT id FROM users WHERE email=?').bind(email).first())return wrong('Email sudah terdaftar.',409);
   const salt=uid(),passhash=await hashPass(password,salt);
   try{await db.prepare('INSERT INTO users(id,email,password_hash,name) VALUES(?,?,?,?)').bind(uid(),email,salt+':'+passhash,name).run();}
   catch{return wrong('Gagal membuat akun.',409);}
   return J({message:'Akun demo berhasil dibuat. Silakan login.'},201);
 }
 if(method==='POST'&&path==='/auth/login'){
   const b=await parse(req);const email=String(b.email||'').trim().toLowerCase(),password=String(b.password||'');
   if(email.length>254||password.length>128||!email)return wrong('Email atau kata sandi tidak valid.',401);
   const attempts=await db.prepare("SELECT COUNT(*) AS n FROM auth_attempts WHERE email=? AND at > ?").bind(email,new Date(Date.now()-15*60000).toISOString()).first();
   if(Number(attempts?.n)>12)return wrong('Terlalu banyak percobaan. Coba lagi nanti.',429);
   const found=await db.prepare("SELECT id,name,email,role,password_hash FROM users WHERE email=?").bind(email).first();
   let ok=false;
   if(found&&found.password_hash?.includes(':')){const [salt,hash]=found.password_hash.split(':');const candidate=await hashPass(password,salt);let diff=0;for(let i=0;i<hash.length;i++)diff|=hash.charCodeAt(i)^candidate.charCodeAt(i);ok=diff===0;}
   if(!ok){await db.prepare('INSERT INTO auth_attempts(email,at) VALUES(?,?)').bind(email,new Date().toISOString()).run();return wrong('Email atau kata sandi salah.',401);}
   await db.prepare('DELETE FROM auth_attempts WHERE email=?').bind(email).run();
   const raw=Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b=>b.toString(16).padStart(2,'0')).join('');
   await db.prepare('INSERT INTO sessions(id,user_id,token_hash,expires_at) VALUES(?,?,?,?)').bind(uid(),found.id,await sha(raw),new Date(Date.now()+7*86400000).toISOString()).run();
   return J({access_token:raw,user:{id:found.id,email:found.email,name:found.name,role:found.role,app_metadata:{role:found.role},email_confirmed_at:new Date().toISOString()}});
 }
 if(method==='GET'&&path==='/auth/me'){const u=await user(req,db);return u?J({user:{...u,app_metadata:{role:u.role},email_confirmed_at:new Date().toISOString()}}):wrong('Sesi tidak valid.',401);}
 if(method==='POST'&&path==='/auth/logout'){const h=req.headers.get('Authorization')||'';if(/^Bearer [0-9a-f]{64}$/.test(h))await db.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha(h.slice(7))).run();return J({success:true});}
 if(method==='POST'&&path==='/orders'){
   const u=await user(req,db);if(!u)return wrong('Silakan masuk terlebih dahulu.',401);
   const b=await parse(req);const items=b.items;
   if(!Array.isArray(items)||items.length<1||items.length>30)return wrong('Keranjang tidak valid.');
   if(!/^[a-f0-9-]{36}$/i.test(String(b.client_request_id||'')))return wrong('ID permintaan tidak valid.');
   const name=String(b.customer_name||'').trim(),phone=String(b.customer_phone||'').replace(/[\s-]/g,''),fulfillment=b.fulfillment==='delivery'?'delivery':'pickup',addr=String(b.delivery_address||'').trim(),notes=String(b.notes||'').slice(0,800);
   if(name.length<3||name.length>100||!validPhone(phone)||!eligibleDate(b.scheduled_for)||(fulfillment==='delivery'&&addr.length<12))return wrong('Periksa data kontak, alamat, atau jadwal.');
   const existing=await db.prepare('SELECT id FROM orders WHERE user_id=? AND client_request_id=?').bind(u.id,b.client_request_id).first();
   if(existing)return J({order_id:existing.id,reused:true,demo:true});
   const rows=[];const seen=new Set();
   for(const item of items){
     if(!allowedSlug.test(String(item.slug||''))||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>50||seen.has(item.slug))return wrong('Produk atau jumlah tidak valid.');
     seen.add(item.slug);
     const p=await db.prepare('SELECT id,name,price_idr FROM products WHERE slug=? AND active=1').bind(item.slug).first();
     if(!p)return wrong('Produk sudah tidak tersedia.',409);
     rows.push({p,qty:item.quantity});
   }
   const subtotal=rows.reduce((s,x)=>s+x.p.price_idr*x.qty,0);if(subtotal<1||subtotal>1000000000)return wrong('Total tidak valid.');
   const id=uid();
   const statements=[db.prepare('INSERT INTO orders(id,user_id,client_request_id,customer_name,customer_phone,fulfillment,delivery_address,notes,scheduled_for,subtotal_idr,delivery_fee_idr,total_idr,payment_method,payment_status,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
     .bind(id,u.id,b.client_request_id,name,phone,fulfillment,fulfillment==='delivery'?addr:null,notes,new Date(b.scheduled_for).toISOString(),subtotal,0,subtotal,'demo','awaiting_confirmation','pending')];
   for(const x of rows)statements.push(db.prepare('INSERT INTO order_items(id,order_id,product_id,product_name,unit_price_idr,quantity,line_total_idr) VALUES(?,?,?,?,?,?,?)').bind(uid(),id,x.p.id,x.p.name,x.p.price_idr,x.qty,x.p.price_idr*x.qty));
   try{await db.batch(statements);}catch{return wrong('Gagal menyimpan pesanan. Coba lagi.',500);}
   return J({order_id:id,subtotal_idr:subtotal,payment_status:'awaiting_confirmation',shipping_pending:fulfillment==='delivery',demo:true},201);
 }
 if(method==='GET'&&path==='/orders/mine'){
   const u=await user(req,db);if(!u)return wrong('Silakan masuk.',401);
   const o=await db.prepare('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC LIMIT 100').bind(u.id).all();
   const orders=[];for(const order of o.results){const items=await db.prepare('SELECT product_name,unit_price_idr,quantity,line_total_idr FROM order_items WHERE order_id=?').bind(order.id).all();orders.push({...order,order_items:items.results});}
   const c=await db.prepare('SELECT id,service_slug,package_name,quantity,scheduled_for,status,created_at FROM catering_requests WHERE user_id=? ORDER BY created_at DESC LIMIT 100').bind(u.id).all();
   return J({orders,catering:c.results});
 }
 const pay=path.match(/^\/orders\/([a-f0-9-]{36})\/demo-pay$/i);
 if(method==='POST'&&pay){
   const u=await user(req,db);if(!u)return wrong('Login diperlukan.',401);
   const order=await db.prepare('SELECT id,status,payment_status,payment_method FROM orders WHERE id=? AND user_id=?').bind(pay[1],u.id).first();
   if(!order)return wrong('Pesanan tidak ditemukan.',404);
   if(order.payment_method!=='demo')return wrong('Bukan pembayaran demo.',409);
   if(order.payment_status==='paid')return J({success:true,demo:true,already_paid:true});
   if(order.status==='cancelled'||order.payment_status!=='awaiting_confirmation')return wrong('Pesanan tidak dapat dibayar.',409);
   const changed=await db.prepare("UPDATE orders SET payment_status='paid',paid_at=?,updated_at=? WHERE id=? AND user_id=? AND payment_status='awaiting_confirmation' AND status!='cancelled'").bind(new Date().toISOString(),new Date().toISOString(),order.id,u.id).run();
   if(changed.meta.changes!==1)return wrong('Status berubah, muat ulang.',409);
   await db.prepare('INSERT INTO payment_events(id,order_id,actor_user_id,type,previous_status,next_status) VALUES(?,?,?,?,?,?)').bind(uid(),order.id,u.id,'demo_payment_simulated','awaiting_confirmation','paid').run();
   return J({success:true,demo:true,message:'Simulasi selesai. Tidak ada uang asli berpindah.'});
 }
 if(method==='POST'&&path==='/catering'){
   const u=await user(req,db);if(!u)return wrong('Silakan login.',401);
   const b=await parse(req),qty=Number(b.quantity),phone=String(b.phone||'').replace(/[\s-]/g,''),address=String(b.address||'').trim();
   if(!['daily-catering','snack-box','tumpeng-mini','prasmanan-gubukan'].includes(b.service_slug)||!Number.isInteger(qty)||qty<1||qty>5000||!validPhone(phone)||address.length<12||!eligibleDate(b.scheduled_for))return wrong('Data permintaan tidak valid.');
   const id=uid();await db.prepare('INSERT INTO catering_requests(id,user_id,service_slug,package_name,quantity,scheduled_for,phone,address,notes) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,u.id,b.service_slug,String(b.package_name||'').slice(0,120),qty,new Date(b.scheduled_for).toISOString(),phone,address,String(b.notes||'').slice(0,800)).run();
   return J({request_id:id,status:'requested'},201);
 }
 if(path.startsWith('/admin/')){
   const u=await admin(req,db);if(!u)return wrong('Akses admin ditolak.',403);
   if(method==='GET'&&path==='/admin/dashboard'){
     const ord=await db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 100').all();
     const orders=[];for(const o of ord.results){const items=await db.prepare('SELECT product_name,quantity,line_total_idr FROM order_items WHERE order_id=?').bind(o.id).all();const owner=await db.prepare('SELECT email FROM users WHERE id=?').bind(o.user_id).first();orders.push({...o,customer_email:owner?.email||'',order_items:items.results});}
     const prod=await db.prepare("SELECT *, 'amber' AS accent FROM products ORDER BY created_at DESC LIMIT 200").all();
     const cnt=await db.prepare('SELECT COUNT(*) AS total FROM orders').first();
     const cat=await db.prepare('SELECT c.*,u.email AS customer_email FROM catering_requests c JOIN users u ON u.id=c.user_id ORDER BY c.created_at DESC LIMIT 100').all();
     return J({orders,products:prod.results,totalOrders:cnt.total,catering:cat.results});
   }
   if(method==='POST'&&path==='/admin/products'){
     const b=await parse(req),name=String(b.name||'').trim(),category=String(b.category||'Nasi Box').trim(),price=Number(b.price_idr);
     if(name.length<3||name.length>120||!Number.isInteger(price)||price<1||price>100000000)return wrong('Data menu tidak valid.');
     const slug=name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70),id=uid();
     if(!allowedSlug.test(slug))return wrong('Nama menu tidak valid.');
     try{await db.prepare('INSERT INTO products(id,slug,name,category,price_idr,description,featured,image_url) VALUES(?,?,?,?,?,?,?,?)').bind(id,slug,name,category,price,String(b.description||''),b.featured?1:0,b.image_url||null).run();}catch{return wrong('Nama menu sudah digunakan.',409);}
     return J({product:{id,slug}},201);
   }
   const product=path.match(/^\/admin\/products\/([a-f0-9-]{36})$/i);
   if(method==='PATCH'&&product){
     const b=await parse(req);const keys=['name','price_idr','active','featured','image_url'];const changes=[];const vals=[];
     for(const key of keys){if(!(key in b))continue;let value=b[key];if(key==='active'||key==='featured')value=value?1:0;if(key==='price_idr'&&(!Number.isInteger(value)||value<1))return wrong('Harga tidak valid.');if(key==='image_url'&&value!==null&&value!==''&&!/^https:\/\//.test(value))return wrong('URL foto tidak valid.');if(key==='name'&&(typeof value!=='string'||value.trim().length<3))return wrong('Nama tidak valid.');changes.push(key+'=?');vals.push(value|| (value===0?0:null));}
     if(!changes.length)return wrong('Tidak ada perubahan.');changes.push("updated_at=CURRENT_TIMESTAMP");vals.push(product[1]);
     const result=await db.prepare('UPDATE products SET '+changes.join(',')+' WHERE id=?').bind(...vals).run();
     if(result.meta.changes!==1)return wrong('Produk tidak ditemukan.',404);
     return J({product:{id:product[1]}});
   }
   const order=path.match(/^\/admin\/orders\/([a-f0-9-]{36})$/i);
   if(method==='PATCH'&&order){
     const b=await parse(req);const o=await db.prepare('SELECT status,payment_status,payment_method FROM orders WHERE id=?').bind(order[1]).first();if(!o)return wrong('Pesanan tidak ditemukan.',404);
     const transitions={pending:['confirmed','cancelled'],confirmed:['preparing','cancelled'],preparing:['delivering','completed','cancelled'],delivering:['completed'],completed:[],cancelled:[]};
     if(b.status!==undefined&&!transitions[o.status].includes(b.status))return wrong('Urutan status tidak valid.',409);
     if(b.status&&['preparing','delivering','completed'].includes(b.status)&&o.payment_status!=='paid')return wrong('Pembayaran belum dikonfirmasi.',409);
     if(b.payment_status!==undefined)return wrong('Pembayaran demo hanya dikonfirmasi oleh pelanggan.',409);
     if(b.status)await db.prepare('UPDATE orders SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status=?').bind(b.status,order[1],o.status).run();
     return J({order:{id:order[1],status:b.status||o.status,payment_status:o.payment_status}});
   }
   const cater=path.match(/^\/admin\/catering\/([a-f0-9-]{36})$/i);
   if(method==='PATCH'&&cater){
     const b=await parse(req);const c=await db.prepare('SELECT status FROM catering_requests WHERE id=?').bind(cater[1]).first();
     if(!c)return wrong('Permintaan tidak ditemukan.',404);
     const next={requested:['reviewing','declined'],reviewing:['approved','declined'],approved:[],declined:[]};
     if(!next[c.status].includes(b.status))return wrong('Perubahan status tidak valid.',409);
     await db.prepare('UPDATE catering_requests SET status=? WHERE id=? AND status=?').bind(b.status,cater[1],c.status).run();
     return J({request:{id:cater[1],status:b.status}});
   }
 }
 return wrong('Endpoint tidak ditemukan.',404);
}
export default {async fetch(req,env){try{return await handle(req,env)}catch(e){return J({error:'Kesalahan server internal.'},500)}}};
