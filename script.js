const API_URL = "https://script.google.com/macros/s/AKfycbzLni3rDZ3Uyujz1PWNvBhFYK8Bm5SSbjoo-AFAazqgwwvLW3OdtumtFdwmz-1Kj_eKJQ/exec";

let contactsData = [];
let sheetUrl = "";

// Load semua kontak dan link sheet
function loadContacts(){
  fetch(API_URL + "?action=readAll")
    .then(res => res.json())
    .then(res => {
      contactsData = res.data;
      sheetUrl = res.sheetUrl;
      document.querySelector("#sheetLink a").href = sheetUrl;
      document.querySelector("#sheetLink a").textContent = sheetUrl;
      renderTable(contactsData);
    });
}

// Render tabel
function renderTable(data){
  const tbody = document.getElementById("contactsTable");
  tbody.innerHTML = "";
  data.forEach((c,i) => {
    tbody.innerHTML += `<tr>
      <td><input type="checkbox" class="selectBox" data-id="${c.id}" onchange="toggleDeleteBtn()"></td>
      <td>${i+1}</td>
      <td>${c.nama}</td>
      <td>${c.telepon}</td>
      <td>${c.email}</td>
      <td>${c.perusahaan}</td>
      <td>${c.catatan}</td>
      <td>
        <button class="action" onclick='editContact(${JSON.stringify(c)})'>✏️ Edit</button>
        <button class="action" onclick='deleteContact(${c.id})'>🗑️ Hapus</button>
      </td>
    </tr>`;
  });
}

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
    .then(()=>{ clearForm(); loadContacts(); });
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
      .then(()=>loadContacts());
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
    setTimeout(loadContacts,500);
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
  const filtered = contactsData.filter(c=>
    c.nama.toLowerCase().includes(keyword) ||
    c.telepon.toLowerCase().includes(keyword) ||
    c.email.toLowerCase().includes(keyword) ||
    c.perusahaan.toLowerCase().includes(keyword) ||
    c.catatan.toLowerCase().includes(keyword)
  );
  renderTable(filtered);
}

// Load awal
loadContacts();
