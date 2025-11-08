const sheetURL = "https://script.google.com/macros/s/AKfycbxidjon3T56d3EMUYRVjyjO1mcNulgERcPqmdxEpKutN88B9F-b1XoTsV_R3afyFBp2/exec";

// TAMPILKAN DATA
async function loadContacts() {
  const tbody = document.querySelector("#contactTable tbody");
  tbody.innerHTML = "<tr><td colspan='6'>Memuat data...</td></tr>";

  try {
    const res = await fetch(sheetURL);
    const data = await res.json();
    tbody.innerHTML = "";

    if (!data || data.length === 0) {
      tbody.innerHTML = "<tr><td colspan='6'>Belum ada data</td></tr>";
      return;
    }

    data.forEach((c, i) => {
      const row = `<tr>
        <td>${c.Nama || ""}</td>
        <td>${c.Email || ""}</td>
        <td>${c.Telepon || ""}</td>
        <td>${c.Perusahaan || ""}</td>
        <td>${c.Catatan || ""}</td>
        <td>
          <button class="edit" onclick="editContact(${i + 2}, '${c.Nama}', '${c.Email}', '${c.Telepon}', '${c.Perusahaan}', '${c.Catatan}')">Edit</button>
          <button class="delete" onclick="deleteContact(${i + 2})">Hapus</button>
        </td>
      </tr>`;
      tbody.insertAdjacentHTML("beforeend", row);
    });
  } catch (err) {
    console.error("Gagal memuat data:", err);
    tbody.innerHTML = "<tr><td colspan='6'>Gagal memuat data</td></tr>";
  }
}

// TAMBAH / UPDATE DATA
document.querySelector("#contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const method = form.row.value ? "PUT" : "POST"; // PUT jika sedang edit

  try {
    await fetch(sheetURL, {
      method,
      body: formData
    });

    form.reset();
    document.querySelector("#submitBtn").textContent = "Tambah Kontak";
    await loadContacts();
  } catch (err) {
    console.error("Gagal menyimpan data:", err);
    alert("Gagal menyimpan data. Coba lagi.");
  }
});

// FUNGSI EDIT
function editContact(row, Nama, Email, Telepon, Perusahaan, Catatan) {
  document.querySelector("#row").value = row;
  document.querySelector("#Nama").value = Nama;
  document.querySelector("#Email").value = Email;
  document.querySelector("#Telepon").value = Telepon;
  document.querySelector("#Perusahaan").value = Perusahaan;
  document.querySelector("#Catatan").value = Catatan;
  document.querySelector("#submitBtn").textContent = "Simpan Perubahan";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// FUNGSI HAPUS
async function deleteContact(row) {
  if (!confirm("Yakin ingin menghapus kontak ini?")) return;

  const formData = new FormData();
  formData.append("row", row);

  try {
    await fetch(sheetURL, {
      method: "DELETE",
      body: formData
    });
    await loadContacts();
  } catch (err) {
    console.error("Gagal menghapus:", err);
    alert("Gagal menghapus data.");
  }
}

loadContacts();
