const API_URL = "https://script.google.com/macros/s/AKfycbxmbLVrLtpehWdQAD6Yc3ARPQK5jEt8YwVhQMWp2lRFIfdIW7Vrbvum7Grv2q6Lb4nuZA/exec";
let contactsData = []; // Simpan semua data

// Load semua kontak
function loadContacts(){
  fetch(API_URL + "?action=readAll")
    .then(res => res.json())
    .then(data => {
      contactsData = data;
      renderTable(data);
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
        <button class="action" onclick='editContact(${JSON.stringify(c)})'>Edit</button>
        <button class="action" onclick='deleteContact(${c.id})'>Hapus</button>
      </td>
    </tr>`;
  });
}

// Submit form
document.getElementById("contactForm").addEventListener("submit", function(e){
  e.preventDefault();
  saveContact();
});

// Simpan / update kontak
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
    params.append("id", id);
  } else {
    params.append("action","create");
  }

  fetch(API_URL, { method:"POST", body: params })
    .then(()=> { clearForm(); loadContacts(); });
}

// Edit kontak
function editContact(contact){
  document.getElementById("contactId").value = contact.id;
  document.getElementById("nama").value = contact.nama;
  document.getElementById("telepon").value = contact.telepon;
  document.getElementById("email").value = contact.email;
  document.getElementById("perusahaan").value = contact.perusahaan;
  document.getElementById("catatan").value = contact.catatan;
}

// Hapus kontak tunggal
function deleteContact(id){
  if(confirm("Hapus kontak ini?")){
    const params = new URLSearchParams({ action:"delete", id:id });
    fetch(API_URL, { method:"POST", body: params })
      .then(()=> loadContacts());
  }
}

// Hapus kontak terpilih (multi-delete)
function deleteSelected(){
  if(confirm("Hapus semua kontak yang dipilih?")){
    const selected = Array.from(document.querySelectorAll(".selectBox:checked"));
    selected.forEach(box => {
      const params = new URLSearchParams({ action:"delete", id:box.dataset.id });
      fetch(API_URL, { method:"POST", body: params });
    });
    setTimeout(loadContacts, 500); // Tunggu sebentar untuk update
  }
}

// Pilih semua checkbox
function toggleSelectAll(checkbox){
  const boxes = document.querySelectorAll(".selectBox");
  boxes.forEach(b => b.checked = checkbox.checked);
  toggleDeleteBtn();
}

// Tampilkan tombol delete multi jika ada yang dipilih
function toggleDeleteBtn(){
  const selected = document.querySelectorAll(".selectBox:checked").length;
  document.getElementById("deleteSelectedBtn").style.display = selected>0?"inline-block":"none";
}

// Bersihkan form
function clearForm(){
  document.getElementById("contactId").value = "";
  document.getElementById("contactForm").reset();
}

// Search/filter
function filterContacts(){
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const filtered = contactsData.filter(c => 
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
