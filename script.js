const API_URL = "https://script.google.com/macros/s/AKfycbydEpfOgZhBuKqdoROmXlIYi41PW9E5YpECmUhu-Mrhgaku1Pchf3KVqbZ9bkiJa7rvNw/exec";

const contactsTable = document.getElementById("contactsTable");
const contactForm = document.getElementById("contactForm");
const searchInput = document.getElementById("searchInput");
const selectAllCheckbox = document.getElementById("selectAll");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
const copySelectedBtn = document.getElementById("copySelectedBtn");
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
  document.getElementById("copyFromDetail").onclick = () => copyData(c);
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
  alert("Data berhasil disimpan!"); // Alert saat berhasil
});

// === Clear Form ===
function clearForm() {
  contactForm.reset();
  contactForm.contactId.value = "";
}

// === Delete Contact ===
async function deleteContact(id) {
  if (!confirm("Hapus kontak ini?")) return;
  const params = new URLSearchParams({ action: "delete", id });
  await fetch(API_URL, { method: "POST", body: params });
  fetchData();
  alert("Kontak berhasil dihapus!"); // Alert saat berhasil
}

// === Delete Selected Contacts ===
function deleteSelected() {
  const selected = Array.from(document.querySelectorAll(".selectBox:checked")).map((b) => b.dataset.id);
  if (selected.length === 0) return;
  if (!confirm("Hapus semua kontak yang dipilih?")) return;

  selected.forEach(async (id) => {
    const params = new URLSearchParams({ action: "delete", id });
    await fetch(API_URL, { method: "POST", body: params });
  });

  fetchData();
  alert("Kontak yang dipilih berhasil dihapus!"); // Alert saat berhasil
}

// === Copy Selected Data ===
function copySelected() {
  const selected = Array.from(document.querySelectorAll(".selectBox:checked")).map((b) => b.dataset.id);
  const selectedData = contactsData.filter((c) => selected.includes(c.id.toString()));

  if (selectedData.length === 0) return;

  const text = selectedData.map((c) => `${c.nama} | ${c.telepon} | ${c.email} | ${c.perusahaan} | ${c.catatan}`).join("\n");
  navigator.clipboard.writeText(text).then(() => alert("Kontak yang dipilih telah disalin!"));
}

// === Copy Data from Detail Modal ===
function copyData(c) {
  const text = `${c.nama} | ${c.telepon} | ${c.email} | ${c.perusahaan} | ${c.catatan}`;
  navigator.clipboard.writeText(text).then(() => alert("Kontak detail telah disalin!"));
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
  copySelectedBtn.style.display = selectedCount > 0 ? "inline-block" : "none";
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
      const csvData = reader.result.split("\n").map((row) => row.split(","));
      const data = csvData.slice(1).map((row) => ({
        nama: row[0],
        telepon: row[1],
        email: row[2],
        perusahaan: row[3],
        catatan: row[4],
      }));
      const params = new URLSearchParams({ action: "import", data: JSON.stringify(data) });
      await fetch(API_URL, { method: "POST", body: params });
      alert("CSV berhasil diimpor!");
      fetchData();
    };
    reader.readAsText(file);
  } else {
    alert("File bukan format CSV!");
  }
});

// === Initialize ===
window.addEventListener("load", fetchData);
