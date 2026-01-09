const links = [
'http://localhost/fathan/pertemuan1.html', 
'https://zxfathann.biz.id/pertemuan2.html', 
'https://zxfathann.biz.id/pertemuan3.html', 
'https://zxfathann.biz.id/pertemuan4.html', 
'https://zxfathann.biz.id/pertemuan5.html', 
'https://zxfathann.biz.id/pertemuan6.html', 
'https://zxfathann.biz.id/pertemuan7.html', 
'https://zxfathann.biz.id/pertemuan8.html', 
'https://zxfathann.biz.id/pertemuan9.html', 
'https://zxfathann.biz.id/pertemuan10.html', 
'https://zxfathann.biz.id/pertemuan11.html', 
'https://zxfathann.biz.id/pertemuan12.html', 
'https://zxfathann.biz.id/pertemuan13.html', 
'https://zxfathann.biz.id/pertemuan14.html', 
'https://zxfathann.biz.id/pertemuan15.html', 
'https://zxfathann.biz.id/pertemuan16.html', 
'https://zxfathann.biz.id/pertemuan17.html', 
'https://zxfathann.biz.id/pertemuan18.html', 
'https://zxfathann.biz.id/pertemuan19.html', 
'https://zxfathann.biz.id/pertemuan20.html', 
'https://zxfathann.biz.id/pertemuan21.html'

];

// Mengambil elemen tbody untuk menambahkan link
const tableBody = document.getElementById('table-body');

// Menambahkan baris ke tabel untuk setiap pertemuan
links.forEach((link, index) => {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    const anchor = document.createElement('a');
    
    anchor.href = link;
    anchor.textContent = `Pertemuan ${index + 1}`;  // Menambahkan nomor pertemuan
    cell.appendChild(anchor);
    row.appendChild(cell);
    tableBody.appendChild(row);
});
