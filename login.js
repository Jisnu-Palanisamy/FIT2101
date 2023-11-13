
const admin = {

    email: 'admin@gmail.com',
    password: 'pass',
    name: 'Admin NIMDA',
    role: 'admin'
};

const localStoredUsers = JSON.parse(localStorage.getItem('localStoredUsers'));
const adminAndUsers = [];
console.log("Local Stored Users", localStoredUsers);
if(localStoredUsers){
    //console.log("Local Stored Users", localStoredUsers);
    for(let i = 0; i < localStoredUsers.length; i++){
        //console.log(localStoredUsers[i]);
        adminAndUsers.push(localStoredUsers[i]);
    }
}

adminAndUsers.push(admin);

console.log("All Users", adminAndUsers);

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();


        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        console.log(email, password);

            const users = adminAndUsers;
            console.log(users);
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // Successful login, redirect to index.html and pass the username as a query parameter
                localStorage.setItem('loggedUser', JSON.stringify(user));
                window.location.href = `scrumboard.html`;
                //errorMessage.textContent = 'Login Successfull.';
                //console.log("logged In");
            } else {
                errorMessage.textContent = 'Invalid username or password.';
            }
});
});
