const app = firebase.initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
});
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', async function() {
    const releaseForm = document.getElementById('release-form');
    const releaseList = document.getElementById('releases');
    let releases = [];

    // Load releases from Firestore on page load
    async function loadReleases() {

        const querySnapshot = await db.collection("releases").orderBy("releaseDate").get();
        releases = [];
        querySnapshot.forEach((doc) => {
            releases.push({ id: doc.id, ...doc.data() });
        });
      
        displayReleases();
    }

    // Load releases immediately
    await loadReleases();

    // Handle form submission
    releaseForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const artistName = document.getElementById('artist-name').value;
        const trackTitle = document.getElementById('track-title').value;
        const releaseDate = document.getElementById('release-date').value;

        const formCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        const artworkCheckbox = formCheckboxes[0];
        const contractsCheckbox = formCheckboxes[1];

        const release = {
            artistName,
            trackTitle,
            releaseDate,
            artworkGD: artworkCheckbox ? artworkCheckbox.checked : false,
            contractsSent: contractsCheckbox ? contractsCheckbox.checked : false
        };

        // Add to Firestore
        try {
            const docRef = await db.collection("releases").add(release);
            releaseForm.reset();
            await loadReleases(); // Reload the list
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    });

    function displayReleases() {
        releaseList.innerHTML = '';
        releases.forEach((release) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${release.artistName} - ${release.trackTitle}</strong> 
                <span>${release.releaseDate}</span>
                <label>Artwork in GD: 
                    <input type="checkbox" class="artwork-checkbox" data-id="${release.id}" ${release.artworkGD ? 'checked' : ''}>
                </label>
                <label>Contracts Sent: 
                    <input type="checkbox" class="contracts-checkbox" data-id="${release.id}" ${release.contractsSent ? 'checked' : ''}>
                </label>
                <button class="delete" data-id="${release.id}">Live/Delete</button>
            `;
            releaseList.appendChild(li);
        });
    }

    // Handle checkbox changes
    releaseList.addEventListener('change', async function(e) {
        if (e.target.classList.contains('artwork-checkbox') || e.target.classList.contains('contracts-checkbox')) {
            const id = e.target.getAttribute('data-id');
            const isArtwork = e.target.classList.contains('artwork-checkbox');
            const field = isArtwork ? 'artworkGD' : 'contractsSent';
            
            try {
                await db.collection("releases").doc(id).update({
                    [field]: e.target.checked
                });
                await loadReleases(); // Reload the list
            } catch (error) {
                console.error("Error updating document: ", error);
            }
        }
    });

    // Handle delete
    releaseList.addEventListener('click', async function(e) {
        if (e.target.classList.contains('delete')) {
            const id = e.target.getAttribute('data-id');
            try {
                await db.collection("releases").doc(id).delete();
                await loadReleases(); // Reload the list
            } catch (error) {
                console.error("Error deleting document: ", error);
            }
        }
    });
});