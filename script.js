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
          alert("CSV berhasil diimpor!");
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

// === Search Functionality ===
searchInput.addEventListener("keyup", () => {
  const kw = searchInput.value.toLowerCase();
  document.querySelectorAll("#contactsTable tr").forEach((row) => {
    row.style.display = row.innerText.toLowerCase().includes(kw) ? "" : "none";
  });
});

// === Initialize ===
window.addEventListener("load", fetchData);
