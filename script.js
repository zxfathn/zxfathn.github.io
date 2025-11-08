const sheetURL = "https://script.google.com/macros/s/AKfycbxdfJH7BtJHo0Osm3tBs6IYdH55F-2KWVegilOxJ9XbJAbMJbB_xMldD6iW2qccYiluEA/exec"; // Ganti dengan URL Web App

let selectAll = false;

// ==== Load semua kontak ====
async function loadContacts() {
  const tbody = document.querySelector("#contactTable tbody");
  tbody.innerHTML = "";
  try {
    const res = await fetch(sheetURL);
    const data = await res.json();
    data.forEach(c => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><input type="checkbox" class="rowCheckbox" data-id="${c.id}"></td>
        <td>${c.Nama || ""}</td>
        <td>${c.Email || ""}</td>
        <td>${c.Telepon || ""}</td>
        <td>${c.Perusahaan || ""}</td>
        <td>${c.Catatan || ""}</td>
        <td>
          <button class="edit" onclick="editContact(${c.id}, '${c.Nama}', '${c.Email}', '${c.Telepon}', '${c.Perusahaan}', '${c.Catatan}')">Edit</button>
          <button class="delete" onclick="deleteContact(${c.id})">Hapus</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch(err) { console.error("Gagal memuat data:", err); }
}

// ==== Simpan / Edit Kontak ====
document.querySelector("#contactForm").addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.target;
  const formData = Object.fromEntries(new FormData(form));
  try {
    await fetch(sheetURL, { method: "POST", body: JSON.stringify(formData) });
    form.reset();
    document.getElementById("contactId").value = "";
    loadContacts();
  } catch(err){ console.error("Simpan error:", err); }
});

// ==== Hapus Kontak ====
async function deleteContact(id){
  if(!confirm("Yakin ingin menghapus kontak ini?")) return;
  try{
    await fetch(`${sheetURL}?id=${id}`, { method: "DELETE" });
    loadContacts();
  } catch(err){ console.error("Delete error:", err); }
}

// ==== Edit Kontak ====
function editContact(id,nama,email,telepon,perusahaan,catatan){
  document.getElementById("contactId").value = id;
  document.querySelector('[name="Nama"]').value = nama;
  document.querySelector('[name="Email"]').value = email;
  document.querySelector('[name="Telepon"]').value = telepon;
  document.querySelector('[name="Perusahaan"]').value = perusahaan;
  document.querySelector('[name="Catatan"]').value = catatan;
}

// ==== Select All / Unselect All ====
document.getElementById("selectAllBtn").addEventListener("click", ()=>{
  selectAll = !selectAll;
  document.querySelectorAll(".rowCheckbox").forEach(cb => cb.checked = selectAll);
});

// ==== Delete Selected ====
document.getElementById("deleteSelectedBtn").addEventListener("click", async ()=>{
  const checkedBoxes = document.querySelectorAll(".rowCheckbox:checked");
  if(!checkedBoxes.length){ alert("Pilih kontak dulu!"); return; }
  if(!confirm(`Hapus ${checkedBoxes.length} kontak?`)) return;
  for(const cb of checkedBoxes){
    const id = cb.dataset.id;
    await fetch(`${sheetURL}?id=${id}`, { method:"DELETE" });
  }
  loadContacts();
});

// ==== Load saat halaman dibuka ====
loadContacts();
