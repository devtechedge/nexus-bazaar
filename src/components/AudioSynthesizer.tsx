import React from 'react';
import { Volume2, VolumeX, Play, Pause, Music, Sliders } from 'lucide-react';

export default function AudioSynthesizer() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [volume, setVolume] = React.useState(0.2);
  const [mode, setMode] = React.useState<'hum' | 'drone' | 'winds'>('hum');
  const [tempo, setTempo] = React.useState(120);

  // Audio nodes refs
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const mainGainRef = React.useRef<GainNode | null>(null);
  const oscillator1Ref = React.useRef<OscillatorNode | null>(null);
  const oscillator2Ref = React.useRef<OscillatorNode | null>(null);
  const filterNodeRef = React.useRef<BiquadFilterNode | null>(null);
  const lfoRef = React.useRef<OscillatorNode | null>(null);
  const intervalRef = React.useRef<any>(null);

  // Canvas visualizer refs
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);

  // Start synthesizer
  const startSynth = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(volume, ctx.currentTime);
      mainGain.connect(ctx.destination);
      mainGainRef.current = mainGain;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);
      filter.Q.setValueAtTime(5, ctx.currentTime);
      filter.connect(mainGain);
      filterNodeRef.current = filter;

      if (mode === 'hum') {
        // Deep low hum
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(55, ctx.currentTime); // A1 note
        osc.connect(filter);
        osc.start();
        oscillator1Ref.current = osc;

        // Sub bass
        const oscSub = ctx.createOscillator();
        oscSub.type = 'sine';
        oscSub.frequency.setValueAtTime(27.5, ctx.currentTime); // A0 sub
        oscSub.connect(mainGain);
        oscSub.start();
        oscillator2Ref.current = oscSub;

        // Low-frequency filter sweep (LFO)
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.5, ctx.currentTime); // 0.5Hz sweep
        lfoGain.gain.setValueAtTime(120, ctx.currentTime); // sweep width
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
        lfoRef.current = lfo;

      } else if (mode === 'drone') {
        // Interweaving chorused detuned drone
        const osc1 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(110, ctx.currentTime); // A2 note
        osc1.connect(filter);
        osc1.start();
        oscillator1Ref.current = osc1;

        const osc2 = ctx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(110.4, ctx.currentTime); // Detuned drone
        osc2.connect(filter);
        osc2.start();
        oscillator2Ref.current = osc2;

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.2, ctx.currentTime); // slower LFO
        lfoGain.gain.setValueAtTime(200, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
        lfoRef.current = lfo;

      } else if (mode === 'winds') {
        // Solar Winds: periodic synth arpeggiated plucks
        const delay = ctx.createDelay();
        delay.delayTime.setValueAtTime(0.3, ctx.currentTime);
        const delayFeedback = ctx.createGain();
        delayFeedback.gain.setValueAtTime(0.4, ctx.currentTime);
        delay.connect(delayFeedback);
        delayFeedback.connect(delay);
        delay.connect(mainGain);

        const playPluck = () => {
          if (!audioCtxRef.current) return;
          const now = audioCtxRef.current.currentTime;
          const oscPluck = audioCtxRef.current.createOscillator();
          const pluckGain = audioCtxRef.current.createGain();

          oscPluck.type = 'triangle';
          const notes = [110, 165, 220, 275, 330, 440, 550, 660]; // Chord degrees (A minor/major hybrid pentatonic)
          const randomNote = notes[Math.floor(Math.random() * notes.length)];
          
          oscPluck.frequency.setValueAtTime(randomNote, now);
          pluckGain.gain.setValueAtTime(0, now);
          pluckGain.gain.linearRampToValueAtTime(0.15, now + 0.05);
          pluckGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

          oscPluck.connect(pluckGain);
          pluckGain.connect(mainGain);
          pluckGain.connect(delay);
          
          oscPluck.start(now);
          oscPluck.stop(now + 2.0);
        };

        playPluck();
        // Set up recurring pluck timer
        const intervalTime = Math.max(300, (60 / tempo) * 1000);
        intervalRef.current = setInterval(playPluck, intervalTime);
      }

      setIsPlaying(true);
    } catch (error) {
      console.warn("Audio Context blocked or unsupported in this container", error);
    }
  };

  // Stop synthesizer
  const stopSynth = () => {
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (oscillator1Ref.current) {
        oscillator1Ref.current.stop();
        oscillator1Ref.current.disconnect();
        oscillator1Ref.current = null;
      }
      if (oscillator2Ref.current) {
        oscillator2Ref.current.stop();
        oscillator2Ref.current.disconnect();
        oscillator2Ref.current = null;
      }
      if (lfoRef.current) {
        lfoRef.current.stop();
        lfoRef.current.disconnect();
        lfoRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsPlaying(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Live Canvas Visualizer Loop
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      
      // Draw grid lines
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.5;
      for (let i = 20; i < w; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.strokeStyle = isPlaying ? '#0d9488' : '#64748b'; // teal or slate
      ctx.lineWidth = 2.5;

      // Generate simulated synthesized waveform based on active synth modes
      for (let x = 0; x < w; x++) {
        let y = h / 2;
        if (isPlaying) {
          if (mode === 'hum') {
            y += Math.sin(x * 0.045 + phase) * 12 * Math.sin(x * 0.005);
            y += Math.cos(x * 0.12 - phase * 1.5) * 4;
          } else if (mode === 'drone') {
            y += Math.sin(x * 0.02 + phase) * 18 * Math.cos(x * 0.012 + phase * 0.4);
            y += Math.sin(x * 0.08 - phase) * 5;
          } else {
            // plucks spikes fading
            y += Math.sin(x * 0.06 + phase) * 6 * Math.sin(x * 0.015);
            if (x % 40 < 5) {
              y += Math.sin(x * 0.3) * 14 * Math.cos(phase * 0.8);
            }
          }
        } else {
          // Subtle idle noise flatline
          y += Math.sin(x * 0.01 + phase) * 1.5;
        }

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      phase += isPlaying ? (mode === 'hum' ? 0.08 : mode === 'drone' ? 0.05 : 0.03) : 0.015;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, mode]);

  // Handle dynamic volume slider update
  React.useEffect(() => {
    if (mainGainRef.current && audioCtxRef.current) {
      mainGainRef.current.gain.linearRampToValueAtTime(volume, audioCtxRef.current.currentTime + 0.1);
    }
  }, [volume]);

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      stopSynth();
    };
  }, []);

  // Update modes dynamically (re-start node network)
  const handleModeChange = (newMode: 'hum' | 'drone' | 'winds') => {
    setMode(newMode);
    if (isPlaying) {
      stopSynth();
      setTimeout(() => {
        setMode(newMode);
        startSynth();
      }, 80);
    }
  };

  return (
    <div id="cyber-synth-deck" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col md:flex-row items-stretch gap-4 max-w-xl mx-auto w-full">
      {/* Visualizer Canvas Panel */}
      <div className="flex-1 rounded-xl bg-slate-900 border border-slate-800 p-2.5 flex flex-col justify-between relative overflow-hidden h-[120px]">
        <div className="flex items-center justify-between text-[9px] font-mono text-teal-400 uppercase tracking-widest z-10">
          <span className="flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${isPlaying ? 'bg-teal-500 animate-pulse' : 'bg-slate-600'}`}></span>
            Atmosphere Waveform Generator
          </span>
          <span>{isPlaying ? 'STATE: OSC_ENG_ON' : 'STATE: COLD_STANDBY'}</span>
        </div>

        <canvas ref={canvasRef} width={280} height={70} className="w-full h-[65px] block my-1" />

        <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 z-10">
          <span>FREQ: {mode === 'hum' ? '55Hz (Sub-8)' : mode === 'drone' ? '110Hz detuned' : 'Quantum Delay Loop'}</span>
          <span>GAIN OFFSET: {(volume * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Control sliders & mode choices */}
      <div className="flex flex-col justify-between gap-3 w-full md:w-56">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Music className="h-3 w-3 text-teal-600" /> Soundscape Deck
            </span>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => handleModeChange('hum')}
                className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-tight uppercase ${
                  mode === 'hum' ? 'bg-teal-600 text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Hyper-drive Engine Hum"
              >
                Hum
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('drone')}
                className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-tight uppercase ${
                  mode === 'drone' ? 'bg-teal-600 text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Neon Grid Chorused Drone"
              >
                Drone
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('winds')}
                className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-tight uppercase ${
                  mode === 'winds' ? 'bg-teal-600 text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Solar Winds Chord Plucks"
              >
                Winds
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 font-mono">
              <span>OUTPUT VOLUME</span>
              <span>{(volume * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              {volume === 0 ? <VolumeX className="h-3.5 w-3.5 text-slate-400" /> : <Volume2 className="h-3.5 w-3.5 text-teal-600" />}
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer h-1 rounded-lg bg-slate-100 appearance-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              onClick={stopSynth}
              className="flex-1 flex items-center justify-center gap-1 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all tracking-wider cursor-pointer"
            >
              <Pause className="h-3.5 w-3.5" /> Stop Drone
            </button>
          ) : (
            <button
              onClick={startSynth}
              className="flex-1 flex items-center justify-center gap-1 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all tracking-wider cursor-pointer shadow-md shadow-teal-500/10"
            >
              <Play className="h-3.5 w-3.5" /> Play Synth
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
