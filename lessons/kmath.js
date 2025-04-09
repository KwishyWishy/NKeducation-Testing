"use strict";

const lessonsFile = "kmath.json";
const lessonLinksDiv = document.getElementById("lesson-links");

window.addEventListener("DOMContentLoaded", () => {
    fetch(lessonsFile)
        .then(response => response.json())
        .then(data => {
            data.lessons.forEach(lesson => {
                createLessonLink(lesson);
            });
        });
});

function createLessonLink(lesson) {
    const link = document.createElement("a");
    link.href = `lesson-${lesson.title.replace(/\s+/g, '-').toLowerCase()}.html`;
    link.textContent = lesson.title;
    link.classList.add("lesson-link");
    lessonLinksDiv.appendChild(link);
    lessonLinksDiv.appendChild(document.createElement("br"));
    
    // Create individual lesson page
    createLessonPage(lesson);
}

function createLessonPage(lesson) {
    const lessonPageContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${lesson.browser_title}</title>
            <link rel="stylesheet" href="styles.css">
        </head>
        <body>
            <header>
                <h1>${lesson.title}</h1>
            </header>
            <main>
                <p>${lesson.intro}</p>
                <a href="${lesson.video_link}">Watch Video Tutorial</a>
                <p>${lesson.lesson_content}</p>
                <h3>Key Points:</h3>
                <ul>
                    ${lesson.key_points.map(point => `<li>${point}</li>`).join('')}
                </ul>
            </main>
        </body>
        </html>
    `;
    
    // Create a new file for the lesson page
    const lessonFileName = `lesson-${lesson.title.replace(/\s+/g, '-').toLowerCase()}.html`;
    const blob = new Blob([lessonPageContent], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = lessonFileName;
    link.click();
}
