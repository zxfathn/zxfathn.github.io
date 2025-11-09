const API_URL = "https://script.google.com/macros/s/AKfycbxfsA5hIqfF_PNQm6GTBLvlVa774qvLzubgmgL-WiNoDQThqxP0swplHP4049oZbWXfEg/exec";

const contactsTable = document.getElementById("contactsTable");
const contactForm = document.getElementById("contactForm");
const searchInput = document.getElementById("searchInput");
const selectAllCheckbox = document.getElementById("selectAll");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
const uploadCsvInput = document.getElementById("uploadCsv");
const editModal = document.getElementById("editModal");
const detailModal = document.getElementById("detailModal");
const detailText = document.getElementById("detailText");

let contactsData = [];

// === Fetch Data ===
async function fetchData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    contactsData = data;
    buildTable(data);
  } catch (err) {
    console.error(err);
  }
}

// === Build Table ===
function buildTable(data) {
  contactsTable.innerHTML = "";
  data.forEach((c, i) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><input type="checkbox" class="selectBox" data-id="${c.id}" onclick="toggleDeleteBtn()"></td>
      <td>${i + 1}</td>
      <td>${c.nama}</td>
      <td>${c.telepon}</td>
      <td>${c.email}</td>
      <td>${c.perusahaan}</td>
      <td>${c.catatan}</td>
    `;

    row.querySelector(".selectBox").addEventListener("change", toggleDeleteBtn);
    row.addEventListener("click", (e) => {
      if (!e.target.classList.contains("selectBox")) {
        showDetails(c);
      }
    });

    contactsTable.appendChild(row);
  });
}

// === Show Details in Modal ===
function showDetails(c) {
  detailText.innerHTML = `<b>Nama:</b> ${c.nama}<br>
    <b>Telepon:</b> ${c.telepon}<br>
    <b>Email:</b> ${c.email}<br>
    <b>Perusahaan:</b> ${c.perusahaan}<br>
    <b>Catatan:</b> ${c.catatan}`;

  detailModal.style.display = "block";

  document.getElementById("editFromDetail").onclick = () => openEditForm(c);
  document.getElementById("deleteFromDetail").onclick = () => deleteContact(c.id);
}

// === Open Edit Modal ===
function openEditForm(c) {
  document.getElementById("editNama").value = c.nama;
  document.getElementById("editTelepon").value = c.telepon;
  document.getElementById("editEmail").value = c.email;
  document.getElementById("editPerusahaan").value = c.perusahaan;
  document.getElementById("editCatatan").value = c.catatan;
  document.getElementById("editId").value = c.id;
  editModal.style.display = "block";
}

// === Close Modal ===
function closeEditModal() {
  editModal.style.display = "none";
}

function closeDetailModal() {
  detailModal.style.display = "none";
}

// === Save/Edit Contact ===
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = contactForm.contactId.value;
  const params = new URLSearchParams({
    nama: contactForm.nama.value,
    telepon: contactForm.telepon.value,
    email: contactForm.email.value,
    perusahaan: contactForm.perusahaan.value,
    catatan: contactForm.catatan.value,
    action: id ? "update" : "create",
    id,
  });

  await fetch(API_URL, { method: "POST", body: params });
  fetchData();
  clearForm();
});

// === Clear Form ===
function clearForm() {
  contactForm.reset();
  contactForm.contactId.value = "";
  document.getElementById("btnCancel").style.display = "none";
}

// === Delete Contact ===
async function deleteContact(id) {
  if (!confirm("Hapus kontak ini?")) return;
  await fetch(API_URL, { method: "POST", body: new URLSearchParams({ action: "delete", id }) });
  fetchData();
}

// === Delete Selected Contacts ===
function deleteSelected() {
  const selected = Array.from(document.querySelectorAll(".selectBox:checked")).map((b) => b.dataset.id);
  if (selected.length === 0) return;
  if (!confirm("Hapus semua kontak yang dipilih?")) return;

  selected.forEach(async (id) => {
    await fetch(API_URL, { method: "POST", body: new URLSearchParams({ action: "delete", id }) });
  });

  fetchData();
}

// === Select All / Unselect All ===
function toggleSelectAll(checkbox) {
  const checkboxes = document.querySelectorAll(".selectBox");
  checkboxes.forEach((cb) => {
    cb.checked = checkbox.checked;
  });
  toggleDeleteBtn();
}

// === Toggle Delete Button Visibility ===
function toggleDeleteBtn() {
  const selectedCount = document.querySelectorAll(".selectBox:checked").length;
  deleteSelectedBtn.style.display = selectedCount > 0 ? "inline-block" : "none";
}

// === Search Functionality ===
searchInput.addEventListener("keyup", () => {
  const kw = searchInput.value.toLowerCase();
  document.querySelectorAll("#contactsTable tr").forEach((row) => {
    row.style.display = row.innerText.toLowerCase().includes(kw) ? "" : "none";
  });
});

// === Handle CSV File Upload ===
uploadCsvInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file && file.type === "text/csv") {
    const reader = new FileReader();
    reader.onload = async function () {
      // Mengambil data CSV yang diupload
      const csvData = reader.result.split("\n").map((row) => row.split(","));
      
      // Memastikan bahwa baris pertama adalah header, dan baris berikutnya adalah data
      const headers = csvData[0];  // Ambil header CSV
      const data = csvData.slice(1); // Ambil data setelah header

      // Memetakan setiap baris data ke format objek
      const formattedData = data.map((row) => ({
        nama: row[0],        // Nama
        telepon: row[1],     // Telepon
        email: row[2],       // Email
        perusahaan: row[3],  // Perusahaan
        catatan: row[4],     // Catatan
      }));

      // Cek apakah ada data untuk dikirim
      if (formattedData.length === 0) {
        alert("File CSV tidak mengandung data!");
        return;
      }

      // Kirim data ke API
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          body: new URLSearchParams({
            action: "import",          // Aksi impor
            data: JSON.stringify(formattedData),  // Data dalam format JSON
          }),
        });
        
        const result = await response.json();
        if (result.status === "ok") {
          alert("CSV berhasil diimpor!");
          fetchData();  // Memperbarui data setelah impor
        } else {
          alert("Terjadi kesalahan saat mengimpor CSV.");
        }
      } catch (err) {
        console.error("Error importing CSV: ", err);
        alert("Terjadi kesalahan saat mengimpor CSV.");
      }
    };
    
    // Membaca file CSV sebagai teks
    reader.readAsText(file);
  } else {
    alert("File bukan format CSV!");
  }
});

// === Initialize ===
window.addEventListener("load", fetchData);
