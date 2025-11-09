const API_URL = "https://script.google.com/macros/s/AKfycbydEpfOgZhBuKqdoROmXlIYi41PW9E5YpECmUhu-Mrhgaku1Pchf3KVqbZ9bkiJa7rvNw/exec"; // ganti dengan URL Web App Google Sheets
const contactsTable = document.getElementById("contactsTable");
const detailModal = document.getElementById("detailModal");
const detailText = document.getElementById("detailText");
const contactForm = document.getElementById("contactForm");
const btnCancel = contactForm.querySelector(".btn-cancel");
const searchInput = document.getElementById("searchInput");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");

// ==== FETCH DATA ====
async function fetchData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    buildTable(data);
    return data;
  } catch(err) {
    console.error("Gagal fetch data:", err);
  }
}

// ==== BUILD TABLE ====
function buildTable(data){
  contactsTable.innerHTML = "";
  data.forEach((c,i)=>{
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="checkbox" class="selectBox" data-id="${c.id}" onchange="toggleDeleteBtn()"></td>
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
    row.querySelector(".editBtn").onclick = ()=> openEditForm(c);
    row.querySelector(".deleteBtn").onclick = ()=> deleteContact(c.id);
    row.querySelector(".selectBox").addEventListener("change", toggleDeleteBtn);
    row.addEventListener("click", e=>{
      if(!e.target.classList.contains("action") && e.target.type !== "checkbox") showDetails(c);
    });
    contactsTable.appendChild(row);
  });
}

// ==== SHOW DETAIL MODAL ====
function showDetails(c){
  detailText.innerHTML = `<b>Nama:</b> ${c.nama}<br>
    <b>Telepon:</b> ${c.telepon}<br>
    <b>Email:</b> ${c.email}<br>
    <b>Perusahaan:</b> ${c.perusahaan}<br>
    <b>Catatan:</b> ${c.catatan}`;
  detailModal.style.display="block";

  document.getElementById("editFromDetail").onclick = ()=> openEditForm(c);
  document.getElementById("deleteFromDetail").onclick = ()=> deleteContact(c.id);
}

function closeModal(){ detailModal.style.display="none"; }
detailModal.querySelector(".close").addEventListener("click", closeModal);
detailModal.addEventListener("click", e=>{if(e.target===detailModal) closeModal();});

// ==== EDIT FORM ====
function openEditForm(c){
  contactForm.nama.value = c.nama;
  contactForm.telepon.value = c.telepon;
  contactForm.email.value = c.email;
  contactForm.perusahaan.value = c.perusahaan;
  contactForm.catatan.value = c.catatan;
  contactForm.contactId.value = c.id;
  btnCancel.style.display="inline-block";
  closeModal();
}

// ==== CLEAR FORM ====
function clearForm(){
  contactForm.reset();
  contactForm.contactId.value = "";
  btnCancel.style.display="none";
}

// ==== SAVE CONTACT ====
contactForm.addEventListener("submit", async e=>{
  e.preventDefault();
  const id = contactForm.contactId.value;
  const params = new URLSearchParams({
    nama: contactForm.nama.value,
    telepon: contactForm.telepon.value,
    email: contactForm.email.value,
    perusahaan: contactForm.perusahaan.value,
    catatan: contactForm.catatan.value,
    action: id ? "update" : "create",
    id
  });
  await fetch(API_URL,{method:"POST",body:params});
  clearForm();
  fetchData();
});

// ==== DELETE ====
async function deleteContact(id){
  if(!confirm("Hapus kontak ini?")) return;
  await fetch(API_URL,{method:"POST",body:new URLSearchParams({action:"delete",id})});
  fetchData();
}

// ==== TOGGLE DELETE BTN ====
function toggleDeleteBtn(){
  const selected = document.querySelectorAll(".selectBox:checked").length;
  deleteSelectedBtn.style.display = selected>0 ? "inline-block" : "none";
}

// ==== DELETE SELECTED ====
function deleteSelected(){
  const selected = Array.from(document.querySelectorAll(".selectBox:checked")).map(b=>b.dataset.id);
  if(selected.length===0) return;
  if(!confirm("Hapus semua kontak yang dipilih?")) return;
  selected.forEach(id=>{
    fetch(API_URL,{method:"POST",body:new URLSearchParams({action:"delete",id})});
  });
  fetchData();
}

// ==== SEARCH FILTER ====
searchInput.addEventListener("keyup",()=>{
  const kw = searchInput.value.toLowerCase();
  document.querySelectorAll("#contactsTable tr").forEach(r=>{
    r.style.display = r.innerText.toLowerCase().includes(kw) ? "" : "none";
  });
});

// ==== COPY ALL ====
function copyAll(){
  fetch(API_URL).then(res=>res.json()).then(data=>{
    const text = data.map(c=>`${c.nama}|${c.telepon}|${c.email}|${c.perusahaan}|${c.catatan}`).join("\n");
    navigator.clipboard.writeText(text);
    alert("Kontak telah disalin!");
  });
}

// ==== EXPORT CSV ====
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
