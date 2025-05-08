const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Define the content type and file paths
const contentType = 'kmath';
const lessonsFilePath = path.join(__dirname, 'kmathlessons.json');
const groupsFilePath = path.join(__dirname, 'kmathgroups.json');
const sectionsFilePath = path.join(__dirname, 'kmathsections.json');

// Endpoint to get lessons
router.get('/lessons', (req, res) => {
    fs.readFile(lessonsFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading lessons file');
        }
        const lessons = JSON.parse(data);
        res.json(lessons);
    });
});

// Endpoint to generate lesson pages
router.get('/lesson/:id', (req, res) => {
    const lessonId = req.params.id;
    fs.readFile(lessonsFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading lessons file');
        }
        const lessons = JSON.parse(data);
        const lesson = lessons[lessonId];

        if (!lesson) {
            return res.status(404).send('Lesson not found');
        }

        const lessonPage = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${lesson.pageTitle}</title>
                <link rel="icon" type="image/x-icon" href="/images/tricube-education-favicon.png">
                <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,600;1,600&display=swap" rel="stylesheet">                <link rel="stylesheet" href="/styles.css">
            </head>
            <body>
                <header>
                    <div class="header-left"><a href="/index.html"><img src="/images/tricube-education-logo.png" style="width:145px;height:60px;"alt="TriCube Education"></a></div>
                    <nav class="header-right">
                        <ul>
                            <li class="dropdown">
                                <button class="nav-button" onclick="location.href='/grade-select.html'">Subjects</button>
                                <div class="dropdown-content">
                                    <div class="subject">
                                        <a href="#">Mathematics</a>
                                        <div class="course-dropdown">
                                            <a href="/kmath">Kindergarten</a>
                                            <a href="/math1">1st Grade</a>
                                            <a href="/math2">2nd Grade</a>
                                            <a href="/math3">3rd Grade</a>
                                            <a href="/math4">4th Grade</a>
                                            <a href="/math5">5th Grade</a>
                                            <a href="/math6">6th Grade</a>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <button class="nav-button" onclick="location.href='/update-log.html'">Updates</button>
                            </li>
                            <li>
                                <button class="nav-button" onclick="location.href='/about.html'">About</button>
                            </li>
                        </ul>
                    </nav>
                </header>
                <main>
                    <h1>${lesson.lessonTitle}</h1>
                    <p>${lesson.intro}</p>
                    <iframe id="ytplayer" type="text/html" width="720" height ="405" src="https://www.youtube.com/embed/${lesson.videoCode}" frameborder="0" allowfullscreen></iframe>
                    <p>${lesson.lessonContent}</p>
                    <h2>Key Points</h2>
                    <div class="lessons-page">
                        <ul>
                            ${lesson.keyPoints.map(point => `<li>${point}</li>`).join('')}
                        </ul>
                    </div>
                    <a href="/${contentType}">Back to Lessons</a>
                </main>
            </body>
            </html>
        `;
        res.send(lessonPage);
    });
});

// Endpoint to serve the main lessons page
router.get('/', (req, res) => {
    fs.readFile(lessonsFilePath, 'utf8', (err, lessonsData) => {
        if (err) {
            return res.status(500).send('Error reading lessons file');
        }
        const lessons = JSON.parse(lessonsData);

        fs.readFile(groupsFilePath, 'utf8', (err, groupsData) => {
            if (err) {
                return res.status(500).send('Error reading groups file');
            }
            const groups = JSON.parse(groupsData);

            fs.readFile(sectionsFilePath, 'utf8', (err, sectionsData) => {
                if (err) {
                    return res.status(500).send('Error reading sections file');
                }
                const sections = JSON.parse(sectionsData);

                const groupMap = {};
                groups.forEach(group => {
                    groupMap[group.name] = { sections: [], order: group.order };
                });

                sections.forEach(section => {
                    if (groupMap[section.group]) {
                        groupMap[section.group].sections.push({
                            name: section.name,
                            order: section.order,
                            lessons: lessons.filter(lesson => lesson.section === section.name)
                        });
                    }
                });

                const sortedGroups = Object.keys(groupMap).sort((a, b) => {
                    return groupMap[a].order - groupMap[b].order;
                });

                const groupsList = sortedGroups.map(groupName => {
                    const sectionsList = groupMap[groupName].sections
                        .sort((a, b) => a.order - b.order)
                        .map(section => `
                            <li class="section-item">
                                <span class="section-name" data-section="${section.name}">${section.name}</span>
                                <div class="expandable-box" id="box-${section.name}">
                                    <div class="box-header">
                                        <h3>${section.name}</h3>
                                        <button class="close-button">&times;</button>
                                    </div>
                                    <div class="box-content">
                                        ${section.lessons.map(lesson => `
                                            <a href="/${contentType}/lesson/${lesson.index}" class="lesson-link">
                                                ${lesson.lessonTitle}
                                            </a>
                                        `).join('')}
                                    </div>
                                </div>
                            </li>
                        `).join('');

                    const encodedGroupName = encodeURIComponent(groupName);
                    return `
                        <button onclick="location.href='/${contentType}/group/${encodedGroupName}'" class="group">
                            <span class="group-name">${groupName}</span>
                            <span class="divider"></span>
                            <span class="sections">
                                <ul>
                                    ${sectionsList}
                                </ul>
                            </span>
                        </button>
                    `;
                }).join('');

                const mainPage = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Lessons</title>
                        <link rel="icon" type="image/x-icon" href="/images/tricube-education-favicon.png">
                        <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,600;1,600&display=swap" rel="stylesheet">
                        <link rel="stylesheet" href="/styles.css">
                        <style>
                            * {
                                font-family: 'Nunito', sans-serif;
                            }
                            body {
                                font-family: 'Nunito', sans-serif;
                            }
                            .lessons-page {
                                padding: 20px;
                                max-width: 1200px;
                                margin: 0 auto;
                            }
                            .group {
                                display: flex;
                                flex-direction: row;
                                align-items: center;
                                border-radius: 15px;
                                padding: 10px;
                                background-color: #86BFF3;
                                margin-bottom: 20px;
                                transition: background-color 0.3s;
                                width: 100%;
                                border: none;
                                text-align: left;
                                font-family: 'Nunito', sans-serif;
                            }
                            .group:hover {
                                background-color: #68b3f7;
                            }
                            .group-name {
                                flex: 1;
                                font-size: 1.5em;
                                margin-right: 10px;
                                font-weight: 700;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-family: 'Nunito', sans-serif;
                                text-align: center;
                            }
                            .divider {
                                width: 2px;
                                background-color: #ccc;
                                margin: 0 10px;
                                height: 100%;
                                min-height: 50px;
                            }
                            .sections {
                                flex: 2;
                            }
                            .sections ul {
                                list-style-type: none;
                                padding: 0;
                                display: grid;
                                grid-template-columns: repeat(2, 1fr);
                                gap: 5px;
                                margin: 0;
                            }
                            .section-item {
                                margin: 5px 0;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                padding: 5px;
                                position: relative;
                            }
                            .section-name {
                                cursor: pointer;
                                padding: 5px;
                                border-radius: 5px;
                                transition: background-color 0.2s;
                            }
                            .section-name:hover {
                                background-color: rgba(255, 255, 255, 0.2);
                            }
                            .expandable-box {
                                display: none;
                                position: absolute;
                                top: 100%;
                                left: 0;
                                width: 100%;
                                background-color: white;
                                border-radius: 10px;
                                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                                z-index: 1000;
                                margin-top: 10px;
                                padding: 15px;
                            }
                            .expandable-box.active {
                                display: block;
                            }
                            .box-header {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                margin-bottom: 15px;
                                padding-bottom: 10px;
                                border-bottom: 1px solid #eee;
                            }
                            .box-header h3 {
                                margin: 0;
                                font-size: 1.2em;
                                font-weight: 700;
                                text-align: center;
                                flex-grow: 1;
                            }
                            .close-button {
                                background: none;
                                border: none;
                                font-size: 1.5em;
                                cursor: pointer;
                                padding: 0 5px;
                                color: #666;
                            }
                            .close-button:hover {
                                color: #333;
                            }
                            .box-content {
                                display: grid;
                                grid-template-columns: repeat(2, 1fr);
                                gap: 10px;
                            }
                            .lesson-link {
                                text-decoration: none;
                                color: #2e2d40;
                                padding: 8px;
                                border-radius: 5px;
                                background-color: #86BFF3;
                                transition: background-color 0.2s;
                            }
                            .lesson-link:hover {
                                background-color: #68b3f7;
                            }
                        </style>
                        <script>
                            document.addEventListener('DOMContentLoaded', function() {
                                let activeBox = null;
                                
                                function closeActiveBox() {
                                    if (activeBox) {
                                        activeBox.classList.remove('active');
                                        activeBox = null;
                                    }
                                }
                                
                                document.querySelectorAll('.section-name').forEach(sectionName => {
                                    sectionName.addEventListener('click', function(e) {
                                        e.stopPropagation();
                                        const box = document.getElementById('box-' + this.dataset.section);
                                        
                                        if (activeBox === box) {
                                            closeActiveBox();
                                        } else {
                                            closeActiveBox();
                                            box.classList.add('active');
                                            activeBox = box;
                                        }
                                    });
                                });
                                
                                document.querySelectorAll('.close-button').forEach(button => {
                                    button.addEventListener('click', function(e) {
                                        e.stopPropagation();
                                        closeActiveBox();
                                    });
                                });
                                
                                document.addEventListener('click', function(e) {
                                    if (!e.target.closest('.section-item')) {
                                        closeActiveBox();
                                    }
                                });
                            });
                        </script>
                    </head>
                    <body>
                        <header>
                            <div class="header-left"><a href="/index.html"><img src="/images/tricube-education-logo.png" style="width:145px;height:60px;"alt="TriCube Education"></a></div>
                            <nav class="header-right">
                                <ul>
                                    <li class="dropdown">
                                        <button class="nav-button" onclick="location.href='/grade-select.html'">Subjects</button>
                                        <div class="dropdown-content">
                                            <div class="subject">
                                                <a href="#">Mathematics</a>
                                                <div class="course-dropdown">
                                                    <a href="/kmath">Kindergarten</a>
                                                    <a href="/math1">1st Grade</a>
                                                    <a href="/math2">2nd Grade</a>
                                                    <a href="/math3">3rd Grade</a>
                                                    <a href="/math4">4th Grade</a>
                                                    <a href="/math5">5th Grade</a>
                                                    <a href="/math6">6th Grade</a>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <button class="nav-button" onclick="location.href='/update-log.html'">Updates</button>
                                    </li>
                                    <li>
                                        <button class="nav-button" onclick="location.href='/about.html'">About</button>
                                    </li>
                                </ul>
                            </nav>
                        </header>
                        <main>
                            <h1>Kindergarten Math Lessons</h1>
                            <div class="lessons-page">
                                ${groupsList}
                            </div>
                        </main>
                    </body>
                    </html>
                `;

                res.send(mainPage);
            });
        });
    });
});

// Dynamic route for each group
router.get('/group/:name', (req, res) => {
    const groupName = req.params.name;
    fs.readFile(groupsFilePath, 'utf8', (err, groupsData) => {
        if (err) {
            return res.status(500).send('Error reading groups file');
        }
        const groups = JSON.parse(groupsData);
        const group = groups.find(g => g.name === groupName);

        if (!group) {
            return res.status(404).send('Group not found');
        }

        fs.readFile(sectionsFilePath, 'utf8', (err, sectionsData) => {
            if (err) {
                return res.status(500).send('Error reading sections file');
            }
            const sections = JSON.parse(sectionsData);

            fs.readFile(lessonsFilePath, 'utf8', (err, lessonsData) => {
                if (err) {
                    return res.status(500).send('Error reading lessons file');
                }
                const lessons = JSON.parse(lessonsData);

                const groupSections = sections
                    .filter(section => section.group === groupName)
                    .sort((a, b) => a.order - b.order);

                const sectionsHtml = groupSections.map(section => {
                    const sectionLessons = lessons.filter(lesson => lesson.section === section.name);
                    return `
                        <div class="section-container">
                            <h2>${section.name}</h2>
                            <div class="lessons-list">
                                ${sectionLessons.map(lesson => `
                                    <a href="/${contentType}/lesson/${lesson.index}" class="lesson-link">
                                        ${lesson.lessonTitle}
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('');

                const groupPage = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>${groupName} Group</title>
                        <link rel="icon" type="image/x-icon" href="/images/tricube-education-favicon.png">
                        <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,600;1,600&display=swap" rel="stylesheet">
                        <link rel="stylesheet" href="/styles.css">
                        <style>
                            * {
                                font-family: 'Nunito', sans-serif;
                            }
                            .group-page {
                                max-width: 1200px;
                                margin: 0 auto;
                                padding: 20px;
                            }
                            .sections-grid {
                                display: grid;
                                grid-template-columns: repeat(3, 1fr);
                                gap: 20px;
                                margin-top: 20px;
                            }
                            .section-container {
                                background-color: #f5f5f5;
                                border-radius: 10px;
                                padding: 15px;
                            }
                            .section-container h2 {
                                margin-top: 0;
                                color: #2e2d40;
                                font-size: 1.2em;
                                margin-bottom: 15px;
                            }
                            .lessons-list {
                                display: flex;
                                flex-direction: column;
                                gap: 10px;
                            }
                            .lesson-link {
                                text-decoration: none;
                                color: #2e2d40;
                                padding: 8px;
                                border-radius: 5px;
                                background-color: #86BFF3;
                                transition: background-color 0.2s;
                            }
                            .lesson-link:hover {
                                background-color: #68b3f7;
                            }
                        </style>
                    </head>
                    <body>
                        <header>
                            <div class="header-left"><a href="/index.html"><img src="/images/tricube-education-logo.png" style="width:145px;height:60px;"alt="TriCube Education"></a></div>
                            <nav class="header-right">
                                <ul>
                                    <li class="dropdown">
                                        <button class="nav-button" onclick="location.href='/grade-select.html'">Subjects</button>
                                        <div class="dropdown-content">
                                            <div class="subject">
                                                <a href="#">Mathematics</a>
                                                <div class="course-dropdown">
                                                    <a href="/kmath">Kindergarten</a>
                                                    <a href="/math1">1st Grade</a>
                                                    <a href="/math2">2nd Grade</a>
                                                    <a href="/math3">3rd Grade</a>
                                                    <a href="/math4">4th Grade</a>
                                                    <a href="/math5">5th Grade</a>
                                                    <a href="/math6">6th Grade</a>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <button class="nav-button" onclick="location.href='/update-log.html'">Updates</button>
                                    </li>
                                    <li>
                                        <button class="nav-button" onclick="location.href='/about.html'">About</button>
                                    </li>
                                </ul>
                            </nav>
                        </header>
                        <main>
                            <div class="group-page">
                                <h1>${groupName}</h1>
                                <div class="sections-grid">
                                    ${sectionsHtml}
                                </div>
                            </div>
                        </main>
                    </body>
                    </html>
                `;
                res.send(groupPage);
            });
        });
    });
});

module.exports = router; // Export the router for use in server.js
