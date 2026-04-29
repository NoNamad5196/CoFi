import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

type LanguageMode = "cpp" | "java" | "python" | "mixed";
type BaseLanguage = Exclude<LanguageMode, "mixed">;
type Difficulty = "easy" | "normal" | "hard";
type GamePhase = "ready" | "playing" | "gameOver";

type Enemy = {
  id: string;
  word: string;
  language: BaseLanguage;
  x: number;
  y: number;
  speed: number;
  createdAt: number;
};

type GameState = {
  phase: GamePhase;
  language: LanguageMode;
  difficulty: Difficulty;
  enemies: Enemy[];
  score: number;
  hp: number;
  combo: number;
  bestCombo: number;
  attempts: number;
  hits: number;
  typedChars: number;
  elapsedMs: number;
  startAt: number;
  lastFrameAt: number;
  lastSpawnAt: number;
  damagePulse: number;
  hitPulse: number;
};

type GameAction =
  | { type: "selectLanguage"; language: LanguageMode }
  | { type: "selectDifficulty"; difficulty: Difficulty }
  | { type: "start"; now: number }
  | { type: "restart"; now: number }
  | { type: "main" }
  | { type: "tick"; now: number }
  | { type: "submit"; value: string };

const DEFENSE_LINE = 8;
const STARTING_HP = 5;
const STORAGE_PREFIX = "code-typing-defense";

const WORD_BANK: Record<BaseLanguage, Record<Difficulty, string[]>> = {
  cpp: {
    easy: [
      "int",
      "char",
      "float",
      "if",
      "else",
      "for",
      "while",
      "return",
      "void",
      "main",
    ],
    normal: [
      "printf",
      "scanf",
      "include",
      "define",
      "struct",
      "sizeof",
      "malloc",
      "free",
      "nullptr",
      "vector",
    ],
    hard: [
      "template",
      "namespace",
      "constexpr",
      "unordered_map",
      "dynamic_cast",
      "shared_ptr",
      "unique_ptr",
      "priority_queue",
    ],
  },
  java: {
    easy: [
      "class",
      "public",
      "static",
      "void",
      "main",
      "String",
      "int",
      "if",
      "else",
      "return",
    ],
    normal: [
      "private",
      "protected",
      "extends",
      "implements",
      "interface",
      "ArrayList",
      "HashMap",
      "Scanner",
      "System",
      "println",
    ],
    hard: [
      "synchronized",
      "IOException",
      "NullPointerException",
      "BufferedReader",
      "StringBuilder",
      "Collections",
      "Comparable",
      "Serializable",
    ],
  },
  python: {
    easy: [
      "def",
      "if",
      "else",
      "elif",
      "for",
      "while",
      "return",
      "print",
      "input",
      "list",
    ],
    normal: [
      "lambda",
      "import",
      "except",
      "finally",
      "class",
      "range",
      "append",
      "dictionary",
      "comprehension",
    ],
    hard: [
      "decorator",
      "generator",
      "asyncio",
      "enumerate",
      "itertools",
      "collections",
      "dataclass",
      "contextmanager",
    ],
  },
};

const LANGUAGE_META: Record<
  LanguageMode,
  {
    label: string;
    shortLabel: string;
    description: string;
    color: string;
    accent: string;
    speedMultiplier: number;
    spawnMultiplier: number;
    maxEnemyBonus: number;
  }
> = {
  cpp: {
    label: "C / C++",
    shortLabel: "C++",
    description: "빠른 적이 몰려오는 고성능 모드입니다.",
    color: "#1f8a70",
    accent: "#2dd4bf",
    speedMultiplier: 1.1,
    spawnMultiplier: 1,
    maxEnemyBonus: 0,
  },
  java: {
    label: "Java",
    shortLabel: "Java",
    description: "긴 객체지향 키워드가 많이 등장합니다.",
    color: "#b45309",
    accent: "#f59e0b",
    speedMultiplier: 0.98,
    spawnMultiplier: 1.05,
    maxEnemyBonus: 0,
  },
  python: {
    label: "Python",
    shortLabel: "Py",
    description: "짧은 단어가 더 자주 등장합니다.",
    color: "#2563eb",
    accent: "#60a5fa",
    speedMultiplier: 0.94,
    spawnMultiplier: 0.82,
    maxEnemyBonus: 1,
  },
  mixed: {
    label: "혼합 모드",
    shortLabel: "Mix",
    description: "세 언어 키워드가 섞여 나오는 고난도 모드입니다.",
    color: "#7c3aed",
    accent: "#c084fc",
    speedMultiplier: 1.16,
    spawnMultiplier: 0.76,
    maxEnemyBonus: 2,
  },
};

const DIFFICULTY_META: Record<
  Difficulty,
  {
    label: string;
    description: string;
    spawnMs: number;
    speed: number;
    maxEnemies: number;
    points: number;
  }
> = {
  easy: {
    label: "Easy",
    description: "느린 속도와 짧은 단어로 시작합니다.",
    spawnMs: 1750,
    speed: 5.6,
    maxEnemies: 5,
    points: 10,
  },
  normal: {
    label: "Normal",
    description: "속도와 단어 길이가 균형 잡힌 난이도입니다.",
    spawnMs: 1250,
    speed: 7.2,
    maxEnemies: 7,
    points: 20,
  },
  hard: {
    label: "Hard",
    description: "빠른 웨이브와 긴 단어가 이어집니다.",
    spawnMs: 900,
    speed: 9.1,
    maxEnemies: 9,
    points: 30,
  },
};

const LANGUAGE_OPTIONS: LanguageMode[] = ["cpp", "java", "python", "mixed"];
const DIFFICULTY_OPTIONS: Difficulty[] = ["easy", "normal", "hard"];
const BASE_LANGUAGES: BaseLanguage[] = ["cpp", "java", "python"];

const initialState: GameState = {
  phase: "ready",
  language: "cpp",
  difficulty: "easy",
  enemies: [],
  score: 0,
  hp: STARTING_HP,
  combo: 0,
  bestCombo: 0,
  attempts: 0,
  hits: 0,
  typedChars: 0,
  elapsedMs: 0,
  startAt: 0,
  lastFrameAt: 0,
  lastSpawnAt: 0,
  damagePulse: 0,
  hitPulse: 0,
};

function storageKey(language: LanguageMode, difficulty: Difficulty) {
  return `${STORAGE_PREFIX}:${language}:${difficulty}`;
}

function readBestScore(language: LanguageMode, difficulty: Difficulty) {
  if (typeof window === "undefined") {
    return 0;
  }

  const value = window.localStorage.getItem(storageKey(language, difficulty));
  const parsed = value === null ? 0 : Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function writeBestScore(
  language: LanguageMode,
  difficulty: Difficulty,
  score: number,
) {
  window.localStorage.setItem(storageKey(language, difficulty), String(score));
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pickOne<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function wordsFor(language: LanguageMode, difficulty: Difficulty) {
  if (language === "mixed") {
    return BASE_LANGUAGES.flatMap((baseLanguage) =>
      WORD_BANK[baseLanguage][difficulty].map((word) => ({
        word,
        language: baseLanguage,
      })),
    );
  }

  return WORD_BANK[language][difficulty].map((word) => ({
    word,
    language,
  }));
}

function createEnemy(
  language: LanguageMode,
  difficulty: Difficulty,
  now: number,
): Enemy {
  const languageConfig = LANGUAGE_META[language];
  const difficultyConfig = DIFFICULTY_META[difficulty];
  const selected = pickOne(wordsFor(language, difficulty));

  return {
    id: `${now.toFixed(0)}-${Math.random().toString(16).slice(2)}`,
    word: selected.word,
    language: selected.language,
    x: randomBetween(92, 98),
    y: randomBetween(13, 84),
    speed:
      difficultyConfig.speed *
      languageConfig.speedMultiplier *
      randomBetween(0.92, 1.12),
    createdAt: now,
  };
}

function getSpawnMs(language: LanguageMode, difficulty: Difficulty) {
  return DIFFICULTY_META[difficulty].spawnMs * LANGUAGE_META[language].spawnMultiplier;
}

function getMaxEnemies(language: LanguageMode, difficulty: Difficulty) {
  return (
    DIFFICULTY_META[difficulty].maxEnemies + LANGUAGE_META[language].maxEnemyBonus
  );
}

function resetForPlay(state: GameState, now: number): GameState {
  return {
    ...state,
    phase: "playing",
    enemies: [createEnemy(state.language, state.difficulty, now)],
    score: 0,
    hp: STARTING_HP,
    combo: 0,
    bestCombo: 0,
    attempts: 0,
    hits: 0,
    typedChars: 0,
    elapsedMs: 0,
    startAt: now,
    lastFrameAt: now,
    lastSpawnAt: now,
    damagePulse: 0,
    hitPulse: 0,
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "selectLanguage":
      return {
        ...state,
        language: action.language,
      };
    case "selectDifficulty":
      return {
        ...state,
        difficulty: action.difficulty,
      };
    case "start":
    case "restart":
      return resetForPlay(state, action.now);
    case "main":
      return {
        ...state,
        phase: "ready",
        enemies: [],
        hp: STARTING_HP,
        combo: 0,
        elapsedMs: 0,
      };
    case "tick": {
      if (state.phase !== "playing") {
        return state;
      }

      const deltaSeconds = Math.min(
        Math.max((action.now - state.lastFrameAt) / 1000, 0),
        0.08,
      );
      const movedEnemies = state.enemies.map((enemy) => ({
        ...enemy,
        x: enemy.x - enemy.speed * deltaSeconds,
      }));
      const activeEnemies = movedEnemies.filter((enemy) => enemy.x > DEFENSE_LINE);
      const reachedCount = movedEnemies.length - activeEnemies.length;
      const nextHp = Math.max(0, state.hp - reachedCount);
      const spawnDue =
        action.now - state.lastSpawnAt >=
        getSpawnMs(state.language, state.difficulty);

      let enemies = activeEnemies;
      let lastSpawnAt = state.lastSpawnAt;

      if (
        nextHp > 0 &&
        spawnDue &&
        enemies.length < getMaxEnemies(state.language, state.difficulty)
      ) {
        enemies = [
          ...enemies,
          createEnemy(state.language, state.difficulty, action.now),
        ];
        lastSpawnAt = action.now;
      }

      return {
        ...state,
        phase: nextHp <= 0 ? "gameOver" : state.phase,
        enemies: nextHp <= 0 ? [] : enemies,
        hp: nextHp,
        combo: reachedCount > 0 ? 0 : state.combo,
        elapsedMs: action.now - state.startAt,
        lastFrameAt: action.now,
        lastSpawnAt,
        damagePulse:
          reachedCount > 0 ? state.damagePulse + reachedCount : state.damagePulse,
      };
    }
    case "submit": {
      if (state.phase !== "playing") {
        return state;
      }

      const submitted = action.value.trim();

      if (!submitted) {
        return state;
      }

      const matchingEnemies = state.enemies
        .filter((enemy) => enemy.word === submitted)
        .sort((a, b) => a.x - b.x);
      const target = matchingEnemies[0];
      const attempts = state.attempts + 1;
      const typedChars = state.typedChars + submitted.length;

      if (!target) {
        return {
          ...state,
          attempts,
          typedChars,
          combo: 0,
        };
      }

      const nextCombo = state.combo + 1;
      const comboBonus = nextCombo * 5;
      const gainedPoints = DIFFICULTY_META[state.difficulty].points + comboBonus;

      return {
        ...state,
        enemies: state.enemies.filter((enemy) => enemy.id !== target.id),
        score: state.score + gainedPoints,
        combo: nextCombo,
        bestCombo: Math.max(state.bestCombo, nextCombo),
        attempts,
        hits: state.hits + 1,
        typedChars,
        hitPulse: state.hitPulse + 1,
      };
    }
    default:
      return state;
  }
}

function formatTime(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getAccuracy(hits: number, attempts: number) {
  if (attempts === 0) {
    return 100;
  }

  return Math.round((hits / attempts) * 100);
}

function getWpm(typedChars: number, elapsedMs: number) {
  if (elapsedMs < 1000) {
    return 0;
  }

  const minutes = elapsedMs / 60000;
  return Math.round(typedChars / 5 / minutes);
}

function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [inputValue, setInputValue] = useState("");
  const [bestScore, setBestScore] = useState(() =>
    readBestScore(initialState.language, initialState.difficulty),
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLanguage = LANGUAGE_META[state.language];
  const selectedDifficulty = DIFFICULTY_META[state.difficulty];
  const displayBest = Math.max(bestScore, state.score);
  const accuracy = getAccuracy(state.hits, state.attempts);
  const wpm = getWpm(state.typedChars, state.elapsedMs);
  const hpPercent = (state.hp / STARTING_HP) * 100;

  const themeStyle = useMemo(
    () =>
      ({
        "--accent": selectedLanguage.accent,
        "--language": selectedLanguage.color,
      }) as CSSProperties,
    [selectedLanguage.accent, selectedLanguage.color],
  );

  useEffect(() => {
    setBestScore(readBestScore(state.language, state.difficulty));
  }, [state.language, state.difficulty]);

  useEffect(() => {
    if (state.phase === "gameOver" && state.score > bestScore) {
      writeBestScore(state.language, state.difficulty, state.score);
      setBestScore(state.score);
    }
  }, [
    bestScore,
    state.difficulty,
    state.language,
    state.phase,
    state.score,
  ]);

  useEffect(() => {
    if (state.phase !== "playing") {
      return;
    }

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 50);
    let frame = window.requestAnimationFrame(function tick(now) {
      dispatch({ type: "tick", now });
      frame = window.requestAnimationFrame(tick);
    });

    return () => {
      window.clearTimeout(focusTimer);
      window.cancelAnimationFrame(frame);
    };
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "playing") {
      setInputValue("");
    }
  }, [state.phase]);

  function handleStart() {
    dispatch({ type: "start", now: performance.now() });
  }

  function handleRestart() {
    dispatch({ type: "restart", now: performance.now() });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch({ type: "submit", value: inputValue });
    setInputValue("");
  }

  return (
    <main className={`app ${state.phase}`} style={themeStyle}>
      <section className="shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">Code Typing Defense</p>
            <h1>
              <span className="headline-line">메순간</span>
              <span className="headline-line">키워드 입력으로</span>
              <span className="headline-line">방어선을 지키세요</span>
            </h1>
          </div>
          <div className="topbar-stats" aria-label="현재 점수 요약">
            <span>최고 {displayBest}</span>
            <span>모드 {selectedLanguage.shortLabel}</span>
          </div>
        </header>

        {state.phase === "ready" && (
          <section className="setup-panel" aria-labelledby="setup-title">
            <div className="setup-copy">
              <h2 id="setup-title">언어와 난이도 선택</h2>
              <p>
                화면 오른쪽에서 다가오는 프로그래밍 키워드를 정확히 입력해
                왼쪽 방어선을 지키세요.
              </p>
            </div>

            <div className="option-group" aria-label="언어 모드">
              <div className="group-label">언어</div>
              <div className="button-grid language-grid">
                {LANGUAGE_OPTIONS.map((language) => {
                  const meta = LANGUAGE_META[language];
                  return (
                    <button
                      className="choice-button"
                      type="button"
                      key={language}
                      aria-pressed={state.language === language}
                      onClick={() =>
                        dispatch({ type: "selectLanguage", language })
                      }
                    >
                      <span
                        className="choice-swatch"
                        style={{ backgroundColor: meta.accent }}
                      />
                      <span>
                        <strong>{meta.label}</strong>
                        <small>{meta.description}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="option-group" aria-label="난이도">
              <div className="group-label">난이도</div>
              <div className="button-grid difficulty-grid">
                {DIFFICULTY_OPTIONS.map((difficulty) => {
                  const meta = DIFFICULTY_META[difficulty];
                  return (
                    <button
                      className="choice-button"
                      type="button"
                      key={difficulty}
                      aria-pressed={state.difficulty === difficulty}
                      onClick={() =>
                        dispatch({ type: "selectDifficulty", difficulty })
                      }
                    >
                      <span>
                        <strong>{meta.label}</strong>
                        <small>{meta.description}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="setup-footer">
              <div className="best-readout">
                <span>저장된 최고점수</span>
                <strong>{bestScore}</strong>
              </div>
              <button className="primary-button" type="button" onClick={handleStart}>
                방어 시작
              </button>
            </div>
          </section>
        )}

        {state.phase === "playing" && (
          <section className="game-layout" aria-label="타자 디펜스 게임">
            <div className="hud">
              <div className="metric">
                <span>점수</span>
                <strong>{state.score}</strong>
              </div>
              <div className="metric">
                <span>최고</span>
                <strong>{displayBest}</strong>
              </div>
              <div className="metric">
                <span>시간</span>
                <strong>{formatTime(state.elapsedMs)}</strong>
              </div>
              <div className="metric">
                <span>콤보</span>
                <strong>{state.combo}x</strong>
              </div>
              <div className="metric">
                <span>WPM</span>
                <strong>{wpm}</strong>
              </div>
              <div className="metric">
                <span>정확도</span>
                <strong>{accuracy}%</strong>
              </div>
            </div>

            <div className="board-shell">
              <div
                className="game-board"
                aria-label="적 이동 경로"
                onClick={() => inputRef.current?.focus()}
              >
                <div
                  className="defense-line"
                  style={{ left: `${DEFENSE_LINE}%` }}
                >
                  <span>방어선</span>
                </div>

                <div className="hp-rail" aria-label={`체력 ${state.hp}`}>
                  <span>HP</span>
                  <div className="hp-track">
                    <div
                      className="hp-fill"
                      style={{ width: `${hpPercent}%` }}
                    />
                  </div>
                  <strong>{state.hp}</strong>
                </div>

                {state.damagePulse > 0 && (
                  <div key={`damage-${state.damagePulse}`} className="damage-wave" />
                )}
                {state.hitPulse > 0 && (
                  <div key={`hit-${state.hitPulse}`} className="hit-spark">
                    +{selectedDifficulty.points + state.combo * 5}
                  </div>
                )}

                {state.enemies.map((enemy) => {
                  const enemyLanguage = LANGUAGE_META[enemy.language];
                  return (
                    <div
                      className="enemy"
                      key={enemy.id}
                      style={
                        {
                          left: `${enemy.x}%`,
                          top: `${enemy.y}%`,
                          "--enemy-color": enemyLanguage.color,
                          "--enemy-accent": enemyLanguage.accent,
                        } as CSSProperties
                      }
                    >
                      <span className="enemy-language">
                        {enemyLanguage.shortLabel}
                      </span>
                      <span className="enemy-word">{enemy.word}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <form className="command-line" onSubmit={handleSubmit}>
              <label htmlFor="keyword-input">키워드 입력</label>
              <input
                id="keyword-input"
                ref={inputRef}
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="보이는 키워드를 입력하고 Enter"
              />
              <button type="submit">입력</button>
            </form>
          </section>
        )}

        {state.phase === "gameOver" && (
          <section className="result-panel" aria-labelledby="result-title">
            <p className="eyebrow">게임 오버</p>
            <h2 id="result-title">방어선이 뚫렸습니다.</h2>
            <div className="result-grid">
              <div className="metric large">
                <span>최종 점수</span>
                <strong>{state.score}</strong>
              </div>
              <div className="metric large">
                <span>최고 점수</span>
                <strong>{displayBest}</strong>
              </div>
              <div className="metric">
                <span>언어</span>
                <strong>{selectedLanguage.label}</strong>
              </div>
              <div className="metric">
                <span>난이도</span>
                <strong>{selectedDifficulty.label}</strong>
              </div>
              <div className="metric">
                <span>최고 콤보</span>
                <strong>{state.bestCombo}x</strong>
              </div>
              <div className="metric">
                <span>정확도</span>
                <strong>{accuracy}%</strong>
              </div>
            </div>
            <div className="result-actions">
              <button className="primary-button" type="button" onClick={handleRestart}>
                다시 시작
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => dispatch({ type: "main" })}
              >
                메인으로
              </button>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

export default App;
