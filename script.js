const sheetURL = "https://script.google.com/macros/s/AKfycbxUeONdd-3mbxz0iwhlC4p6HIwt0N3o6z8x3mPGEBNCDysiWSXLtfdaONg8HYln0ai9/exec"; // pastikan benar

async function loadContacts() {
  try {
    const res = await fetch(sheetURL);
    const json = await res.json();
    if (json.status !== "OK") throw new Error(json.message || "Gagal load");
    const data = json.data || [];
    const tbody = document.querySelector("#contactTable tbody");
    tbody.innerHTML = "";

    data.forEach(c => {
      // escape string untuk aman dalam onclick (simple replace)
      const esc = s => (s === undefined || s === null) ? "" : String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;');
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${c.Nama || ""}</td>
        <td>${c.Email || ""}</td>
        <td>${c.Telepon || ""}</td>
        <td>${c.Perusahaan || ""}</td>
        <td>${c.Catatan || ""}</td>
        <td>
          <button class="edit" onclick='editContact(${c.id},"${esc(c.Nama)}","${esc(c.Email)}","${esc(c.Telepon)}","${esc(c.Perusahaan)}","${esc(c.Catatan)}")'>Edit</button>
          <button class="delete" onclick="deleteContact(${c.id})">Hapus</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Gagal memuat data:", err);
    alert("Gagal memuat data: " + err.message);
  }
}

document.querySelector("#contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("contactId").value;
  const Nama = document.getElementById("Nama").value;
  const Email = document.getElementById("Email").value;
  const Telepon = document.getElementById("Telepon").value;
  const Perusahaan = document.getElementById("Perusahaan").value;
  const Catatan = document.getElementById("Catatan").value;

  const isUpdate = !!id;
  const payload = {
    action: isUpdate ? "update" : "create",
    id: id || undefined,
    Nama, Email, Telepon, Perusahaan, Catatan
  };

  try {
    const res = await fetch(sheetURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.status !== "OK") throw new Error(json.message || "Gagal menyimpan");
    e.target.reset();
    document.getElementById("contactId").value = "";
    loadContacts();
  } catch (err) {
    console.error("Simpan error:", err);
    alert("Simpan error: " + err.message);
  }
});

async function deleteContact(id) {
  if (!confirm("Yakin ingin menghapus kontak ini?")) return;
  try {
    const res = await fetch(sheetURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id })
    });
    const json = await res.json();
    if (json.status !== "OK") throw new Error(json.message || "Gagal delete");
    loadContacts();
  } catch (err) {
    console.error("Delete error:", err);
    alert("Delete error: " + err.message);
  }
}

function editContact(id, Nama, Email, Telepon, Perusahaan, Catatan) {
  document.getElementById("contactId").value = id;
  document.getElementById("Nama").value = Nama;
  document.getElementById("Email").value = Email;
  document.getElementById("Telepon").value = Telepon;
  document.getElementById("Perusahaan").value = Perusahaan;
  document.getElementById("Catatan").value = Catatan;
}

loadContacts();
