const API_URL = "https://script.google.com/macros/s/AKfycbydEpfOgZhBuKqdoROmXlIYi41PW9E5YpECmUhu-Mrhgaku1Pchf3KVqbZ9bkiJa7rvNw/exec"; // ganti API URL

const contactsTable = document.getElementById("contactsTable");
const contactForm = document.getElementById("contactForm");
const searchInput = document.getElementById("searchInput");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");

const detailModal = document.getElementById("detailModal");
const detailText = document.getElementById("detailText");
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");

// ==== FETCH DATA ====
async function fetchData(){
  try{
    const res = await fetch(API_URL);
    const data = await res.json();
    buildTable(data);
    window.scrollTo(0,0);
  }catch(err){ console.error(err); }
}

// ==== BUILD TABLE ====
function buildTable(data){
  contactsTable.innerHTML="";
  data.forEach((c,i)=>{
    const row = document.createElement("tr");
    row.innerHTML=`
      <td><input type="checkbox" class="selectBox" data-id="${c.id}" onchange="toggleDeleteBtn()"></td>
      <td>${i+1}</td>
      <td>${c.nama}</td>
      <td>${c.telepon}</td>
      <td>${c.email}</td>
      <td>${c.perusahaan}</td>
      <td>${c.catatan}</td>
      <td><button class="action deleteBtn">🗑️</button></td>
    `;
    row.querySelector(".deleteBtn").onclick = ()=> deleteContact(c.id);
    row.addEventListener("click", e=>{
      if(!e.target.classList.contains("action") && e.target.type!=="checkbox") showDetailModal(c);
    });
    contactsTable.appendChild(row);
  });
}

// ==== DETAIL MODAL ====
function showDetailModal(c){
  detailText.innerHTML = `
    <b>Nama:</b> ${c.nama}<br>
    <b>Telepon:</b> ${c.telepon}<br>
    <b>Email:</b> ${c.email}<br>
    <b>Perusahaan:</b> ${c.perusahaan}<br>
    <b>Catatan:</b> ${c.catatan}
  `;
  detailModal.style.display="block";
  document.getElementById("editFromDetail").onclick = ()=> openEditModal(c);
  document.getElementById("deleteFromDetail").onclick = ()=> deleteContact(c.id);
}
function closeDetailModal(){ detailModal.style.display="none"; }
detailModal.addEventListener("click", e=>{ if(e.target===detailModal) closeDetailModal(); });

// ==== EDIT MODAL ====
function openEditModal(c){
  editModal.style.display="block";
  document.getElementById("editId").value = c.id;
  document.getElementById("editNama").value = c.nama;
  document.getElementById("editTelepon").value = c.telepon;
  document.getElementById("editEmail").value = c.email;
  document.getElementById("editPerusahaan").value = c.perusahaan;
  document.getElementById("editCatatan").value = c.catatan;
  closeDetailModal();
}
function closeEditModal(){ editModal.style.display="none"; editForm.reset(); }
editModal.addEventListener("click", e=>{ if(e.target===editModal) closeEditModal(); });

// ==== SAVE EDIT ====
editForm.addEventListener("submit", async e=>{
  e.preventDefault();
  const id = document.getElementById("editId").value;
  const params = new URLSearchParams({
    action: "update",
    id,
    nama: document.getElementById("editNama").value,
    telepon: document.getElementById("editTelepon").value,
    email: document.getElementById("editEmail").value,
    perusahaan: document.getElementById("editPerusahaan").value,
    catatan: document.getElementById("editCatatan").value
  });
  await fetch(API_URL, {method:"POST", body:params});
  closeEditModal();
  fetchData();
});

// ==== ADD CONTACT ====
contactForm.addEventListener("submit", async e=>{
  e.preventDefault();
  const params = new URLSearchParams({
    action: "create",
    nama: contactForm.nama.value,
    telepon: contactForm.telepon.value,
    email: contactForm.email.value,
    perusahaan: contactForm.perusahaan.value,
    catatan: contactForm.catatan.value
  });
  await fetch(API_URL, {method:"POST", body:params});
  contactForm.reset();
  fetchData();
});

// ==== DELETE ====
async function deleteContact(id){
  if(!confirm("Hapus kontak ini?")) return;
  await fetch(API_URL,{method:"POST", body:new URLSearchParams({action:"delete", id})});
  fetchData();
}

// ==== DELETE SELECTED ====
function toggleDeleteBtn(){
  deleteSelectedBtn.style.display = document.querySelectorAll(".selectBox:checked").length>0?"inline-block":"none";
}
function deleteSelected(){
  const selected = Array.from(document.querySelectorAll(".selectBox:checked")).map(b=>b.dataset.id);
  if(selected.length===0) return;
  if(!confirm("Hapus semua kontak yang dipilih?")) return;
  selected.forEach(id=>{
    fetch(API_URL,{method:"POST", body:new URLSearchParams({action:"delete", id})});
  });
  fetchData();
}

// ==== SEARCH ====
searchInput.addEventListener("keyup", ()=>{
  const kw = searchInput.value.toLowerCase();
  document.querySelectorAll("#contactsTable tr").forEach(r=>{
    r.style.display = r.innerText.toLowerCase().includes(kw)?"":"none";
  });
});

// ==== COPY & EXPORT ====
function copyAll(){
  fetch(API_URL).then(res=>res.json()).then(data=>{
    const text = data.map(c=>`${c.nama}|${c.telepon}|${c.email}|${c.perusahaan}|${c.catatan}`).join("\n");
    navigator.clipboard.writeText(text);
    alert("Kontak telah disalin!");
  });
}
function exportCSV(){
  fetch(API_URL).then(res=>res.json()).then(data=>{
    const csv = [["Nama","Telepon","Email","Perusahaan","Catatan"],...data.map(c=>[c.nama,c.telepon,c.email,c.perusahaan,c.catatan])]
      .map(e=>e.join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download="kontak.csv";
    link.click();
  });
}

// ==== INIT ====
window.addEventListener("load", fetchData);
function clearForm(){ contactForm.reset(); contactForm.contactId.value=""; }
