import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
        import { getDatabase, ref, onChildAdded } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
        import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

        // Your web app's Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyBYor_26K8Hxw94gCh4jMR1iFSpWd0BvJo",
            authDomain: "proximamente-sub.firebaseapp.com",
            databaseURL: "https://proximamente-sub-default-rtdb.firebaseio.com",
            projectId: "proximamente-sub",
            storageBucket: "proximamente-sub.appspot.com",
            messagingSenderId: "711347794672",
            appId: "1:711347794672:web:2234b215ca77ddb4f28835",
            measurementId: "G-JH5FCM0XYE"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const database = getDatabase(app);
        const auth = getAuth(app);
        const dataTable = document.getElementById('data-table');
        const notification = document.getElementById('notification');

        // Login form
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Signed in
                    const user = userCredential.user;
                    console.log('Usuario autenticado:', user);
                })
                .catch((error) => {
                    console.error('Error en la autenticación:', error);
                    const errorMessage = document.getElementById('loginError');
                    errorMessage.textContent = 'Correo o contraseña incorrecta.';
                    errorMessage.style.display = 'block'; // Mostrar el mensaje de error
                });
        });

        // Listen for authentication state changes
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, show the data section
                document.querySelector('.auth').style.display = 'none';
                document.querySelector('.data').style.display = 'block';
            } else {
                // No user is signed in, show the login form
                document.querySelector('.auth').style.display = 'block';
                document.querySelector('.data').style.display = 'none';
            }
        });

        // Function to handle new data added to the database
        function handleNewData(snapshot) {
            const childData = snapshot.val();
            const email = childData.email;
            const dataElement = document.createElement('div');
            dataElement.textContent = email;
            dataTable.appendChild(dataElement);
        }

        // Listen for new data added to the database
        const dataRef = ref(database, 'subscribers');
        onChildAdded(dataRef, handleNewData);

        // Function to copy emails to clipboard
        function copyEmails() {
            const emails = document.querySelectorAll('.data-table div');
            const emailsArray = Array.from(emails).map(emailDiv => emailDiv.textContent.trim());
            const emailsString = emailsArray.join('\n');
            navigator.clipboard.writeText(emailsString).then(() => {
                // Show notification
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = 'none';
                }, 3000); // Hide after 3 seconds
            });
        }

        // Add event listener to the copy button
        const copyButton = document.getElementById('copyButton');
        copyButton.addEventListener('click', copyEmails);