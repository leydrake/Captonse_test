import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

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
const eventsRef = collection(db, "events");

// DOM elements
const eventsList = document.querySelector('.events-list');
const addEventBtn = document.querySelector('.add-event-btn');
const addEventModal = document.getElementById('addEventModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const eventForm = document.getElementById('eventForm');
const eventImage = document.getElementById('eventImage');
const imagePreview = document.getElementById('imagePreview');
const eventTitle = document.getElementById('eventTitle');
const eventLocation = document.getElementById('eventLocation');
const locationDropdown = document.getElementById('locationDropdown');

// Sample locations for dropdown
const locations = [
    'Activity Center',
    'AVR',
    'Admin Building',
    'MPG Building',
    'BSBA Building',
    'Pancho Hall',
    'Library',
    'Gymnasium',
    'Canteen'
];

let editingEventId = null;
let editingEventImage = '';

// Fetch and render events
async function fetchAndRenderEvents() {
    const querySnapshot = await getDocs(eventsRef);
    const events = [];
    querySnapshot.forEach((docSnap) => {
        events.push({ id: docSnap.id, ...docSnap.data() });
    });
    renderEvents(events);
}

// Render events
function renderEvents(events) {
    eventsList.innerHTML = '';
    events.forEach((event, idx) => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <div class="event-img-placeholder">
                ${event.image ? `<img src="${event.image}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;"/>` : `<svg width=\"40\" height=\"40\" viewBox=\"0 0 24 24\" fill=\"none\"><rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"#f0f0f0\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"18\" fill=\"#bbb\">?</text></svg>`}
            </div>
            <div class="event-details">
                <div class="event-title">${event.title}</div>
                <div class="event-location">Location: ${event.location}</div>
            </div>
            <button class="event-edit-btn" aria-label="Edit" data-id="${event.id}">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 20h9" stroke="#206233" stroke-width="2" stroke-linecap="round"/>
                    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" stroke="#206233" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            <button class="event-delete-btn" aria-label="Delete" data-id="${event.id}">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18" stroke="#206233" stroke-width="2" stroke-linecap="round"/>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6h16z" stroke="#206233" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 11v6M14 11v6" stroke="#206233" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        `;
        eventsList.appendChild(card);
    });
    // Add event listeners for delete
    document.querySelectorAll('.event-delete-btn').forEach(btn => {
        btn.onclick = async function() {
            const id = this.getAttribute('data-id');
            const confirmed = confirm('Are you sure you want to delete this event?');
            if (!confirmed) return;
            await deleteDoc(doc(db, "events", id));
            fetchAndRenderEvents();
        };
    });
    // Edit event
    document.querySelectorAll('.event-edit-btn').forEach(btn => {
        btn.onclick = async function() {
            const id = this.getAttribute('data-id');
            const eventDoc = await getDoc(doc(db, "events", id));
            if (eventDoc.exists()) {
                const data = eventDoc.data();
                eventTitle.value = data.title;
                eventLocation.value = data.location;
                if (data.image) {
                    imagePreview.src = data.image;
                    imagePreview.style.display = 'block';
                    editingEventImage = data.image;
                } else {
                    imagePreview.style.display = 'none';
                    editingEventImage = '';
                }
                editingEventId = id;
                addEventModal.style.display = 'flex';
            }
        };
    });
}

// Modal open/close
addEventBtn.onclick = function() {
    addEventModal.style.display = 'flex';
    editingEventId = null;
    editingEventImage = '';
    eventForm.reset();
    imagePreview.style.display = 'none';
};
closeModalBtn.onclick = function() {
    addEventModal.style.display = 'none';
    editingEventId = null;
    editingEventImage = '';
    eventForm.reset();
    imagePreview.style.display = 'none';
};

// Image preview
eventImage.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            imagePreview.src = evt.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.style.display = 'none';
    }
};

// Searchable dropdown for location
let filteredLocations = [];
eventLocation.oninput = function() {
    const val = eventLocation.value.toLowerCase();
    filteredLocations = locations.filter(loc => loc.toLowerCase().includes(val));
    if (filteredLocations.length > 0 && val) {
        locationDropdown.innerHTML = filteredLocations.map(loc => `<li>${loc}</li>`).join('');
        locationDropdown.style.display = 'block';
    } else {
        locationDropdown.style.display = 'none';
    }
};
locationDropdown.onclick = function(e) {
    if (e.target.tagName === 'LI') {
        eventLocation.value = e.target.textContent;
        locationDropdown.style.display = 'none';
    }
};
document.addEventListener('click', function(e) {
    if (!eventLocation.contains(e.target) && !locationDropdown.contains(e.target)) {
        locationDropdown.style.display = 'none';
    }
});

// Add or edit event submit
eventForm.onsubmit = async function(e) {
    e.preventDefault();
    const title = eventTitle.value.trim();
    const location = eventLocation.value.trim();
    let image = '';
    if (eventImage.files[0]) {
        image = imagePreview.src;
    } else if (editingEventId) {
        image = editingEventImage;
    }
    if (!title || !location) return;
    if (editingEventId) {
        // Update existing event
        await updateDoc(doc(db, "events", editingEventId), { title, location, image });
    } else {
        // Add new event
        await addDoc(eventsRef, { title, location, image });
    }
    fetchAndRenderEvents();
    addEventModal.style.display = 'none';
    editingEventId = null;
    editingEventImage = '';
    eventForm.reset();
    imagePreview.style.display = 'none';
};

// Initial fetch
fetchAndRenderEvents(); 


