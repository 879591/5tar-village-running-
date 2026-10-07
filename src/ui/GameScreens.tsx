/**
 * UI Overlays & Screens for 5tar Village Runner
 * Implements Splash Screen, Main Menu, How To Play, Settings, About Developer, HUD, Pause, Countdown, and Result Screen.
 */

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Home,
  Settings,
  HelpCircle,
  User,
  Volume2,
  VolumeX,
  Music,
  Smartphone,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { GAME_CONFIG } from '../config/gameConfig';
import { UserSettings } from '../scripts/storage';
import { AudioEngine } from '../audio/soundEngine';

export type ScreenState =
  | 'SPLASH'
  | 'MAIN_MENU'
  | 'HOW_TO_PLAY'
  | 'SETTINGS'
  | 'ABOUT_DEV'
  | 'COUNTDOWN'
  | 'PLAYING'
  | 'PAUSED'
  | 'GAME_OVER';

interface SplashProps {
  onContinue: () => void;
}

export const SplashScreen: React.FC<SplashProps> = ({ onContinue }) => {
  return (
    <div
      onClick={() => {
        AudioEngine.playButtonClick();
        onContinue();
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-slate-950/90 backdrop-blur-md cursor-pointer"
    >
      <div className="w-full text-center pt-4 text-xs text-slate-400">
        <span>Original Indie Production</span>
        <span className="mx-2" aria-hidden="true">·</span>
        <span>Offline Ready</span>
      </div>

      <div className="flex flex-col items-center text-center max-w-md my-auto">
        {/* Original 5-Star Village Emblem SVG */}
        <div className="w-24 h-24 rounded-3xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center mb-6 shadow-lg">
          <svg className="w-14 h-14 text-amber-400" viewBox="0 0 64 64" fill="none">
            <path
              d="M32 6L39.5 21.2L56.3 23.6L44.1 35.5L47 52.2L32 44.3L17 52.2L19.9 35.5L7.7 23.6L24.5 21.2L32 6Z"
              fill="currentColor"
              stroke="#fef08a"
              strokeWidth="2.5"
            />
            <circle cx="32" cy="31" r="6" fill="#0f172a" />
          </svg>
        </div>

        <p className="text-xs font-semibold tracking-wider text-amber-400 mb-2">
          {GAME_CONFIG.developer.studioName} Presents
        </p>
        <h1
          className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3"
          style={{ textWrap: 'balance' }}
        >
          {GAME_CONFIG.title}
        </h1>
        <p className="text-sm text-slate-300 max-w-xs leading-relaxed mb-8">
          Run through lush green fields, village homesteads, canal bridges, and festive bazaars.
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            AudioEngine.playButtonClick();
            onContinue();
          }}
          className="min-h-[48px] px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-bold text-base transition-all shadow-lg whitespace-nowrap"
        >
          Tap to Enter Village
        </button>
      </div>

      <div className="text-xs text-slate-400 pb-2">
        <span>Created by {GAME_CONFIG.developer.developerName}</span>
        <span className="mx-2" aria-hidden="true">·</span>
        <span>v{GAME_CONFIG.version}</span>
      </div>
    </div>
  );
};

interface MainMenuProps {
  bestScore: number;
  totalCoins: number;
  onStartPlay: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
}

export const MainMenuScreen: React.FC<MainMenuProps> = ({
  bestScore,
  totalCoins,
  onStartPlay,
  onOpenHowToPlay,
  onOpenSettings,
  onOpenAbout,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-between p-5 sm:p-8 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-slate-950/40 backdrop-blur-[2px] overflow-y-auto">
      {/* Top Bar — Clean 3-Zone Contract */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-2 border-b border-white/10">
        <span className="text-base sm:text-lg font-extrabold tracking-tight text-white font-display whitespace-nowrap">
          {GAME_CONFIG.title}
        </span>

        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200 font-mono-tabular">
          <span>Best: <strong className="text-amber-400">{bestScore.toLocaleString()}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Coins: <strong className="text-yellow-300">{totalCoins.toLocaleString()}</strong></span>
        </div>
      </header>

      {/* Center Hero & Main Menu Actions */}
      <main className="w-full max-w-md mx-auto my-auto py-6 flex flex-col items-center text-center">
        <div className="text-xs text-amber-300 font-medium mb-2">
          <span>Indian Village Endless Runner</span>
          <span className="mx-2" aria-hidden="true">·</span>
          <span>By {GAME_CONFIG.developer.studioName}</span>
        </div>

        <h2
          className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-6"
          style={{ textWrap: 'balance' }}
        >
          Ready for the Village Run?
        </h2>

        <div className="w-full flex flex-col gap-3">
          {/* PLAY (Primary CTA) */}
          <button
            type="button"
            onClick={() => {
              AudioEngine.playButtonClick();
              onStartPlay();
            }}
            className="w-full min-h-[54px] px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-extrabold text-lg flex items-center justify-center gap-3 shadow-lg transition-all whitespace-nowrap cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>PLAY</span>
          </button>

          {/* HOW TO PLAY */}
          <button
            type="button"
            onClick={() => {
              AudioEngine.playButtonClick();
              onOpenHowToPlay();
            }}
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-[0.98] border border-white/15 text-slate-100 font-semibold text-sm flex items-center justify-center gap-2.5 transition-all whitespace-nowrap cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>HOW TO PLAY</span>
          </button>

          {/* SETTINGS */}
          <button
            type="button"
            onClick={() => {
              AudioEngine.playButtonClick();
              onOpenSettings();
            }}
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-[0.98] border border-white/15 text-slate-100 font-semibold text-sm flex items-center justify-center gap-2.5 transition-all whitespace-nowrap cursor-pointer"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>SETTINGS</span>
          </button>

          {/* ABOUT DEVELOPER */}
          <button
            type="button"
            onClick={() => {
              AudioEngine.playButtonClick();
              onOpenAbout();
            }}
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-[0.98] border border-white/15 text-slate-100 font-semibold text-sm flex items-center justify-center gap-2.5 transition-all whitespace-nowrap cursor-pointer"
          >
            <User className="w-4 h-4 text-amber-400" />
            <span>ABOUT DEVELOPER</span>
          </button>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="w-full max-w-4xl mx-auto text-center text-xs text-slate-400 py-2">
        <span>Swipe or use Arrow keys to dodge village obstacles</span>
        <span className="mx-2" aria-hidden="true">·</span>
        <span>{GAME_CONFIG.developer.developerName}</span>
      </footer>
    </div>
  );
};

interface ModalProps {
  onBack: () => void;
}

export const HowToPlayScreen: React.FC<ModalProps> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-white/15 p-6 sm:p-8 text-slate-100 my-auto">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
          <h2 className="text-xl sm:text-2xl font-bold text-white">How to Play</h2>
          <span className="text-xs text-slate-400">Controls & Rules</span>
        </div>

        <div className="space-y-5 text-sm leading-relaxed text-slate-300">
          <div>
            <h3 className="text-sm font-semibold text-amber-400 mb-2">1. Movement Controls</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-center gap-3">
                <ArrowLeft className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Move Left</div>
                  <div className="text-slate-400">Swipe Left or Left Arrow / A</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-center gap-3">
                <ArrowRight className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Move Right</div>
                  <div className="text-slate-400">Swipe Right or Right Arrow / D</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-center gap-3">
                <ArrowUp className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Jump Over</div>
                  <div className="text-slate-400">Swipe Up or Up Arrow / W / Space</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-center gap-3">
                <ArrowDown className="w-5 h-5 text-sky-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Slide Under</div>
                  <div className="text-slate-400">Swipe Down or Down Arrow / S</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <h3 className="text-sm font-semibold text-amber-400 mb-1.5">2. Village Obstacles</h3>
            <p className="text-xs text-slate-300">
              Jump over low stones, monsoon puddles, and hay bales. Slide under high wooden gates and bazaar banners. Switch lanes to dodge full-sized loaded bullock carts.
            </p>
          </div>

          <div className="pt-2 border-t border-white/10">
            <h3 className="text-sm font-semibold text-amber-400 mb-1.5">3. Coins & High Score</h3>
            <p className="text-xs text-slate-300">
              Each gold coin grants +{GAME_CONFIG.difficulty.pointsPerCoin} bonus points. Running speed increases smoothly as you survive longer.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            AudioEngine.playButtonClick();
            onBack();
          }}
          className="mt-6 w-full min-h-[48px] py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all cursor-pointer whitespace-nowrap"
        >
          Back to Main Menu
        </button>
      </div>
    </div>
  );
};

interface SettingsProps {
  settings: UserSettings;
  onUpdateSettings: (next: UserSettings) => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings,
  onBack,
}) => {
  const toggleField = (field: keyof UserSettings) => {
    const updated = {
      ...settings,
      [field]: !settings[field],
    };
    onUpdateSettings(updated);
    AudioEngine.playButtonClick();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-white/15 p-6 sm:p-8 text-slate-100">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Settings</h2>
          <span className="text-xs text-slate-400">Saved Automatically</span>
        </div>

        <div className="divide-y divide-white/10">
          {/* Music Toggle */}
          <button
            type="button"
            onClick={() => toggleField('musicEnabled')}
            className="w-full min-h-[60px] py-3 flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Music className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-white">Background Music</div>
                <div className="text-xs text-slate-400">Indian village folk melody</div>
              </div>
            </div>
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono-tabular transition-colors ${
                settings.musicEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-white/10'
              }`}
            >
              {settings.musicEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Sound Effects Toggle */}
          <button
            type="button"
            onClick={() => toggleField('soundEnabled')}
            className="w-full min-h-[60px] py-3 flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500 shrink-0" />
              )}
              <div>
                <div className="text-sm font-semibold text-white">Sound Effects</div>
                <div className="text-xs text-slate-400">Coin chimes, jump & collision audio</div>
              </div>
            </div>
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono-tabular transition-colors ${
                settings.soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-white/10'
              }`}
            >
              {settings.soundEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Vibration Toggle */}
          <button
            type="button"
            onClick={() => toggleField('vibrationEnabled')}
            className="w-full min-h-[60px] py-3 flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-white">Vibration</div>
                <div className="text-xs text-slate-400">Haptic feedback on supported devices</div>
              </div>
            </div>
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono-tabular transition-colors ${
                settings.vibrationEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-white/10'
              }`}
            >
              {settings.vibrationEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            AudioEngine.playButtonClick();
            onBack();
          }}
          className="mt-6 w-full min-h-[48px] py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all cursor-pointer whitespace-nowrap"
        >
          Save & Return
        </button>
      </div>
    </div>
  );
};

export const AboutDeveloperScreen: React.FC<ModalProps> = ({ onBack }) => {
  const { studioName, developerName, roleTitle, socialLinks } = GAME_CONFIG.developer;
  const showSocials = !GAME_CONFIG.isPlayablesBuild;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-white/15 p-6 sm:p-8 text-slate-100 my-auto">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
          <h2 className="text-xl sm:text-2xl font-bold text-white">About Developer</h2>
          <span className="text-xs text-amber-400">Creator Info</span>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-xs text-slate-400 mb-1">Studio / Brand</div>
            <div className="text-2xl font-extrabold text-amber-400 font-display">{studioName}</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 mb-1">Developer</div>
            <div className="text-lg font-bold text-white">{developerName}</div>
            <div className="text-sm text-slate-300 mt-0.5">{roleTitle}</div>
          </div>

          {showSocials && (
            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <div className="text-xs text-slate-400 mb-2">Official Links</div>

              {socialLinks.facebook ? (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => AudioEngine.playButtonClick()}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-white/10 flex items-center justify-between text-xs sm:text-sm font-medium text-slate-200 transition-colors"
                >
                  <span>Facebook</span>
                  <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
                </a>
              ) : null}

              {socialLinks.instagram ? (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => AudioEngine.playButtonClick()}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-white/10 flex items-center justify-between text-xs sm:text-sm font-medium text-slate-200 transition-colors"
                >
                  <span>Instagram (@5tar.suraj)</span>
                  <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
                </a>
              ) : null}

              {socialLinks.youtube ? (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => AudioEngine.playButtonClick()}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-white/10 flex items-center justify-between text-xs sm:text-sm font-medium text-slate-200 transition-colors"
                >
                  <span>YouTube</span>
                  <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
                </a>
              ) : null}

              {socialLinks.website ? (
                <a
                  href={socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => AudioEngine.playButtonClick()}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-white/10 flex items-center justify-between text-xs sm:text-sm font-medium text-slate-200 transition-colors"
                >
                  <span>Official Website</span>
                  <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
                </a>
              ) : null}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            AudioEngine.playButtonClick();
            onBack();
          }}
          className="mt-6 w-full min-h-[48px] py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all cursor-pointer whitespace-nowrap"
        >
          Back to Main Menu
        </button>
      </div>
    </div>
  );
};

interface HUDProps {
  score: number;
  coins: number;
  zoneLabel: string;
  onPause: () => void;
}

export const GameplayHUD: React.FC<HUDProps> = ({ score, coins, zoneLabel, onPause }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none p-3 sm:p-5 flex items-center justify-between max-w-5xl mx-auto">
      {/* Score & Coins Readout */}
      <div className="pointer-events-auto flex items-center gap-4 px-4 py-2 rounded-2xl bg-slate-950/75 backdrop-blur-md border border-white/15 text-white">
        <div>
          <div className="text-[11px] text-slate-400">Score</div>
          <div className="text-lg sm:text-xl font-bold font-mono-tabular leading-tight">
            {score.toLocaleString()}
          </div>
        </div>
        <div className="h-6 w-[1px] bg-white/15" />
        <div>
          <div className="text-[11px] text-amber-300">Coins</div>
          <div className="text-lg sm:text-xl font-bold font-mono-tabular text-amber-400 leading-tight">
            {coins.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Current Village Area Name (Desktop / Tablet subtle label) */}
      <div className="hidden sm:block text-xs font-medium text-slate-100 bg-slate-950/60 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-white/10">
        {zoneLabel}
      </div>

      {/* Pause Button (>= 44x44px hitbox) */}
      <button
        type="button"
        aria-label="Pause Game"
        onClick={() => {
          AudioEngine.playButtonClick();
          onPause();
        }}
        className="pointer-events-auto min-w-[46px] min-h-[46px] rounded-2xl bg-slate-950/75 hover:bg-slate-900 active:scale-95 backdrop-blur-md border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer"
      >
        <Pause className="w-5 h-5" />
      </button>
    </header>
  );
};

interface CountdownProps {
  secondsLeft: number;
}

export const CountdownOverlay: React.FC<CountdownProps> = ({ secondsLeft }) => {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center pointer-events-none bg-slate-950/35 backdrop-blur-[1px]">
      <div className="text-xs font-semibold text-amber-300 tracking-wider mb-2">
        Get Ready to Run
      </div>
      <div className="text-7xl sm:text-8xl font-extrabold text-white font-mono-tabular drop-shadow-lg">
        {secondsLeft > 0 ? secondsLeft : 'GO!'}
      </div>
    </div>
  );
};

interface PauseProps {
  score: number;
  coins: number;
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseProps> = ({
  score,
  coins,
  onResume,
  onRestart,
  onMainMenu,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-white/15 p-6 sm:p-7 text-center text-white">
        <h2 className="text-2xl font-extrabold mb-2">Game Paused</h2>
        <div className="text-xs text-slate-300 mb-6 font-mono-tabular">
          <span>Score: {score.toLocaleString()}</span>
          <span className="mx-2" aria-hidden="true">·</span>
          <span>Coins: {coins.toLocaleString()}</span>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              AudioEngine.playButtonClick();
              onResume();
            }}
            className="w-full min-h-[48px] py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME</span>
          </button>

          <button
            type="button"
            onClick={() => {
              AudioEngine.playButtonClick();
              onRestart();
            }}
            className="w-full min-h-[48px] py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART</span>
          </button>

          <button
            type="button"
            onClick={() => {
              AudioEngine.playButtonClick();
              onMainMenu();
            }}
            className="w-full min-h-[48px] py-3 px-5 rounded-xl bg-slate-950 hover:bg-slate-800 active:scale-[0.98] border border-white/10 text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface ResultProps {
  score: number;
  coins: number;
  bestScore: number;
  isNewRecord: boolean;
  crashReason: string;
  onRetry: () => void;
  onMainMenu: () => void;
}

export const ResultScreen: React.FC<ResultProps> = ({
  score,
  coins,
  bestScore,
  isNewRecord,
  crashReason,
  onRetry,
  onMainMenu,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-white/15 p-6 sm:p-8 text-center text-white">
        <div className="text-xs text-amber-400 font-medium mb-1">
          {isNewRecord ? 'New Village Record Achieved!' : `Stopped by ${crashReason || 'Obstacle'}`}
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-6">
          GAME OVER
        </h2>

        {/* Metrics Summary */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-white/10 mb-6">
          <div>
            <div className="text-xs text-slate-400 mb-1">Score</div>
            <div className="text-xl sm:text-2xl font-bold text-white font-mono-tabular">
              {score.toLocaleString()}
            </div>
          </div>

          <div className="border-x border-white/10 px-2">
            <div className="text-xs text-slate-400 mb-1">Coins</div>
            <div className="text-xl sm:text-2xl font-bold text-amber-400 font-mono-tabular">
              {coins.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 mb-1">Best Score</div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono-tabular">
              {bestScore.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              AudioEngine.playButtonClick();
              onRetry();
            }}
            className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-extrabold text-base flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-5 h-5" />
            <span>RETRY</span>
          </button>

          <button
            type="button"
            onClick={() => {
              AudioEngine.playButtonClick();
              onMainMenu();
            }}
            className="w-full min-h-[48px] py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-100 font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
