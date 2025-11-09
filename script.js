const API_URL = "https://script.google.com/macros/s/AKfycbzfbnfSw6UelQSJtRi4GGCWxQjcE6SyrryC191LWRsqL9O2x_ZJUsucSqS3cdJJ28YBiQ/exec";

const contactsTable = document.getElementById("contactsTable");
const detailModal = document.getElementById("detailModal");
const detailText = document.getElementById("detailText");
const toast = document.getElementById("toast");
const selectAllCheckbox = document.getElementById("selectAll");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
const searchInput = document.getElementById("searchInput");
const exportCSVBtn = document.getElementById("exportCSVBtn");
const copyAllBtn = document.getElementById("copyAllBtn");

// Modals
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editCancelBtn = document.getElementById("editCancelBtn");

// ===== CREATE CONTACT =====
document.getElementById("contactForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const params = new URLSearchParams({
    action:"create",
    nama: document.getElementById("nama").value.toUpperCase().slice(0,20),
    telepon: document.getElementById("telepon").value,
    email: document.getElementById("email").value.toLowerCase(),
    perusahaan: document.getElementById("perusahaan").value.slice(0,20),
    catatan: document.getElementById("catatan").value.slice(0,20)
  });
  await fetch(API_URL,{method:"POST", body:params});
  showToast("Kontak baru ditambahkan!");
  document.getElementById("contactForm").reset();
  fetchData();
});

// ===== CUSTOM CONFIRM =====
function customConfirm(msg) {
  return new Promise(resolve => {
    const confirmModal = document.getElementById("confirmModal");
    const confirmText = document.getElementById("confirmText");
    const confirmYes = document.getElementById("confirmYes");
    const confirmNo = document.getElementById("confirmNo");
    confirmText.textContent = msg;
    confirmModal.style.display = "block";
    const cleanUp = ()=>{
      confirmModal.style.display="none";
      confirmYes.onclick=null;
      confirmNo.onclick=null;
    };
    confirmYes.onclick=()=>{cleanUp(); resolve(true);}
    confirmNo.onclick=()=>{cleanUp(); resolve(false);}
    confirmModal.onclick=e=>{if(e.target===confirmModal){cleanUp(); resolve(false);}}
  });
}

// ===== TOAST =====
function showToast(msg){
  toast.textContent=msg;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),2000);
}

// ===== FETCH DATA =====
async function fetchData(){
  const res = await fetch(API_URL);
  const data = await res.json();
  buildTable(data);
  return data;
}

// ===== BUILD TABLE =====
function buildTable(data){
  contactsTable.innerHTML="";
  data.forEach((c,i)=>{
    const row = document.createElement("tr");
    row.innerHTML=`
      <td><input type="checkbox" class="selectBox" data-id="${c.id}"></td>
      <td>${i+1}</td>
      <td>${c.nama}</td>
      <td>${c.telepon}</td>
      <td>${c.email}</td>
      <td>${c.perusahaan}</td>
      <td>${c.catatan}</td>
      <td>
        <button class="action editBtn">✏️</button>
        <button class="action deleteBtn">🗑️</button>
      </td>
    `;
    row.querySelector(".editBtn").addEventListener("click",()=>openEditModal(c));
    row.querySelector(".deleteBtn").addEventListener("click",()=>deleteContact(c.id));
    row.querySelector(".selectBox").addEventListener("change",toggleDeleteBtn);
    row.addEventListener("click",e=>{
      if(!e.target.classList.contains("action")&&e.target.type!=="checkbox") showDetails(c);
    });
    contactsTable.appendChild(row);
  });
}

// ===== DETAIL MODAL =====
function showDetails(c){
  detailText.innerHTML=`<b>Nama:</b> ${c.nama}<br>
  <b>Telepon:</b> ${c.telepon}<br>
  <b>Email:</b> ${c.email}<br>
  <b>Perusahaan:</b> ${c.perusahaan}<br>
  <b>Catatan:</b> ${c.catatan}`;
  detailModal.style.display="block";
}
detailModal.querySelector(".close").addEventListener("click",()=>detailModal.style.display="none");
detailModal.addEventListener("click",e=>{if(e.target===detailModal) detailModal.style.display="none";});

// ===== EDIT MODAL =====
function openEditModal(c){
  editForm.editId.value=c.id;
  editForm.editNama.value=c.nama;
  editForm.editTelepon.value=c.telepon;
  editForm.editEmail.value=c.email;
  editForm.editPerusahaan.value=c.perusahaan;
  editForm.editCatatan.value=c.catatan;

  editModal.style.display="block";
  editCancelBtn.style.display="inline-block"; // tombol batal muncul saat modal edit
}
editCancelBtn.addEventListener("click",()=>{
  editModal.style.display="none";
  editCancelBtn.style.display="none";
});
editModal.addEventListener("click",e=>{
  if(e.target===editModal){
    editModal.style.display="none";
    editCancelBtn.style.display="none";
  }
});

editForm.addEventListener("submit", async e=>{
  e.preventDefault();
  const id = editForm.editId.value;
  const params = new URLSearchParams({
    action:"update",
    id,
    nama: editForm.editNama.value.toUpperCase().slice(0,20),
    telepon: editForm.editTelepon.value,
    email: editForm.editEmail.value.toLowerCase(),
    perusahaan: editForm.editPerusahaan.value.slice(0,20),
    catatan: editForm.editCatatan.value.slice(0,20)
  });
  await fetch(API_URL,{method:"POST", body:params});
  editModal.style.display="none";
  editCancelBtn.style.display="none";
  showToast("Kontak diperbarui!");
  fetchData();
});

// ===== DELETE =====
async function deleteContact(id){
  const ok = await customConfirm("Hapus kontak ini?");
  if(!ok) return;
  await fetch(API_URL,{method:"POST", body:new URLSearchParams({action:"delete",id})});
  showToast("Kontak dihapus!");
  fetchData();
}

// ===== MULTI DELETE =====
deleteSelectedBtn.addEventListener("click", async ()=>{
  const selected = Array.from(document.querySelectorAll(".selectBox:checked"));
  if(selected.length===0) return;
  const ok = await customConfirm("Hapus semua kontak yang dipilih?");
  if(!ok) return;
  await Promise.all(selected.map(b=>fetch(API_URL,{method:"POST", body:new URLSearchParams({action:"delete", id:b.dataset.id})})));
  showToast("Kontak terhapus!");
  fetchData();
});

// ===== SELECT ALL =====
selectAllCheckbox.addEventListener("change",()=>{
  document.querySelectorAll(".selectBox").forEach(b=>b.checked=selectAllCheckbox.checked);
  toggleDeleteBtn();
});
function toggleDeleteBtn(){
  deleteSelectedBtn.style.display=document.querySelectorAll(".selectBox:checked").length>0?"inline-block":"none";
}

// ===== FILTER =====
searchInput.addEventListener("keyup",()=>{
  const kw = searchInput.value.toLowerCase();
  document.querySelectorAll("#contactsTable tr").forEach(r=>r.style.display=r.innerText.toLowerCase().includes(kw)?"":"none");
});

// ===== EKSPOR CSV =====
exportCSVBtn.addEventListener("click", async ()=>{
  const data = await fetchData();
  const csv = [["Nama","Telepon","Email","Perusahaan","Catatan"], ...data.map(c=>[c.nama,c.telepon,c.email,c.perusahaan,c.catatan])]
  .map(e=>e.join(",")).join("\n");
  const blob = new Blob([csv],{type:"text/csv"});
  const link = document.createElement("a");
  link.href=URL.createObjectURL(blob);
  link.download="kontak.csv";
  link.click();
});

// ===== SALIN SEMUA =====
copyAllBtn.addEventListener("click", async()=>{
  const data = await fetchData();
  const text = data.map(c=>`${c.nama} | ${c.telepon} | ${c.email} | ${c.perusahaan} | ${c.catatan}`).join("\n");
  await navigator.clipboard.writeText(text);
  showToast("Semua kontak telah disalin!");
});

// ===== INIT =====
window.addEventListener("load", fetchData);
