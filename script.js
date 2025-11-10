const API_URL = "https://script.google.com/macros/s/AKfycbxxGrURpSSUixbcI3xh5DUXow0A3pn3Fxw6ybGnrYGkuVYa559xd--ZqliKoKth-nGR/exec";

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
    const res = await fetch(API_URL + "?t=" + new Date().getTime()); // cache buster
    const data = await res.json();
    contactsData = data;
    buildTable(data);
  } catch (err) {
    console.error("Error fetching data: ", err);
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
      <td>${c.catatan || ""}</td>
    `;
    row.querySelector(".selectBox").addEventListener("change", toggleDeleteBtn);
    row.addEventListener("click", (e) => {
      if (!e.target.classList.contains("selectBox")) showDetails(c);
    });
    contactsTable.appendChild(row);
  });
}

// === Show Details ===
function showDetails(c) {
  detailText.innerHTML = `
    <b>Nama:</b> ${c.nama}<br>
    <b>Telepon:</b> ${c.telepon}<br>
    <b>Email:</b> ${c.email}<br>
    <b>Perusahaan:</b> ${c.perusahaan}<br>
    <b>Catatan:</b> ${c.catatan || "-"}
  `;
  detailModal.style.display = "block";
  document.getElementById("editFromDetail").onclick = () => openEditForm(c);
  document.getElementById("copyFromDetail").onclick = copyData;
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

// === Close Modals ===
function closeEditModal() {
  editModal.style.display = "none";
}
function closeDetailModal() {
  detailModal.style.display = "none";
}

// === Save / Edit Contact ===
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = contactForm.contactId.value;
  const payload = {
    action: id ? "update" : "create",
    id,
    nama: contactForm.nama.value,
    telepon: contactForm.telepon.value,
    email: contactForm.email.value,
    perusahaan: contactForm.perusahaan.value,
    catatan: contactForm.catatan.value,
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();

    if (result.status === "success") {
      alert(result.message);
      fetchData();
      clearForm();
    } else {
      alert("Gagal: " + result.message);
    }
  } catch (err) {
    console.error("Error saving contact:", err);
    alert("Terjadi kesalahan saat menyimpan data.");
  }
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
  const payload = { action: "delete", id };
  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  fetchData();
}

// === Delete Selected ===
async function deleteSelected() {
  const selected = Array.from(document.querySelectorAll(".selectBox:checked")).map((b) => b.dataset.id);
  if (selected.length === 0) return;
  if (!confirm("Hapus semua kontak yang dipilih?")) return;

  for (let id of selected) {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
  }
  fetchData();
}

// === Copy Data ===
function copyData() {
  const text = detailText.innerText;
  navigator.clipboard.writeText(text).then(() => alert("Kontak telah disalin!"));
}

// === Select All ===
function toggleSelectAll(checkbox) {
  document.querySelectorAll(".selectBox").forEach((cb) => (cb.checked = checkbox.checked));
  toggleDeleteBtn();
}

// === Toggle Delete Button ===
function toggleDeleteBtn() {
  const count = document.querySelectorAll(".selectBox:checked").length;
  deleteSelectedBtn.style.display = count > 0 ? "inline-block" : "none";
}

// === Search ===
searchInput.addEventListener("keyup", () => {
  const kw = searchInput.value.toLowerCase();
  document.querySelectorAll("#contactsTable tr").forEach((row) => {
    row.style.display = row.innerText.toLowerCase().includes(kw) ? "" : "none";
  });
});

// === Upload CSV ===
uploadCsvInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file || file.type !== "text/csv") return alert("File bukan CSV!");

  const reader = new FileReader();
  reader.onload = async function () {
    const csvData = reader.result.split("\n").map((r) => r.split(","));
    const data = csvData.slice(1).map((r) => ({
      nama: r[0],
      telepon: r[1],
      email: r[2],
      perusahaan: r[3],
      catatan: r[4],
    }));
    const payload = { action: "import", data };
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    alert("CSV berhasil diimpor!");
    fetchData();
  };
  reader.readAsText(file);
});

// === Init ===
window.addEventListener("load", fetchData);
