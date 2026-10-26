import { useState, useEffect, useRef } from 'react';
import Gombalan from './components/Gombalan';
import HeartEffect from './components/HeartEffect';
import gsap from 'gsap';

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [targetName, setTargetName] = useState<string | null>(null);
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);
  const [showHintText, setShowHintText] = useState(false);

  const flapRef = useRef<SVGPathElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<any>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const textHintRef = useRef<HTMLDivElement>(null);
  const envelopeFrontRef = useRef<HTMLDivElement>(null);
  const envelopeBackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ambil parameter dari URL saat pertama kali dimuat
    const searchParams = new URLSearchParams(window.location.search);
    const target = searchParams.get('target');
    if (target) {
      setTargetName(target);
      document.title = `SURAT TERBUKA UNTUK ${target.toUpperCase()}`;
    } else {
      document.title = 'foru.io';
    }
  }, []);

  useEffect(() => {
    if (isEnvelopeOpened && letterRef.current) {
      gsap.fromTo(letterRef.current, 
        { y: 30, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: "back.out(1.4)" }
      );
    }
  }, [isEnvelopeOpened]);

  const handleStart = () => {
    // Play music now that user has interacted
    const audio = document.getElementById('bgMusic') as HTMLAudioElement;
    if (audio) {
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Audio autoplay prevented:', e));
    }

    // Start 3-2-1 countdown, then swap "1" with hint text for 4s
    setCountdown(3);
    setShowHintText(false);
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        // Hide number, show hint text for 4 seconds
        setCountdown(null);
        setShowHintText(true);
        setTimeout(() => {
          setShowHintText(false);
          setHasStarted(true);
        }, 4000);
      }
    }, 1000);
  };

  const handleSuccess = async (noCount: number) => {
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetName: targetName || 'Unknown',
          noClicks: noCount,
          success: true
        })
      });
      console.log('Successfully tracked interaction!');
    } catch (err) {
      console.error('Failed to notify backend:', err);
    }
  };

  const handleOpenEnvelope = () => {
    if (!flapRef.current || !wrapperRef.current || !letterRef.current) return;
    
    wrapperRef.current.style.pointerEvents = 'none';

    const isMobile = window.innerWidth <= 768;

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        setIsEnvelopeOpened(true);
        if (wrapperRef.current) wrapperRef.current.style.pointerEvents = 'auto';
      }
    });

    // 1. Fade out hint text
    tl.to(textHintRef.current, {
      opacity: 0,
      y: 12,
      duration: 0.25,
      ease: "power2.in"
    })

    // 2. Buka flap amplop (3D flip)
    .to(flapRef.current, {
      rotateX: 180,
      transformOrigin: "top",
      duration: 0.55,
      ease: "power2.inOut"
    }, "-=0.1")

    // 3. Kertas naik keluar dari amplop
    .to(letterRef.current, {
      y: isMobile ? -75 : -100,
      duration: 0.6,
      ease: "power3.out"
    }, "-=0.1")

    // 4. Amplop jatuh & menghilang
    .to([envelopeFrontRef.current, envelopeBackRef.current], {
      y: 90,
      opacity: 0,
      scale: 0.88,
      duration: 0.45,
      ease: "power3.in"
    }, "-=0.3")

    // 5. Kertas melebar jadi kartu + reposition ke tengah
    .to(letterRef.current, {
      width: isMobile ? "90vw" : "440px",
      height: "auto",
      minHeight: isMobile ? "220px" : "260px",
      padding: isMobile ? "1.6rem 1.2rem" : "2.6rem",
      y: 0,
      borderRadius: "22px",
      border: "3.5px dashed #ff4d79",
      boxShadow: "0 10px 32px rgba(255, 77, 121, 0.25)",
      duration: 0.65,
      ease: "expo.out"
    })

    // 6. Unblur teks secara bersamaan
    .to(contentRef.current, {
      filter: "blur(0px)",
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.45")

    // 7. Tampilkan tombol dengan animasi pop
    .fromTo(contentRef.current?.querySelector('.start-btn') as HTMLElement, {
      visibility: "visible",
      scale: 0.6,
      opacity: 0,
    }, {
      scale: 1,
      opacity: 1,
      visibility: "visible",
      duration: 0.4,
      ease: "back.out(2)",
      clearProps: "scale"
    }, "-=0.2");
  };

  const techInfoButton = (
    <div style={{
      position: 'fixed',
      top: '14px',
      right: '16px',
      zIndex: 99999,
      textAlign: 'right',
    }}>
      <button
        onClick={() => {
          const el = document.getElementById('tech-info-panel');
          if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
        }}
        style={{
          background: 'rgba(255,255,255,0.85)',
          border: '2px solid rgba(255,77,121,0.35)',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          fontSize: '0.85rem',
          cursor: 'pointer',
          color: '#ff4d79',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(255,77,121,0.15)',
          touchAction: 'manipulation',
        }}
        aria-label="Informasi"
      >?</button>
      <div
        id="tech-info-panel"
        style={{
          display: 'none',
          marginTop: '8px',
          background: 'rgba(255,255,255,0.98)',
          borderRadius: '14px',
          padding: '14px 16px',
          fontSize: '0.78rem',
          color: '#555',
          lineHeight: 1.6,
          maxWidth: '260px',
          textAlign: 'left',
          boxShadow: '0 4px 20px rgba(255,77,121,0.18)',
          border: '1.5px solid rgba(255,77,121,0.2)',
        }}
      >
        <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#ff4d79' }}>Mau buat pesan ini juga?</p>
        <p style={{ margin: '0 0 8px' }}>
          Tinggal tambahin <code style={{ background: '#fff0f5', padding: '1px 5px', borderRadius: '4px', color: '#e91e8c' }}>?target=NamaDia</code> di akhir URL. Atau ngga kamu bisa join server Discord yang udah tersedia Bot nya! <code style={{ background: '#fff0f5', padding: '1px 5px', borderRadius: '4px', color: '#e91e8c' }}>https://discord.gg/zJqZXKHn</code>
        </p>
        <p style={{ margin: '0 0 4px', fontSize: '0.72rem', color: '#999' }}>Contoh:</p>
        <code style={{ background: '#fff0f5', padding: '3px 7px', borderRadius: '6px', fontSize: '0.7rem', color: '#e91e8c', wordBreak: 'break-all', display: 'block' }}>
          {window.location.origin}/?target=Sayang
        </code>
      </div>
    </div>
  );

  return (
    <>
      {/* Persistent Canvas Heart Effect (Never unmounted, 0 stutter) */}
      <HeartEffect />

      <audio id="bgMusic" loop preload="metadata">
        <source src="https://media-hosting.imagekit.io//57d9b82542f24b31/wannabeyours.mp4?Expires=1834834240&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=fLWj0s-DFN0BYhACzcL2Vt6ns3P8OmnzOirGVSK1ntGY0QYL0c7qPjnfzsffd9Fz9SIj71ykx1RLCoDfTwvwTMBGnRQmkpfuTMp5ooR3SNK3Ql-9KF254A2SyHAzKUGdd~v7NsMUpUILrykwbM-B-hU0C31HZrhgvLd4-4~wk7xdS-TZ~pgfHGWuwqZR3-ya1adDQQ6hLAcAiRPQsy2H~4b4lbhdbXSnCdWjCuxb7zMHdIwEqJk3vwvyqHhoY4-HNtlTJXoCj54FPpqSaLBrcCkNsz-d3oUxUztdeYggJVROeUvEiaf1nZ5IlQdm0vrJzbtE93zAZnXHfEE26VZlzg__" type="video/mp4" />
      </audio>

      {techInfoButton}

      {!hasStarted ? (
        <div className="start-screen">
          {/* Countdown Overlay */}
          {(countdown !== null || showHintText) && (
            <div className="countdown-overlay">
              {showHintText ? (
                <p className="countdown-hint">
                  janji, gaakan kaget ya {targetName ? targetName : 'kamu'}
                </p>
              ) : (
                <h1 className="countdown-number" key={countdown}>{countdown}</h1>
              )}
            </div>
          )}

          <div 
            className="envelope-scene" 
            style={{ 
              opacity: (countdown !== null || showHintText) ? 0 : 1, 
              transition: 'opacity 0.25s ease', 
              pointerEvents: (countdown !== null || showHintText) ? 'none' : 'auto' 
            }}
          >
            <div 
              className="envelope-container" 
              ref={wrapperRef} 
              onClick={!isEnvelopeOpened && countdown === null ? handleOpenEnvelope : undefined}
            >
              <div className="envelope-back" ref={envelopeBackRef}>
                <svg viewBox="0 0 100 80" width="100%" height="100%" preserveAspectRatio="none">
                  <path d="M0,0 L100,0 L100,80 L0,80 Z" fill="#ffb3c6" />
                  <path ref={flapRef} d="M0,0 L50,45 L100,0 Z" fill="#ff4d79" />
                </svg>
              </div>

              <div className="envelope-paper" ref={letterRef}>
                <div className="paper-content" ref={contentRef} style={{ opacity: 1, filter: !isEnvelopeOpened ? 'blur(5px)' : 'blur(0px)', userSelect: 'none' }}>
                  <h2 style={{ color: '#ff4d79', fontSize: '1.2rem', margin: '0 0 8px' }}>Haii {targetName ? targetName : 'Manis'}!</h2>
                  <p className="modal-desc">Ada sesuatu yang udah lama pengen aku sampaiin... deg-degannya lebih besar dari kata-katanya</p>
                  <button className="btn start-btn" onClick={handleStart} style={{ visibility: isEnvelopeOpened ? 'visible' : 'hidden', opacity: isEnvelopeOpened ? 1 : 0 }}>
                    Baca yuk!
                  </button>
                </div>
              </div>

              <div className="envelope-front" ref={envelopeFrontRef}>
                <svg viewBox="0 0 100 80" width="100%" height="100%" preserveAspectRatio="none">
                  <path d="M0,80 L50,40 L100,80 Z" fill="#ff758c" />
                  <path d="M0,0 L50,40 L0,80 Z" fill="#ffb3c6" />
                  <path d="M100,0 L50,40 L100,80 Z" fill="#ffb3c6" />
                  {/* Wax seal */}
                  <circle cx="50" cy="43" r="10" fill="#ff0040" />
                  <circle cx="50" cy="43" r="8" fill="#cc0033" />
                  <text x="50" y="47" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">V</text>
                </svg>
              </div>
            </div>

            <div className="text-hint" ref={textHintRef} style={{ textAlign: 'center', marginTop: '20px' }}>
              <p className="envelope-text" style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 6px 0' }}>
                Ada surat spesial buat kamu nih {targetName ? targetName : 'kamu'}!
              </p>
              <p className="click-hint bounce-text" style={{ fontSize: '0.85rem', color: '#ff758c', cursor: 'pointer', margin: 0 }}>
                (klik amplopnya ya {targetName ? targetName : 'kamu'} plisss!)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <Gombalan targetName={targetName} onSuccess={handleSuccess} />
      )}
    </>
  );
}

export default App;
