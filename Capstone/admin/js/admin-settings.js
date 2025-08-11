import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc, writeBatch } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyB8Xi8J7t3wRSy1TeIxiGFz-Is6U0zDFVg",
    authDomain: "navigatecampus.firebaseapp.com",
    projectId: "navigatecampus",
    storageBucket: "navigatecampus.appspot.com",
    messagingSenderId: "55012323145",
    appId: "1:55012323145:web:3408681d5a450f05b2b498",
    measurementId: "G-39WFZN3VPV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const confirmModal = document.getElementById('confirmModal');
const confirmTitle = document.getElementById('confirmTitle');
const confirmMessage = document.getElementById('confirmMessage');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        
        // Remove active class from all tabs and panels
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding panel
        btn.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
    });
});

// Confirmation Modal
function showConfirmModal(title, message, onConfirm) {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmModal.style.display = 'flex';
    
    confirmYes.onclick = () => {
        confirmModal.style.display = 'none';
        onConfirm();
    };
    
    confirmNo.onclick = () => {
        confirmModal.style.display = 'none';
    };
}

// Account Management
const accountForm = document.getElementById('accountForm');
const adminEmail = document.getElementById('adminEmail');
const currentPassword = document.getElementById('currentPassword');
const newPassword = document.getElementById('newPassword');
const confirmPassword = document.getElementById('confirmPassword');

// Function to verify current password
async function verifyCurrentPassword(email, password) {
    try {
        const hashedPassword = btoa(password); // Same encoding as login
        const docRef = doc(db, "admin_credentials", "admin");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.email === email && data.password === hashedPassword) {
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Error verifying current password:', error);
        return false;
    }
}

// Function to update password in Firebase
async function updatePasswordInFirebase(newPassword) {
    try {
        const hashedNewPassword = btoa(newPassword); // Hash the new password
        await updateDoc(doc(db, "admin_credentials", "admin"), {
            password: hashedNewPassword,
            lastUpdated: new Date()
        });
        return true;
    } catch (error) {
        console.error('Error updating password:', error);
        return false;
    }
}

// Load current admin email
async function loadAdminEmail() {
    try {
        const docRef = doc(db, "admin_credentials", "admin");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            adminEmail.value = data.email;
        }
    } catch (error) {
        console.error('Error loading admin email:', error);
    }
}

// Function to check password strength
function checkPasswordStrength(password) {
    let strength = 0;
    let feedback = [];
    
    if (password.length >= 8) strength++;
    else feedback.push('At least 8 characters');
    
    if (/[a-z]/.test(password)) strength++;
    else feedback.push('Include lowercase letter');
    
    if (/[A-Z]/.test(password)) strength++;
    else feedback.push('Include uppercase letter');
    
    if (/[0-9]/.test(password)) strength++;
    else feedback.push('Include number');
    
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    else feedback.push('Include special character');
    
    if (strength <= 2) return { strength: 'weak', score: strength, feedback };
    if (strength <= 3) return { strength: 'medium', score: strength, feedback };
    return { strength: 'strong', score: strength, feedback };
}

// Function to update password strength indicator
function updatePasswordStrength(password) {
    const strengthResult = checkPasswordStrength(password);
    const strengthIndicator = document.getElementById('passwordStrength');
    
    if (strengthIndicator) {
        strengthIndicator.textContent = `Password Strength: ${strengthResult.strength.toUpperCase()}`;
        strengthIndicator.className = `password-strength ${strengthResult.strength}`;
    }
}

// Function to validate form fields
function validateForm() {
    const email = adminEmail.value.trim();
    const currentPass = currentPassword.value;
    const newPass = newPassword.value;
    const confirmPass = confirmPassword.value;
    
    let isValid = true;
    
    // Clear previous error states
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error', 'success');
        const errorMsg = group.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
    });
    
    // Validate email
    if (!email) {
        showFieldError(adminEmail, 'Email is required');
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFieldError(adminEmail, 'Please enter a valid email');
        isValid = false;
    }
    
    // Validate current password
    if (!currentPass) {
        showFieldError(currentPassword, 'Current password is required');
        isValid = false;
    }
    
    // Validate new password
    if (!newPass) {
        showFieldError(newPassword, 'New password is required');
        isValid = false;
    } else if (newPass.length < 6) {
        showFieldError(newPassword, 'Password must be at least 6 characters');
        isValid = false;
    }
    
    // Validate confirm password
    if (!confirmPass) {
        showFieldError(confirmPassword, 'Please confirm your password');
        isValid = false;
    } else if (newPass !== confirmPass) {
        showFieldError(confirmPassword, 'Passwords do not match');
        isValid = false;
    }
    
    return isValid;
}

// Function to show field error
function showFieldError(input, message) {
    const formGroup = input.closest('.form-group');
    formGroup.classList.add('error');
    
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    errorMsg.textContent = message;
    formGroup.appendChild(errorMsg);
}

// Function to show field success
function showFieldSuccess(input) {
    const formGroup = input.closest('.form-group');
    formGroup.classList.remove('error');
    formGroup.classList.add('success');
    
    const errorMsg = formGroup.querySelector('.error-message');
    if (errorMsg) errorMsg.remove();
}

// Add password strength indicator to the form
function addPasswordStrengthIndicator() {
    const newPasswordGroup = newPassword.closest('.form-group');
    const strengthIndicator = document.createElement('div');
    strengthIndicator.id = 'passwordStrength';
    strengthIndicator.className = 'password-strength';
    newPasswordGroup.appendChild(strengthIndicator);
}

// Add event listeners for real-time validation
function addFormValidationListeners() {
    // Email validation
    adminEmail.addEventListener('blur', () => {
        const email = adminEmail.value.trim();
        if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showFieldSuccess(adminEmail);
        }
    });
    
    // New password strength checking
    newPassword.addEventListener('input', () => {
        updatePasswordStrength(newPassword.value);
        if (newPassword.value.length >= 6) {
            showFieldSuccess(newPassword);
        }
    });
    
    // Confirm password validation
    confirmPassword.addEventListener('input', () => {
        if (confirmPassword.value && confirmPassword.value === newPassword.value) {
            showFieldSuccess(confirmPassword);
        }
    });
}

accountForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate form first
    if (!validateForm()) {
        return;
    }
    
    const email = adminEmail.value.trim();
    const currentPass = currentPassword.value;
    const newPass = newPassword.value;
    const confirmPass = confirmPassword.value;
    
    if (currentPass === newPass) {
        showFieldError(newPassword, 'New password must be different from current password');
        return;
    }
    
    // Show loading state
    const submitBtn = accountForm.querySelector('.save-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Updating...';
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    try {
        // Verify current password
        const isCurrentPasswordValid = await verifyCurrentPassword(email, currentPass);
        
        if (!isCurrentPasswordValid) {
            showFieldError(currentPassword, 'Current password is incorrect');
            return;
        }
        
        // Update password in Firebase
        const updateSuccess = await updatePasswordInFirebase(newPass);
        
        if (updateSuccess) {
            // Show success message
            alert('Password updated successfully!');
            
            // Clear form and show success states
            currentPassword.value = '';
            newPassword.value = '';
            confirmPassword.value = '';
            showFieldSuccess(currentPassword);
            showFieldSuccess(newPassword);
            showFieldSuccess(confirmPassword);
            
            // Clear password strength indicator
            const strengthIndicator = document.getElementById('passwordStrength');
            if (strengthIndicator) {
                strengthIndicator.textContent = '';
                strengthIndicator.className = 'password-strength';
            }
        } else {
            alert('Failed to update password. Please try again.');
        }
        
    } catch (error) {
        console.error('Error updating account:', error);
        alert('An error occurred while updating the password. Please try again.');
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
});

// Load admin email when page loads
loadAdminEmail();

// Initialize enhanced password change functionality
addPasswordStrengthIndicator();
addFormValidationListeners();

// Event Management
const defaultEventImage = document.getElementById('defaultEventImage');
const defaultImagePreview = document.getElementById('defaultImagePreview');
const requireApproval = document.getElementById('requireApproval');
const showEvents = document.getElementById('showEvents');
const exportEventsBtn = document.getElementById('exportEvents');
const importEventsBtn = document.getElementById('importEvents');
const importFile = document.getElementById('importFile');
const clearEventsBtn = document.getElementById('clearEvents');

// Default event image preview
defaultEventImage.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            defaultImagePreview.src = evt.target.result;
            defaultImagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Export events
exportEventsBtn.addEventListener('click', async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const events = [];
        querySnapshot.forEach((doc) => {
            events.push({ id: doc.id, ...doc.data() });
        });
        
        const dataStr = JSON.stringify(events, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'events-export.json';
        link.click();
        
        URL.revokeObjectURL(url);
        alert('Events exported successfully!');
    } catch (error) {
        alert('Error exporting events: ' + error.message);
    }
});

// Import events
importEventsBtn.addEventListener('click', () => {
    importFile.click();
});

importFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    showConfirmModal(
        'Import Events',
        'This will add all events from the file. Continue?',
        async () => {
            try {
                const text = await file.text();
                const events = JSON.parse(text);
                
                const batch = writeBatch(db);
                events.forEach(event => {
                    const { id, ...eventData } = event;
                    const docRef = doc(collection(db, "events"));
                    batch.set(docRef, eventData);
                });
                
                await batch.commit();
                alert('Events imported successfully!');
                importFile.value = '';
            } catch (error) {
                alert('Error importing events: ' + error.message);
            }
        }
    );
});

// Clear all events
clearEventsBtn.addEventListener('click', () => {
    showConfirmModal(
        'Clear All Events',
        'This will permanently delete ALL events. This action cannot be undone. Are you sure?',
        async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "events"));
                const batch = writeBatch(db);
                querySnapshot.forEach((doc) => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                alert('All events cleared successfully!');
            } catch (error) {
                alert('Error clearing events: ' + error.message);
            }
        }
    );
});

// Appearance Settings
const siteLogo = document.getElementById('siteLogo');
const logoPreview = document.getElementById('logoPreview');
const themeRadios = document.querySelectorAll('input[name="theme"]');
const accentColor = document.getElementById('accentColor');
const saveAppearanceBtn = document.getElementById('saveAppearance');

// Logo preview
siteLogo.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            logoPreview.src = evt.target.result;
            logoPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Save appearance
saveAppearanceBtn.addEventListener('click', () => {
    const selectedTheme = document.querySelector('input[name="theme"]:checked').value;
    const color = accentColor.value;
    
    // Save to localStorage for now (in a real app, save to Firestore)
    localStorage.setItem('appTheme', selectedTheme);
    localStorage.setItem('accentColor', color);
    
    alert('Appearance settings saved!');
});

// Security Settings
const allowPublicAdd = document.getElementById('allowPublicAdd');
const allowPublicEdit = document.getElementById('allowPublicEdit');
const adminList = document.getElementById('adminList');
const addAdminBtn = document.getElementById('addAdmin');
const saveSecurityBtn = document.getElementById('saveSecurity');

// Load admin list
function loadAdminList() {
    adminList.innerHTML = `
        <div style="color: #666; font-style: italic;">
            <div>admin@navigatecampus.com (Primary Admin)</div>
            <div>support@navigatecampus.com (Support Admin)</div>
        </div>
    `;
}

loadAdminList();

// Add admin (placeholder)
addAdminBtn.addEventListener('click', () => {
    const email = prompt('Enter admin email:');
    if (email) {
        alert(`Admin ${email} added successfully! (Note: Requires Firebase Auth setup)`);
    }
});

// Save security settings
saveSecurityBtn.addEventListener('click', () => {
    const settings = {
        allowPublicAdd: allowPublicAdd.checked,
        allowPublicEdit: allowPublicEdit.checked
    };
    
    localStorage.setItem('securitySettings', JSON.stringify(settings));
    alert('Security settings saved!');
});

// Notification Settings
const emailNewEvents = document.getElementById('emailNewEvents');
const emailEventChanges = document.getElementById('emailEventChanges');
const emailDeletions = document.getElementById('emailDeletions');
const notificationEmail = document.getElementById('notificationEmail');
const saveNotificationsBtn = document.getElementById('saveNotifications');

// Save notification settings
saveNotificationsBtn.addEventListener('click', () => {
    const settings = {
        emailNewEvents: emailNewEvents.checked,
        emailEventChanges: emailEventChanges.checked,
        emailDeletions: emailDeletions.checked,
        notificationEmail: notificationEmail.value
    };
    
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    alert('Notification settings saved!');
});

// About Section
const lastUpdated = document.getElementById('lastUpdated');

// Set last updated date
lastUpdated.textContent = new Date().toLocaleDateString();

// Load saved settings on page load
function loadSavedSettings() {
    // Load theme
    const savedTheme = localStorage.getItem('appTheme');
    if (savedTheme) {
        document.querySelector(`input[name="theme"][value="${savedTheme}"]`).checked = true;
    }
    
    // Load accent color
    const savedColor = localStorage.getItem('accentColor');
    if (savedColor) {
        accentColor.value = savedColor;
    }
    
    // Load security settings
    const securitySettings = localStorage.getItem('securitySettings');
    if (securitySettings) {
        const settings = JSON.parse(securitySettings);
        allowPublicAdd.checked = settings.allowPublicAdd;
        allowPublicEdit.checked = settings.allowPublicEdit;
    }
    
    // Load notification settings
    const notificationSettings = localStorage.getItem('notificationSettings');
    if (notificationSettings) {
        const settings = JSON.parse(notificationSettings);
        emailNewEvents.checked = settings.emailNewEvents;
        emailEventChanges.checked = settings.emailEventChanges;
        emailDeletions.checked = settings.emailDeletions;
        notificationEmail.value = settings.notificationEmail || '';
    }
}

// Initialize
loadSavedSettings();

// Close modal when clicking outside
confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
        confirmModal.style.display = 'none';
    }
}); 