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

    const isSelfLink = targetUrl.includes(window.location.hostname) && (targetUrl.includes('index.html') || targetUrl.endsWith('/') || targetUrl.endsWith('.php'));
    const isRelative = targetUrl === './' || targetUrl === '/' || targetUrl.startsWith('./');

    if (!targetUrl || targetUrl.trim() === '' || isSelfLink || isRelative) {
        viewerEl.removeAttribute('srcdoc');
        viewerEl.src = '';
        alert("No PDF document found for this paper. Link might be broken or leads back to the app.");
        return;
    }

    // Use Google Docs Viewer for remote PDFs
    if (paper.pdf_link) {
        viewerEl.removeAttribute('srcdoc');
        viewerEl.src = `https://docs.google.com/viewer?url=${encodeURIComponent(paper.pdf_link)}&embedded=true`;
    } else {
        viewerEl.removeAttribute('srcdoc');
        viewerEl.src = targetUrl;
    }

    document.getElementById('open-btn').href = targetUrl;

    // Notes
    const trackerData = getTrackerData();
    const savedData = trackerData[paper.url] || {};
    notesInput.value = savedData.notes || '';

    updateMainButton();
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
