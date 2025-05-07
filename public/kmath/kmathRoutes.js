const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Define the content type and file paths
const contentType = 'kmath';
const lessonsFilePath = path.join(__dirname, 'kmathlessons.json');
const groupsFilePath = path.join(__dirname, 'kmathgroups.json');

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
                <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,600;1,600&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="/styles.css">
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

        fs.readFile(groupsFilePath, 'utf8', (err, groupsData ) => {
            if (err) {
                return res.status(500).send('Error reading groups file');
            }
            const groups = JSON.parse(groupsData);

            const groupMap = {};
            groups.forEach(group => {
                groupMap[group.name] = { lessons: [], order: group.order };
            });

            lessons.forEach((lesson, index) => {
                if (groupMap[lesson.group]) {
                    groupMap[lesson.group].lessons.push({ title: lesson.lessonTitle, index });
                }
            });

            const sortedGroups = Object.keys(groupMap).sort((a, b) => {
                return groupMap[a].order - groupMap[b].order;
            });

            const groupsList = sortedGroups.map(groupName => {
                const lessonsList = groupMap[groupName].lessons.map(lesson => `
                    <li><a href="/${contentType}/lesson/${lesson.index}">${lesson.title}</a></li>
                `).join('');
                const encodedGroupName = encodeURIComponent(groupName);
                return `
                    <div class="group">
                        <a href="/${contentType}/group/${encodedGroupName}" class="group-link">${groupName}</a>
                        <div class="group-name"></div>
                        <div class="divider"></div>
                        <div class="lessons">
                            <ul>
                                ${lessonsList}
                            </ul>
                        </div>
                    </div>
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
                        body {
                            font-family: 'Nunito', sans-serif;
                        }
                        .lessons-page {
                            padding: 20px;
                        }
                        .group {
                            display: flex;
                            flex-direction: row;
                            align-items: flex-start;
                            border-radius: 15px;
                            padding: 10px;
                            background-color: #86BFF3;
                            margin-bottom: 20px;
                            transition: background-color 0.3s;
                            position: relative;
                            cursor: pointer;
                        }
                        .group:hover {
                            background-color: #68b3f7;
                        }
                        .group-link {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            z-index: 1;
                            text-decoration: none;
                            color: transparent;
                        }
                        .group-name {
                            flex: 1;
                            font-size: 1.5em;
                            margin-right: 10px;
                            position: relative;
                            z-index: 2;
                        }
                        .divider {
                            width: 1px;
                            background-color: #ccc;
                            margin: 0 10px;
                            position: relative;
                            z-index: 2;
                        }
                        .lessons {
                            flex: 2;
                            position: relative;
                            z-index: 2;
                        }
                        .lessons ul {
                            list-style-type: none;
                            padding: 0;
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 5px;
                        }
                        .lessons li {
                            margin: 5px 0;
                        }
                        .lessons a {
                            text-decoration: none;
                            color: #2e2d40;
                            position: relative;
                            z-index: 2;
                        }
                        .lessons a:hover {
                            text-decoration: underline;
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
                    <h1>${groupName} Group</h1>
                    <p>Welcome to the ${groupName} group page!</p>
                    <a href="/${contentType}">Back to Lessons</a>
                </main>
            </body>
            </html>
        `;
        res.send(groupPage);
    });
});

module.exports = router; // Export the router for use in server.js
