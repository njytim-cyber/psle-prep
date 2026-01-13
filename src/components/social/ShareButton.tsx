import React, { useState } from 'react';
import { Share2, Copy, Check, Twitter, MessageCircle } from 'lucide-react';

interface ShareButtonProps {
    totalCompleted: number;
    level: number;
    streak?: number;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
    totalCompleted,
    level,
    streak = 0
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareText = `🎯 PSLE Prep Progress Update!\n\n📚 ${totalCompleted} papers completed\n⭐ Level ${level}\n${streak > 1 ? `🔥 ${streak} day streak!\n` : ''}\nKeep grinding! 💪`;

    const shareUrl = window.location.origin;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const shareTwitter = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
    };

    const shareWhatsApp = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
        window.open(url, '_blank');
    };

    const shareNative = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My PSLE Prep Progress',
                    text: shareText,
                    url: shareUrl
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            setIsOpen(true);
        }
    };

    return (
        <>
            <button
                onClick={shareNative}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: 'var(--md-sys-color-secondary-container)',
                    color: 'var(--md-sys-color-on-secondary-container)',
                    border: 'none',
                    borderRadius: 'var(--md-sys-shape-corner-full)',
                    font: 'var(--md-sys-typescale-label-large)',
                    cursor: 'pointer',
                    transition: 'all var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-standard)'
                }}
            >
                <Share2 size={18} />
                Share Progress
            </button>

            {/* Share Modal (fallback for browsers without native share) */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.8)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        style={{
                            background: 'var(--md-sys-color-surface-container)',
                            borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                            padding: '24px',
                            maxWidth: '400px',
                            width: '90%'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 style={{
                            margin: '0 0 16px',
                            font: 'var(--md-sys-typescale-title-large)',
                            color: 'var(--md-sys-color-on-surface)'
                        }}>
                            Share Your Progress
                        </h3>

                        {/* Preview */}
                        <div style={{
                            background: 'var(--md-sys-color-surface-container-high)',
                            padding: '16px',
                            borderRadius: 'var(--md-sys-shape-corner-medium)',
                            marginBottom: '20px',
                            font: 'var(--md-sys-typescale-body-medium)',
                            color: 'var(--md-sys-color-on-surface-variant)',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {shareText}
                        </div>

                        {/* Share Options */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={copyToClipboard}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '12px 20px',
                                    background: 'var(--md-sys-color-primary-container)',
                                    color: 'var(--md-sys-color-on-primary-container)',
                                    border: 'none',
                                    borderRadius: 'var(--md-sys-shape-corner-large)',
                                    cursor: 'pointer',
                                    font: 'var(--md-sys-typescale-label-medium)'
                                }}
                            >
                                {copied ? <Check size={20} /> : <Copy size={20} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>

                            <button
                                onClick={shareTwitter}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '12px 20px',
                                    background: '#1DA1F2',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--md-sys-shape-corner-large)',
                                    cursor: 'pointer',
                                    font: 'var(--md-sys-typescale-label-medium)'
                                }}
                            >
                                <Twitter size={20} />
                                Twitter
                            </button>

                            <button
                                onClick={shareWhatsApp}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '12px 20px',
                                    background: '#25D366',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--md-sys-shape-corner-large)',
                                    cursor: 'pointer',
                                    font: 'var(--md-sys-typescale-label-medium)'
                                }}
                            >
                                <MessageCircle size={20} />
                                WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
