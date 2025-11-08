const API_URL = "https://script.google.com/macros/s/AKfycbykj0wv7KyUt4tKJwBFhmVXpHpF74qr252AfrCdsPcrbJpgFlLDO_n1SAaDnKS10fN3Rg/exec";

// Form submit
document.getElementById("contactForm").addEventListener("submit", e=>{
  e.preventDefault();
  saveContact();
});

// Simpan / update
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
    .then(()=> location.reload()); // reload halaman setelah create/update
}

// Edit
function editContact(c){
  document.getElementById("contactId").value = c.id;
  document.getElementById("nama").value = c.nama;
  document.getElementById("telepon").value = c.telepon;
  document.getElementById("email").value = c.email;
  document.getElementById("perusahaan").value = c.perusahaan;
  document.getElementById("catatan").value = c.catatan;
}

// Hapus satu
function deleteContact(id){
  if(confirm("Hapus kontak ini?")){
    const params = new URLSearchParams({ action:"delete", id:id });
    fetch(API_URL,{method:"POST",body:params})
      .then(()=> location.reload()); // reload halaman setelah delete
  }
}

// Hapus banyak
function deleteSelected(){
  if(confirm("Hapus semua kontak yang dipilih?")){
    const selected = Array.from(document.querySelectorAll(".selectBox:checked"));
    selected.forEach(box=>{
      const params = new URLSearchParams({action:"delete",id:box.dataset.id});
      fetch(API_URL,{method:"POST",body:params});
    });
    setTimeout(()=>location.reload(),500); // reload halaman setelah delete banyak
  }
}

// Pilih semua
function toggleSelectAll(checkbox){
  const boxes = document.querySelectorAll(".selectBox");
  boxes.forEach(b=>b.checked = checkbox.checked);
  toggleDeleteBtn();
}

// Tampilkan tombol delete multi
function toggleDeleteBtn(){
  const selected = document.querySelectorAll(".selectBox:checked").length;
  document.getElementById("deleteSelectedBtn").style.display = selected>0?"inline-block":"none";
}

// Bersihkan form
function clearForm(){
  document.getElementById("contactForm").reset();
  document.getElementById("contactId").value="";
}

// Filter/search
function filterContacts(){
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const rows = document.querySelectorAll("#contactsTable tr");
  rows.forEach(row=>{
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(keyword) ? "" : "none";
  });
}

// Load awa
// data akan otomatis muncul saat halaman reload
