import { useParams, useNavigate } from 'react-router-dom';
import { useStateContext } from '../context/StateContext';

const SCHOOL_SLUGS: Record<string, string> = {
    'Raffles Girls': 'Raffles',
    'Nanyang': 'Nanyang',
    'Tao Nan': 'Taonan',
    'Henry Park': 'henrypark',
    'Nan Hua': 'Nanhua',
    'Catholic High': 'catholic',
    'Ai Tong': 'Aitong',
    'ACS': 'ACS',
    'ACS Junior': 'ACSj',
    'Maris Stella': 'MarisStella',
    'Red Swastika': 'Red_Swastika',
    'Rosyth': 'Rosyth',
    'Maha Bodhi': 'Mahabodhi',
    'Methodist Girls': 'MGS',
    'Pei Chun': 'Pei_Chun',
    'CHIJ': 'CHIJ',
    'Singapore Chinese Girls': 'SCGS',
    'Anglo Chinese': 'ACS',
    'Methodist Paya Lebar': 'PLMGS',
    'Nan Chiau': 'NanChiau',
    'St Nicholas': 'StNick',
    'River Valley': 'RV'
};

export const PdfView = () => {
    // Determine ID from URL. We used encodeURIComponent(file_path) as ID
    // React Router * matches everything after /paper/, so we might need to be careful if it includes slashes.
    // However, since we used encodeURIComponent, it should be a single segment or we need to capture the splat.
    // In App.tsx: <Route path="paper/*" element={<PdfView />} />
    // The splat is in specified as *. 
    // We should probably just use a query param or a safe ID. 
    // But let's try to parse the splat.
    const params = useParams();
    const splat = params['*'];
    const paperId = splat ? decodeURIComponent(splat) : '';

    const { papers, trackerData, markComplete, saveNotes } = useStateContext();
    const navigate = useNavigate();

    const paper = papers.find(p => p.file_path === paperId);

    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState('');
    const [notesOpen, setNotesOpen] = useState(true);

    const trackerItem = paper ? trackerData[paper.file_path] : undefined;
    const isCompleted = trackerItem?.completed;

    useEffect(() => {
        if (!paper) return;

        // Reset state
        setPdfUrl(null);
        setError(null);
        setLoading(true);
        setNotes(trackerItem?.notes || '');

        const loadPdf = async () => {
            // Priority: PDF Link (Remote) > File Path (Local) > Source URL (Page)
            let targetUrl = paper.pdf_link || paper.file_path || paper.url;

            // Adjust local path if needed (e.g. leading slash)
            // paper.file_path is like "papers/..." relative to root. 
            // Vite public dir serves at root. So "/" + path
            if (!targetUrl.startsWith('http') && !targetUrl.startsWith('/')) {
                targetUrl = '/' + targetUrl;
            }

            const isRemoteViewer = targetUrl.includes('docs.google.com') || targetUrl.includes('drive.google.com');
            const isLocal = !isRemoteViewer && !paper.pdf_link && !targetUrl.startsWith('http');

            if (isLocal) {
                // 404 Check
                try {
                    const response = await fetch(targetUrl, { method: 'HEAD' });
                    const contentType = response.headers.get('Content-Type');

                    if (contentType && contentType.includes('text/html')) {
                        throw new Error("File not found (HTML fallback detected)");
                    }
                    if (!response.ok) {
                        throw new Error(`File load failed: ${response.status}`);
                    }

                    setPdfUrl(targetUrl);
                } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
                    console.warn("Local PDF Load failed, trying patterns:", err.message);

                    // FALLBACK: Try constructed remote links
                    const slug = SCHOOL_SLUGS[paper.school] || paper.school.replace(/\s+/g, '');
                    const sub = paper.subject || 'Maths';

                    // Strategy A: Level_Subject_Year_Term_School
                    const fbA = `https://www.testpapersfree.com/pdfs/${paper.level}_${sub}_${paper.year}_${paper.term}_${slug}.pdf`;
                    // Strategy B: Level_Subject_Term_Year_School
                    const fbB = `https://www.testpapersfree.com/pdfs/${paper.level}_${sub}_${paper.term}_${paper.year}_${slug}.pdf`;

                    try {
                        const resA = await fetch(fbA, { method: 'HEAD' });
                        if (resA.ok && resA.headers.get('Content-Type')?.includes('pdf')) {
                            setPdfUrl(`https://docs.google.com/viewer?url=${encodeURIComponent(fbA)}&embedded=true`);
                            setLoading(false);
                            return;
                        }

                        const resB = await fetch(fbB, { method: 'HEAD' });
                        if (resB.ok && resB.headers.get('Content-Type')?.includes('pdf')) {
                            setPdfUrl(`https://docs.google.com/viewer?url=${encodeURIComponent(fbB)}&embedded=true`);
                            setLoading(false);
                            return;
                        }

                        throw new Error("Could not locate PDF via local or remote fallback patterns.");
                    } catch (fbErr: any) {
                        setError(fbErr.message || "Failed to load PDF");
                    }
                }
            } else {
                // Remote
                if (paper.pdf_link) {
                    setPdfUrl(`https://docs.google.com/viewer?url=${encodeURIComponent(paper.pdf_link)}&embedded=true`);
                } else {
                    setPdfUrl(targetUrl);
                }
            }
            setLoading(false);
        };

        loadPdf();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paper]);

    if (!paper) {
        return <div className="view-pane" style={{ padding: 20 }}>Paper not found.</div>;
    }

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(e.target.value);
        saveNotes(paper.file_path, e.target.value);
    };

    return (
        <div id="pdf-view" className="view-pane" style={{ backgroundColor: 'var(--bg-dark)', display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Toolbar */}
            <div id="top-toolbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        className="btn-action"
                        style={{
                            background: 'var(--md-sys-color-surface-container-high)',
                            color: 'var(--md-sys-color-on-surface)',
                            padding: '8px 16px',
                            borderRadius: '100px',
                            border: '1px solid var(--md-sys-color-outline-variant)',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                        onClick={() => navigate(-1)}
                    >
                        ◀ Back
                    </button>
                    <div id="paper-info">
                        <h2 id="current-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{paper.title}</h2>
                    </div>
                </div>
                <div>
                    <button
                        className={`btn-action btn-mark ${isCompleted ? 'done' : ''}`}
                        onClick={() => markComplete(paper.file_path, !isCompleted)}
                    >
                        {isCompleted ? 'Completed ✓' : '⭐ Mark Complete'}
                    </button>
                    {pdfUrl && !pdfUrl.includes('docs.google.com') && (
                        <a href={pdfUrl} target="_blank" rel="noreferrer" className="btn-action btn-open">
                            Open PDF ↗
                        </a>
                    )}
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {loading && <div style={{ padding: 20, color: 'white' }}>Loading PDF...</div>}

                {error && (
                    <div style={{ padding: 40, textAlign: 'center', color: '#ffb4ab' }}>
                        <h3>Unable to load PDF</h3>
                        <p>{error}</p>
                        <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                            Original File: {paper.file_path}
                        </p>
                    </div>
                )}

                {!loading && !error && pdfUrl && (
                    <iframe
                        id="pdf-viewer"
                        src={pdfUrl}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        title="PDF Viewer"
                    />
                )}

                {/* Notes Pane */}
                <div id="notes-pane" style={{
                    height: notesOpen ? '140px' : '40px',
                    background: 'var(--md-sys-color-surface-container-low)',
                    borderTop: '1px solid var(--md-sys-color-outline-variant)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    transition: 'height 0.3s'
                }}>
                    <div id="notes-header" onClick={() => setNotesOpen(!notesOpen)}>
                        <span>📝 Field Notes</span>
                        <span className="toggle-icon" style={{ transform: notesOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}>▼</span>
                    </div>
                    <textarea
                        id="notes-input"
                        placeholder="// Write your observations here..."
                        value={notes}
                        onChange={handleNotesChange}
                        style={{ display: notesOpen ? 'block' : 'none' }}
                    ></textarea>
                </div>
            </div>
        </div>
    );
};
