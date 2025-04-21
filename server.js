const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware to serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, 'images')));

// Define a route for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Adjust the path as necessary
});

// Endpoint to get lessons
app.get('/lessons', (req, res) => {
    fs.readFile('lessons.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading lessons file');
        }
        const lessons = JSON.parse(data);
        res.json(lessons);
    });
});

// Endpoint to generate lesson pages
app.get('/lesson/:id', (req, res) => {
    const lessonId = req.params.id;
    fs.readFile('lessons.json', 'utf8', (err, data) => {
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
                    <iframe id="ytplayer" type="text/html" width="720" height="405" src="https://www.youtube.com/embed/${lesson.videoCode}" frameborder="0" allowfullscreen></iframe>
                    <p>${lesson.lessonContent}</p>
                    <h2>Key Points</h2>
                    <div class="lessons-page"
                        <ul>
                            ${lesson.keyPoints.map(point => `<li>${point}</li>`).join('')}
                        </ul>
                    </div>
                    <a href="/kmath">Back to Lessons</a>
                </main>
            </body>
            </html>
        `;
        res.send(lessonPage);
    });
});

// Endpoint to serve the main lessons page
app.get('/kmath', (req, res) => {
    // Read lessons.json
    fs.readFile('lessons.json', 'utf8', (err, lessonsData) => {
        if (err) {
            return res.status(500).send('Error reading lessons file');
        }
        const lessons = JSON.parse(lessonsData);

        // Read groups.json
        fs.readFile('groups.json', 'utf8', (err, groupsData) => {
            if (err) {
                return res.status(500).send('Error reading groups file');
            }
            const groups = JSON.parse(groupsData);

            // Create a map for groups
            const groupMap = {};
            groups.forEach(group => {
                groupMap[group.name] = { lessons: [], order: group.order };
            });

            // Group lessons by their group
            lessons.forEach((lesson, index) => {
                if (groupMap[lesson.group]) {
                    groupMap[lesson.group].lessons.push({ title: lesson.lessonTitle, index });
                }
            });

            // Sort groups by order
            const sortedGroups = Object.keys(groupMap).sort((a, b) => {
                return groupMap[a].order - groupMap[b].order;
            });

            // Create the lessons list HTML
            const groupsList = sortedGroups.map(groupName => {
                const lessonsList = groupMap[groupName].lessons.map(lesson => `
                    <li><a href="/lesson/${lesson.index}">${lesson.title}</a></li>
                `).join('');
                return `
                    <div class="group">
                        <h2>${groupName}</h2>
                        <ul>
                            ${lessonsList}
                        </ul>
                    </div>
                `;
            }).join('');

            const mainPage = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Kindergarten Math</title>
                    <link rel="icon" type="image/x-icon" href="/images/tricube-education-favicon.png">
                    <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,600;1,600&display=swap" rel="stylesheet">
                    <link rel="stylesheet" href="styles.css">
                    <style>
                        body {
                            font-family: 'Nunito', sans-serif;
                        }
                        .lessons-page {
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 20px;
                            padding: 20px;
                        }
                        .group {
                            border: 1px solid #ccc;
                            border-radius: 8px;
                            padding: 10px;
                            background-color: #f9f9f9;
                        }
                        .group h2 {
                            font-size: 1.5em;
                            margin-bottom: 10px;
                        }
                        .group ul {
                            list-style-type: none;
                            padding: 0;
                        }
                        .group li {
                            margin: 5px 0;
                        }
                        .group a {
                            text-decoration: none;
                            color: #2e2d40;
                        }
                        .group a:hover {
                            text-decoration: underline;
                        }
                    </style>
                </head>
                <body>
                <header>
                    <div class="header-left"><a href="index.html"><img src="/images/tricube-education-logo.png" style="width:145px;height:60px;"alt="TriCube Education"></a></div>
                    <nav class="header-right">
                        <ul>
                            <li class="dropdown">
                                <button class="nav-button" onclick="location.href='grade-select.html'">Subjects</button>
                                <div class="dropdown-content">
                                    <div class="subject">
                                        <a href="#">Mathematics</a>
                                        <div class="course-dropdown">
                                            <a href="/kmath">Kindergarten</a>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <button class="nav-button" onclick="location.href='update-log.html'">Updates</button>
                            </li>
                            <li>
                                <button class="nav-button" onclick="location.href='about.html'">About</button>
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});