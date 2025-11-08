const sheetURL = "https://script.google.com/macros/s/AKfycbxIm1TEaxg6P11w7h2xW0wAtNUupf6r_BgWpHi_aLyPApCh3A94Zvl2c1O0V-NC2w_9/exec";

async function loadContacts() {
  try {
    const res = await fetch(sheetURL);
    const data = await res.json();
    const tbody = document.querySelector("#contactTable tbody");
    tbody.innerHTML = "";

    data.forEach(c => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${c.Nama || ""}</td>
        <td>${c.Email || ""}</td>
        <td>${c.Telepon || ""}</td>
        <td>${c.Perusahaan || ""}</td>
        <td>${c.Catatan || ""}</td>
        <td>
          <button class="action-btn" onclick="editContact(${c.id}, '${c.Nama}', '${c.Email}', '${c.Telepon}', '${c.Perusahaan}', '${c.Catatan}')">Edit</button> |
          <button class="action-btn" onclick="deleteContact(${c.id})">Hapus</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Gagal memuat data:", err);
  }
}

document.querySelector("#contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = Object.fromEntries(new FormData(form));

  if (formData.id) {
    // Update data
    await fetch(sheetURL, {
      method: "PUT",
      body: JSON.stringify(formData),
    });
  } else {
    // Tambah data baru
    await fetch(sheetURL, {
      method: "POST",
      body: JSON.stringify(formData),
    });
  }

  form.reset();
  document.getElementById("contactId").value = "";
  loadContacts();
});

async function deleteContact(id) {
  if (!confirm("Yakin ingin menghapus kontak ini?")) return;
  await fetch(`${sheetURL}?id=${id}`, { method: "DELETE" });
  loadContacts();
}

function editContact(id, nama, email, telepon, perusahaan, catatan) {
  document.getElementById("contactId").value = id;
  document.querySelector('[name="Nama"]').value = nama;
  document.querySelector('[name="Email"]').value = email;
  document.querySelector('[name="Telepon"]').value = telepon;
  document.querySelector('[name="Perusahaan"]').value = perusahaan;
  document.querySelector('[name="Catatan"]').value = catatan;
}

loadContacts();
