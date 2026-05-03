/**
 * AreaPage — shared logic for the four AI Task Force visioning area pages.
 *
 * Each area page (teacher-support.html, student-learning.html, family-engagement.html,
 * district-systems.html) calls AreaPage.init() with its area metadata. This module
 * renders the framing prompts + submission form + handles submission to Sheets.
 *
 * Depends on submissions-service.js (window.SubmissionsService).
 */

window.AreaPage = (function () {
    const MODULE_ID = 'vvusd-ai-task-force-2026';

    const AREAS = {
        teacher: {
            slug: 'teacher',
            label: 'Teacher Support',
            badgeNumber: '01',
            colorClass: 'teal',
            colorHex: '#2dd4bf',
            colorRgb: '20, 184, 166',
            tagline: 'What teachers and school sites need to thrive with AI.',
            framingTitle: 'What should AI do for teachers next year?',
            framingLead: 'Think classroom. Think workflow. Think about the things that drain Sunday afternoons or pull you away from kids. What could the district build that gives teachers their time, attention, or expertise back?',
            prompts: [
                { icon: 'graduation-cap', title: 'Classroom-facing tools', body: 'Differentiation engines, lesson planners, feedback assistants — things students never see but that change what teaching feels like.' },
                { icon: 'database', title: 'District-data tools', body: 'Things that need Aeries, IEP, EL, gradebook, or attendance data — supports a teacher couldn\'t build alone with Gemini in a doc.' },
                { icon: 'users-round', title: 'Capacity that lasts', body: 'Champions at every site, site-leader cohorts, departmental deep dives — work that distributes AI fluency beyond a single person.' }
            ],
            specHints: [
                'Who specifically uses this — what role, what grade, what subject?',
                'What problem is it solving today, and how does AI change that?',
                'What three features matter most? (Cut everything else for now.)',
                'What district data would it need to actually work?'
            ]
        },
        student: {
            slug: 'student',
            label: 'Student Learning',
            badgeNumber: '02',
            colorClass: 'purple',
            colorHex: '#c084fc',
            colorRgb: '168, 85, 247',
            tagline: 'What students should be doing with AI.',
            framingTitle: 'Are we doing enough with students?',
            framingLead: 'Curriculum. AI literacy. Norms across courses. Content built for students, not just for staff. What should students be doing with AI next year — and what does the district owe them to make that real?',
            prompts: [
                { icon: 'book-open', title: 'AI literacy curriculum', body: 'District-vetted, age-appropriate, integrated into existing courses. Not bolted on as an elective — woven through.' },
                { icon: 'sparkles', title: 'Student-built work', body: 'Showcases, portfolios, capstones — venues where students actually do work with AI and share it across schools.' },
                { icon: 'shield-check', title: 'Norms students help write', body: 'Shared expectations for how AI shows up in coursework — collaborative norms, not handed-down policy.' }
            ],
            specHints: [
                'Which students? Grade level, course, language, learner profile.',
                'What is the student doing with AI? Be specific about the action.',
                'What does the teacher\'s role look like alongside it?',
                'What does it look like at the end — a product? a habit? a piece of learning?'
            ]
        },
        family: {
            slug: 'family',
            label: 'Family Engagement',
            badgeNumber: '03',
            colorClass: 'orange',
            colorHex: '#fb923c',
            colorRgb: '251, 146, 60',
            tagline: 'Extending VVUSD\'s reach to families.',
            framingTitle: 'How does AI show up for families?',
            framingLead: 'Multilingual content. Two-way conversation. AI literacy that meets parents where they are. The website, the newsletter, the parent meeting — what could the district do that families would actually feel?',
            prompts: [
                { icon: 'languages', title: 'Multilingual reach', body: 'School site content, newsletters, classroom updates — every word, in every family\'s language, automatically kept in sync.' },
                { icon: 'message-circle', title: 'Two-way conversation', body: 'Family question collection ahead of town halls, teacher contact logs that follow the family, AI follow-up suggestions for outreach.' },
                { icon: 'home', title: 'Family AI literacy', body: 'Community sessions for parents to understand what AI is doing in their kid\'s school — with their language, on their terms.' }
            ],
            specHints: [
                'Which families? Language, grade level, type of contact.',
                'What\'s broken today? What does the family experience right now?',
                'What does the family see, feel, or do differently?',
                'What does the district side look like — who creates, who routes, who follows up?'
            ]
        },
        district: {
            slug: 'district',
            label: 'Deeper District Systems',
            badgeNumber: '04',
            colorClass: 'blue',
            colorHex: '#60a5fa',
            colorRgb: '59, 130, 246',
            tagline: 'Workflow, integration, automation across the district apparatus.',
            framingTitle: 'What plumbing does AI need to actually live in our work?',
            framingLead: 'Beyond classrooms. Think about the work that happens in HR, Curriculum, SpEd, EL, IT, Comms — the systems and processes the district runs every week. What deeper integration would let AI actually do real work, not just sit in a chatbot?',
            prompts: [
                { icon: 'workflow', title: 'Workflow automations', body: 'IEP timelines, intervention referrals, sub coverage routing, compliance reviews — tedious work that AI can pre-process so people decide.' },
                { icon: 'plug', title: 'Cross-system integrations', body: 'Aeries, the CMS, gradebook, IEP system — connective tissue that lets AI actually pull from the data it needs.' },
                { icon: 'gauge', title: 'Departmental deep dives', body: 'Pick one function — HR, Curriculum, SpEd, EL — and remake their workflow with AI from end to end. One sprint per quarter.' }
            ],
            specHints: [
                'Which department or function? Be concrete.',
                'What\'s the manual workflow today — step by step?',
                'Where does AI insert itself? What stays human?',
                'What system or data would it need to integrate with?'
            ]
        }
    };

    function init(areaSlug) {
        const area = AREAS[areaSlug];
        if (!area) {
            console.error('Unknown area:', areaSlug);
            return;
        }

        // Apply area accent color via CSS custom property
        document.documentElement.style.setProperty('--area-color', area.colorHex);
        document.documentElement.style.setProperty('--area-color-rgb', area.colorRgb);

        // Populate area metadata
        const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
        set('area-label', area.label);
        set('area-badge-number', area.badgeNumber);
        set('area-tagline', area.tagline);
        set('area-framing-title', area.framingTitle);
        set('area-framing-lead', area.framingLead);
        document.title = `${area.label} · VVUSD AI Task Force Visioning`;

        // Render prompts
        const promptGrid = document.getElementById('prompt-grid');
        if (promptGrid) {
            promptGrid.innerHTML = area.prompts.map(p => `
                <div class="prompt-card">
                    <div class="prompt-icon"><i data-lucide="${p.icon}" style="width: 22px; height: 22px;"></i></div>
                    <h3 class="prompt-title">${p.title}</h3>
                    <p class="prompt-body">${p.body}</p>
                </div>
            `).join('');
        }

        // Render spec hints
        const specList = document.getElementById('spec-hints');
        if (specList) {
            specList.innerHTML = area.specHints.map(h => `<li>${h}</li>`).join('');
        }

        // Wire submission form
        const form = document.getElementById('submission-form');
        if (form) {
            form.addEventListener('submit', handleSubmit.bind(null, area));
        }

        // Pre-fill the hidden area field
        const areaInput = document.getElementById('field-area');
        if (areaInput) areaInput.value = area.label;

        // Initialize Lucide icons after content is in
        if (window.lucide) lucide.createIcons();
    }

    async function handleSubmit(area, ev) {
        ev.preventDefault();

        const titleEl = document.getElementById('field-title');
        const descEl = document.getElementById('field-description');
        const linkEl = document.getElementById('field-link');
        const membersEl = document.getElementById('field-members');
        const errorEl = document.getElementById('form-error');
        const submitBtn = document.getElementById('submit-btn');
        const successPanel = document.getElementById('success-panel');
        const formCard = document.getElementById('form-card');

        const title = titleEl.value.trim();
        const description = descEl.value.trim();
        const link = linkEl.value.trim();
        const members = membersEl.value.trim();

        // Validate
        const errors = [];
        if (!title) errors.push('Title is required.');
        if (!description) errors.push('Description is required.');
        if (!/^https?:\/\//i.test(link)) errors.push('Link must be a full URL starting with http:// or https://');

        if (errors.length) {
            errorEl.innerHTML = errors.map(e => `<div>${e}</div>`).join('');
            errorEl.style.display = 'block';
            return;
        }
        errorEl.style.display = 'none';

        // Disable, show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader-2" style="width: 18px; height: 18px; animation: spin 1s linear infinite;"></i> <span>Submitting…</span>';
        if (window.lucide) lucide.createIcons();

        try {
            // Set group "user name" so the gallery has a label per submission
            const groupLabel = members
                ? members.split(',')[0].trim() + (members.includes(',') ? ' + group' : '')
                : `Group · ${area.label}`;
            localStorage.setItem('vcl_userName', groupLabel);

            await SubmissionsService.submit(MODULE_ID, 'project', {
                area: area.label,
                title,
                description,
                link,
                members
            });

            // Show success
            formCard.style.display = 'none';
            successPanel.style.display = 'block';
            if (window.lucide) lucide.createIcons();
        } catch (err) {
            console.error(err);
            errorEl.innerHTML = `<div>Submission failed: ${err.message || 'unknown error'}. Try again or wave the facilitator over.</div>`;
            errorEl.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Submit to the gallery</span> <i data-lucide="arrow-right" style="width: 18px; height: 18px;"></i>';
            if (window.lucide) lucide.createIcons();
        }
    }

    return { init: init, AREAS: AREAS };
})();
