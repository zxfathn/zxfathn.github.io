const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwFtYSDMWHRxx7mblymIHbGAxUwnXko5AbGSz81E3KqYLHK0Tfj7rqalyqjYWWRG7Sy/exec";

async function loadContacts() {
  try {
    const res = await fetch(SCRIPT_URL);
    const data = await res.json();
    const tbody = document.querySelector("#contactTable tbody");
    tbody.innerHTML = "";

    data.forEach((c, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${c.Nama}</td>
        <td>${c.Email}</td>
        <td>${c.Telepon}</td>
        <td>${c.Perusahaan}</td>
        <td>${c.Catatan}</td>
        <td>
          <button class="action-btn edit-btn" onclick="editContact(${i + 2}, '${c.Nama}', '${c.Email}', '${c.Telepon}', '${c.Perusahaan}', '${c.Catatan}')">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteContact(${i + 2})">Hapus</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    alert("Gagal memuat data. Pastikan Apps Script di-deploy sebagai 'Anyone'.");
    console.error(err);
  }
}

document.querySelector("#contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const rowId = formData.get("rowId");
  const method = rowId ? "PUT" : "POST";

  await fetch(SCRIPT_URL, {
    method,
    body: JSON.stringify(Object.fromEntries(formData)),
  });

  form.reset();
  document.querySelector("#btnSimpan").textContent = "Tambah Kontak";
  loadContacts();
});

function editContact(rowId, Nama, Email, Telepon, Perusahaan, Catatan) {
  document.querySelector("#rowId").value = rowId;
  document.querySelector("[name='Nama']").value = Nama;
  document.querySelector("[name='Email']").value = Email;
  document.querySelector("[name='Telepon']").value = Telepon;
  document.querySelector("[name='Perusahaan']").value = Perusahaan;
  document.querySelector("[name='Catatan']").value = Catatan;
  document.querySelector("#btnSimpan").textContent = "Simpan Perubahan";
}

async function deleteContact(rowId) {
  if (!confirm("Yakin mau hapus data ini?")) return;
  await fetch(`${SCRIPT_URL}?rowId=${rowId}`, { method: "DELETE" });
  loadContacts();
}

loadContacts();
