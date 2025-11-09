const API_URL = "https://script.google.com/macros/s/AKfycbydEpfOgZhBuKqdoROmXlIYi41PW9E5YpECmUhu-Mrhgaku1Pchf3KVqbZ9bkiJa7rvNw/exec";

const contactsTable = document.getElementById("contactsTable");
const contactForm = document.getElementById("contactForm");
const searchInput = document.getElementById("searchInput");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
const copySelectedBtn = document.getElementById("copySelectedBtn");
const uploadCsvInput = document.getElementById("uploadCsv");

const detailModal = document.getElementById("detailModal");
const detailText = document.getElementById("detailText");
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");

// ==== FETCH DATA ====
async function fetchData(){
  try{
    const res = await fetch(API_URL);
    const data = await res.json();
    buildTable(data);
    window.scrollTo(0,0);
  }catch(err){ console.error(err); }
}

// ==== BUILD TABLE ====
function buildTable(data){
  contactsTable.innerHTML="";
  data.forEach((c,i)=>{
    const row = document.createElement("tr");
    row.innerHTML=`
      <td><input type="checkbox" class="selectBox" data-id="${c.id}" onchange="updateSelectedButtons()"></td>
      <td>${i+1}</td>
      <td>${c.nama}</td>
      <td>${c.telepon}</td>
      <td>${c.email}</td>
      <td>${c.perusahaan}</td>
      <td>${c.catatan}</td>
    `;
    row.addEventListener("click", e=>{
      if(!e.target.classList.contains("selectBox")) showDetailModal(c);
    });
    contactsTable.appendChild(row);
  });
  updateSelectedButtons();
}

// ==== SELECT ALL / ONE ====
function toggleSelectAll(box){
  const checked = box.checked;
  document.querySelectorAll(".selectBox").forEach(cb=>cb.checked=checked);
  updateSelectedButtons();
}
function updateSelectedButtons(){
  const anySelected = document.querySelectorAll(".selectBox:checked").length>0;
  deleteSelectedBtn.style.display = anySelected ? "inline-block" : "none";
  copySelectedBtn.style.display = anySelected ? "inline-block" : "none";
}

// ==== DELETE SELECTED ====
function deleteSelected(){
  const selected = Array.from(document.querySelectorAll(".selectBox:checked")).map(b=>b.dataset.id);
  if(selected.length===0) return;
  if(!confirm("Hapus semua kontak yang dipilih?")) return;
  selected.forEach(id=>{
    fetch(API_URL,{method:"POST",body:new URLSearchParams({action:"delete",id})});
  });
  alert("Kontak terhapus!");
  fetchData();
}

// ==== COPY SELECTED ====
function copySelected(){
  const selectedIds = Array.from(document.querySelectorAll(".selectBox:checked")).map(b=>b.dataset.id);
  if(selectedIds.length===0) return;
  fetch(API_URL)
    .then(res=>res.json())
    .then(data=>{
      const text = data
        .filter(c=>selectedIds.includes(c.id))
        .map(c=>`${c.nama}|${c.telepon}|${c.email}|${c.perusahaan}|${c.catatan}`)
        .join("\n");
      navigator.clipboard.writeText(text).then(()=>alert("Kontak terpilih telah disalin!"));
    });
}

// ==== UPLOAD CSV ====
uploadCsvInput.addEventListener("change", function(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async function(event){
    const lines = event.target.result.split("\n");
    for(const line of lines){
      const [nama, telepon, email, perusahaan, catatan] = line.split(",");
      if(!nama) continue;
      const params = new URLSearchParams({action:"create", nama, telepon, email, perusahaan, catatan});
      await fetch(API_URL, {method:"POST", body: params});
    }
    alert("CSV berhasil diupload!");
    fetchData();
  }
  reader.readAsText(file);
});

// ==== DETAIL MODAL ====
function showDetailModal(c){
  detailText.innerText = `Nama: ${c.nama}\nTelepon: ${c.telepon}\nEmail: ${c.email}\nPerusahaan: ${c.perusahaan}\nCatatan: ${c.catatan}`;
  detailModal.style.display="block";
  document.getElementById("editFromDetail").onclick = ()=> openEditModal(c);
  document.getElementById("copyFromDetail").onclick = ()=> {
    navigator.clipboard.writeText(detailText.innerText.replace(/: /g,"|"));
    alert("Kontak telah disalin!");
  };
  document.getElementById("deleteFromDetail").onclick = async ()=>{
    if(!confirm("Hapus kontak ini?")) return;
    await fetch(API_URL, {method:"POST", body:new URLSearchParams({action:"delete", id:c.id})});
    alert("Kontak terhapus!");
    closeDetailModal();
    fetchData();
  };
}
function closeDetailModal(){ detailModal.style.display="none"; }
detailModal.addEventListener("click", e=>{ if(e.target===detailModal) closeDetailModal(); });

// ==== EDIT MODAL ====
function openEditModal(c){
  editModal.style.display="block";
  document.getElementById("editId").value = c.id;
  document.getElementById("editNama").value = c.nama;
  document.getElementById("editTelepon").value = c.telepon;
  document.getElementById("editEmail").value = c.email;
  document.getElementById("editPerusahaan").value = c.perusahaan;
  document.getElementById("editCatatan").value = c.catatan;
  closeDetailModal();
}
function closeEditModal(){ editModal.style.display="none"; editForm.reset(); }
editModal.addEventListener("click", e=>{ if(e.target===editModal) closeEditModal(); });

// ==== SAVE EDIT ====
editForm.addEventListener("submit", async e=>{
  e.preventDefault();
  const id = document.getElementById("editId").value;
  const params = new URLSearchParams({
    action:"update",
    id,
    nama: document.getElementById("editNama").value,
    telepon: document.getElementById("editTelepon").value,
    email: document.getElementById("editEmail").value,
    perusahaan: document.getElementById("editPerusahaan").value,
    catatan: document.getElementById("editCatatan").value
  });
  await fetch(API_URL, {method:"POST", body:params});
  alert("Kontak berhasil diupdate!");
  closeEditModal();
  fetchData();
});

// ==== ADD CONTACT ====
contactForm.addEventListener("submit", async e=>{
  e.preventDefault();
  const params = new URLSearchParams({
    action:"create",
    nama: contactForm.nama.value,
    telepon: contactForm.telepon.value,
    email: contactForm.email.value,
    perusahaan: contactForm.perusahaan.value,
    catatan: contactForm.catatan.value
  });
  await fetch(API_URL, {method:"POST", body:params});
  alert("Kontak berhasil ditambahkan!");
  contactForm.reset();
  fetchData();
});

// ==== SEARCH ====
searchInput.addEventListener("keyup", ()=>{
  const kw = searchInput.value.toLowerCase();
  document.querySelectorAll("#contactsTable tr").forEach(r=>{
    r.style.display = r.innerText.toLowerCase().includes(kw)?"":"none";
  });
});

// ==== INIT ====
window.addEventListener("load", fetchData);
