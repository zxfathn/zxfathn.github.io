// Daftar link pertemuan yang akan diisi di tabel
const links = [
    'http://localhost/fathan/pertemuan1.html', 'https://zxfathn.github.io/pertemuan2.html', 'https://zxfathn.github.io/3.html', 
    'https://zxfathn.github.io/4.html', 'https://zxfathn.github.io/5.html', 'https://zxfathn.github.io/6.html', 
    'https://zxfathn.github.io/7.html', 'https://zxfathn.github.io/8.html', 'https://zxfathn.github.io/9.html', 
    'https://zxfathn.github.io/10.html', 'https://zxfathn.github.io/11.html', 'https://zxfathn.github.io/12.html', 
    'https://zxfathn.github.io/13.html', 'https://zxfathn.github.io/14.html', 'https://zxfathn.github.io/15.html', 
    'https://zxfathn.github.io/16.html', 'https://zxfathn.github.io/17.html', 'https://zxfathn.github.io/18.html', 
    'https://zxfathn.github.io/19.html', 'https://zxfathn.github.io/20.html', 'https://zxfathn.github.io/21.html'
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
