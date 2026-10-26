import React, { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import gsap from 'gsap';

const noMessages = [
    {
        text: "Itu salah klik kan? Iya kann??",
        image: "https://i.pinimg.com/736x/1e/7c/6f/1e7c6ff7a0c26f7eaefbce683656193d.jpg"
    },
    {
        text: "Beneran mau no? Yakin banget?",
        image: "https://i.pinimg.com/736x/90/73/a9/9073a9359bff531cd830ae7384752934.jpg"
    },
    {
        text: "Oke oke... ini terakhir lho! Oke kalo masih no juga, aku anggap kamu emang gatau cara klik mau :(",
        image: "https://i.pinimg.com/736x/a6/43/f5/a643f5a40db387585b56bc767b66fddb.jpg"
    },
];

const RUN_AFTER = 3;

interface GombalanProps {
    targetName: string | null;
    onSuccess: (noCount: number) => void;
}

const Gombalan: React.FC<GombalanProps> = ({ targetName, onSuccess }) => {
    const [noCount, setNoCount] = useState(0);
    const [isAccepted, setIsAccepted] = useState(false);
    const [cardFading, setCardFading] = useState(false);
    const [isOfficiallyCouple, setIsOfficiallyCouple] = useState(false);
    const [showDateCard, setShowDateCard] = useState(false);
    const [jadianDate, setJadianDate] = useState('');
    const [isShaking, setIsShaking] = useState(false);
    const [noBtnOffset, setNoBtnOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const offsetRef = useRef({ x: 0, y: 0 });
    const noBtnRef = useRef<HTMLButtonElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const buttonsRef = useRef<HTMLDivElement>(null);
    const acceptAudioRef = useRef<HTMLAudioElement | null>(null);

    const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches);

    // Preload reaction images to eliminate image decode freezes
    useEffect(() => {
        const urlsToPreload = [
            'https://i.pinimg.com/736x/e4/72/4d/e4724dc43d60d24fa01eda5d6614715a.jpg',
            'https://i.pinimg.com/736x/1e/7c/6f/1e7c6ff7a0c26f7eaefbce683656193d.jpg',
            'https://i.pinimg.com/736x/90/73/a9/9073a9359bff531cd830ae7384752934.jpg',
            'https://i.pinimg.com/736x/a6/43/f5/a643f5a40db387585b56bc767b66fddb.jpg',
            'https://media.tenor.com/gUiu1zyxfzYAAAAi/good-night-kiss-kiss.gif'
        ];
        urlsToPreload.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }, []);

    /* ─── Text helpers ─── */
    const getTitleText = () => {
        if (isAccepted) return 'HOREE KAMU NERIMA AKU!!';
        if (noCount > 0 && noCount <= noMessages.length) return noMessages[noCount - 1].text;
        if (noCount > noMessages.length) {
            const runTexts = [
                'Masih yakin pilih NO terus?',
                'Aku tetep nunggu jawaban IYA kamu kok!',
                'Udah ah,, mending klik YES aja!!',
                'Serius deh, YES itu enak lho!!',
            ];
            return runTexts[Math.min(noCount - noMessages.length - 1, runTexts.length - 1)];
        }
        return targetName
            ? `${targetName}, Kamu mau ngga jadi Pacarku?`
            : 'Kamu mau ngga jadi Pacarku?';
    };

    const getNoLabel = () => {
        if (noCount === 0) return 'gamau';
        if (noCount === 1) return 'gamau ihh';
        if (noCount === 2) return 'pokoknya gamau';
        const runLabels = ['beneran gamau!!', 'gamau titik!', 'GAMAU DONG!!', 'udah deh gamau', 'hahaha gamau!!'];
        return runLabels[Math.min(noCount - RUN_AFTER, runLabels.length - 1)];
    };

    const getImageSrc = () => {
        if (isAccepted) return 'https://media.tenor.com/gUiu1zyxfzYAAAAi/good-night-kiss-kiss.gif';
        if (noCount > 0 && noCount <= noMessages.length) return noMessages[noCount - 1].image;
        if (noCount > noMessages.length) return noMessages[noMessages.length - 1].image;
        return 'https://i.pinimg.com/736x/e4/72/4d/e4724dc43d60d24fa01eda5d6614715a.jpg';
    };

    // Yes button grows, No button shrinks
    const yesFontSize = `${Math.min(1.05 + noCount * 0.16, 2.0)}rem`;
    const yesPadding = `${Math.min(10 + noCount * 3, 20)}px ${Math.min(22 + noCount * 5, 50)}px`;
    const noFontSize = `${Math.max(0.95 - noCount * 0.08, 0.65)}rem`;

    /* ─── Shake ─── */
    const triggerShake = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
    };

    /* ─── Audio crossfade helper ─── */
    const crossfadeToAcceptSong = () => {
        const bgMusic = document.getElementById('bgMusic') as HTMLAudioElement | null;

        // Fade out background music
        if (bgMusic && !bgMusic.paused) {
            const fadeOut = setInterval(() => {
                if (bgMusic.volume > 0.04) {
                    bgMusic.volume = Math.max(0, bgMusic.volume - 0.04);
                } else {
                    bgMusic.pause();
                    bgMusic.volume = 0;
                    clearInterval(fadeOut);
                }
            }, 60);
        }

        // Fade in acceptance song
        const audio = new Audio('/somebody_pleasure.mp3');
        audio.volume = 0;
        audio.loop = true;
        acceptAudioRef.current = audio;

        audio.play().then(() => {
            let vol = 0;
            const fadeIn = setInterval(() => {
                vol = Math.min(vol + 0.02, 0.5);
                audio.volume = vol;
                if (vol >= 0.5) clearInterval(fadeIn);
            }, 50);
        }).catch(e => console.log('Accept audio blocked:', e));
    };

    /* ─── Yes handler ─── */
    const handleYesClick = () => {
        setIsAccepted(true);
        onSuccess(noCount);
        crossfadeToAcceptSong();

        // Optimized lightweight confetti bursts for mobile
        const duration = 2500;
        const end = Date.now() + duration;
        const particleCount = isMobile ? 18 : 40;
        const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 10000 };

        const ticker = setInterval(() => {
            const timeLeft = end - Date.now();
            if (timeLeft <= 0) return clearInterval(ticker);
            confetti({
                ...defaults,
                particleCount: Math.round(particleCount * (timeLeft / duration)),
                origin: { x: Math.random(), y: Math.random() - 0.2 }
            });
        }, 320);

        setTimeout(() => {
            setCardFading(true);
            setTimeout(() => {
                setCardFading(false);
                setIsOfficiallyCouple(true);
                confetti({
                    particleCount: isMobile ? 50 : 110,
                    spread: 100,
                    origin: { y: 0.5 },
                    zIndex: 10000
                });

                setTimeout(() => {
                    setCardFading(true);
                    setTimeout(() => {
                        const today = new Date();
                        setJadianDate(today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
                        setCardFading(false);
                        setShowDateCard(true);
                        confetti({
                            particleCount: isMobile ? 65 : 140,
                            spread: 120,
                            origin: { y: 0.55 },
                            zIndex: 10000
                        });
                    }, 650);
                }, 3000);
            }, 650);
        }, 4500);
    };

    const handleNoClick = () => {
        triggerShake();
        setNoCount(prev => prev + 1);
    };

    const isRunning = noCount >= RUN_AFTER;

    const clampAndSetNoOffset = useCallback((x: number, y: number) => {
        const limitX = isMobile ? 48 : 110;
        const limitY = isMobile ? 26 : 52;
        const safeX = Math.max(-limitX, Math.min(x, limitX));
        const safeY = Math.max(-limitY, Math.min(y, limitY));
        offsetRef.current = { x: safeX, y: safeY };
        setNoBtnOffset({ x: safeX, y: safeY });
    }, [isMobile]);

    const runAway = useCallback((cursorX?: number, cursorY?: number) => {
        if (!noBtnRef.current) return;
        const btnRect = noBtnRef.current.getBoundingClientRect();

        let nextX = offsetRef.current.x;
        let nextY = offsetRef.current.y;

        if (cursorX != null && cursorY != null) {
            const centerX = btnRect.left + btnRect.width / 2;
            const centerY = btnRect.top + btnRect.height / 2;
            const angle = Math.atan2(centerY - cursorY, centerX - cursorX);
            const jump = isMobile ? 42 : 72;

            nextX = offsetRef.current.x + Math.cos(angle) * jump;
            nextY = offsetRef.current.y + Math.sin(angle) * (jump * 0.55);
        } else {
            nextX = offsetRef.current.x + (Math.random() > 0.5 ? 48 : -48);
            nextY = offsetRef.current.y + (Math.random() > 0.5 ? 22 : -22);
        }

        clampAndSetNoOffset(nextX, nextY);
    }, [clampAndSetNoOffset, isMobile]);

    // Desktop: escape when cursor gets close
    useEffect(() => {
        if (!isRunning || isMobile) return;

        const PROXIMITY = 90;
        const onMouseMove = (e: MouseEvent) => {
            if (!noBtnRef.current) return;
            const rect = noBtnRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

            if (dist < PROXIMITY) {
                runAway(e.clientX, e.clientY);
            }
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', onMouseMove);
    }, [isRunning, isMobile, runAway]);

    // Mobile: move away on touch
    useEffect(() => {
        if (!isRunning || !isMobile || !noBtnRef.current) return;

        const btn = noBtnRef.current;
        const onTouchStart = (e: TouchEvent) => {
            e.preventDefault();
            const touch = e.touches[0];
            runAway(touch?.clientX, touch?.clientY);
        };

        btn.addEventListener('touchstart', onTouchStart, { passive: false });
        return () => btn.removeEventListener('touchstart', onTouchStart);
    }, [isRunning, isMobile, runAway]);

    useEffect(() => {
        if (!isRunning) {
            offsetRef.current = { x: 0, y: 0 };
            setNoBtnOffset({ x: 0, y: 0 });
        }
    }, [isRunning]);

    // Entrance animation — clean and snappy
    useEffect(() => {
        if (!containerRef.current) return;

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo(containerRef.current,
            { y: 40, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, duration: 0.75, clearProps: 'transform' }
        )
        .fromTo(titleRef.current,
            { y: -16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5 },
        '-=0.45')
        .fromTo(imageRef.current,
            { scale: 0.85, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5 },
        '-=0.35')
        .fromTo(buttonsRef.current,
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45 },
        '-=0.3');
    }, []);

    /* ─── Render ─── */
    return (
        <div
            ref={containerRef}
            className={`container${isShaking ? ' is-shaking' : ''}`}
            style={{
                width: isMobile ? '92vw' : '460px',
                minHeight: '270px',
                position: 'relative',
                zIndex: 10,
                transition: 'opacity 0.6s ease',
                opacity: cardFading ? 0 : 1,
            }}
        >
            {showDateCard ? (
                /* ── TANGGAL JADIAN ── */
                <>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '8px', animation: 'heartbeat 1.4s infinite', color: '#ff4d79' }}>
                        {targetName ? targetName : 'Kamu'}
                    </div>
                    <h1 className="title" style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', marginBottom: '8px', lineHeight: '1.4' }}>
                        TANGGAL JADIAN KITA!!
                    </h1>
                    <p style={{
                        color: '#ff1a53', fontWeight: 900, fontSize: isMobile ? '1.05rem' : '1.2rem',
                        margin: '0 0 14px', textShadow: '0 2px 8px rgba(255,26,83,0.25)',
                    }}>
                        {jadianDate}
                    </p>
                    <img
                        src="https://media1.tenor.com/m/HZA1YV1NQkwAAAAC/happy-dance-panda.gif"
                        alt="celebration"
                        loading="eager"
                        decoding="async"
                        style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '16px', objectFit: 'cover', marginBottom: '12px' }}
                    />
                    <p style={{ color: '#ff758c', fontSize: '0.98rem', fontWeight: 'bold', margin: '0 0 4px' }}>
                        Happy anniversary setiap hari!
                    </p>
                    <p style={{ color: '#ffb3c6', fontSize: '0.82rem', margin: 0 }}>
                        semoga kita selalu bahagia ya
                    </p>
                </>
            ) : isOfficiallyCouple ? (
                /* ── RESMI PACARAN ── */
                <>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '8px', animation: 'heartbeat 1.2s infinite', color: '#ff4d79' }}>
                        {targetName ? targetName : 'Kamu'}
                    </div>
                    <h1 className="title" style={{ fontSize: isMobile ? '1.15rem' : '1.45rem', marginBottom: '14px', lineHeight: '1.4' }}>
                        KITA RESMI PACARAN YA {targetName ? targetName.toUpperCase() : 'KAMU'}!
                    </h1>
                    <img
                        src="https://media1.tenor.com/m/b_rlhykPQ4AAAAAC/love.gif"
                        alt="couple"
                        loading="eager"
                        decoding="async"
                        style={{ maxWidth: '100%', maxHeight: '190px', borderRadius: '16px', objectFit: 'cover', marginBottom: '14px' }}
                    />
                    <p style={{ color: '#ff758c', fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>
                        muah!
                    </p>
                </>
            ) : (
                /* ── MAIN QUESTION ── */
                <>
                    <h1 ref={titleRef} className="title" style={{ fontSize: isMobile ? '1.15rem' : '1.4rem', marginBottom: '12px', lineHeight: '1.4' }}>
                        {getTitleText()}
                    </h1>

                    <img
                        ref={imageRef}
                        src={getImageSrc()}
                        alt="reaction"
                        loading="eager"
                        decoding="async"
                        style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '14px', objectFit: 'cover', display: 'block', margin: '0 auto 16px', transition: 'opacity 0.3s ease' }}
                    />

                    {!isAccepted && (
                        <div ref={buttonsRef} className="buttons" style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.8rem' }}>
                            <button
                                className="btn yes-btn"
                                onClick={handleYesClick}
                                style={{
                                    padding: yesPadding,
                                    fontSize: yesFontSize,
                                    background: 'linear-gradient(135deg,#ff4d79,#ff758c)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 16px rgba(255,77,121,0.4)',
                                    touchAction: 'manipulation',
                                }}
                            >
                                IYA mau!
                            </button>

                            <button
                                ref={noBtnRef}
                                className={`btn no-btn${isRunning ? ' running' : ''}`}
                                onClick={(e) => {
                                    if (isRunning) {
                                        runAway(e.clientX, e.clientY);
                                        return;
                                    }
                                    handleNoClick();
                                }}
                                onMouseEnter={() => {
                                    if (isRunning) runAway();
                                }}
                                style={{
                                    padding: '9px 20px',
                                    fontSize: noFontSize,
                                    backgroundColor: '#f5f5f5',
                                    color: '#888',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    touchAction: 'manipulation',
                                    ...(isRunning ? {
                                        position: 'relative' as const,
                                        transform: `translate3d(${noBtnOffset.x}px, ${noBtnOffset.y}px, 0)`,
                                        zIndex: 9999,
                                        willChange: 'transform',
                                    } : {}),
                                }}
                            >
                                {getNoLabel()}
                            </button>
                        </div>
                    )}

                    {noCount > 0 && !isAccepted && (
                        <p style={{ color: '#ffb3c6', fontSize: '0.75rem', marginTop: '10px', marginBottom: 0 }}>
                            Kamu udah nyoba pencet tombol gamau sebanyak {noCount}x loh
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

export default React.memo(Gombalan);
