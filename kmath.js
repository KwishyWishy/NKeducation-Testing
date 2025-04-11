"use strict";

const lessonsFile = "lessons/kmath.json";
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
    link.href = `#${lesson.title.replace(/\s+/g, '-').toLowerCase()}`;
    link.textContent = lesson.title;
    link.classList.add("lesson-link");
    lessonLinksDiv.appendChild(link);
    lessonLinksDiv.appendChild(document.createElement("br"));
    
    // Create individual lesson page
    createLessonPage(lesson);
}

function createLessonPage(lesson) {
    const lessonPageContent = `
        <div id="${lesson.title.replace(/\s+/g, '-').toLowerCase()}">
            <h1>${lesson.title}</h1>
            <p>${lesson.intro}</p>
            <a href="${lesson.video_link}">Watch Video Tutorial</a>
            <p>${lesson.lesson_content}</p>
            <h3>Key Points:</h3>
            <ul>
                ${lesson.key_points.map(point => `<li>${point}</li>`).join('')}
            </ul>
        </div>
    `;
    
    // Append the lesson page content to the main page
    const mainDiv = document.querySelector("main");
    mainDiv.insertAdjacentHTML("beforeend", lessonPageContent);
}
