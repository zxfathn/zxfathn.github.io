const sheetURL = "https://script.google.com/macros/s/AKfycbx0mWrcWFjpjOj8PPdiJ1Yu9sN76vMGB_zKZsGIPnh-muoHDeT_dQ4Is7Yi6u1Ds0pF/exec";
async function loadContacts() {
  const res = await fetch(sheetURL);
  const data = await res.json();
  const tbody = document.querySelector("#contactTable tbody");
  tbody.innerHTML = "";
  data.forEach(c => {
    const row = `<tr>
      <td>${c.Nama}</td>
      <td>${c.Email}</td>
      <td>${c.Telepon}</td>
      <td>${c.Perusahaan}</td>
      <td>${c.Catatan}</td>
    </tr>`;
    tbody.insertAdjacentHTML("beforeend", row);
  });
}

document.querySelector("#contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target));
  await fetch(sheetURL, {
    method: "POST",
    body: JSON.stringify(formData)
  });
  e.target.reset();
  loadContacts();
});

loadContacts();
