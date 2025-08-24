// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBg0sXdxmRfaH9dF5ItiWnCEU2B4LDiCWA",
  authDomain: "attendanceapp-6769c.firebaseapp.com",
  databaseURL: "https://attendanceapp-6769c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "attendanceapp-6769c",
  storageBucket: "attendanceapp-6769c.firebasestorage.app",
  messagingSenderId: "317326164920",
  appId: "1:317326164920:web:ae856d3bc0f64f0f3fc54d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Get DOM elements
const loginSection = document.getElementById('login-section');
const adminDashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const loginError = document.getElementById('login-error');
const logoutButton = document.getElementById('logout-button');
const usersTableBody = document.getElementById('users-table-body');

// Handle Admin Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            // Signed in successfully
            // The onAuthStateChanged listener will handle UI changes
        })
        .catch((error) => {
            loginError.textContent = `Error: ${error.message}`;
        });
});

// Handle Logout
logoutButton.addEventListener('click', () => {
    signOut(auth);
});

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, show the dashboard
        loginSection.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        
        // Load the user list
        loadUserList();
    } else {
        // User is signed out, show the login form
        loginSection.classList.remove('hidden');
        adminDashboard.classList.add('hidden');
    }
});

// Function to load and display the list of users
function loadUserList() {
    const usersRef = ref(db, 'users');
    onValue(usersRef, (snapshot) => {
        const usersData = snapshot.val();
        usersTableBody.innerHTML = ''; // Clear the table
        
        if (usersData) {
            Object.keys(usersData).forEach(userId => {
                const user = usersData[userId];
                
                // Create a new row for each user
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.name || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>
                        <span id="plan-${userId}">${user.plan || 'free'}</span>
                    </td>
                    <td>
                        <select id="plan-select-${userId}" class="plan-select">
                            <option value="free" ${user.plan === 'free' ? 'selected' : ''}>Free</option>
                            <option value="basic" ${user.plan === 'basic' ? 'selected' : ''}>Basic</option>
                            <option value="standard" ${user.plan === 'standard' ? 'selected' : ''}>Standard</option>
                            <option value="enterprise" ${user.plan === 'enterprise' ? 'selected' : ''}>Enterprise</option>
                        </select>
                        <button class="update-button" data-user-id="${userId}">Update</button>
                    </td>
                `;
                usersTableBody.appendChild(row);
            });
        }
    });
}

// Handle plan update button clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('update-button')) {
        const userId = e.target.dataset.userId;
        const selectElement = document.getElementById(`plan-select-${userId}`);
        const newPlan = selectElement.value;
        
        // Update the user's plan in the database
        const userRef = ref(db, 'users/' + userId);
        update(userRef, {
            plan: newPlan
        }).then(() => {
            alert(`User's plan updated to: ${newPlan}`);
        }).catch((error) => {
            alert("Error updating plan: " + error.message);
        });
    }
});