const API_URL = "https://script.google.com/macros/s/AKfycbxUL7BA-Obl2D0uinaElayBlKx09Jg5EPScfq3F0_n9kCcT4zaytW2Qh0sLh0_yteQd5g/exec";

const contactForm = document.getElementById("contactForm");
const btnCancel = document.getElementById("btnCancel");
const searchInput = document.getElementById("searchInput");
const selectAllCheckbox = document.getElementById("selectAll");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
const exportCSVBtn = document.getElementById("exportCSVBtn");
const copyAllBtn = document.getElementById("copyAllBtn");
const contactsTable = document.getElementById("contactsTable");
const detailModal = document.getElementById("detailModal");
const detailText = document.getElementById("detailText");
const toast = document.getElementById("toast");

// === HELPERS ===
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

function resetForm() {
  contactForm.reset();
  document.getElementById("contactId").value = "";
}

// === FETCH DATA ===
async function fetchData() {
  const res = await fetch(API_URL);
  const data = await res.json();
  buildTable(data);
  return data;
}

// === SAVE / UPDATE ===
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("contactId").value;
  const params = new URLSearchParams({
    nama: document.getElementById("nama").value.toUpperCase().slice(0,20),
    telepon: document.getElementById("telepon").value,
    email: document.getElementById("email").value.toLowerCase(),
    perusahaan: document.getElementById("perusahaan").value.slice(0,20),
    catatan: document.getElementById("catatan").value.slice(0,20),
    action: id ? "update" : "create",
  });
  if (id) params.append("id", id);

  await fetch(API_URL, { method: "POST", body: params });
  showToast("Kontak tersimpan!");
  resetForm();
  fetchData();
});

btnCancel.addEventListener("click", resetForm);

// === TABLE BUILD ===
function buildTable(data) {
  contactsTable.innerHTML = "";
  data.forEach((c, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="checkbox" class="selectBox" data-id="${c.id}"></td>
      <td>${i+1}</td>
      <td>${c.nama.toUpperCase().slice(0,20)}</td>
      <td>${c.telepon}</td>
      <td style="text-transform:lowercase;">${c.email.toLowerCase()}</td>
      <td>${c.perusahaan.slice(0,20)}</td>
      <td>${c.catatan.slice(0,20)}</td>
      <td>
        <button class="action editBtn">✏️</button>
        <button class="action deleteBtn">🗑️</button>
      </td>`;
    
    row.addEventListener("click", e => {
      if (!e.target.classList.contains("action") && e.target.type !== "checkbox") showDetails(c);
    });

    row.querySelector(".editBtn").addEventListener("click", () => editContact(c));
    row.querySelector(".deleteBtn").addEventListener("click", () => deleteContact(c.id));
    row.querySelector(".selectBox").addEventListener("change", toggleDeleteBtn);

    contactsTable.appendChild(row);
  });
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

// === DELETE ===
async function deleteContact(id) {
  if (!confirm("Hapus kontak ini?")) return;
  await fetch(API_URL, { method: "POST", body: new URLSearchParams({ action:"delete", id }) });
  showToast("Kontak dihapus!");
  fetchData();
}

// === MULTI DELETE ===
deleteSelectedBtn.addEventListener("click", async () => {
  if (!confirm("Hapus semua kontak yang dipilih?")) return;
  const selected = Array.from(document.querySelectorAll(".selectBox:checked"));
  await Promise.all(selected.map(box => 
    fetch(API_URL, { method:"POST", body: new URLSearchParams({ action:"delete", id: box.dataset.id }) })
  ));
  showToast("Kontak terhapus!");
  fetchData();
});

// === SELECT ALL ===
selectAllCheckbox.addEventListener("change", () => {
  document.querySelectorAll(".selectBox").forEach(b => b.checked = selectAllCheckbox.checked);
  toggleDeleteBtn();
});

function toggleDeleteBtn() {
  const anySelected = document.querySelectorAll(".selectBox:checked").length > 0;
  deleteSelectedBtn.style.display = anySelected ? "inline-block" : "none";
}

// === FILTER ===
searchInput.addEventListener("keyup", () => {
  const keyword = searchInput.value.toLowerCase();
  document.querySelectorAll("#contactsTable tr").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(keyword) ? "" : "none";
  });
});

// === MODAL DETAIL ===
function showDetails(c) {
  detailText.innerHTML = `
    <b>Nama:</b> ${c.nama}<br>
    <b>Telepon:</b> ${c.telepon}<br>
    <b>Email:</b> ${c.email}<br>
    <b>Perusahaan:</b> ${c.perusahaan}<br>
    <b>Catatan:</b> ${c.catatan}`;
  detailModal.style.display = "block";
}

detailModal.querySelector(".close").addEventListener("click", () => detailModal.style.display = "none");
detailModal.addEventListener("click", e => {
  if (e.target === detailModal) detailModal.style.display = "none";
});

// === EKSPOR CSV ===
exportCSVBtn.addEventListener("click", async () => {
  const data = await fetchData();
  const csv = [["Nama","Telepon","Email","Perusahaan","Catatan"], ...data.map(c=>[c.nama,c.telepon,c.email,c.perusahaan,c.catatan])]
              .map(e=>e.join(",")).join("\n");
  const blob = new Blob([csv], { type:"text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "kontak.csv";
  link.click();
});

// === SALIN SEMUA ===
copyAllBtn.addEventListener("click", async () => {
  const data = await fetchData();
  const text = data.map(c => `${c.nama} | ${c.telepon} | ${c.email} | ${c.perusahaan} | ${c.catatan}`).join("\n");
  await navigator.clipboard.writeText(text);
  showToast("Semua kontak telah disalin!");
});

// === INIT ===
window.addEventListener("load", fetchData);
