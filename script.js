const API_URL = "https://script.google.com/macros/s/AKfycbxUL7BA-Obl2D0uinaElayBlKx09Jg5EPScfq3F0_n9kCcT4zaytW2Qh0sLh0_yteQd5g/exec";

document.getElementById("contactForm").addEventListener("submit", e=>{
  e.preventDefault();
  saveContact();
});

function saveContact(){
  const id = document.getElementById("contactId").value;
  const params = new URLSearchParams({
    nama: document.getElementById("nama").value,
    telepon: document.getElementById("telepon").value,
    email: document.getElementById("email").value,
    perusahaan: document.getElementById("perusahaan").value,
    catatan: document.getElementById("catatan").value
  });
  params.append("action", id ? "update" : "create");
  if(id) params.append("id", id);

  fetch(API_URL,{method:"POST",body:params})
    .then(()=>location.reload());
}

function editContact(c){
  document.getElementById("contactId").value = c.id;
  document.getElementById("nama").value = c.nama;
  document.getElementById("telepon").value = c.telepon;
  document.getElementById("email").value = c.email;
  document.getElementById("perusahaan").value = c.perusahaan;
  document.getElementById("catatan").value = c.catatan;
}

function deleteContact(id){
  if(confirm("Hapus kontak ini?")){
    const params = new URLSearchParams({ action:"delete", id:id });
    fetch(API_URL,{method:"POST",body:params})
      .then(()=>location.reload());
  }
}

function deleteSelected(){
  if(confirm("Hapus semua kontak yang dipilih?")){
    const selected = Array.from(document.querySelectorAll(".selectBox:checked"));
    selected.forEach(box=>{
      const params = new URLSearchParams({action:"delete",id:box.dataset.id});
      fetch(API_URL,{method:"POST",body:params});
    });
    setTimeout(()=>location.reload(),500);
  }
}

function toggleSelectAll(checkbox){
  const boxes = document.querySelectorAll(".selectBox");
  boxes.forEach(b=>b.checked = checkbox.checked);
  toggleActionBtns();
}

function toggleActionBtns(){
  const selected = document.querySelectorAll(".selectBox:checked").length;
  document.getElementById("deleteSelectedBtn").style.display = selected>0?"inline-block":"none";
  document.getElementById("copySelectedBtn").style.display = selected>0?"inline-block":"none";
}

function clearForm(){
  document.getElementById("contactForm").reset();
  document.getElementById("contactId").value="";
}

function filterContacts(){
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const rows = document.querySelectorAll("#contactsTable tr");
  rows.forEach(row=>{
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(keyword) ? "" : "none";
  });
}

window.onload = function() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      const table = document.getElementById("contactsTable");
      table.innerHTML = "";
      data.forEach((c, i) => {
        const emailLower = c.email.toLowerCase();
        const truncated = str => str.length > 20 ? str.slice(0, 20) + "…" : str;
        const row = document.createElement("tr");
        row.innerHTML = `
          <td><input type="checkbox" class="selectBox" data-id="${c.id}" onchange="toggleActionBtns()"></td>
          <td style="text-align:left;">${i+1}</td>
          <td>${truncated(c.nama.toUpperCase())}</td>
          <td>${truncated(c.telepon)}</td>
          <td class="email">${truncated(emailLower)}</td>
          <td>${truncated(c.perusahaan.toUpperCase())}</td>
          <td>${truncated(c.catatan.toUpperCase())}</td>
          <td>
            <button class="action" onclick='editContact(${JSON.stringify(c)})'>✏️</button>
            <button class="action" onclick="deleteContact(${c.id})">🗑️</button>
          </td>
        `;
        row.onclick = () => alert(`
📇 DETAIL KONTAK:
Nama: ${c.nama}
Telepon: ${c.telepon}
Email: ${c.email}
Perusahaan: ${c.perusahaan}
Catatan: ${c.catatan}
        `);
        table.appendChild(row);
      });
    });
};

// === EKSPOR CSV ===
function exportCSV() {
  const rows = [["Nama","Telepon","Email","Perusahaan","Catatan"]];
  document.querySelectorAll("#contactsTable tr").forEach(tr => {
    const tds = tr.querySelectorAll("td");
    if (tds.length > 0) {
      rows.push([
        tds[2].innerText, tds[3].innerText, tds[4].innerText,
        tds[5].innerText, tds[6].innerText
      ]);
    }
  });
  const csv = rows.map(e => e.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "kontak.csv";
  a.click();
}

// === SALIN DATA ===
function copySelected() {
  const selected = Array.from(document.querySelectorAll(".selectBox:checked"));
  if(selected.length===0) return alert("Tidak ada data yang dipilih.");
  const data = selected.map(b => {
    const row = b.closest("tr").querySelectorAll("td");
    return `${row[2].innerText} | ${row[3].innerText} | ${row[4].innerText} | ${row[5].innerText} | ${row[6].innerText}`;
  }).join("\n");
  navigator.clipboard.writeText(data);
  alert("Data berhasil disalin ke clipboard!");
}
