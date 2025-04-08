Run
Copy code
document.addEventListener("DOMContentLoaded", function() {
    // Load announcement text from JSON file
    fetch('announcements.json')
        .then(response => response.json())
        .then(data => {
            const announcementText = data.announcement;
            document.getElementById('announcement-text').textContent = announcementText;
        })
        .catch(error => console.error('Error loading announcement:', error));

    const announcementBar = document.getElementById('announcement-bar');
    const closeButton = document.getElementById('close-button');
    const expandButton = document.getElementById('expand-button');

    // Close button functionality
    closeButton.addEventListener('click', function() {
        announcementBar.classList.add('collapsed');
        expandButton.style.display = 'block'; // Show the expand button
    });

    // Expand button functionality
    expandButton.addEventListener('click', function() {
        announcementBar.classList.remove('collapsed');
        expandButton.style.display = 'none'; // Hide the expand button
    });
});
