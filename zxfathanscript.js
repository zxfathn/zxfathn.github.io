document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault(); 
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var gender = document.getElementById('gender').value;
    document.getElementById('result-name').textContent = name;
    document.getElementById('result-email').textContent = email;
    document.getElementById('result-gender').textContent = gender;
    document.getElementById('instructions').style.display = 'none';
    document.querySelector('.form-section').style.display = 'none';
    document.getElementById('form-result').style.display = 'block';
});
