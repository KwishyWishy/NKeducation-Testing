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
                <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
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

                // Organize sections by group
                sections.forEach(section => {
                    if (groupMap[section.group]) {
                        groupMap[section.group].sections.push({
                            name: section.name,
                            order: section.order
                        });
                    }
                });

                // Sort sections within each group
                Object.keys(groupMap).forEach(groupName => {
                    groupMap[groupName].sections.sort((a, b) => a.order - b.order);
                });

                const sortedGroups = Object.keys(groupMap).sort((a, b) => {
                    return groupMap[a].order - groupMap[b].order;
                });

                const groupsList = sortedGroups.map((groupName, groupIndex) => {
                    const groupSections = groupMap[groupName].sections;
                    const encodedGroupName = encodeURIComponent(groupName);
                    const sectionsGrid = `
                        <ul class="sections-grid">
                            ${groupSections.map(section => `
                                <li>
                                    <div class="section-name" onclick="event.stopPropagation(); toggleSection('${section.name}', ${groupIndex})">${section.name}</div>
                                    <div id="${section.name}" class="section-content collapsed">
                                        <button class="close-button" onclick="event.stopPropagation(); toggleSection('${section.name}', ${groupIndex})">×</button>
                                        <h3>${section.name}</h3>
                                        <ul>
                                            ${lessons.filter(lesson => lesson.section === section.name).map(lesson => `
                                                <li><a href="/${contentType}/lesson/${lessons.indexOf(lesson)}">${lesson.lessonTitle}</a></li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    `;
                    return `
                        <div class="group-bubble group-bubble-wrapper" style="position:relative;" data-group-index="${groupIndex}" onclick="handleGroupBubbleClick(event, '${encodedGroupName}')">
                            <div class="group-name">${groupName}</div>
                            <div class="divider" data-group-index="${groupIndex}"></div>
                            <div class="sections">
                                ${sectionsGrid}
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
                        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
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
                                max-width: 1300px;
                                margin: 0 auto;
                                display: flex;
                                flex-direction: column;
                                gap: 30px;
                            }
                            .group-bubble {
                                display: flex;
                                flex-direction: row;
                                align-items: center;
                                border-radius: 15px;
                                padding: 20px 30px;
                                background-color: #86BFF3;
                                margin: 0 auto;
                                width: 100%;
                                max-width: 1200px;
                                min-width: 300px;
                                box-sizing: border-box;
                                justify-content: flex-start;
                                gap: 20px;
                                transition: background 0.3s;
                                /* Remove default button styles */
                                border: none;
                                outline: none;
                                cursor: pointer;
                                box-shadow: none;
                                appearance: none;
                                -webkit-appearance: none;
                                -moz-appearance: none;
                                min-height: 110px;
                            }
                            .group-bubble:focus {
                                outline: none;
                            }
                            .group-bubble:hover {
                                background-color: #68b3f7;
                            }
                            .group-name {
                                width: 260px;
                                font-size: 1.5em;
                                font-weight: 700;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                text-align: center;
                                margin-right: 10px;
                                white-space: normal;
                                word-break: break-word;
                                line-height: 1.2;
                                padding: 8px 0;
                            }
                            .divider {
                                width: 2px;
                                background-color: #ccc;
                                height: 90px; /* will be set by JS */
                                min-height: 50px;
                                align-self: center;
                                margin: 0 10px;
                                transition: height 0.3s;
                            }
                            .sections {
                                flex: 1;
                                min-width: 0;
                                display: flex;
                                align-items: flex-start;
                            }
                            .sections-grid {
                                display: grid;
                                grid-template-columns: repeat(2, 1fr);
                                gap: 10px;
                                width: 100%;
                                list-style: none;
                                padding: 0;
                                margin: 0;
                            }
                            .sections-grid li {
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: flex-start;
                            }
                            .section-name {
                                cursor: pointer;
                                padding: 8px 18px;
                                text-align: center;
                                font-weight: 600;
                                background-color: #86BFF3;
                                border-radius: 20px;
                                margin: 2px 0 8px 0;
                                box-shadow: 0 1px 3px rgba(0,0,0,0.07);
                                border: 1px solid #ccc;
                                transition: background 0.3s;
                                color: #2e2d40;
                                font-size: 1.1em;
                                pointer-events: auto;
                            }
                            .section-name:hover {
                                text-decoration: underline;
                                background-color: #68b3f7;
                            }
                            .section-content {
                                position: relative;
                                background-color: #fff;
                                border: 1px solid #ccc;
                                border-radius: 5px;
                                padding: 15px;
                                z-index: 1000;
                                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                                transition: max-height 0.5s ease, padding 0.5s ease;
                                max-height: 500px;
                                overflow: hidden;
                                width: 100%;
                                margin-top: 5px;
                                background: #fff;
                                pointer-events: auto;
                            }
                            .section-content.collapsed {
                                max-height: 0;
                                padding: 0;
                                border: none;
                            }
                            .section-content h3 {
                                text-align: center;
                                margin-top: 0;
                                margin-bottom: 15px;
                                font-weight: 700;
                            }
                            .section-content .close-button {
                                position: absolute;
                                right: 10px;
                                top: 10px;
                                background: none;
                                border: none;
                                font-size: 20px;
                                cursor: pointer;
                                color: #2e2d40;
                                pointer-events: auto;
                            }
                            .section-content .close-button:hover {
                                color: #666;
                            }
                            .group-bubble-wrapper {
                                position: relative;
                            }
                            .group-bubble-link {
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                background: none;
                                border: none;
                                cursor: pointer;
                                z-index: 2;
                                padding: 0;
                                margin: 0;
                                outline: none;
                                pointer-events: auto;
                            }
                            .group-bubble-link:focus {
                                outline: 2px solid #2e2d40;
                            }
                            .group-bubble:focus,
                            .group-bubble-link:focus {
                                outline: none !important;
                            }
                        </style>
                        <script>
                            let originalHeights = []; // Array to store original heights of group bubbles

                            function setDividerHeight(groupIndex, height = null) {
                                const bubble = document.querySelector('.group-bubble[data-group-index="' + groupIndex + '"]');
                                const divider = document.querySelector('.divider[data-group-index="' + groupIndex + '"]');
                                if (bubble && divider) {
                                    const bubbleHeight = height !== null ? height : bubble.offsetHeight;
                                    divider.style.height = Math.max(50, Math.round(bubbleHeight * 0.9)) + 'px';
                                }
                            }

                            function setAllDividerHeights() {
                                const bubbles = document.querySelectorAll('.group-bubble');
                                bubbles.forEach((bubble, idx) => {
                                    originalHeights[idx] = bubble.offsetHeight; // Store original height
                                    setDividerHeight(idx, originalHeights[idx]); // Set initial divider height
                                });
                            }

                            function toggleSection(sectionId, groupIndex) {
                                const section = document.getElementById(sectionId);
                                const allSections = document.querySelectorAll('.section-content');
                                const allDividers = document.querySelectorAll('.divider');

                                // Close all other sections and update their dividers
                                allSections.forEach((s, idx) => {
                                    if (s.id !== sectionId) {
                                        s.classList.add('collapsed');
                                        s.style.display = 'none'; // Hide collapsed sections
                                        // Update the divider height for the group bubble
                                        const groupBubbleIndex = Math.floor(idx / 2); // Assuming 2 sections per group
                                        setDividerHeight(groupBubbleIndex, originalHeights[groupBubbleIndex]);
                                    }
                                });

                                // Toggle the clicked section
                                if (section.classList.contains('collapsed')) {
                                    // Expanding: set display:block before removing collapsed
                                    section.style.display = 'block';
                                    // Force reflow to apply display before removing class
                                    void section.offsetWidth;
                                    section.classList.remove('collapsed');
                                } else {
                                    // Collapsing: add collapsed class
                                    section.classList.add('collapsed');
                                }

                                // Update divider height immediately for expand
                                setDividerHeight(groupIndex);
                                
                                // Listen for transitionend to update divider after collapse/expand
                                const onTransitionEnd = (e) => {
                                    if (e.propertyName === 'max-height') {
                                        if (section.classList.contains('collapsed')) {
                                            // If collapsed, reset divider height to original
                                            setDividerHeight(groupIndex, originalHeights[groupIndex]);
                                        } else {
                                            // If expanded, update divider height
                                            setDividerHeight(groupIndex);
                                        }
                                        section.removeEventListener('transitionend', onTransitionEnd);
                                    }
                                };
                                section.addEventListener('transitionend', onTransitionEnd);
                            }

                            function handleGroupBubbleClick(event, groupName) {
                                // If the click is on a section name, section-content, or close-button, do nothing
                                const ignoreClasses = ['section-name', 'section-content', 'close-button'];
                                let el = event.target;
                                while (el && el !== event.currentTarget) {
                                    if (ignoreClasses.some(cls => el.classList && el.classList.contains(cls))) {
                                        return;
                                    }
                                    el = el.parentElement;
                                }
                                window.location.href = '/kmath/group/' + groupName;
                            }

                            // On page load and resize, set all divider heights
                            window.addEventListener('DOMContentLoaded', setAllDividerHeights);
                            window.addEventListener('resize', setAllDividerHeights);
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

                // Filter sections for this group
                const groupSections = sections
                    .filter(section => section.group === groupName)
                    .sort((a, b) => a.order - b.order);

                // Create three sections per row
                const sectionsHtml = groupSections.reduce((acc, section, index) => {
                    if (index % 3 === 0) {
                        acc += '<div class="sections-row">';
                    }

                    const sectionLessons = lessons.filter(lesson => lesson.section === section.name);
                    const lessonsList = sectionLessons.map(lesson => `
                        <li><a href="/${contentType}/lesson/${lessons.indexOf(lesson)}">${lesson.lessonTitle}</a></li>
                    `).join('');

                    acc += `
                        <div class="section-column">
                            <h3>${section.name}</h3>
                            <ul>
                                ${lessonsList}
                            </ul>
                        </div>
                    `;

                    if (index % 3 === 2 || index === groupSections.length - 1) {
                        acc += '</div>';
                    }

                    return acc;
                }, '');

                const groupPage = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>${groupName} Group</title>
                        <link rel="icon" type="image/x-icon" href="/images/tricube-education-favicon.png">
                        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
                        <link rel="stylesheet" href="/styles.css">
                        <style>
                            .sections-row {
                                display: flex;
                                justify-content: space-between;
                                margin-bottom: 30px;
                            }
                            .section-column {
                                flex: 1;
                                margin: 0 15px;
                                padding: 20px;
                                background-color: #f8f9fa;
                                border-radius: 10px;
                                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                            }
                            .section-column h3 {
                                text-align: center;
                                margin-top: 0;
                                margin-bottom: 15px;
                                color: #2e2d40;
                            }
                            .section-column ul {
                                list-style-type: none;
                                padding: 0;
                            }
                            .section-column li {
                                margin: 10px 0;
                            }
                            .section-column a {
                                text-decoration: none;
                                color: #2e2d40;
                                display: block;
                                padding: 5px;
                                text-align: center;
                            }
                            .section-column a:hover {
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
                            <h1>${groupName}</h1>
                            <div class="lessons-page">
                                ${sectionsHtml}
                            </div>
                            <a href="/${contentType}">Back to Lessons</a>
                        </main>
                    </ </body>
                    </html>
                `;
                res.send(groupPage);
            });
        });
    });
});

module.exports = router;
