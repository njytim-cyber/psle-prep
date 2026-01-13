import {
    getPapers, getTrackerData, updateTrackerItem, save, getCurrentUrl, setCurrentUrl
} from './state.js';
import ViewManager from './view-manager.js';
import { debounce } from './ui.js';

// --- PDF Logic ---

export function loadPaper(paperOrUrl) {
    const allPapers = getPapers();
    let paper;
    if (typeof paperOrUrl === 'string') {
        paper = allPapers.find(p => p.url === paperOrUrl);
    } else {
        paper = paperOrUrl;
    }

    if (!paper) return;
    setCurrentUrl(paper.url);

    // Switch to PDF View
    ViewManager.show('pdf');

    // UI Updates
    document.getElementById('current-title').innerText = paper.title;
    document.getElementById('current-details').innerText = `${paper.subject || 'Maths'} | ${paper.level || 'P4'} | ${paper.year} | ${paper.term} | ${paper.school}`;

    const viewerEl = document.getElementById('pdf-viewer');
    const notesInput = document.getElementById('notes-input');

    // Priority: PDF Link (Remote) > File Path (Local) > Source URL (Page)
    let targetUrl = paper.pdf_link || paper.file_path || paper.url;

    const isRemoteViewer = targetUrl.includes('docs.google.com') || targetUrl.includes('drive.google.com');

    if (!targetUrl || targetUrl.trim() === '') {
        resetViewer();
        alert("No PDF document found for this paper.");
        return;
    }

    // Prevent immediate recursion for obvious self-links
    if (targetUrl === './' || targetUrl === '/' || (targetUrl.includes(window.location.hostname) && !targetUrl.endsWith('.pdf'))) {
        resetViewer();
        alert("Invalid document link.");
        return;
    }

    // For local files, verify existence to prevent SPA 404 fallback (Recursion)
    if (!isRemoteViewer && !paper.pdf_link) {
        // Show loading state?
        viewerEl.src = 'about:blank';

        fetch(targetUrl, { method: 'HEAD' })
            .then(response => {
                const contentType = response.headers.get('Content-Type');
                if (contentType && contentType.includes('text/html')) {
                    // It's a 404 rewrite to index.html
                    throw new Error("File not found (HTML fallback detected)");
                }
                if (!response.ok) {
                    throw new Error(`File load failed: ${response.status}`);
                }
                // Allowed
                viewerEl.src = targetUrl;
                document.getElementById('open-btn').href = targetUrl;
            })
            .catch(err => {
                console.error("PDF Load Error:", err);
                resetViewer();
                alert(`Error loading paper: The PDF file is missing or inaccessible.\n(${err.message})`);
            });

    } else {
        // Remote (Google Docs) or explicitly trusted
        if (paper.pdf_link) {
            viewerEl.removeAttribute('srcdoc');
            viewerEl.src = `https://docs.google.com/viewer?url=${encodeURIComponent(paper.pdf_link)}&embedded=true`;
        } else {
            viewerEl.removeAttribute('srcdoc');
            viewerEl.src = targetUrl;
        }
        document.getElementById('open-btn').href = targetUrl;
    }

    // Notes
    const trackerData = getTrackerData();
    const savedData = trackerData[paper.url] || {};
    notesInput.value = savedData.notes || '';

    updateMainButton();
}

function resetViewer() {
    const viewerEl = document.getElementById('pdf-viewer');
    viewerEl.removeAttribute('srcdoc');
    viewerEl.src = '';
    document.getElementById('open-btn').href = '#';
}

export function updateMainButton() {
    const btn = document.getElementById('mark-btn');
    const currentUrl = getCurrentUrl();
    const trackerData = getTrackerData();
    const isDone = trackerData[currentUrl] && trackerData[currentUrl].date;

    if (isDone) {
        btn.innerText = "Completed ✓";
        btn.classList.add('done');
    } else {
        btn.innerText = "⭐ Mark Complete";
        btn.classList.remove('done');
    }
}

export function toggleNotes() {
    const pane = document.getElementById('notes-pane');
    const icon = document.querySelector('.toggle-icon');
    if (pane.style.height === '30px') {
        pane.style.height = '120px';
        pane.classList.remove('collapsed');
        icon.style.transform = 'rotate(0deg)';

    } else {
        pane.style.height = '30px';
        pane.classList.add('collapsed');
        icon.style.transform = 'rotate(180deg)';
    }
}

export function saveNotes() {
    const currentUrl = getCurrentUrl();
    if (!currentUrl) return;

    const notesInput = document.getElementById('notes-input');
    updateTrackerItem(currentUrl, { notes: notesInput.value });

    // We import 'save' from state, which handles the cloud save
    save();
}

export function handleMainMark(callbacks) {
    const currentUrl = getCurrentUrl();
    if (!currentUrl) return;
    const trackerData = getTrackerData();
    if (trackerData[currentUrl] && trackerData[currentUrl].date) return; // Already done

    // Trigger modal logic (passed via callback or event?)
    // Better to dispatch event
    document.dispatchEvent(new CustomEvent('open-completion-modal', { detail: currentUrl }));
}
