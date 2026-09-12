// Popup script for IITKGP ERP Feedback Automator with Multi-Sentiment Support

document.querySelectorAll('.sentiment-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        const sentiment = btn.dataset.sentiment || 'good';
        const statusDiv = document.getElementById('status');
        statusDiv.className = 'status-box';
        statusDiv.style.display = 'none';

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab || !tab.id) {
                statusDiv.className = 'status-box warning';
                statusDiv.innerText = '⚠️ Please make sure the active tab is open to the ERP feedback page.';
                return;
            }

            statusDiv.className = 'status-box';
            statusDiv.style.display = 'block';
            statusDiv.innerText = `⏳ Auto-filling [${sentiment.toUpperCase()}] feedback...`;

            chrome.tabs.sendMessage(tab.id, { action: 'autofill', sentiment: sentiment }, async (response) => {
                if (chrome.runtime.lastError || !response) {
                    try {
                        await chrome.scripting.executeScript({
                            target: { tabId: tab.id, allFrames: true },
                            files: ['content.js']
                        });

                        setTimeout(() => {
                            chrome.tabs.sendMessage(tab.id, { action: 'autofill', sentiment: sentiment }, (retryResponse) => {
                                handleResult(retryResponse || response, sentiment);
                            });
                        }, 350);
                    } catch (injectErr) {
                        statusDiv.className = 'status-box warning';
                        statusDiv.innerText = `Error: ${injectErr.message || 'Could not communicate with ERP tab.'}`;
                    }
                } else {
                    handleResult(response, sentiment);
                }
            });

            function handleResult(res, sent) {
                if (!res) {
                    statusDiv.className = 'status-box warning';
                    statusDiv.innerHTML = '⚠️ Please make sure a <strong>Faculty</strong> is selected first.';
                    return;
                }

                if (res.error) {
                    statusDiv.className = 'status-box warning';
                    statusDiv.innerText = res.error;
                    return;
                }

                const total = (res.radioCount || 0) + (res.selectCount || 0);
                if (total > 0 || (res.textCount || 0) > 0) {
                    statusDiv.className = 'status-box success';
                    const labelMap = { good: '😊 Good / Positive', neutral: '😐 Neutral / Balanced', worse: '🙁 Critical / Needs Work' };
                    statusDiv.innerHTML = `✅ <strong>Filled as ${labelMap[sent] || sent}!</strong><br>• Questions Answered: ${total}<br>• Comments Filled: ${res.textCount}<br><em>Now type the visual captcha & submit!</em>`;
                } else {
                    statusDiv.className = 'status-box warning';
                    statusDiv.innerHTML = '⚠️ No questions found.<br>Please click your <strong>Faculty Name</strong> first.';
                }
            }
        } catch (err) {
            statusDiv.className = 'status-box warning';
            statusDiv.innerText = `Error: ${err.message}`;
        }
    });
});

// Multi-Sentiment Bookmarklet Generator
const bookmarkletCode = `javascript:(function(){let m=prompt("Enter Feedback Mood:\\n1 = Good (Positive)\\n2 = Neutral (Balanced)\\n3 = Critical (Needs Work)","1");if(!m)return;let mode=m==='3'?'worse':(m==='2'?'neutral':'good');let r=0,t=0;function isEx(e){let n=(e.name||'').toLowerCase(),v=(e.value||'').trim(),p=(e.closest('div,td,tr,table,p')?.innerText||'');return /^[A-Z]{2}\\d{4,6}$/i.test(v)||p.includes('List Of Subjects')||p.includes('Select Faculty')||n.includes('sub')||n.includes('fac')||n.includes('prof');}function fill(d){const rg={};d.querySelectorAll('input[type="radio"]').forEach(e=>{if(isEx(e))return;rg[e.name]=rg[e.name]||[];rg[e.name].push(e);});Object.keys(rg).forEach(k=>{let g=rg[k];let target=mode==='good'?g[0]:(mode==='neutral'?g[Math.min(2,Math.floor(g.length/2))]:g[g.length-1]);target.checked=true;target.dispatchEvent(new Event('change',{bubbles:true}));target.dispatchEvent(new Event('input',{bubbles:true}));r++;});const cGood=["The course structure and teaching methods are exceptionally well-organized, engaging, and provide crystal-clear conceptual clarity.","The pace of teaching is optimal, with comprehensive lecture notes, regular doubt clearance, and outstanding practical examples.","Overall learning experience and continuous assessments are extremely helpful and no major modifications are needed."];const cNeut=["The course coverage is satisfactory overall, though incorporating more practical tutorials and interactive problem-solving sessions would be beneficial.","The instructor covers the syllabus systematically; however, providing additional reference materials and lecture summaries would further enhance understanding.","The assessments are balanced, but providing earlier feedback on assignments would help track personal learning progress more effectively."];const cWorse=["The pace of lectures was often too rapid, making it difficult to follow complex theoretical derivations and concepts during class.","More detailed step-by-step explanations and practical examples are urgently required to improve student engagement and comprehension.","The continuous assessment workload was overwhelming without sufficient guidance and timely clarification of doubts."];const resp=mode==='good'?cGood:(mode==='neutral'?cNeut:cWorse);d.querySelectorAll('textarea').forEach((ta,i)=>{ta.value=resp[i%resp.length];ta.dispatchEvent(new Event('input',{bubbles:true}));ta.dispatchEvent(new Event('change',{bubbles:true}));t++;});const c=d.querySelector('input[placeholder*="Captcha" i]');if(c){c.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>c.focus(),300);}}fill(document);if(r>0||t>0){alert('Filled as '+mode.toUpperCase()+'!\\nQuestions: '+r+'\\nComments: '+t+'\\n\\nPlease solve the captcha and submit.');}else{alert('Please select a Faculty/Professor first to load questions!');}})();`;

document.getElementById('copy-bookmarklet-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(bookmarkletCode).then(() => {
        const btn = document.getElementById('copy-bookmarklet-btn');
        btn.innerText = '✅ Copied to Clipboard!';
        setTimeout(() => {
            btn.innerText = '📋 Copy 1-Click Bookmarklet Code';
        }, 3000);
    });
});
