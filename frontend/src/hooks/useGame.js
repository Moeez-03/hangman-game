// frontend/src/hooks/useGame.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { gameAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const DIFF_CFG = {
  easy:   { maxFails: 10, timeLimit: 90,  base: 100, hintPen: 20, preReveal: 2 },
  medium: { maxFails: 8,  timeLimit: 60,  base: 200, hintPen: 40, preReveal: 1 },
  hard:   { maxFails: 6,  timeLimit: 40,  base: 400, hintPen: 80, preReveal: 0 },
};

const GALLOWS_PARTS = 10;

export function useGame() {
  const { user, updateUserStats } = useAuth();

  // ── Game state ─────────────────────────────────────
  const [status,       setStatus]       = useState('idle');     // idle | playing | won | lost
  const [wordData,     setWordData]      = useState(null);       // { id, word, hint, difficulty }
  const [guessed,      setGuessed]       = useState(new Set());
  const [preRevealed,  setPreRevealed]   = useState(new Set());
  const [fails,        setFails]         = useState(0);
  const [score,        setScore]         = useState(0);
  const [streak,       setStreak]        = useState(0);
  const [timeLeft,     setTimeLeft]      = useState(60);
  const [hintUsed,     setHintUsed]      = useState(false);
  const [hintVisible,  setHintVisible]   = useState(false);
  const [combo,        setCombo]         = useState(0);
  const [lastGuess,    setLastGuess]     = useState(null);       // { letter, correct }
  const [loading,      setLoading]       = useState(false);

  // Powerups — persist per session only
  const [powers, setPowers] = useState({ reveal: 2, elim: 2, extra: 1 });

  const timerRef   = useRef(null);
  const startTime  = useRef(null);
  const maxFails   = useRef(DIFF_CFG.easy.maxFails);
  const cfg        = useRef(DIFF_CFG.easy);

  // ── Derived values ─────────────────────────────────
  const word       = wordData?.word?.toUpperCase() || '';
  const hint       = wordData?.hint || '';
  const wordId     = wordData?.id;
  const difficulty = wordData?.difficulty || 'easy';

  const uniqueLetters = [...new Set(word.replace(/ /g,'').split(''))];
  const foundCount    = uniqueLetters.filter(l => guessed.has(l)).length;
  const totalCount    = uniqueLetters.length;
  const progress      = totalCount ? Math.round((foundCount / totalCount) * 100) : 0;
  const gallowsStep   = Math.min(fails, GALLOWS_PARTS);
  const livesLeft     = maxFails.current - fails;
  const isTimerOn     = true; // could wire to settings

  // ── Start game ─────────────────────────────────────
  const startGame = useCallback(async (category = 'all', diff = 'easy', timerEnabled = true) => {
    setLoading(true);
    stopTimer();
    try {
      const res = await gameAPI.getWord(category, diff);
      const data = res.data;

      cfg.current     = DIFF_CFG[data.difficulty] || DIFF_CFG.easy;
      maxFails.current = cfg.current.maxFails;

      // Pre-reveal
      const letters = [...new Set(data.word.toUpperCase().replace(/ /g,'').split(''))];
      const shuffled = letters.sort(() => Math.random() - 0.5);
      const preRevSet = new Set(shuffled.slice(0, cfg.current.preReveal));

      setWordData(data);
      setGuessed(new Set(preRevSet));
      setPreRevealed(new Set(preRevSet));
      setFails(0);
      setScore(0);
      setHintUsed(false);
      setHintVisible(false);
      setCombo(0);
      setLastGuess(null);
      setStatus('playing');

      if (timerEnabled) {
        setTimeLeft(cfg.current.timeLimit);
        startTimer(cfg.current.timeLimit);
      }
      startTime.current = Date.now();
    } catch (err) {
      console.error('Failed to load word:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Timer ──────────────────────────────────────────
  function startTimer(limit) {
    stopTimer();
    let t = limit;
    timerRef.current = setInterval(() => {
      t--;
      setTimeLeft(t);
      if (t <= 0) {
        stopTimer();
        endGame(false);
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }

  // ── Guess ──────────────────────────────────────────
  const guess = useCallback((letter) => {
    if (status !== 'playing') return;
    if (guessed.has(letter)) return;

    const newGuessed = new Set(guessed);
    newGuessed.add(letter);
    setGuessed(newGuessed);
    setLastGuess({ letter, correct: word.includes(letter) });

    if (word.includes(letter)) {
      // Correct guess
      const newCombo = combo + 1;
      setCombo(newCombo);

      const timeBonus  = Math.floor(timeLeft / 10) * 5;
      const comboBonus = newCombo >= 3 ? newCombo * 10 : 0;
      const letterPts  = (cfg.current.base / 10) + timeBonus + comboBonus;
      setScore(prev => prev + letterPts);

      // Check win
      const allFound = uniqueLetters.every(l => newGuessed.has(l));
      if (allFound) endGame(true, newGuessed);

    } else {
      // Wrong guess
      setCombo(0);
      const newFails = fails + 1;
      setFails(newFails);

      if (newFails >= maxFails.current) {
        endGame(false);
      }
    }
  }, [status, guessed, word, combo, fails, timeLeft, uniqueLetters]);

  // ── End game ───────────────────────────────────────
  function endGame(won, finalGuessed) {
    stopTimer();
    setStatus(won ? 'won' : 'lost');

    const elapsed = Math.round((Date.now() - startTime.current) / 1000);

    setScore(prev => {
      let finalScore = prev;
      if (won) {
        const tb  = timeLeft * 3;
        const nh  = hintUsed ? 0 : cfg.current.base / 2;
        const acc = Math.max(0, (maxFails.current - fails)) * 20;
        finalScore = prev + tb + nh + acc;
      }

      // Save to backend if logged in
      if (user && wordId) {
        const newStreak = won ? streak + 1 : 0;
        gameAPI.submit({
          word_id:       wordId,
          score:         Math.floor(finalScore),
          wrong_guesses: fails,
          time_taken:    elapsed,
          difficulty:    difficulty,
          won,
          hint_used:     hintUsed,
          streak:        newStreak,
        }).then(res => {
          if (res.data.stats) updateUserStats(res.data.stats);
        }).catch(console.error);

        setStreak(newStreak);
      }

      return Math.floor(finalScore);
    });

    // Reveal word on loss
    if (!won) {
      setGuessed(new Set(word.split('')));
    }
  }

  // ── Hint ───────────────────────────────────────────
  const toggleHint = useCallback(() => {
    if (fails < 3) return; // locked
    if (!hintUsed) {
      setHintUsed(true);
      setHintVisible(true);
      setScore(prev => Math.max(0, prev - cfg.current.hintPen));
    } else {
      setHintVisible(v => !v);
    }
  }, [fails, hintUsed]);

  // ── Powerups ───────────────────────────────────────
  const powerReveal = useCallback(() => {
    if (!powers.reveal || status !== 'playing') return;
    const unrevealed = uniqueLetters.filter(l => !guessed.has(l));
    if (!unrevealed.length) return;
    const letter = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    guess(letter);
    setPowers(p => ({ ...p, reveal: p.reveal - 1 }));
  }, [powers, status, uniqueLetters, guessed, guess]);

  const powerEliminate = useCallback(() => {
    if (!powers.elim || status !== 'playing') return;
    const wordSet = new Set(word.split(''));
    const cands   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
      .filter(l => !wordSet.has(l) && !guessed.has(l));
    if (cands.length < 5) return;
    const picks = cands.sort(() => Math.random() - 0.5).slice(0, 5);
    const newGuessed = new Set(guessed);
    picks.forEach(l => newGuessed.add(l));
    setGuessed(newGuessed);
    setPowers(p => ({ ...p, elim: p.elim - 1 }));
  }, [powers, status, word, guessed]);

  const powerExtraLife = useCallback(() => {
    if (!powers.extra || status !== 'playing') return;
    setFails(prev => Math.max(0, prev - 2));
    setPowers(p => ({ ...p, extra: p.extra - 1 }));
  }, [powers, status]);

  // ── Cleanup on unmount ─────────────────────────────
  useEffect(() => () => stopTimer(), []);

  return {
    // State
    status, word, hint, loading,
    guessed, preRevealed, fails, score, streak,
    timeLeft, hintUsed, hintVisible, combo, lastGuess,
    powers, gallowsStep, livesLeft, progress,
    foundCount, totalCount, difficulty,
    cfg: cfg.current,
    maxFails: maxFails.current,

    // Actions
    startGame, guess, toggleHint,
    powerReveal, powerEliminate, powerExtraLife,
    stopTimer,
  };
}
