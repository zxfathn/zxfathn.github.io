// URL Web App dari Google Apps Script kamu
const sheetURL = "https://script.google.com/macros/s/AKfycbzSd5XF_7n5d8OZ9gDuB06_m9at49Evqew__xtQqe9g6ZzhCFQIO_I55lDNPvibwrYN/exec";

// Ambil dan tampilkan semua data
async function loadContacts() {
  const tbody = document.querySelector("#contactTable tbody");
  tbody.innerHTML = "<tr><td colspan='5'>Memuat data...</td></tr>";

  try {
    const res = await fetch(sheetURL);
    const data = await res.json();

    tbody.innerHTML = "";

    if (!data || data.length === 0) {
      tbody.innerHTML = "<tr><td colspan='5'>Belum ada data</td></tr>";
      return;
    }

    data.forEach(c => {
      const row = `<tr>
        <td>${c.Nama || ""}</td>
        <td>${c.Email || ""}</td>
        <td>${c.Telepon || ""}</td>
        <td>${c.Perusahaan || ""}</td>
        <td>${c.Catatan || ""}</td>
      </tr>`;
      tbody.insertAdjacentHTML("beforeend", row);
    });
  } catch (err) {
    console.error("Gagal memuat data:", err);
    tbody.innerHTML = "<tr><td colspan='5'>Gagal memuat data</td></tr>";
  }
}

// Tambah data ke Google Sheet
document.querySelector("#contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  try {
    const res = await fetch(sheetURL, {
      method: "POST",
      body: formData
    });

    if (!res.ok) throw new Error("HTTP Error: " + res.status);
    e.target.reset();
    await loadContacts();
  } catch (err) {
    console.error("Gagal menambah data:", err);
    alert("Gagal menambah data. Coba lagi.");
  }
});

// Jalankan saat halaman dibuka
loadContacts();
