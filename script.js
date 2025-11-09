const API_URL="https://script.google.com/macros/s/AKfycbydEpfOgZhBuKqdoROmXlIYi41PW9E5YpECmUhu-Mrhgaku1Pchf3KVqbZ9bkiJa7rvNw/exec";

const contactsTable=document.getElementById("contactsTable");
const detailModal=document.getElementById("detailModal");
const detailView=document.getElementById("detailView");
const toast=document.getElementById("toast");

const selectAllCheckbox=document.getElementById("selectAll");
const deleteSelectedBtn=document.getElementById("deleteSelectedBtn");
const searchInput=document.getElementById("searchInput");
const exportCSVBtn=document.getElementById("exportCSVBtn");
const copyAllBtn=document.getElementById("copyAllBtn");

const editForm=document.getElementById("editForm");
const editCancelBtn=document.getElementById("editCancelBtn");
const contactForm=document.getElementById("contactForm");
const formCancelBtn=document.getElementById("formCancel");

function showToast(msg){toast.textContent=msg;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2000);}

async function fetchData(){const res=await fetch(API_URL);const data=await res.json();buildTable(data);return data;}

function buildTable(data){
contactsTable.innerHTML="";
data.forEach((c,i)=>{
const row=document.createElement("tr");
row.innerHTML=`<td><input type="checkbox" class="selectBox" data-id="${c.id}"></td><td>${i+1}</td><td>${c.nama}</td><td>${c.telepon}</td><td>${c.email}</td><td>${c.perusahaan}</td><td>${c.catatan}</td>`;
row.querySelector(".selectBox").addEventListener("change",toggleDeleteBtn);
row.addEventListener("click",e=>{if(!e.target.classList.contains("selectBox")) showDetailPopup(c);});
contactsTable.appendChild(row);
});}

function showDetailPopup(c){
detailView.innerHTML=`<div id="detailInfo"><b>Nama:</b> ${c.nama}<br><b>Telepon:</b> ${c.telepon}<br><b>Email:</b> ${c.email}<br><b>Perusahaan:</b> ${c.perusahaan}<br><b>Catatan:</b> ${c.catatan}<br><br>
<button onclick='startEdit(${JSON.stringify(c)})'>✏️ Edit</button>
<button onclick='deleteContact(${c.id})'>🗑️ Hapus</button>
<button onclick='copyContact(${JSON.stringify(c)})'>📋 Salin</button>
</div>`;
editForm.style.display="none";detailView.style.display="block";detailModal.style.display="block";
}

function copyContact(c){navigator.clipboard.writeText(`${c.nama} | ${c.telepon} | ${c.email} | ${c.perusahaan} | ${c.catatan}`);showToast("Kontak disalin!");}

function startEdit(c){detailView.style.display="none";editForm.style.display="block";editForm.editId.value=c.id;editForm.editNama.value=c.nama;editForm.editTelepon.value=c.telepon;editForm.editEmail.value=c.email;editForm.editPerusahaan.value=c.perusahaan;editForm.editCatatan.value=c.catatan;}

editCancelBtn.addEventListener("click",()=>{editForm.style.display="none";detailView.style.display="block";});

editForm.addEventListener("submit",async e=>{e.preventDefault();const id=editForm.editId.value;const params=new URLSearchParams({action:"update",id,nama:editForm.editNama.value.toUpperCase().slice(0,20),telepon:editForm.editTelepon.value,email:editForm.editEmail.value.toLowerCase(),perusahaan:editForm.editPerusahaan.value.slice(0,20),catatan:editForm.editCatatan.value.slice(0,20)});await fetch(API_URL,{method:"POST",body:params});detailModal.style.display="none";showToast("Kontak diperbarui!");fetchData();});

async function deleteContact(id){if(!confirm("Hapus kontak ini?"))return;await fetch(API_URL,{method:"POST",body:new URLSearchParams({action:"delete",id})});detailModal.style.display="none";showToast("Kontak dihapus!");fetchData();}

contactForm.addEventListener("submit",async e=>{e.preventDefault();const params=new URLSearchParams({action:"create",nama:document.getElementById("nama").value.toUpperCase().slice(0,20),telepon:document.getElementById("telepon").value,email:document.getElementById("email").value.toLowerCase(),perusahaan:document.getElementById("perusahaan").value.slice(0,20),catatan:document.getElementById("catatan").value.slice(0,20)});await fetch(API_URL,{method:"POST",body:params});showToast("Kontak baru ditambahkan!");contactForm.reset();fetchData();});

formCancelBtn.addEventListener("click",()=>{contactForm.reset();formCancelBtn.style.display="none";});

detailModal.querySelector(".close").addEventListener("click",()=>detailModal.style.display="none");
detailModal.addEventListener("click",e=>{if(e.target===detailModal) detailModal.style.display="none";});

selectAllCheckbox.addEventListener("change",()=>{document.querySelectorAll(".selectBox").forEach(b=>b.checked=selectAllCheckbox.checked);toggleDeleteBtn();});
function toggleDeleteBtn(){deleteSelectedBtn.style.display=document.querySelectorAll(".selectBox:checked").length>0?"inline-block":"none";}
searchInput.addEventListener("keyup",()=>{const kw=searchInput.value.toLowerCase();document.querySelectorAll("#contactsTable tr").forEach(r=>r.style.display=r.innerText.toLowerCase().includes(kw)?"":"none");});

exportCSVBtn.addEventListener("click",async()=>{const data=await fetchData();const csv=[["Nama","Telepon","Email","Perusahaan","Catatan"],...data.map(c=>[c.nama,c.telepon,c.email,c.perusahaan,c.catatan])].map(e=>e.join(",")).join("\n");const blob=new Blob([csv],{type:"text/csv"});const link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download="kontak.csv";link.click();});

copyAllBtn.addEventListener("click",async()=>{const data=await fetchData();const text=data.map(c=>`${c.nama} | ${c.telepon} | ${c.email} | ${c.perusahaan} | ${c.catatan}`).join("\n");await navigator.clipboard.writeText(text);showToast("Semua kontak disalin!");});

window.addEventListener("load",fetchData);
