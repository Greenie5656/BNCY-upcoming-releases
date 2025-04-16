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

        // Get all checkboxes
        const artworkCheckbox = document.getElementById('artwork-gd');
        const trackGDCheckbox = document.getElementById('track-gd');
        const contentCreatedCheckbox = document.getElementById('content-created');
        const contractsCheckbox = document.getElementById('contractsSent');

        const release = {
            artistName,
            trackTitle,
            releaseDate,
            artworkGD: artworkCheckbox ? artworkCheckbox.checked : false,
            trackGD: trackGDCheckbox ? trackGDCheckbox.checked : false,
            contentCreated: contentCreatedCheckbox ? contentCreatedCheckbox.checked : false,
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
            
            // Format the release date (assuming format is YYYY-MM-DD)
            let displayDate = release.releaseDate;
            try {
                const dateObj = new Date(release.releaseDate);
                if (!isNaN(dateObj)) {
                    displayDate = dateObj.toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }).replace(/\//g, '-');
                }
            } catch (e) {
                console.error("Error formatting date", e);
            }
            
            // Simplified HTML structure to match the screenshot
            li.innerHTML = `
                <div class="release-title">
                    <strong>${release.artistName} - ${release.trackTitle}</strong>
                </div>
                <span class="release-date">${displayDate}</span>
                <button class="delete" data-id="${release.id}">Live/Delete</button>
                <div class="release-checkboxes">
                    <label class="${release.artworkGD ? 'checked' : ''}">
                        <span>Artwork in GD</span>
                        <input type="checkbox" class="artwork-checkbox" data-id="${release.id}" ${release.artworkGD ? 'checked' : ''}>
                    </label>
                    <label class="${release.trackGD ? 'checked' : ''}">
                        <span>Track in GD</span>
                        <input type="checkbox" class="track-gd-checkbox" data-id="${release.id}" ${release.trackGD ? 'checked' : ''}>
                    </label>
                    <label class="${release.contentCreated ? 'checked' : ''}">
                        <span>Content Created</span>
                        <input type="checkbox" class="content-created-checkbox" data-id="${release.id}" ${release.contentCreated ? 'checked' : ''}>
                    </label>
                    <label class="${release.contractsSent ? 'checked' : ''}">
                        <span>Contracts Sent</span>
                        <input type="checkbox" class="contracts-checkbox" data-id="${release.id}" ${release.contractsSent ? 'checked' : ''}>
                    </label>
                </div>
            `;
            releaseList.appendChild(li);
        });
    }

    // Handle checkbox changes
    releaseList.addEventListener('change', async function(e) {
        if (e.target.classList.contains('artwork-checkbox') || 
            e.target.classList.contains('track-gd-checkbox') || 
            e.target.classList.contains('content-created-checkbox') || 
            e.target.classList.contains('contracts-checkbox')) {
            
            const id = e.target.getAttribute('data-id');
            let field = '';
            
            // Determine which field to update
            if (e.target.classList.contains('artwork-checkbox')) {
                field = 'artworkGD';
            } else if (e.target.classList.contains('track-gd-checkbox')) {
                field = 'trackGD';
            } else if (e.target.classList.contains('content-created-checkbox')) {
                field = 'contentCreated';
            } else if (e.target.classList.contains('contracts-checkbox')) {
                field = 'contractsSent';
            }
            
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