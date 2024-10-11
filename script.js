document.addEventListener('DOMContentLoaded', function() {
    const releaseForm = document.getElementById('release-form');
    const releaseList = document.getElementById('releases');

    // Retrieve releases from local storage or initialize an empty array
    let releases = JSON.parse(localStorage.getItem('releases')) || [];

    // Display releases on page load
    displayReleases();

    // Handle form submission
    releaseForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form values
        const artistName = document.getElementById('artist-name').value;
        const trackTitle = document.getElementById('track-title').value;
        const releaseDate = document.getElementById('release-date').value;

        // Create a new release object without the artwork checkbox
        const release = {
            artistName,
            trackTitle,
            releaseDate,
            artworkGD: false // Initially set to false
        };

        // Add release to releases array and save to local storage
        releases.push(release);
        localStorage.setItem('releases', JSON.stringify(releases));

        // Clear the form
        releaseForm.reset();

        // Display updated release list
        displayReleases();
    });

    // Function to display releases
    function displayReleases() {
        releaseList.innerHTML = '';

        // Sort releases by date
        releases.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));

        releases.forEach((release, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<div>
                <div><strong>${release.artistName} - ${release.trackTitle}</strong></div>
                <div><span>${release.releaseDate}</span></div>
                <div><label>Artwork in GD: 
                    <input type="checkbox" class="artwork-checkbox" data-index="${index}" ${release.artworkGD ? 'checked' : ''}>
                </label></div>
                </div>
                <button class="delete" data-index="${index}">Live/Delete</button>
            `;
            releaseList.appendChild(li);
        });
    }

    // Handle checkbox change (to update artwork status)
    releaseList.addEventListener('change', function(e) {
        if (e.target.classList.contains('artwork-checkbox')) {
            const index = e.target.getAttribute('data-index');
            releases[index].artworkGD = e.target.checked;
            localStorage.setItem('releases', JSON.stringify(releases));
        }
    });

    // Handle delete/live button click
    releaseList.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete')) {
            const index = e.target.getAttribute('data-index');
            releases.splice(index, 1);
            localStorage.setItem('releases', JSON.stringify(releases));
            displayReleases();
        }
    });
});
