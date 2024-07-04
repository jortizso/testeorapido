import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
const database = getDatabase();

// Function to show notification
function showNotification(message) {
  const notificationElement = document.getElementById(message);
  notificationElement.style.display = 'block';
  setTimeout(() => {
    notificationElement.style.display = 'none';
  }, 5000); // Hide notification after 3 seconds
}

// Function to handle form submission
document.getElementById('subscribeForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const emailInput = document.getElementById('email');
  const email = emailInput.value.trim(); // Trim whitespace from email

  if (!email) {
    emailInput.style.border = '1px solid red'; // Change border color to red
    emailInput.placeholder = 'Ingresa un correo electrónico';
    return;
  }

  // Reset border color and placeholder
  emailInput.style.border = '';
  emailInput.placeholder = '';

  // Save email to Firebase Realtime Database
  push(ref(database, 'subscribers'), {
    email: email
  }).then(function () {
    showNotification('successNotification');
    document.getElementById('subscribeForm').reset();
  }).catch(function (error) {
    console.error('Error al suscribirse:', error);
    showNotification('errorNotification');
  });
});

// Function to change border color back to normal when typing
document.getElementById('email').addEventListener('input', function () {
  this.style.border = ''; // Reset border color
});


