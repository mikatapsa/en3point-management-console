document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const errorMessage = document.getElementById('error-message');

    loginButton.addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            errorMessage.innerText = 'Please fill in all fields.';
            errorMessage.style.display = 'block';
            return;
        }

        let result = await en3pointLogin({ userid: username, password })

        if (result.status) {
            console.log(result.result);
            localStorage.setItem('userid', username);   
            localStorage.setItem('authToken', result.result.authToken);
            localStorage.setItem('walletAddress', result.result.walletAddress); 
            localStorage.setItem('adminData', JSON.stringify(result.result));

            window.location.href = 'index.html'; // Redirect to main page
        } else {
            errorMessage.innerText = 'Login failed. Please check your credentials.';
            errorMessage.style.display = 'block';
        }
        const carouselItems = document.querySelectorAll('.carousel-item');
    
        carouselItems.forEach(item => {
            item.addEventListener('click', () => {
                carouselItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            });
        });
    });

    document.getElementById('reset-password-link').addEventListener('click', () => {
        alert('Password reset functionality is not implemented yet.');
    });
});
