const API_URL = "https://script.google.com/macros/s/AKfycbwjplk3fuw3gG8_5Jfd5P0zHPyk1GNOSo2glHnBBGdfw6mjbNaJ73svQ9ZvBGxvRgsBag/exec";

const contactsTable = document.getElementById("contactsTable");
const contactForm = document.getElementById("contactForm");
const searchInput = document.getElementById("searchInput");
const selectAllCheckbox = document.getElementById("selectAll");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
const copySelectedBtn = document.getElementById("copySelectedBtn");
const uploadCsvInput = document.getElementById("uploadCsv");

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
    contactsTable.appendChild(row);
  });
}

// === Handle CSV File Upload ===
uploadCsvInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file && file.type === "text/csv") {
    const reader = new FileReader();
    reader.onload = async function () {
      const csvData = reader.result.split("\n").map((row) => row.split(","));
      
      // Parsing CSV ke dalam format yang benar
      const data = csvData.slice(1).map((row) => ({
        nama: row[0],
        telepon: row[1],
        email: row[2],
        perusahaan: row[3],
        catatan: row[4],
      }));

      // Mengirim data CSV ke server
      const params = new URLSearchParams();
      params.append("action", "import");
      params.append("data", JSON.stringify(data));  // Kirim data CSV dalam format JSON

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          body: params,
        });

        const responseData = await res.json();
        if (responseData.status === "ok") {
          alert("CSV berhasil diimpor! Klik OK untuk melanjutkan.");
          // Arahkan pengguna ke halaman tujuan setelah klik OK
          window.location.href = "https://zxfathn.github.io";  // Arahkan ke halaman
          fetchData(); // Memanggil fungsi fetchData untuk reload data baru
        } else {
          alert("Terjadi kesalahan: " + responseData.message);
        }
      } catch (err) {
        alert("Error mengimpor CSV: " + err.message);
      }
    };
    reader.readAsText(file);
  } else {
    alert("File bukan format CSV!");
  }
});

// === Delete Selected Contacts ===
async function deleteSelected() {
  const selected = Array.from(document.querySelectorAll(".selectBox:checked")).map((b) => b.dataset.id);
  if (selected.length === 0) return;
  if (!confirm("Hapus semua kontak yang dipilih?")) return;

  for (let id of selected) {
    await fetch(API_URL, { method: "POST", body: new URLSearchParams({ action: "delete", id }) });
  }

  // Alert after deletion
  alert("Kontak yang dipilih telah dihapus! Klik OK untuk melanjutkan.");
  window.location.href = "https://zxfathn.github.io";  // Arahkan ke halaman setelah mengklik OK
  fetchData(); // Refresh the data on the page
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

  try {
    await fetch(API_URL, { method: "POST", body: params });
    fetchData();
    clearForm();
    alert("Kontak berhasil disimpan! Klik OK untuk melanjutkan.");
    window.location.href = "https://zxfathn.github.io";  // Arahkan ke halaman setelah mengklik OK
  } catch (err) {
    console.error("Error saving contact:", err);
    alert("Terjadi kesalahan saat menyimpan kontak.");
  }
});

// === Clear Form ===
function clearForm() {
  contactForm.reset();
  contactForm.contactId.value = "";
  document.getElementById("btnCancel").style.display = "none";
}

// === Initialize ===
window.addEventListener("load", fetchData);
