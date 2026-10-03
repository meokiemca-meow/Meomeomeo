const KEY="quan-tra-sua-save-v1";

const defaultState={
  shopName:"Quán Trà Sữa",
  money:1000000,
  reputation:0,
  customers:0,
  day:1,
  inventory:{tea:12, flavor:12, topping:12},
  levels:{tea:1, flavor:1, topping:1, decor:1},
  currentCustomer:null,
  logs:["Bắt đầu kinh doanh với 1.000.000đ."]
};

let state=load();

const teas=[
 {name:"Trà đen",price:0,unlock:1},
 {name:"Trà xanh",price:1500,unlock:2},
 {name:"Ô long",price:2500,unlock:3},
 {name:"Trà nhài",price:3500,unlock:4}
];
const flavors=[
 {name:"Sữa truyền thống",price:0,unlock:1},
 {name:"Dâu",price:1000,unlock:1},
 {name:"Socola",price:1500,unlock:2},
 {name:"Matcha",price:2000,unlock:3},
 {name:"Khoai môn",price:2500,unlock:4}
];
const toppings=[
 {name:"Không topping",price:0,unlock:1},
 {name:"Trân châu đen",price:2000,unlock:1},
 {name:"Thạch trái cây",price:2500,unlock:2},
 {name:"Pudding",price:3000,unlock:3},
 {name:"Kem cheese",price:4000,unlock:4}
];

const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat("vi-VN").format(Math.round(n))+"đ";
function load(){
  try{
    const x=JSON.parse(localStorage.getItem(KEY));
    return x?{...defaultState,...x,inventory:{...defaultState.inventory,...x.inventory},levels:{...defaultState.levels,...x.levels}}:structuredClone(defaultState);
  }catch(e){return structuredClone(defaultState)}
}
function save(){
  localStorage.setItem(KEY,JSON.stringify(state));
  $("notice").textContent="💾 Đã lưu dữ liệu trên thiết bị.";
}
function log(msg){
  state.logs.unshift([Ngày ${state.day}] ${msg});
  state.logs=state.logs.slice(0,40);
}
function unlocked(list,level){return list.filter(x=>x.unlock<=level)}
function fillSelect(el,list,level){
  const old=el.value;
  el.innerHTML="";
  unlocked(list,level).forEach((x,i)=>{
    const o=document.createElement("option");o.value=i;o.textContent=`${x.name} (+${money(x.price)})`;o.dataset.name=x.name;el.appendChild(o);
  });
  if([...el.options].some(o=>o.value===old))el.value=old;
}
function renderSelects(){
  fillSelect($("teaSelect"),teas,state.levels.tea);
  fillSelect($("flavorSelect"),flavors,state.levels.flavor);
  fillSelect($("toppingSelect"),toppings,state.levels.topping);
  updateRecipe();
}
function updateRecipe(){
  const t=unlocked(teas,state.levels.tea)[$("teaSelect").selectedIndex]||teas[0];
  const f=unlocked(flavors,state.levels.flavor)[$("flavorSelect").selectedIndex]||flavors[0];
  const p=unlocked(toppings,state.levels.topping)[$("toppingSelect").selectedIndex]||toppings[0];
  const price=12000+(state.levels.tea-1)*1000+(state.levels.flavor-1)*700+(state.levels.topping-1)*500;
  $("recipeInfo").innerHTML=`💵 Giá bán dự kiến: <b>${money(price+t.price+f.price+p.price)}</b><br>⏱️ Mỗi ly cần 1 trà + 1 vị + 1 topping.`;
}
function cost(type){return 120000*state.levels[type]}
function render(){
  $("shopTitle").textContent="🧋 "+state.shopName;
  $("money").textContent=money(state.money);
  $("reputation").textContent=Math.round(state.reputation)+"%";
  $("customers").textContent=state.customers;
  $("day").textContent=state.day;
  $("teaLevel").textContent=state.levels.tea;
  $("flavorLevel").textContent=state.levels.flavor;
  $("toppingLevel").textContent=state.levels.topping;
  $("decorLevel").textContent=state.levels.decor;
  $("teaCost").textContent=money(cost("tea"));
  $("flavorCost").textContent=money(cost("flavor"));
  $("toppingCost").textContent=money(cost("topping"));
  $("decorCost").textContent=money(cost("decor"));
  $("teaDesc").textContent=`mở ${unlocked(teas,state.levels.tea).length}/${teas.length} loại trà`;
  $("flavorDesc").textContent=`mở ${unlocked(flavors,state.levels.flavor).length}/${flavors.length} vị`;
  $("toppingDesc").textContent=`mở ${unlocked(toppings,state.levels.topping).length}/${toppings.length} topping`;
  $("inventory").innerHTML=`
    <div class="inventory-row"><span>🍵 Trà</span><b>${state.inventory.tea}</b></div>
    <div class="inventory-row"><span>🍓 Vị</span><b>${state.inventory.flavor}</b></div>
    <div class="inventory-row"><span>🧋 Topping</span><b>${state.inventory.topping}</b></div>`;
  $("log").innerHTML=state.logs.map(x=>`<div>${escapeHtml(x)}</div>`).join("");
  if(state.currentCustomer){
    $("customerName").textContent=state.currentCustomer.name;
    $("customerOrder").textContent=`Muốn: ${state.currentCustomer.tea} + ${state.currentCustomer.flavor} + ${state.currentCustomer.topping}`;
    $("openBtn").disabled=true;
  }else{
    $("customerName").textContent="Chưa có khách";
    $("customerOrder").textContent="Bấm “Đón khách mới” để phục vụ.";
    $("openBtn").disabled=false;
  }
  renderSelects();
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

function newCustomer(){
  if(state.currentCustomer)return;
  const pool=["An","Bình","Chi","Duy","Hà","Lan","Minh","Nam","Ngọc","Vy"];
  const t=teas[Math.floor(Math.random()*unlocked(teas,state.levels.tea).length)];
  const f=flavors[Math.floor(Math.random()*unlocked(flavors,state.levels.flavor).length)];
  const p=toppings[Math.floor(Math.random()*unlocked(toppings,state.levels.topping).length)];
  state.currentCustomer={name:pool[Math.floor(Math.random()*pool.length)],tea:t.name,flavor:f.name,topping:p.name};
  $("notice").textContent="👤 Có khách mới! Hãy pha đúng món khách yêu cầu.";
  log(${state.currentCustomer.name} bước vào quán.);
  save();render();
}
function makeDrink(){
  if(!state.currentCustomer){$("notice").textContent="⚠️ Hãy đón khách trước.";return}
  if(state.inventory.tea<1||state.inventory.flavor<1||state.inventory.topping<1){
    $("notice").textContent="📦 Hết nguyên liệu. Hãy nhập hàng.";return;
  }
  const t=unlocked(teas,state.levels.tea)[$("teaSelect").selectedIndex]||teas[0];
  const f=unlocked(flavors,state.levels.flavor)[$("flavorSelect").selectedIndex]||flavors[0];
  const p=unlocked(toppings,state.levels.topping)[$("toppingSelect").selectedIndex]||toppings[0];
  const c=state.currentCustomer;
  state.inventory.tea--;state.inventory.flavor--;state.inventory.topping--;
  if(t.name===c.tea&&f.name===c.flavor&&p.name===c.topping){
    const price=12000+(state.levels.tea-1)*1000+(state.levels.flavor-1)*700+(state.levels.topping-1)*500+t.price+f.price+p.price;
    const bonus=Math.round(price*(state.reputation/500));
    const earned=price+bonus;
    state.money+=earned;
    state.customers++;
    state.reputation=Math.min(100,state.reputation+2+state.levels.decor*.2);
    $("notice").textContent=`🎉 Khách hài lòng! +${money(earned)} và tăng uy tín.`;
    log(${c.name} nhận đúng món và trả ${money(earned)}.);
    state.currentCustomer=null;
    if(Math.random()<0.25)showFeedback(true);
  }else{
    state.reputation=Math.max(0,state.reputation-2);
    $("notice").textContent="😕 Pha sai món. Khách không hài lòng.";
    log(${c.name} nhận sai món, uy tín giảm.);
    if(Math.random()<0.55)showFeedback(false);
  }
  save();render();
}
function showFeedback(happy){
  const messages=happy?[
    "Trà ngon lắm, lần sau mình sẽ quay lại!",
    "Quán phục vụ dễ thương quá!",
    "Mình rất thích ly này ❤️"
  ]:[
    "Mình gọi một món khác mà quán pha sai rồi.",
    "Mình hơi thất vọng vì phải chờ lại.",
    "Lần sau quán nhớ kiểm tra đơn giúp mình nhé."
  ];
  $("feedbackText").textContent=messages[Math.floor(Math.random()*messages.length)];
  $("feedbackBox").classList.remove("hidden");
}
function reply(good){
  if(good){state.reputation=Math.min(100,state.reputation+3);log("Bạn trả lời lịch sự và xin lỗi khách.");$("notice").textContent="🙏 Khách cảm thấy được tôn trọng. Uy tín +3%";}
  else{state.reputation=Math.max(0,state.reputation-1);log("Bạn chửi khách. Uy tín giảm.");$("notice").textContent="😡 Khách tức giận. Uy tín -1%";}
  $("feedbackBox").classList.add("hidden");save();render();
}
function upgrade(type){
  const c=cost(type);
  if(state.money<c){$("notice").textContent="💸 Không đủ tiền để nâng cấp.";return}
  const max={tea:4,flavor:4,topping:4,decor:8}[type];
  if(state.levels[type]>=max){$("notice").textContent="🏆 Đã đạt cấp tối đa.";return}
  state.money-=c;state.levels[type]++;
  log(Nâng cấp ${type} lên cấp ${state.levels[type]} với ${money(c)}.);
  $("notice").textContent="⬆️ Nâng cấp thành công!";
  save();render();
}
function restock(){
  const c=80000;
  if(state.money<c){$("notice").textContent="💸 Không đủ tiền nhập hàng.";return}
  state.money-=c;
  state.inventory.tea+=10;state.inventory.flavor+=10;state.inventory.topping+=10;
  log(Nhập 10 trà, 10 vị và 10 topping.);
  $("notice").textContent="📦 Nhập hàng thành công.";
  save();render();
}
$("renameBtn").onclick=()=>{
  const n=prompt("Nhập tên quán mới:",state.shopName);
  if(n&&n.trim()){state.shopName=n.trim().slice(0,30);log(Đổi tên quán thành "${state.shopName}".);save();render()}
};
$("saveBtn").onclick=save;
$("resetBtn").onclick=()=>{
  if(confirm("Xóa toàn bộ dữ liệu và chơi lại từ đầu?")){
    localStorage.removeItem(KEY);state=structuredClone(defaultState);render();save();
  }
};
$("openBtn").onclick=newCustomer;
$("makeBtn").onclick=makeDrink;
$("replyGood").onclick=()=>reply(true);
$("replyBad").onclick=()=>reply(false);
$("restockBtn").onclick=restock;
$("upgradeTea").onclick=()=>upgrade("tea");
$("upgradeFlavor").onclick=()=>upgrade("flavor");
$("upgradeTopping").onclick=()=>upgrade("topping");
$("upgradeDecor").onclick=()=>upgrade("decor");
$("teaSelect").onchange=updateRecipe;
$("flavorSelect").onchange=updateRecipe;
$("toppingSelect").onchange=updateRecipe;

render();


// ===== MÀN HÌNH ĐẶT TÊN QUÁN =====
const nameScreen = document.getElementById("nameScreen");
const shopNameInput = document.getElementById("shopNameInput");
const startGameBtn = document.getElementById("startGameBtn");

if (nameScreen && shopNameInput && startGameBtn) {
  // Chỉ hỏi tên ở lần chơi đầu tiên.
  if (!localStorage.getItem(KEY)) {
    nameScreen.style.display = "flex";
    shopNameInput.focus();
  } else {
    nameScreen.style.display = "none";
  }

  function startGameWithName() {
    const name = shopNameInput.value.trim();
    if (!name) {
      alert("⚠️ Bạn chưa nhập tên quán!");
      shopNameInput.focus();
      return;
    }
    state.shopName = name.slice(0, 30);
    save();
    nameScreen.style.display = "none";
    render();
    $("notice").textContent =🎉 Chào mừng bạn đến với ${state.shopName}!`;
  }

  startGameBtn.addEventListener("click", startGameWithName);
  shopNameInput.addEventListener("keydown", e => {
    if (e.key === "Enter") startGameWithName();
  });
}