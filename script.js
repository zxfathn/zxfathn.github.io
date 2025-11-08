// GANTI dengan URL Web App kamu dari Google Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbzvnPXQTWhUL6P43uIK-l-tR1mmjF2KRAwIidpHzXkeCUSVFEy3vEo372GaIp8wM6ukPA/exec";

// === FORM SUBMIT ===
document.getElementById("contactForm").addEventListener("submit", e=>{
  e.preventDefault();
  saveContact();
});

// === SIMPAN / UPDATE ===
function saveContact(){
  const id = document.getElementById("contactId").value;
  const params = new URLSearchParams({
    nama: document.getElementById("nama").value,
    telepon: document.getElementById("telepon").value,
    email: document.getElementById("email").value,
    perusahaan: document.getElementById("perusahaan").value,
    catatan: document.getElementById("catatan").value
  });
  if(id){
    params.append("action","update");
    params.append("id",id);
  } else {
    params.append("action","create");
  }
  fetch(API_URL,{method:"POST",body:params})
    .then(()=>location.reload());
}

// === EDIT ===
function editContact(c){
  document.getElementById("contactId").value = c.id;
  document.getElementById("nama").value = c.nama;
  document.getElementById("telepon").value = c.telepon;
  document.getElementById("email").value = c.email;
  document.getElementById("perusahaan").value = c.perusahaan;
  document.getElementById("catatan").value = c.catatan;
}

// === HAPUS SATU ===
function deleteContact(id){
  if(confirm("Hapus kontak ini?")){
    const params = new URLSearchParams({ action:"delete", id:id });
    fetch(API_URL,{method:"POST",body:params})
      .then(()=>location.reload());
  }
}

// === HAPUS BANYAK ===
function deleteSelected(){
  if(confirm("Hapus semua kontak yang dipilih?")){
    const selected = Array.from(document.querySelectorAll(".selectBox:checked"));
    selected.forEach(box=>{
      const params = new URLSearchParams({action:"delete",id:box.dataset.id});
      fetch(API_URL,{method:"POST",body:params});
    });
    setTimeout(()=>location.reload(),500);
  }
}

// === PILIH SEMUA ===
function toggleSelectAll(checkbox){
  const boxes = document.querySelectorAll(".selectBox");
  boxes.forEach(b=>b.checked = checkbox.checked);
  toggleDeleteBtn();
}

// === TOMBOL DELETE BANYAK ===
function toggleDeleteBtn(){
  const selected = document.querySelectorAll(".selectBox:checked").length;
  document.getElementById("deleteSelectedBtn").style.display = selected>0?"inline-block":"none";
}

// === BERSIHKAN FORM ===
function clearForm(){
  document.getElementById("contactForm").reset();
  document.getElementById("contactId").value="";
}

// === FILTER ===
function filterContacts(){
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const rows = document.querySelectorAll("#contactsTable tr");
  rows.forEach(row=>{
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(keyword) ? "" : "none";
  });
}

// === TAMPILKAN DATA SAAT HALAMAN DIBUKA ===
window.onload = function() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      const table = document.getElementById("contactsTable");
      table.innerHTML = "";
      data.forEach((c, i) => {
        const row = `
          <tr>
            <td><input type="checkbox" class="selectBox" data-id="${c.id}" onchange="toggleDeleteBtn()"></td>
            <td>${i+1}</td>
            <td>${c.nama}</td>
            <td>${c.telepon}</td>
            <td>${c.email}</td>
            <td>${c.perusahaan}</td>
            <td>${c.catatan}</td>
            <td>
              <button class="action" onclick='editContact(${JSON.stringify(c)})'>✏️</button>
              <button class="action" onclick="deleteContact(${c.id})">🗑️</button>
            </td>
          </tr>`;
        table.innerHTML += row;
      });
    });
};
