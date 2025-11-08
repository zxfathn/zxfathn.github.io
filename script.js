const sheetURL = "https://script.google.com/macros/s/AKfycbw3-0DhekjK30lfUlBgk32vqpf-VtgXOBtENIJHNqk3YOW2jxyKZ2YeutEK0FUZHXek/exec";

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
