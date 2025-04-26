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
        
        // Extract unique groups
        const sortedGroups = [...new Set(lessons.map(lesson => lesson.group))].sort();

        // Debugging: Log the groups to the console
        console.log("Extracted Groups:", sortedGroups);

        const groupsList = sortedGroups.map(groupName => {
            return `
                <button onclick="location.href='/${contentType}/group/${encodeURIComponent(groupName)}'" class="group-button bubble">${groupName}</button>
            `;
        }).join('');

        const mainPage = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${contentType} Lessons</title>
                <link rel="icon" type="image/x-icon" href="/images/tricube-education-favicon.png">
                <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,600;1,600&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="/styles.css">
                <style>
                    .bubble {
                        border-radius: 50%;
                        padding: 15px 30px;
                        margin: 10px;
                        background-color: #4CAF50;
                        color: white;
                        border: none;
                        cursor: pointer;
                        transition: background-color 0.3s;
                    }
                    .bubble:hover {
                        background-color: #45a049;
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
                    <h1>${contentType} Lessons</h1>
                    <div class="groups-list">
                        ${groupsList}
                    </div>
                </main>
            </body>
            </html>
        `;
        res.send(mainPage);
    });
});

// Dynamic route for each group
router.get('/group/:name', (req, res) => {
    const groupName = req.params.name; 
    fs.readFile(groupsFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading groups file');
        }
        const groups = JSON.parse(data);
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

module.exports = router;