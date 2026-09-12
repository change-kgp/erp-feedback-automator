// IIT Kharagpur ERP Feedback Automator - Multi-Sentiment Content Script

(function () {
    // Strictly restrict execution exclusively to IIT Kharagpur ERP domains
    const host = (window.location.hostname || '').toLowerCase();
    if (!host.includes('iitkgp.ac.in') && !host.includes('iitkgp.ernet.in')) {
        return;
    }

    const isTopWindow = window.top === window;

    const SENTIMENT_DATA = {
        good: {
            name: 'Good',
            icon: '😊',
            color: '#059669',
            radioKeywords: ['strongly agree', 'excellent', '5', 'optimum', 'yes', 'always', 'high'],
            selectKeywords: ['strongly agree', 'excellent', 'very good', '5', 'optimum', 'yes'],
            pickIndex: (length) => 0, // Top / 1st option
            comments: [
                "The course structure and teaching methods are exceptionally well-organized, engaging, and provide crystal-clear conceptual clarity.",
                "The pace of teaching is optimal, with comprehensive lecture notes, regular doubt clearance, and outstanding practical examples.",
                "Overall learning experience and continuous assessments are extremely helpful and no major modifications are needed.",
                "The instructor was always accessible, supportive, and encouraged active participation throughout all course modules and discussions."
            ]
        },
        neutral: {
            name: 'Neutral',
            icon: '😐',
            color: '#d97706',
            radioKeywords: ['agree', 'neutral', 'satisfactory', 'optimum', '4', '3', 'moderate', 'yes'],
            selectKeywords: ['agree', 'neutral', 'satisfactory', 'good', '4', '3', 'optimum'],
            pickIndex: (length) => Math.min(2, Math.floor(length / 2)), // Middle option (e.g. Neutral / Satisfactory)
            comments: [
                "The course coverage is satisfactory overall, though incorporating more practical tutorials and interactive problem-solving sessions would be beneficial.",
                "The instructor covers the syllabus systematically; however, providing additional reference materials and lecture summaries would further enhance understanding.",
                "The assessments are balanced, but providing earlier feedback on assignments would help track personal learning progress more effectively.",
                "The pace of lectures is generally fine, but spending slightly more time on complex core topics would improve conceptual clarity."
            ]
        },
        worse: {
            name: 'Critical',
            icon: '🙁',
            color: '#dc2626',
            radioKeywords: ['strongly disagree', 'disagree', 'poor', 'unsatisfactory', '1', '2', 'low', 'no', 'too fast', 'too slow'],
            selectKeywords: ['strongly disagree', 'disagree', 'poor', 'unsatisfactory', '1', '2', 'no'],
            pickIndex: (length) => Math.max(0, length - 1), // Lowest / last option (e.g. Strongly Disagree / Poor)
            comments: [
                "The pace of lectures was often too rapid, making it difficult to follow complex theoretical derivations and concepts during class.",
                "More detailed step-by-step explanations and practical examples are urgently required to improve student engagement and comprehension.",
                "The continuous assessment workload was overwhelming without sufficient guidance and timely clarification of doubts.",
                "The learning materials provided were inadequate for deep understanding, requiring major revision and clearer structure for future batches."
            ]
        }
    };

    // Exclude subject and professor selector radios
    function isExcludedSelectorRadio(radio) {
        const name = (radio.name || '').toLowerCase();
        const id = (radio.id || '').toLowerCase();
        const val = (radio.value || '').trim();

        const selectorKeywords = ['sub', 'subj', 'subject', 'fac', 'faculty', 'prof', 'teacher', 'instructor', 'emp', 'member', 'course'];
        for (const kw of selectorKeywords) {
            if (name.includes(kw) || id.includes(kw)) {
                if (!name.includes('rate') && !name.includes('rating') && !name.includes('score') && !name.includes('ans') && !name.includes('q_') && !name.match(/\bq\d+/)) {
                    return true;
                }
            }
        }

        if (/^[A-Z]{2}\d{4,6}$/i.test(val)) {
            return true;
        }

        const parentBlock = radio.closest('div, td, tr, table, p, fieldset');
        if (parentBlock) {
            const text = parentBlock.innerText || '';
            if (text.includes('List Of Subjects') || text.includes('Select Faculty') || text.includes('Please click on the subject')) {
                return true;
            }
        }

        const onclickStr = (radio.getAttribute('onclick') || '').toLowerCase();
        const onchangeStr = (radio.getAttribute('onchange') || '').toLowerCase();
        if (onclickStr.includes('faculty') || onclickStr.includes('subject') || onclickStr.includes('submit') || onclickStr.includes('location') ||
            onchangeStr.includes('faculty') || onchangeStr.includes('subject') || onchangeStr.includes('submit') || onchangeStr.includes('location')) {
            return true;
        }

        return false;
    }

    function autofillDocument(doc, sentimentKey = 'good') {
        let radioCount = 0;
        let textCount = 0;
        let selectCount = 0;

        if (!doc) return { radioCount: 0, textCount: 0, selectCount: 0 };

        const config = SENTIMENT_DATA[sentimentKey] || SENTIMENT_DATA.good;

        // 1. Group ONLY question radio buttons
        const radioGroups = {};
        const radios = doc.querySelectorAll('input[type="radio"]');

        radios.forEach(radio => {
            if (isExcludedSelectorRadio(radio)) {
                return;
            }

            const groupKey = radio.name || 'unnamed_group';
            if (!radioGroups[groupKey]) {
                radioGroups[groupKey] = [];
            }
            radioGroups[groupKey].push(radio);
        });

        // Select matching options for each question group
        Object.keys(radioGroups).forEach(name => {
            const group = radioGroups[name];
            if (group.length > 0) {
                let targetRadio = null;

                // Match by keyword in value or parent label
                for (let r of group) {
                    const val = (r.value || '').trim().toLowerCase();
                    const label = (r.parentElement?.innerText || '').toLowerCase();
                    
                    for (let kw of config.radioKeywords) {
                        if (val === kw || label.includes(kw)) {
                            targetRadio = r;
                            break;
                        }
                    }
                    if (targetRadio) break;
                }

                // Fallback by index if no text match
                if (!targetRadio) {
                    const targetIdx = config.pickIndex(group.length);
                    targetRadio = group[targetIdx] || group[0];
                }

                if (targetRadio) {
                    targetRadio.checked = true;
                    targetRadio.dispatchEvent(new Event('change', { bubbles: true }));
                    targetRadio.dispatchEvent(new Event('input', { bubbles: true }));
                    radioCount++;
                }
            }
        });

        // 2. Selects / Dropdowns
        const selects = doc.querySelectorAll('select');
        selects.forEach(sel => {
            const selName = (sel.name || '').toLowerCase();
            if (selName.includes('sub') || selName.includes('fac') || selName.includes('prof')) return;

            if (sel.options && sel.options.length > 1) {
                let chosenIndex = null;
                for (let i = 0; i < sel.options.length; i++) {
                    const optText = (sel.options[i].text || '').toLowerCase();
                    const optVal = (sel.options[i].value || '').toLowerCase();

                    for (let kw of config.selectKeywords) {
                        if (optText.includes(kw) || optVal === kw) {
                            chosenIndex = i;
                            break;
                        }
                    }
                    if (chosenIndex !== null) break;
                }

                if (chosenIndex === null) {
                    chosenIndex = config.pickIndex(sel.options.length);
                }

                sel.selectedIndex = chosenIndex;
                sel.dispatchEvent(new Event('change', { bubbles: true }));
                selectCount++;
            }
        });

        // 3. Text Areas (10+ words responses)
        const textAreas = doc.querySelectorAll('textarea');
        const responses = config.comments;

        textAreas.forEach((ta, index) => {
            ta.value = responses[index % responses.length];
            ta.dispatchEvent(new Event('focus', { bubbles: true }));
            ta.dispatchEvent(new Event('input', { bubbles: true }));
            ta.dispatchEvent(new Event('change', { bubbles: true }));
            ta.dispatchEvent(new Event('keyup', { bubbles: true }));
            ta.dispatchEvent(new Event('blur', { bubbles: true }));
            textCount++;
        });

        // 4. Smoothly scroll to and focus the Captcha input
        const captchaInput = doc.querySelector('input[placeholder*="Captcha" i], input[name*="captcha" i], input[id*="captcha" i], input[name*="userCaptcha" i]');
        if (captchaInput) {
            captchaInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                captchaInput.focus();
            }, 350);
        }

        // Subframes check
        const subFrames = doc.querySelectorAll('iframe, frame');
        for (let frame of subFrames) {
            try {
                const subDoc = frame.contentDocument || frame.contentWindow.document;
                if (subDoc) {
                    const subRes = autofillDocument(subDoc, sentimentKey);
                    radioCount += subRes.radioCount;
                    textCount += subRes.textCount;
                    selectCount += subRes.selectCount;
                }
            } catch (e) {}
        }

        return { radioCount, textCount, selectCount };
    }

    function isFacultySelected(doc) {
        if (!doc) return false;
        const radios = doc.querySelectorAll('input[type="radio"]');
        let facultyRadiosFound = false;
        let facultyChecked = false;

        radios.forEach(r => {
            if (isExcludedSelectorRadio(r)) {
                const parentText = r.closest('div, td, tr, table, p')?.innerText || '';
                if (parentText.includes('Select Faculty') || (r.name || '').toLowerCase().includes('fac') || (r.name || '').toLowerCase().includes('prof')) {
                    facultyRadiosFound = true;
                    if (r.checked) facultyChecked = true;
                }
            }
        });

        return { facultyRadiosFound, facultyChecked };
    }

    function runAutofill(sentimentKey = 'good') {
        const facCheck = isFacultySelected(document);
        if (facCheck.facultyRadiosFound && !facCheck.facultyChecked) {
            alert("⚠️ Please select a Faculty / Professor first to load the questions!");
            return { error: 'Please select a Faculty / Professor first!' };
        }

        const res = autofillDocument(document, sentimentKey);
        return res;
    }

    // Message listener for popup triggers
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        const sentiment = request.sentiment || 'good';
        const res = runAutofill(sentiment);
        sendResponse(res);
        return true;
    });

    // Create a floating top sentiment toolbar ONLY in the main top window
    function createTopSentimentToolbar() {
        if (!isTopWindow) return;
        if (document.getElementById('iitkgp-autofill-top-bar')) return;
        const target = document.body || document.documentElement;
        if (!target) return;

        const container = document.createElement('div');
        container.id = 'iitkgp-autofill-top-bar';
        
        container.style.cssText = `
            position: fixed !important;
            top: 15px !important;
            right: 25px !important;
            z-index: 2147483647 !important;
            display: flex !important;
            align-items: center !important;
            background: #0f172a !important;
            border: 2px solid #334155 !important;
            border-radius: 50px !important;
            padding: 4px 6px !important;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4) !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            user-select: none !important;
            gap: 4px !important;
        `;

        const titleLabel = document.createElement('span');
        titleLabel.innerHTML = `<span style="margin-left:8px; margin-right:6px; font-weight:700; font-size:12px; color:#94a3b8; letter-spacing:0.5px; text-transform:uppercase;">⚡ Fill:</span>`;
        container.appendChild(titleLabel);

        const moods = [
            { key: 'good', label: 'Good', icon: '😊', bg: '#059669', hoverBg: '#10b981' },
            { key: 'neutral', label: 'Neutral', icon: '😐', bg: '#d97706', hoverBg: '#f59e0b' },
            { key: 'worse', label: 'Critical', icon: '🙁', bg: '#dc2626', hoverBg: '#ef4444' }
        ];

        moods.forEach(mood => {
            const btn = document.createElement('button');
            btn.innerHTML = `<span style="font-size:14px; margin-right:4px;">${mood.icon}</span><span style="font-weight:600; font-size:12px;">${mood.label}</span>`;
            
            btn.style.cssText = `
                background: ${mood.bg} !important;
                color: #ffffff !important;
                border: none !important;
                padding: 6px 12px !important;
                border-radius: 30px !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                transition: all 0.2s ease !important;
                font-family: inherit !important;
            `;

            btn.onmouseenter = () => {
                btn.style.transform = 'translateY(-1px) scale(1.05)';
                btn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
            };

            btn.onmouseleave = () => {
                btn.style.transform = 'translateY(0) scale(1)';
                btn.style.boxShadow = 'none';
            };

            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const res = runAutofill(mood.key);
                const total = (res.radioCount || 0) + (res.selectCount || 0);
                if (total > 0 || (res.textCount || 0) > 0) {
                    const prevText = btn.innerHTML;
                    btn.innerHTML = `<span style="font-size:14px; margin-right:4px;">✓</span><span style="font-weight:600; font-size:12px;">Filled!</span>`;
                    setTimeout(() => {
                        btn.innerHTML = prevText;
                    }, 1500);
                }
            };

            container.appendChild(btn);
        });

        // Draggable support so students can drag it anywhere
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        container.onmousedown = (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
            isDragging = false;
            startX = e.clientX;
            startY = e.clientY;
            const rect = container.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            const onMouseMove = (moveEvent) => {
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;
                if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                    isDragging = true;
                    container.style.top = `${initialTop + dy}px`;
                    container.style.left = `${initialLeft + dx}px`;
                    container.style.right = 'auto';
                }
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        target.appendChild(container);
    }

    if (isTopWindow) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createTopSentimentToolbar);
        } else {
            createTopSentimentToolbar();
        }
        setTimeout(createTopSentimentToolbar, 500);
    }
})();
