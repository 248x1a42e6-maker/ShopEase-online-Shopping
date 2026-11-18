const products = [
  {id:1,name:"Blush Everyday Bag",category:"Fashion",price:899,emoji:"👜",image:"https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700",tone:"#fce2ea"},
  {id:2,name:"Glow Care Set",category:"Beauty",price:649,emoji:"🧴",image:"https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=700",tone:"#f8e8df"},
  {id:3,name:"Wireless Headphones",category:"Electronics",price:1499,emoji:"🎧",image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700",tone:"#e9e5f8"},
  {id:4,name:"Cozy Cushion",category:"Home",price:499,emoji:"🛋️",image:"https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=700",tone:"#f4e8d9"},
  {id:5,name:"Classic Sneakers",category:"Fashion",price:1199,emoji:"👟",image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700",tone:"#e6edf5"},
  {id:6,name:"Daily Lip Tint",category:"Beauty",price:299,emoji:"💄",image:"https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=700",tone:"#fce2e8"},
  {id:7,name:"Smart Watch",category:"Electronics",price:1899,emoji:"⌚",image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700",tone:"#e4edf0"},
  {id:8,name:"Ceramic Mug",category:"Home",price:349,emoji:"☕",image:"https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=700",tone:"#f5e9df"}
];
let cart = JSON.parse(localStorage.getItem("shopease-cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("shopease-wishlist") || "[]");
let user = JSON.parse(localStorage.getItem("shopease-user") || "null");
let authMode = "login";

const $ = id => document.getElementById(id);
const money = amount => "₹" + amount.toLocaleString("en-IN");
function save(){localStorage.setItem("shopease-cart",JSON.stringify(cart));localStorage.setItem("shopease-wishlist",JSON.stringify(wishlist));}
function toast(message){$("toast").textContent=message;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),1800);}
function updateCounts(){$("cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0);$("wishCount").textContent=wishlist.length;$("authBtn").textContent=user?`Hi, ${user.name.split(" ")[0]}`:"Login";}
function renderProducts() {
  const term = $("searchInput").value.trim().toLowerCase();
  const category = $("categoryFilter").value;

  const shown = products.filter(p =>
    (category === "All" || p.category === category) &&
    (p.name.toLowerCase().includes(term) ||
     p.category.toLowerCase().includes(term))
  );

  $("productGrid").innerHTML = shown.map(p => `
    <article class="product-card">
      <div class="product-art" style="background:${p.tone}">
        <img src="${p.image}" alt="${p.name}"
             onerror="this.style.display='none'">
        <button class="wish" data-wish="${p.id}">
          ${wishlist.includes(p.id) ? "♥" : "♡"}
        </button>
      </div>
      <div class="product-info">
        <small>${p.category}</small>
        <h3>${p.name}</h3>
        <div class="product-bottom">
          <span class="price">${money(p.price)}</span>
          <button class="add-btn" data-add="${p.id}">+ Add</button>
        </div>
      </div>
    </article>
  `).join("");

  $("emptyMessage").classList.toggle("hidden", shown.length === 0);
}
function openDrawer(type){
  $("drawerTitle").textContent=type==="cart"?"Your cart":type==="wishlist"?"Your wishlist":"Your orders";
  const items=type==="cart"?cart.map(x=>({...products.find(p=>p.id===x.id),qty:x.qty})):wishlist.map(id=>({...products.find(p=>p.id===id),qty:1}));
  if(!items.length){$("drawerContent").innerHTML='<p class="empty">Nothing here yet. Explore our products!</p>';}
  else{
    $("drawerContent").innerHTML=items.map(p=>`<div class="cart-row"><div class="mini-art">${p.emoji}</div><div class="details"><b>${p.name}</b><p>${money(p.price)} ${type==="cart"?"· Qty "+p.qty:""}</p></div>${type==="cart"?`<div class="qty"><button data-minus="${p.id}">−</button>${p.qty}<button data-plus="${p.id}">+</button></div>`:`<button class="add-btn" data-add="${p.id}">Add</button>`}</div>`).join("");
    if(type==="cart") $("drawerContent").innerHTML+=`<div class="total"><span>Total</span><span>${money(cart.reduce((s,x)=>s+products.find(p=>p.id===x.id).price*x.qty,0))}</span></div><button class="primary-btn full" id="checkoutBtn">Continue to demo checkout →</button>`;
  }
  $("overlay").classList.remove("hidden");$("drawer").classList.add("open");
}
function closeDrawer(){$("drawer").classList.remove("open");$("overlay").classList.add("hidden");}
$("productGrid").addEventListener("click",e=>{
  const add=e.target.closest("[data-add]"), wish=e.target.closest("[data-wish]");
  if(add){const id=Number(add.dataset.add),found=cart.find(x=>x.id===id);found?found.qty++:cart.push({id,qty:1});save();updateCounts();toast("Added to your cart!");}
  if(wish){const id=Number(wish.dataset.wish);wishlist.includes(id)?wishlist=wishlist.filter(x=>x!==id):wishlist.push(id);save();updateCounts();renderProducts();toast("Wishlist updated");}
});
$("drawerContent").addEventListener("click",e=>{
  const plus=e.target.closest("[data-plus]"),minus=e.target.closest("[data-minus]");
  if(plus){cart.find(x=>x.id===Number(plus.dataset.plus)).qty++;}
  if(minus){const id=Number(minus.dataset.minus),item=cart.find(x=>x.id===id);item.qty--;if(item.qty<=0)cart=cart.filter(x=>x.id!==id);}
  if(plus||minus){save();updateCounts();openDrawer("cart");}
  if(e.target.id==="checkoutBtn"){
    if(!user){closeDrawer();openAuth();toast("Please login to continue");return;}
    const total=cart.reduce((s,x)=>s+products.find(p=>p.id===x.id).price*x.qty,0);
    alert(`Demo checkout successful!\\nOrder total: ${money(total)}\\nNo real payment was made.`);
    cart=[];save();updateCounts();closeDrawer();toast("Demo order placed!");
  }
});
$("searchInput").addEventListener("input",renderProducts);$("categoryFilter").addEventListener("change",renderProducts);
$("cartBtn").onclick=()=>openDrawer("cart");$("wishlistBtn").onclick=()=>openDrawer("wishlist");$("closeDrawer").onclick=closeDrawer;$("overlay").onclick=closeDrawer;
function openAuth(){authMode="login";setAuthMode();$("authDialog").showModal();}
function setAuthMode(){const reg=authMode==="register";$("authTitle").textContent=reg?"Create account":"Login";$("authName").parentElement.classList.toggle("hidden",!reg);$("authName").required=reg;$("authSubmit").textContent=reg?"Register":"Login";$("switchAuth").innerHTML=reg?'Already registered? <button type="button">Login</button>':'New here? <button type="button">Create an account</button>';}
$("authBtn").onclick=()=>user?toast(`Signed in as ${user.email}`):openAuth();$("closeAuth").onclick=()=>$("authDialog").close();
$("switchAuth").addEventListener("click",()=>{authMode=authMode==="login"?"register":"login";setAuthMode();});
$("authForm").addEventListener("submit",e=>{
  e.preventDefault();const email=$("authEmail").value.trim(),password=$("authPassword").value;
  if(authMode==="register"){const name=$("authName").value.trim();if(!name){toast("Please enter your name");return;}user={name,email};localStorage.setItem("shopease-user",JSON.stringify(user));toast("Account created!");}
  else{user={name:email.split("@")[0],email};localStorage.setItem("shopease-user",JSON.stringify(user));toast("Login successful!");}
  $("authDialog").close();$("authForm").reset();updateCounts();
});
$("searchInput").addEventListener("input", renderProducts);
renderProducts();
updateCounts();
