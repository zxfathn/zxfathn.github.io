const API_URL = "https://script.google.com/macros/s/AKfycbzTJtaSdvKyMZtMTspA-6Qcymv4wuwHLxJ3PcrkEa_7IrbMdbCKUohznixKap0DajPVMw/exec";

const contactsTable = document.getElementById("contactsTable");
const contactForm = document.getElementById("contactForm");
const searchInput = document.getElementById("searchInput");
const selectAllCheckbox = document.getElementById("selectAll");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
const uploadCsvInput = document.getElementById("uploadCsv");
const editModal = document.getElementById("editModal");
const detailModal = document.getElementById("detailModal");
const detailText = document.getElementById("detailText");
const loader = document.getElementById("loader");
const notification = document.getElementById("notification");

let contactsData = [];

function showLoader(show) {
  loader.style.display = show ? "flex" : "none";
}

function showNotification(message, type = "success") {
  notification.textContent = message;
  notification.className = "notification " + type;
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

// === Fetch Data ===
async function fetchData() {
  showLoader(true);
  try {
    const res = await fetch(API_URL + "?t=" + new Date().getTime());
    const data = await res.json();
    contactsData = data;
    buildTable(data);
  } catch (err) {
    console.error("Error fetching data: ", err);
    showNotification("Gagal memuat data", "error");
  } finally {
    showLoader(false);
  }
}

// === Build Table ===
function buildTable(data) {
  contactsTable.innerHTML = "";
  data.forEach((c, i) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><input type="checkbox" class="selectBox" data-id="${c.id}"></td>
      <td>${i + 1}</td>
      <td>${c.nama}</td>
      <td>${c.telepon}</td>
      <td>${c.email}</td>
      <td>${c.perusahaan}</td>
      <td>${c.catatan || ""}</td>
    `;

    const check = row.querySelector(".selectBox");
    check.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleDeleteBtn();
    });

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
    <b>Catatan:</b> ${c.catatan || ""}`;

  detailModal.style.display = "block";

  document.getElementById("editFromDetail").onclick = () => openEditForm(c);
  document.getElementById("copyFromDetail").onclick = copyData;
  document.getElementById("deleteFromDetail").onclick = async () => {
    await deleteContact(c.id);
    closeDetailModal();
  };
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

// === Save/Edit Contact ===
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("contactId").value;
  const payload = {
    action: id ? "update" : "create",
    id,
    nama: document.getElementById("nama").value,
    telepon: document.getElementById("telepon").value,
    email: document.getElementById("email").value,
    perusahaan: document.getElementById("perusahaan").value,
    catatan: document.getElementById("catatan").value,
  };

  showLoader(true);
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();

    if (result.status === "success") {
      showNotification(result.message, "success");
      contactForm.reset();
      document.getElementById("contactId").value = "";
      await fetchData();
    } else {
      showNotification(result.message, "error");
    }
  } catch (err) {
    console.error("Error saving contact:", err);
    showNotification("Terjadi kesalahan saat menyimpan data", "error");
  } finally {
    showLoader(false);
  }
});

// === Clear Form ===
function clearForm() {
  contactForm.reset();
  document.getElementById("contactId").value = "";
}

// === Delete Contact ===
async function deleteContact(id) {
  if (!confirm("Hapus kontak ini?")) return;
  showLoader(true);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    const result = await res.json();

    if (result.status === "success") {
      showNotification(result.message, "success");
      await fetchData();
    } else {
      showNotification(result.message, "error");
    }
  } catch (err) {
    console.error("Error deleting contact:", err);
    showNotification("Gagal menghapus data!", "error");
  } finally {
    showLoader(false);
  }
}

// === Delete Selected Contacts ===
async function deleteSelected() {
  const selected = Array.from(document.querySelectorAll(".selectBox:checked")).map(b => b.dataset.id);
  if (selected.length === 0) return;
  if (!confirm("Hapus semua kontak yang dipilih?")) return;
  showLoader(true);

  try {
    for (let id of selected) {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
    }
    showNotification("Kontak terpilih dihapus", "success");
    await fetchData();
  } catch (err) {
    console.error("Error deleting selected:", err);
    showNotification("Gagal menghapus beberapa kontak!", "error");
  } finally {
    showLoader(false);
  }
}

// === Copy Data from Detail ===
function copyData() {
  navigator.clipboard.writeText(detailText.innerText)
    .then(() => showNotification("Kontak detail disalin!", "success"))
    .catch(() => showNotification("Gagal menyalin!", "error"));
}

// === Select All / Unselect All ===
function toggleSelectAll(checkbox) {
  document.querySelectorAll(".selectBox").forEach(cb => cb.checked = checkbox.checked);
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
  document.querySelectorAll("#contactsTable tr").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(kw) ? "" : "none";
  });
});

// === Handle CSV File Upload ===
uploadCsvInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file || file.type !== "text/csv") return showNotification("File bukan format CSV!", "error");

  const reader = new FileReader();
  reader.onload = async function() {
    const csvData = reader.result.split("\n").map(r => r.split(","));
    const data = csvData.slice(1).map(row => ({
      nama: row[0],
      telepon: row[1],
      email: row[2],
      perusahaan: row[3],
      catatan: row[4],
    }));

    showLoader(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import", data }),
      });
      const result = await res.json();

      if (result.status === "success") {
        showNotification(result.message, "success");
        await fetchData();
      } else {
        showNotification(result.message, "error");
      }
    } catch (err) {
      console.error("Error importing CSV:", err);
      showNotification("Gagal mengimpor CSV!", "error");
    } finally {
      showLoader(false);
    }
  };
  reader.readAsText(file);
});

// === Initialize ===
window.addEventListener("load", fetchData);
