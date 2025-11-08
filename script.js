// === GANTI URL INI DENGAN PUNYA KAMU ===
const API_URL = "https://script.google.com/macros/s/AKfycbxUL7BA-Obl2D0uinaElayBlKx09Jg5EPScfq3F0_n9kCcT4zaytW2Qh0sLh0_yteQd5g/exec";

// === FORM SUBMIT ===
document.getElementById("contactForm").addEventListener("submit", e => {
  e.preventDefault();
  saveContact();
});

// === SIMPAN / UPDATE ===
function saveContact() {
  const id = document.getElementById("contactId").value;
  const params = new URLSearchParams({
    nama: document.getElementById("nama").value.toUpperCase().slice(0,20),
    telepon: document.getElementById("telepon").value,
    email: document.getElementById("email").value.toLowerCase(),
    perusahaan: document.getElementById("perusahaan").value.slice(0,20),
    catatan: document.getElementById("catatan").value.slice(0,20)
  });
  if (id) {
    params.append("action", "update");
    params.append("id", id);
  } else {
    params.append("action", "create");
  }
  fetch(API_URL, { method: "POST", body: params })
    .then(() => location.reload());
}

// === EDIT ===
function editContact(c) {
  document.getElementById("contactId").value = c.id;
  document.getElementById("nama").value = c.nama;
  document.getElementById("telepon").value = c.telepon;
  document.getElementById("email").value = c.email;
  document.getElementById("perusahaan").value = c.perusahaan;
  document.getElementById("catatan").value = c.catatan;
}

// === HAPUS ===
function deleteContact(id) {
  if (confirm("Hapus kontak ini?")) {
    const params = new URLSearchParams({ action: "delete", id });
    fetch(API_URL, { method: "POST", body: params })
      .then(() => location.reload());
  }
}

// === HAPUS BANYAK ===
function deleteSelected() {
  if (confirm("Hapus semua kontak yang dipilih?")) {
    const selected = Array.from(document.querySelectorAll(".selectBox:checked"));
    selected.forEach(box => {
      const params = new URLSearchParams({ action: "delete", id: box.dataset.id });
      fetch(API_URL, { method: "POST", body: params });
    });
    setTimeout(() => location.reload(), 500);
  }
}

function toggleSelectAll(checkbox) {
  const boxes = document.querySelectorAll(".selectBox");
  boxes.forEach(b => b.checked = checkbox.checked);
  toggleDeleteBtn();
}

function toggleDeleteBtn() {
  const selected = document.querySelectorAll(".selectBox:checked").length;
  document.getElementById("deleteSelectedBtn").style.display = selected > 0 ? "inline-block" : "none";
}

function clearForm() {
  document.getElementById("contactForm").reset();
  document.getElementById("contactId").value = "";
}

// === FILTER ===
function filterContacts() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const rows = document.querySelectorAll("#contactsTable tr");
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(keyword) ? "" : "none";
  });
}

// === TAMPILKAN DATA ===
window.onload = function() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => buildTable(data));
};

function buildTable(data) {
  const table = document.getElementById("contactsTable");
  table.innerHTML = "";
  data.forEach((c, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="checkbox" class="selectBox" data-id="${c.id}" onchange="toggleDeleteBtn()"></td>
      <td>${i + 1}</td>
      <td>${c.nama.toUpperCase().slice(0,20)}</td>
      <td>${c.telepon}</td>
      <td style="text-transform:lowercase;">${c.email.toLowerCase()}</td>
      <td>${c.perusahaan.slice(0,20)}</td>
      <td>${c.catatan.slice(0,20)}</td>
      <td>
        <button class="action" onclick='editContact(${JSON.stringify(c)})'>✏️</button>
        <button class="action" onclick="deleteContact(${c.id})">🗑️</button>
      </td>`;
    row.addEventListener("click", e => {
      if (!e.target.classList.contains("action") && e.target.type !== "checkbox") {
        showDetails(c);
      }
    });
    table.appendChild(row);
  });
}

// === DETAIL MODAL ===
function showDetails(c) {
  document.getElementById("detailText").innerHTML = `
    <b>Nama:</b> ${c.nama}<br>
    <b>Telepon:</b> ${c.telepon}<br>
    <b>Email:</b> ${c.email}<br>
    <b>Perusahaan:</b> ${c.perusahaan}<br>
    <b>Catatan:</b> ${c.catatan}`;
  document.getElementById("detailModal").style.display = "block";
}

function closeModal() {
  document.getElementById("detailModal").style.display = "none";
}

// === EKSPOR CSV ===
function exportCSV() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      const csv = [
        ["Nama", "Telepon", "Email", "Perusahaan", "Catatan"],
        ...data.map(c => [c.nama, c.telepon, c.email, c.perusahaan, c.catatan])
      ].map(e => e.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "kontak.csv";
      link.click();
    });
}

// === SALIN SEMUA ===
function copyAll() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      const text = data.map(c => 
        `${c.nama} | ${c.telepon} | ${c.email} | ${c.perusahaan} | ${c.catatan}`
      ).join("\n");
      navigator.clipboard.writeText(text);
      alert("Semua kontak telah disalin!");
    });
}
