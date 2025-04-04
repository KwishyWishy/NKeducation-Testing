document.addEventListener("DOMContentLoaded", function() {
    // Load announcement text from JSON file
    fetch('announcements.json')
        .then(response => response.json())
        .then(data => {
            const announcementText = data.announcement;
            document.getElementById('announcement-text').textContent = announcementText;
        })
        .catch(error => console.error('Error loading announcement:', error));

    // Close button functionality
    document.getElementById('close-button').addEventListener('click', function() {
        document.getElementById('announcement-bar').style.display = 'none';
    });
});
