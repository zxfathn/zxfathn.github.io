const API_URL = "https://script.google.com/macros/s/AKfycbydEpfOgZhBuKqdoROmXlIYi41PW9E5YpECmUhu-Mrhgaku1Pchf3KVqbZ9bkiJa7rvNw/exec";

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

// === Show Details Modal ===
function showDetails(c) { /* ... sama seperti versi awal ... */ }

// === Edit Modal ===
function openEditForm(c) { /* ... sama seperti versi awal ... */ }

// === Close Modals ===
function closeEditModal() { editModal.style.display = "none"; }
function closeDetailModal() { detailModal.style.display = "none"; }

// === Save/Edit Contact ===
contactForm.addEventListener("submit", async (e) => { /* ... versi awal ... */ });

// === Delete Contact ===
async function deleteContact(id) { /* ... versi awal ... */ }

// === Delete Selected Contacts ===
async function deleteSelected() { /* ... versi awal ... */ }

// === Copy Data ===
function copyData() { /* ... versi awal ... */ }

// === Select All / Toggle Delete Btn ===
function toggleSelectAll(checkbox) { /* ... versi awal ... */ }
function toggleDeleteBtn() { /* ... versi awal ... */ }

// === Search ===
searchInput.addEventListener("keyup", () => { /* ... versi awal ... */ });

// === CSV Upload ===
uploadCsvInput.addEventListener("change", (e) => { /* ... versi awal ... */ });

// === Initialize ===
window.addEventListener("load", fetchData);
