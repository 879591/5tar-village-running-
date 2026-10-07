/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { RunnerSimulation } from './scripts/gameEngine';
import { VillageCanvasRenderer } from './scenes/VillageCanvasRenderer';
import { StorageManager, UserSettings } from './scripts/storage';
import { AudioEngine } from './audio/soundEngine';
import {
  AboutDeveloperScreen,
  CountdownOverlay,
  GameplayHUD,
  HowToPlayScreen,
  MainMenuScreen,
  PauseModal,
  ResultScreen,
  ScreenState,
  SettingsScreen,
  SplashScreen,
} from './ui/GameScreens';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simRef = useRef<RunnerSimulation>(new RunnerSimulation());
  const screenStateRef = useRef<ScreenState>('SPLASH');

  const [screenState, setScreenState] = useState<ScreenState>('SPLASH');
  const [countdown, setCountdown] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [zoneLabel, setZoneLabel] = useState<string>('Mustard & Green Fields');
  const [bestScore, setBestScore] = useState<number>(() => StorageManager.getBestScore());
  const [totalCoins, setTotalCoins] = useState<number>(() => StorageManager.getTotalCoins());
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [crashReason, setCrashReason] = useState<string>('');
  const [settings, setSettings] = useState<UserSettings>(() => StorageManager.getSettings());

  // Touch / Pointer swipe tracking
  const pointerStartRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const updateScreenState = useCallback((next: ScreenState) => {
    screenStateRef.current = next;
    setScreenState(next);
  }, []);

  // Begin 3-second countdown before gameplay starts
  const startNewRunWithCountdown = useCallback(() => {
    simRef.current.reset();
    setScore(0);
    setCoins(0);
    setIsNewRecord(false);
    setZoneLabel(simRef.current.getCurrentZone().label);
    setCountdown(3);
    updateScreenState('COUNTDOWN');
    AudioEngine.startBackgroundMusic();
  }, [updateScreenState]);

  // Countdown Timer Effect (3 -> 2 -> 1 -> PLAYING)
  useEffect(() => {
    if (screenState !== 'COUNTDOWN') return;

    AudioEngine.playCountdownTick(false);
    let currentCount = 3;

    const interval = window.setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCountdown(currentCount);
        AudioEngine.playCountdownTick(false);
      } else if (currentCount === 0) {
        setCountdown(0);
        AudioEngine.playCountdownTick(true);
      } else {
        clearInterval(interval);
        updateScreenState('PLAYING');
      }
    }, 800);

    return () => clearInterval(interval);
  }, [screenState, updateScreenState]);

  // Handle Keyboard Controls (Desktop Arrow Keys + WASD + Escape to Pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = screenStateRef.current;

      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (state === 'PLAYING') {
          updateScreenState('PAUSED');
        } else if (state === 'PAUSED') {
          updateScreenState('PLAYING');
        }
        return;
      }

      if (state !== 'PLAYING') return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          simRef.current.moveLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          simRef.current.moveRight();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
          e.preventDefault();
          simRef.current.jump();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          simRef.current.slide();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [updateScreenState]);

  // Main Animation & Render Loop (Responsive to window resizing & orientation changes)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap DPR at 2 for low-end Android performance
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const sim = simRef.current;
      const currentState = screenStateRef.current;

      if (currentState === 'PLAYING') {
        const alive = sim.update(dt, (coin) => {
          const pt = VillageCanvasRenderer.project(coin.lane, coin.yOffset + 24, coin.z, width, height);
          return { x: pt.x, y: pt.y };
        });

        setScore(sim.score);
        setCoins(sim.coins);
        setZoneLabel(sim.getCurrentZone().label);

        if (!alive) {
          const achievedNewBest = StorageManager.setBestScore(sim.score);
          const updatedBest = StorageManager.getBestScore();
          const updatedTotalCoins = StorageManager.addCoins(sim.coins);

          setBestScore(updatedBest);
          setTotalCoins(updatedTotalCoins);
          setIsNewRecord(achievedNewBest);
          setCrashReason(sim.crashReason);
          updateScreenState('GAME_OVER');
        }
      } else if (
        currentState === 'SPLASH' ||
        currentState === 'MAIN_MENU' ||
        currentState === 'HOW_TO_PLAY' ||
        currentState === 'SETTINGS' ||
        currentState === 'ABOUT_DEV'
      ) {
        // Gentle idle animation in background when on menus
        sim.runAnimPhase += Math.min(dt, 0.05) * 6;
        sim.roadStripeOffset = (sim.roadStripeOffset + Math.min(dt, 0.05) * 140) % 120;
      }

      VillageCanvasRenderer.renderFrame(ctx, sim, width, height);
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateScreenState]);

  // Touch & Mouse Swipe Gesture Handlers on the Game Viewport
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (screenStateRef.current !== 'PLAYING') return;
    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      active: true,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStartRef.current.active || screenStateRef.current !== 'PLAYING') return;

    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    const swipeThreshold = 28; // Responsive 28px threshold for snappy mobile & mouse swipes

    if (Math.abs(dx) < swipeThreshold && Math.abs(dy) < swipeThreshold) return;

    pointerStartRef.current.active = false;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        simRef.current.moveRight();
      } else {
        simRef.current.moveLeft();
      }
    } else {
      if (dy < 0) {
        simRef.current.jump();
      } else {
        simRef.current.slide();
      }
    }
  };

  const handlePointerUp = () => {
    pointerStartRef.current.active = false;
  };

  const handleSettingsUpdate = (nextSettings: UserSettings) => {
    setSettings(nextSettings);
    AudioEngine.updateSettings(nextSettings);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none touch-none"
    >
      {/* Main 2.5D Village Canvas */}
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Active Gameplay HUD & On-Screen Touch D-Pad Controls */}
      {(screenState === 'PLAYING' || screenState === 'COUNTDOWN') && (
        <>
          <GameplayHUD
            score={score}
            coins={coins}
            zoneLabel={zoneLabel}
            onPause={() => {
              if (screenState === 'PLAYING') {
                updateScreenState('PAUSED');
              }
            }}
          />

          {/* Ergonomic Bottom Touch / Click Action Buttons for accessible one-tap play alongside swiping */}
          {screenState === 'PLAYING' && (
            <div className="fixed bottom-4 left-0 right-0 z-30 px-4 pointer-events-none flex items-end justify-between max-w-4xl mx-auto">
              {/* Left / Right Lane Buttons */}
              <div className="flex items-center gap-2.5 pointer-events-auto">
                <button
                  type="button"
                  aria-label="Move Left"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    simRef.current.moveLeft();
                  }}
                  className="w-14 h-14 rounded-2xl bg-slate-950/65 active:bg-amber-500 active:text-slate-950 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  aria-label="Move Right"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    simRef.current.moveRight();
                  }}
                  className="w-14 h-14 rounded-2xl bg-slate-950/65 active:bg-amber-500 active:text-slate-950 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>

              {/* Jump / Slide Action Buttons */}
              <div className="flex items-center gap-2.5 pointer-events-auto">
                <button
                  type="button"
                  aria-label="Slide"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    simRef.current.slide();
                  }}
                  className="w-14 h-14 rounded-2xl bg-slate-950/65 active:bg-amber-500 active:text-slate-950 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <ArrowDown className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  aria-label="Jump"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    simRef.current.jump();
                  }}
                  className="w-14 h-14 rounded-2xl bg-slate-950/65 active:bg-amber-500 active:text-slate-950 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <ArrowUp className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 3-Second Countdown Overlay */}
      {screenState === 'COUNTDOWN' && <CountdownOverlay secondsLeft={countdown} />}

      {/* Splash Screen */}
      {screenState === 'SPLASH' && (
        <SplashScreen
          onContinue={() => {
            AudioEngine.startBackgroundMusic();
            updateScreenState('MAIN_MENU');
          }}
        />
      )}

      {/* Main Menu */}
      {screenState === 'MAIN_MENU' && (
        <MainMenuScreen
          bestScore={bestScore}
          totalCoins={totalCoins}
          onStartPlay={startNewRunWithCountdown}
          onOpenHowToPlay={() => updateScreenState('HOW_TO_PLAY')}
          onOpenSettings={() => updateScreenState('SETTINGS')}
          onOpenAbout={() => updateScreenState('ABOUT_DEV')}
        />
      )}

      {/* How To Play Modal */}
      {screenState === 'HOW_TO_PLAY' && (
        <HowToPlayScreen onBack={() => updateScreenState('MAIN_MENU')} />
      )}

      {/* Settings Modal */}
      {screenState === 'SETTINGS' && (
        <SettingsScreen
          settings={settings}
          onUpdateSettings={handleSettingsUpdate}
          onBack={() => updateScreenState('MAIN_MENU')}
        />
      )}

      {/* About Developer Modal */}
      {screenState === 'ABOUT_DEV' && (
        <AboutDeveloperScreen onBack={() => updateScreenState('MAIN_MENU')} />
      )}

      {/* Pause Modal */}
      {screenState === 'PAUSED' && (
        <PauseModal
          score={score}
          coins={coins}
          onResume={() => updateScreenState('PLAYING')}
          onRestart={startNewRunWithCountdown}
          onMainMenu={() => {
            simRef.current.reset();
            updateScreenState('MAIN_MENU');
          }}
        />
      )}

      {/* Game Over / Result Screen */}
      {screenState === 'GAME_OVER' && (
        <ResultScreen
          score={score}
          coins={coins}
          bestScore={bestScore}
          isNewRecord={isNewRecord}
          crashReason={crashReason}
          onRetry={startNewRunWithCountdown}
          onMainMenu={() => {
            simRef.current.reset();
            updateScreenState('MAIN_MENU');
          }}
        />
      )}
    </div>
  );
}
