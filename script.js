const SCRIPT_URL = "MASUKKAN_URL_APPS_SCRIPT_KAMU_DI_SINI";

async function loadContacts() {
  try {
    const res = await fetch(SCRIPT_URL);
    const data = await res.json();
    const tbody = document.querySelector("#contactTable tbody");
    tbody.innerHTML = "";
    data.forEach(c => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${c.Nama}</td>
        <td>${c.Email}</td>
        <td>${c.Telepon}</td>
        <td>${c.Perusahaan}</td>
        <td>${c.Catatan}</td>
        <td>
          <button onclick='editContact(${c.id})'>Edit</button>
          <button onclick='deleteContact(${c.id})'>Hapus</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    alert("Gagal memuat data!");
  }
}

async function addContact(formData) {
  await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(formData)
  });
  loadContacts();
}

async function editContact(id) {
  const res = await fetch(SCRIPT_URL);
  const data = await res.json();
  const contact = data.find(c => c.id === id);
  if (!contact) return;
  document.querySelector("#id").value = id;
  for (let key in contact) {
    const field = document.querySelector(`[name="${key}"]`);
    if (field) field.value = contact[key];
  }
}

async function deleteContact(id) {
  if (!confirm("Yakin ingin menghapus?")) return;
  await fetch(`${SCRIPT_URL}?id=${id}`, { method: "DELETE" });
  loadContacts();
}

document.querySelector("#contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target));
  if (formData.id) {
    await fetch(SCRIPT_URL, {
      method: "PUT",
      body: JSON.stringify(formData)
    });
  } else {
    await addContact(formData);
  }
  e.target.reset();
  loadContacts();
});

loadContacts();
