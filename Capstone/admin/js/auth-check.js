// Authentication check for admin pages
function checkAdminAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const adminEmail = sessionStorage.getItem('adminEmail');
    
    if (!isLoggedIn || !adminEmail) {
        // Redirect to login page if not authenticated
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Logout function
function adminLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminEmail');
    window.location.href = 'index.html';
}

// Check auth on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
}); 