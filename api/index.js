const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static('public'));

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
            </head>
            <body>
                <h1>${lesson.lessonTitle}</h1>
                <p>${lesson.intro}</p>
                <a href="${lesson.videoLink}">Watch Video Tutorial</a>
                <p>${lesson.lessonContent}</p>
                <h2>Key Points</h2>
                <ul>
                    ${lesson.keyPoints.map(point => `<li>${point}</li>`).join('')}
                </ul>
                <a href="/kmath">Back to Lessons</a>
            </body>
            </html>
        `;
        res.send(lessonPage);
    });
});

// Endpoint to serve the main lessons page
app.get('/kmath', (req, res) => {
    fs.readFile ('lessons.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading lessons file');
        }
        const lessons = JSON.parse(data);
        const lessonsList = lessons.map((lesson, index) => `
            <li><a href="/lesson/${index}">${lesson.lessonTitle}</a></li>
        `).join('');
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
            </head>
            <body>
                <header>
                    <div class="header-left"><a href="index.html"><img src="/images/tricube-eduucation-logo.png" style="width:145px;height:60px;"alt="TriCube Education"></a></div>
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
                            <!-- You can add more tabs here in the future -->
                        </ul>
                    </nav>
                </header>
                <main>
                    <h1>Available Lessons</h1>
                <ul>
                    ${lessonsList}
                </ul>
                </main>
            </body>
            </html>
        `;
        res.send(mainPage);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//test
