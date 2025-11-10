const API_URL = "https://script.google.com/macros/s/AKfycbyqkID8Qy_eXIOOuXypgiQpnF5kIbT_P3btlmF5F8W28zECn8dMLBrDSTTht2Ne_ze2fg/exec";

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
    console.error("Error fetching data:", err);
    alert("Gagal memuat data!");
  }
}

// === Build Table ===
function buildTable(data) {
  contactsTable.innerHTML = "";
  data.forEach((c, i) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><input type="checkbox" class="selectBox" data-nama="${c.nama}" onclick="toggleDeleteBtn()"></td>
      <td>${i + 1}</td>
      <td>${c.nama}</td>
      <td>${c.telepon}</td>
      <td>${c.email}</td>
      <td>${c.perusahaan}</td>
      <td>${c.catatan}</td>
    `;

    row.addEventListener("click", (e) => {
      if (!e.target.classList.contains("selectBox")) {
        showDetails(c);
      }
    });

    contactsTable.appendChild(row);
  });
}

// === Show Details ===
function showDetails(c) {
  detailText.innerHTML = `<b>Nama:</b> ${c.nama}<br>
    <b>Telepon:</b> ${c.telepon}<br>
    <b>Email:</b> ${c.email}<br>
    <b>Perusahaan:</b> ${c.perusahaan}<br>
    <b>Catatan:</b> ${c.catatan}`;

  detailModal.style.display = "block";

  document.getElementById("editFromDetail").onclick = () => openEditForm(c);
  document.getElementById("copyFromDetail").onclick = copyData;
  document.getElementById("deleteFromDetail").onclick = () => deleteContact(c.nama);
}

// === Open Edit Modal ===
function openEditForm(c) {
  document.getElementById("editNama").value = c.nama;
  document.getElementById("editTelepon").value = c.telepon;
  document.getElementById("editEmail").value = c.email;
  document.getElementById("editPerusahaan").value = c.perusahaan;
  document.getElementById("editCatatan").value = c.catatan;
  document.getElementById("oldNama").value = c.nama;
  editModal.style.display = "block";
}

// === Close Modals ===
function closeEditModal() {
  editModal.style.display = "none";
}
function closeDetailModal() {
  detailModal.style.display = "none";
}

// === Save Contact ===
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const oldNama = document.getElementById("oldNama").value;
  const action = oldNama ? "update" : "create";

  const params = new URLSearchParams({
    nama: contactForm.nama.value,
    telepon: contactForm.telepon.value,
    email: contactForm.email.value,
    perusahaan: contactForm.perusahaan.value,
    catatan: contactForm.catatan.value,
    oldNama,
    action,
  });

  try {
    const res = await fetch(API_URL, { method: "POST", body: params });
    const result = await res.json();

    if (result.status === "success") {
      alert(result.message);
      fetchData();
      clearForm();
      closeEditModal();
    } else {
      alert(result.message || "Terjadi kesalahan saat menyimpan data.");
    }
  } catch (err) {
    console.error(err);
    alert("Gagal menghubungi server!");
  }
});

// === Clear Form ===
function clearForm() {
  contactForm.reset();
  document.getElementById("oldNama").value = "";
}

// === Delete Contact ===
async function deleteContact(nama) {
  if (!confirm(`Hapus kontak '${nama}'?`)) return;
  const params = new URLSearchParams({ action: "delete", nama });
  const res = await fetch(API_URL, { method: "POST", body: params });
  const result = await res.json();
  alert(result.message);
  fetchData();
}

// === Delete Selected ===
async function deleteSelected() {
  const selected = Array.from(document.querySelectorAll(".selectBox:checked")).map(b => b.dataset.nama);
  if (selected.length === 0) return;
  if (!confirm(`Hapus ${selected.length} kontak terpilih?`)) return;

  for (const nama of selected) {
    await fetch(API_URL, { method: "POST", body: new URLSearchParams({ action: "delete", nama }) });
  }
  fetchData();
}

// === Copy Data ===
function copyData() {
  navigator.clipboard.writeText(detailText.innerText).then(() => {
    alert("Kontak disalin ke clipboard!");
  });
}

// === Select All ===
function toggleSelectAll(checkbox) {
  document.querySelectorAll(".selectBox").forEach(cb => cb.checked = checkbox.checked);
  toggleDeleteBtn();
}

// === Toggle Delete Button ===
function toggleDeleteBtn() {
  const selectedCount = document.querySelectorAll(".selectBox:checked").length;
  deleteSelectedBtn.style.display = selectedCount > 0 ? "inline-block" : "none";
}

// === Search ===
searchInput.addEventListener("keyup", () => {
  const kw = searchInput.value.toLowerCase();
  document.querySelectorAll("#contactsTable tr").forEach((row) => {
    row.style.display = row.innerText.toLowerCase().includes(kw) ? "" : "none";
  });
});

// === CSV Import ===
uploadCsvInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file || file.type !== "text/csv") return alert("File bukan format CSV!");

  const reader = new FileReader();
  reader.onload = async function () {
    const csvData = reader.result.split("\n").map(r => r.split(","));
    const data = csvData.slice(1).map(row => ({
      nama: row[0],
      telepon: row[1],
      email: row[2],
      perusahaan: row[3],
      catatan: row[4],
    }));
    await fetch(API_URL, { method: "POST", body: new URLSearchParams({ action: "import", data: JSON.stringify(data) }) });
    alert("CSV berhasil diimpor!");
    fetchData();
  };
  reader.readAsText(file);
});

// === Initialize ===
window.addEventListener("load", fetchData);
