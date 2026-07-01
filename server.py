#!/usr/bin/env python3
"""Local-network spelling practice app.

This deliberately uses only the Python standard library so the app can run on a
home server without a package install step.
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import random
import re
import sqlite3
import sys
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
STATIC_DIR = ROOT / "static"
DB_PATH = Path(os.environ.get("SPELLING_BEE_DB", DATA_DIR / "spelling_bee.sqlite"))
SESSION_WORD_COUNT = 10
MAX_HINTS_PER_WORD = 2
GRADES = (2, 5, 7)
XP_BY_GRADE = {2: 10, 5: 15, 7: 20, 0: 15}
BLOCKWORKS_RANKS = [
    (0, "Guest"),
    (50, "Builder"),
    (150, "Obby Runner"),
    (300, "Server Champ"),
    (550, "Admin"),
    (900, "Legend"),
]
LEVEL_XP_STEP = 100
BLOCKWORKS_COLLECTIBLES = [
    {
        "id": "obby-checkpoint",
        "name": "Checkpoint Flex",
        "rarity": "common",
        "image_path": "/assets/blockworks/obby-checkpoint.svg",
        "description": "A clean checkpoint run for steady spelling.",
    },
    {
        "id": "selfie-five",
        "name": "Five Correct Selfie",
        "rarity": "common",
        "image_path": "/assets/blockworks/blockworks-selfie.svg",
        "description": "A celebratory avatar selfie for a five-correct run.",
    },
    {
        "id": "doors-lite",
        "name": "Door 5 Clear",
        "rarity": "rare",
        "image_path": "/assets/blockworks/doors-lite.svg",
        "description": "A not-too-scary hallway card for brave spellers.",
    },
    {
        "id": "crew-lineup",
        "name": "Crew Lineup",
        "rarity": "rare",
        "image_path": "/assets/blockworks/curated/community-roblox-reference.jpg",
        "description": "A static Roblox crew image for a squad-style reward drop.",
    },
    {
        "id": "doors-lobby",
        "name": "Lobby Door",
        "rarity": "rare",
        "image_path": "/assets/blockworks/curated/doors-banner-2.png",
        "description": "A calmer DOORS lobby card without the jump-scare framing.",
    },
    {
        "id": "tilt-token",
        "name": "Tilt Token",
        "rarity": "rare",
        "image_path": "/assets/blockworks/Roblox_Tilt_White.svg",
        "description": "A local logo-token reward for clean answers.",
    },
    {
        "id": "nights-campfire",
        "name": "99 Nights Campfire",
        "rarity": "epic",
        "image_path": "/assets/blockworks/curated/99-nights-banner-1.png",
        "description": "A campfire scene for an eight-correct BlockWorks run.",
    },
    {
        "id": "rivals-arena",
        "name": "Rivals Arena Token",
        "rarity": "epic",
        "image_path": "/assets/blockworks/curated/rivals-banner-2.png",
        "description": "A toy-like arena card from the curated RIVALS thumbnail set.",
    },
    {
        "id": "server-victory",
        "name": "Server Victory",
        "rarity": "epic",
        "image_path": "/assets/blockworks/server-victory.svg",
        "description": "A full-session win card for boss-level spelling.",
    },
    {
        "id": "builder-legend",
        "name": "Builder Legend",
        "rarity": "legendary",
        "image_path": "/assets/blockworks/builder-legend.svg",
        "description": "A rare pull for high-scoring BlockWorks sessions.",
    },
]


SCHEMA = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  unlock_correct_count INTEGER NOT NULL DEFAULT 0,
  accent TEXT NOT NULL,
  background TEXT NOT NULL,
  icon TEXT NOT NULL,
  reward_label TEXT NOT NULL,
  animation TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS children (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  accent_color TEXT NOT NULL DEFAULT '#14b8a6',
  selected_theme_id TEXT REFERENCES themes(id),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS child_theme_unlocks (
  child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  theme_id TEXT NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  unlocked_at TEXT NOT NULL,
  PRIMARY KEY (child_id, theme_id)
);

CREATE TABLE IF NOT EXISTS words (
  id TEXT PRIMARY KEY,
  word TEXT NOT NULL,
  grade_level INTEGER NOT NULL,
  definition TEXT NOT NULL DEFAULT '',
  example_sentence TEXT NOT NULL DEFAULT '',
  difficulty_tags TEXT NOT NULL DEFAULT '[]',
  theme_tags TEXT NOT NULL DEFAULT '[]',
  audio_word_path TEXT NOT NULL DEFAULT '',
  audio_sentence_path TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  grade_level INTEGER NOT NULL,
  theme_id TEXT REFERENCES themes(id),
  mode TEXT NOT NULL DEFAULT 'practice',
  started_at TEXT NOT NULL,
  completed_at TEXT,
  total_words INTEGER NOT NULL,
  correct_count INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  finalized INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS session_words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  word_id TEXT NOT NULL REFERENCES words(id),
  ordinal INTEGER NOT NULL,
  hints_used INTEGER NOT NULL DEFAULT 0,
  revealed_pattern TEXT NOT NULL,
  submitted_answer TEXT,
  correct INTEGER,
  answered_at TEXT,
  UNIQUE(session_id, ordinal)
);

CREATE TABLE IF NOT EXISTS word_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  session_word_id INTEGER NOT NULL REFERENCES session_words(id) ON DELETE CASCADE,
  child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  word_id TEXT NOT NULL REFERENCES words(id),
  submitted_answer TEXT NOT NULL,
  correct INTEGER NOT NULL,
  hints_used INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  attempted_at TEXT NOT NULL,
  UNIQUE(session_word_id)
);

CREATE TABLE IF NOT EXISTS child_collectibles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  collectible_id TEXT NOT NULL,
  theme_id TEXT NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  rarity TEXT NOT NULL,
  name TEXT NOT NULL,
  image_path TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  source_session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
  unlocked_at TEXT NOT NULL,
  UNIQUE(child_id, collectible_id)
);

CREATE TABLE IF NOT EXISTS word_mastery (
  child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  word_id TEXT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  correct_streak INTEGER NOT NULL DEFAULT 0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  correct_attempts INTEGER NOT NULL DEFAULT 0,
  missed_count INTEGER NOT NULL DEFAULT 0,
  mastered INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TEXT,
  PRIMARY KEY (child_id, word_id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_child ON sessions(child_id);
CREATE INDEX IF NOT EXISTS idx_attempts_child_time ON word_attempts(child_id, attempted_at);
CREATE INDEX IF NOT EXISTS idx_collectibles_child ON child_collectibles(child_id, theme_id);
CREATE INDEX IF NOT EXISTS idx_mastery_child ON word_mastery(child_id);
CREATE INDEX IF NOT EXISTS idx_words_grade ON words(grade_level, active);
"""


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def load_json(path: Path) -> list[dict]:
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, list):
        raise ValueError(f"{path} must contain a JSON array")
    return data


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.strip().lower()).strip("-")
    return slug or "word"


def parse_tags(value: object) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return [tag.strip() for tag in value.split(",") if tag.strip()]
    if isinstance(value, list):
        return [str(tag).strip() for tag in value if str(tag).strip()]
    return []


def make_audio_path(word_id: str) -> str:
    return f"/audio/{word_id}.wav"


def init_db() -> None:
    with connect() as conn:
        conn.executescript(SCHEMA)
        run_migrations(conn)
        seed_themes(conn)
        seed_children(conn)
        seed_words(conn)
        backfill_xp(conn)
        for child in conn.execute("SELECT id FROM children"):
            sync_theme_unlocks(conn, child["id"])
        conn.commit()


def table_columns(conn: sqlite3.Connection, table_name: str) -> set[str]:
    return {row["name"] for row in conn.execute(f"PRAGMA table_info({table_name})")}


def run_migrations(conn: sqlite3.Connection) -> None:
    session_columns = table_columns(conn, "sessions")
    if "xp_earned" not in session_columns:
        conn.execute("ALTER TABLE sessions ADD COLUMN xp_earned INTEGER NOT NULL DEFAULT 0")
    attempt_columns = table_columns(conn, "word_attempts")
    if "xp_earned" not in attempt_columns:
        conn.execute("ALTER TABLE word_attempts ADD COLUMN xp_earned INTEGER NOT NULL DEFAULT 0")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_attempts_xp ON word_attempts(child_id, xp_earned)")


def backfill_xp(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        UPDATE word_attempts
        SET xp_earned = COALESCE((
          SELECT
            CASE w.grade_level
              WHEN 2 THEN 10
              WHEN 5 THEN 15
              WHEN 7 THEN 20
              ELSE 15
            END
            + CASE
                WHEN w.grade_level = 0 OR w.theme_tags != '[]' OR s.mode = 'bonus'
                THEN 5
                ELSE 0
              END
          FROM words w
          JOIN sessions s ON s.id = word_attempts.session_id
          WHERE w.id = word_attempts.word_id
        ), 0)
        WHERE correct = 1 AND xp_earned = 0
        """
    )
    conn.execute(
        """
        UPDATE sessions
        SET xp_earned = COALESCE((
          SELECT SUM(xp_earned)
          FROM word_attempts
          WHERE word_attempts.session_id = sessions.id
        ), 0)
        WHERE finalized = 1
        """
    )


def seed_themes(conn: sqlite3.Connection) -> None:
    for theme in load_json(DATA_DIR / "themes.json"):
        conn.execute(
            """
            INSERT INTO themes (
              id, name, description, unlock_correct_count, accent, background,
              icon, reward_label, animation
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              name=excluded.name,
              description=excluded.description,
              unlock_correct_count=excluded.unlock_correct_count,
              accent=excluded.accent,
              background=excluded.background,
              icon=excluded.icon,
              reward_label=excluded.reward_label,
              animation=excluded.animation
            """,
            (
                theme["id"],
                theme["name"],
                theme.get("description", ""),
                int(theme.get("unlock_correct_count", 0)),
                theme.get("accent", "#14b8a6"),
                theme.get("background", "paper"),
                theme.get("icon", "spark"),
                theme.get("reward_label", "Badge"),
                theme.get("animation", "pop"),
            ),
        )


def seed_children(conn: sqlite3.Connection) -> None:
    defaults = [
        ("PT", "#10b981"),
        ("Smallfry", "#f97316"),
        ("TomTom", "#2563eb"),
    ]
    for name, color in defaults:
        conn.execute(
            """
            INSERT OR IGNORE INTO children (name, accent_color, selected_theme_id, created_at)
            VALUES (?, ?, 'storybook', ?)
            """,
            (name, color, now_iso()),
        )


def seed_words(conn: sqlite3.Connection) -> None:
    for record in load_json(DATA_DIR / "words.json"):
        word_id = record.get("id") or f"g{record.get('grade_level', 0)}-{slugify(record['word'])}"
        conn.execute(
            """
            INSERT INTO words (
              id, word, grade_level, definition, example_sentence, difficulty_tags,
              theme_tags, audio_word_path, audio_sentence_path, active
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              word=excluded.word,
              grade_level=excluded.grade_level,
              definition=excluded.definition,
              example_sentence=excluded.example_sentence,
              difficulty_tags=excluded.difficulty_tags,
              theme_tags=excluded.theme_tags,
              audio_word_path=excluded.audio_word_path,
              audio_sentence_path=excluded.audio_sentence_path,
              active=excluded.active
            """,
            (
                word_id,
                record["word"],
                int(record.get("grade_level", 0)),
                record.get("definition", ""),
                record.get("example_sentence", ""),
                json.dumps(parse_tags(record.get("difficulty_tags"))),
                json.dumps(parse_tags(record.get("theme_tags"))),
                record.get("audio_word_path") or make_audio_path(word_id),
                record.get("audio_sentence_path", ""),
                1 if record.get("active", True) else 0,
            ),
        )


def row_to_dict(row: sqlite3.Row) -> dict:
    return {key: row[key] for key in row.keys()}


def xp_for_word(word: sqlite3.Row, session_mode: str = "practice") -> int:
    if not word:
        return 0
    grade_level = int(word["grade_level"] or 0)
    xp = XP_BY_GRADE.get(grade_level, 15)
    theme_tags = json.loads(word["theme_tags"] or "[]") if "theme_tags" in word.keys() else []
    if grade_level == 0 or theme_tags or session_mode == "bonus":
        xp += 5
    return xp


def xp_level(total_xp: int) -> dict:
    level = max(1, total_xp // LEVEL_XP_STEP + 1)
    current_floor = (level - 1) * LEVEL_XP_STEP
    next_floor = level * LEVEL_XP_STEP
    rank = BLOCKWORKS_RANKS[0][1]
    for threshold, label in BLOCKWORKS_RANKS:
        if total_xp >= threshold:
            rank = label
    return {
        "total_xp": total_xp,
        "level": level,
        "rank": rank,
        "xp_into_level": total_xp - current_floor,
        "xp_to_next_level": max(0, next_floor - total_xp),
        "level_step": LEVEL_XP_STEP,
    }


def total_correct(conn: sqlite3.Connection, child_id: int) -> int:
    row = conn.execute(
        "SELECT COUNT(*) AS total FROM word_attempts WHERE child_id = ? AND correct = 1",
        (child_id,),
    ).fetchone()
    return int(row["total"] or 0)


def unlocked_theme_ids(conn: sqlite3.Connection, child_id: int) -> set[str]:
    return {
        row["theme_id"]
        for row in conn.execute(
            "SELECT theme_id FROM child_theme_unlocks WHERE child_id = ?",
            (child_id,),
        )
    }


def sync_theme_unlocks(conn: sqlite3.Connection, child_id: int) -> set[str]:
    correct = total_correct(conn, child_id)
    unlocked_before = unlocked_theme_ids(conn, child_id)
    for theme in conn.execute(
        "SELECT id FROM themes WHERE unlock_correct_count <= ?",
        (correct,),
    ):
        conn.execute(
            """
            INSERT OR IGNORE INTO child_theme_unlocks (child_id, theme_id, unlocked_at)
            VALUES (?, ?, ?)
            """,
            (child_id, theme["id"], now_iso()),
        )
    return unlocked_theme_ids(conn, child_id) - unlocked_before


def child_stats(conn: sqlite3.Connection, child_id: int) -> dict:
    attempts = conn.execute(
        """
        SELECT COUNT(*) AS total, COALESCE(SUM(correct), 0) AS correct,
               COALESCE(SUM(xp_earned), 0) AS xp
        FROM word_attempts
        WHERE child_id = ?
        """,
        (child_id,),
    ).fetchone()
    mastered = conn.execute(
        "SELECT COUNT(*) AS total FROM word_mastery WHERE child_id = ? AND mastered = 1",
        (child_id,),
    ).fetchone()
    review = conn.execute(
        """
        SELECT COUNT(*) AS total
        FROM word_mastery
        WHERE child_id = ? AND mastered = 0 AND missed_count > 0
        """,
        (child_id,),
    ).fetchone()
    streak = 0
    for row in conn.execute(
        """
        SELECT correct FROM word_attempts
        WHERE child_id = ?
        ORDER BY attempted_at DESC, id DESC
        LIMIT 100
        """,
        (child_id,),
    ):
        if row["correct"]:
            streak += 1
        else:
            break
    total = int(attempts["total"] or 0)
    correct = int(attempts["correct"] or 0)
    total_xp = int(attempts["xp"] or 0)
    collectible_count = conn.execute(
        "SELECT COUNT(*) AS total FROM child_collectibles WHERE child_id = ?",
        (child_id,),
    ).fetchone()
    return {
        "total_attempts": total,
        "correct_attempts": correct,
        "xp": xp_level(total_xp),
        "accuracy": round((correct / total) * 100) if total else 0,
        "current_streak": streak,
        "mastered_words": int(mastered["total"] or 0),
        "needs_review": int(review["total"] or 0),
        "collectibles": int(collectible_count["total"] or 0),
        "badges": earned_badges(correct, streak, int(mastered["total"] or 0)),
    }


def child_collectibles(conn: sqlite3.Connection, child_id: int, limit: int | None = None) -> list[dict]:
    sql = """
        SELECT collectible_id, theme_id, rarity, name, image_path, description,
               source_session_id, unlocked_at
        FROM child_collectibles
        WHERE child_id = ?
        ORDER BY unlocked_at DESC, id DESC
    """
    args: list[object] = [child_id]
    if limit:
        sql += " LIMIT ?"
        args.append(limit)
    return [row_to_dict(row) for row in conn.execute(sql, args)]


def public_collectible(record: dict) -> dict:
    return {
        "id": record["id"],
        "theme_id": "blockworks",
        "rarity": record["rarity"],
        "name": record["name"],
        "image_path": record["image_path"],
        "description": record["description"],
    }


def blockworks_rarity_pool(correct_count: int) -> list[str]:
    if correct_count >= 10:
        return ["common", "rare", "rare", "epic", "epic", "legendary"]
    if correct_count >= 9:
        return ["common", "common", "rare", "rare", "epic"]
    if correct_count >= 7:
        return ["common", "common", "common", "rare"]
    return []


def award_blockworks_crate(
    conn: sqlite3.Connection,
    child_id: int,
    session_id: int,
    correct_count: int,
) -> dict | None:
    pool = blockworks_rarity_pool(correct_count)
    if not pool:
        return None
    owned = {
        row["collectible_id"]
        for row in conn.execute(
            "SELECT collectible_id FROM child_collectibles WHERE child_id = ?",
            (child_id,),
        )
    }
    rarity = random.choice(pool)
    candidates = [
        collectible
        for collectible in BLOCKWORKS_COLLECTIBLES
        if collectible["rarity"] == rarity and collectible["id"] not in owned
    ]
    if not candidates:
        candidates = [
            collectible
            for collectible in BLOCKWORKS_COLLECTIBLES
            if collectible["id"] not in owned
        ]
    if not candidates:
        return {
            "opened": True,
            "theme_id": "blockworks",
            "message": "All BlockWorks cards are already collected.",
            "collectible": None,
        }
    collectible = random.choice(candidates)
    conn.execute(
        """
        INSERT OR IGNORE INTO child_collectibles (
          child_id, collectible_id, theme_id, rarity, name, image_path,
          description, source_session_id, unlocked_at
        )
        VALUES (?, ?, 'blockworks', ?, ?, ?, ?, ?, ?)
        """,
        (
            child_id,
            collectible["id"],
            collectible["rarity"],
            collectible["name"],
            collectible["image_path"],
            collectible["description"],
            session_id,
            now_iso(),
        ),
    )
    return {
        "opened": True,
        "theme_id": "blockworks",
        "message": f"{collectible['rarity'].title()} crate pull",
        "collectible": public_collectible(collectible),
    }


def blockworks_reward_events(correct_count: int) -> list[dict]:
    events = []
    if correct_count >= 5:
        events.append(
            {
                "id": "selfie-five",
                "title": "Selfie unlocked",
                "description": "Five correct answers triggered a BlockWorks selfie.",
                "image_path": "/assets/blockworks/blockworks-selfie.svg",
            }
        )
    if correct_count >= 7:
        events.append(
            {
                "id": "checkpoint-seven",
                "title": "Checkpoint crate",
                "description": "Seven correct answers opened the mystery crate lane.",
                "image_path": "/assets/blockworks/obby-checkpoint.svg",
            }
        )
    if correct_count >= 8:
        events.append(
            {
                "id": "campfire-eight",
                "title": "Campfire bonus",
                "description": "Eight correct answers lit up the 99 Nights campfire.",
                "image_path": "/assets/blockworks/curated/99-nights-banner-1.png",
            }
        )
    if correct_count >= 10:
        events.append(
            {
                "id": "server-victory",
                "title": "Server victory",
                "description": "Perfect run. The whole server gets the win screen.",
                "image_path": "/assets/blockworks/server-victory.svg",
            }
        )
    return events


def earned_badges(correct: int, streak: int, mastered: int) -> list[dict]:
    badges = []
    if correct >= 10:
        badges.append({"id": "first-ten", "label": "First 10", "icon": "star"})
    if correct >= 50:
        badges.append({"id": "fifty-correct", "label": "50 Correct", "icon": "bolt"})
    if streak >= 5:
        badges.append({"id": "hot-streak", "label": "Hot Streak", "icon": "flame"})
    if mastered >= 10:
        badges.append({"id": "word-master", "label": "Word Master", "icon": "medal"})
    return badges


def public_child(conn: sqlite3.Connection, row: sqlite3.Row) -> dict:
    child_id = row["id"]
    sync_theme_unlocks(conn, child_id)
    return {
        "id": child_id,
        "name": row["name"],
        "accent_color": row["accent_color"],
        "selected_theme_id": row["selected_theme_id"] or "storybook",
        "unlocked_theme_ids": sorted(unlocked_theme_ids(conn, child_id)),
        "stats": child_stats(conn, child_id),
    }


def public_theme(row: sqlite3.Row, child_unlocked: set[str] | None = None) -> dict:
    data = row_to_dict(row)
    data["unlocked"] = True if child_unlocked is None else data["id"] in child_unlocked
    return data


def blank_pattern(word: str) -> str:
    return "".join("_" if char.isalpha() else char for char in word)


def spaced_pattern(pattern: str) -> list[str]:
    return [char for char in pattern]


def word_weight(word: sqlite3.Row, mastery: sqlite3.Row | None) -> int:
    tags = set(json.loads(word["difficulty_tags"] or "[]"))
    if mastery is None:
        weight = 6
    elif mastery["mastered"]:
        weight = 1
    elif mastery["correct_streak"] == 0 and mastery["total_attempts"] > 0:
        weight = 10
    elif mastery["correct_streak"] == 1:
        weight = 5
    elif mastery["correct_streak"] == 2:
        weight = 3
    else:
        weight = 6
    if "stretch" in tags:
        weight = max(1, weight - 2)
    return weight


def weighted_sample(
    conn: sqlite3.Connection,
    child_id: int,
    candidates: list[sqlite3.Row],
    count: int,
) -> list[sqlite3.Row]:
    mastery_by_word = {
        row["word_id"]: row
        for row in conn.execute(
            "SELECT * FROM word_mastery WHERE child_id = ?",
            (child_id,),
        )
    }
    pool = list(candidates)
    selected: list[sqlite3.Row] = []
    while pool and len(selected) < count:
        weights = [word_weight(word, mastery_by_word.get(word["id"])) for word in pool]
        total = sum(weights)
        marker = random.uniform(0, total)
        running = 0.0
        chosen_index = 0
        for index, weight in enumerate(weights):
            running += weight
            if marker <= running:
                chosen_index = index
                break
        selected.append(pool.pop(chosen_index))
    return selected


def choose_words(
    conn: sqlite3.Connection,
    child_id: int,
    grade_level: int,
    theme_id: str | None,
    mode: str,
) -> list[sqlite3.Row]:
    base = list(
        conn.execute(
            """
            SELECT * FROM words
            WHERE active = 1 AND grade_level = ?
            ORDER BY word COLLATE NOCASE
            """,
            (grade_level,),
        )
    )
    if mode == "bonus" and theme_id:
        bonus = [
            row
            for row in conn.execute("SELECT * FROM words WHERE active = 1 ORDER BY word COLLATE NOCASE")
            if theme_id in json.loads(row["theme_tags"] or "[]")
            and row["id"] not in {word["id"] for word in base}
        ]
        candidates = bonus + base
    else:
        candidates = base
    if len(candidates) < SESSION_WORD_COUNT:
        raise ApiError(HTTPStatus.BAD_REQUEST, "Not enough words are available for that session.")
    return weighted_sample(conn, child_id, candidates, SESSION_WORD_COUNT)


def serialize_session(conn: sqlite3.Connection, session_id: int) -> dict:
    session = conn.execute(
        """
        SELECT s.*, c.name AS child_name, t.name AS theme_name, t.accent AS theme_accent,
               t.background AS theme_background, t.icon AS theme_icon
        FROM sessions s
        JOIN children c ON c.id = s.child_id
        LEFT JOIN themes t ON t.id = s.theme_id
        WHERE s.id = ?
        """,
        (session_id,),
    ).fetchone()
    if not session:
        raise ApiError(HTTPStatus.NOT_FOUND, "Session not found.")
    words = []
    for row in conn.execute(
        """
        SELECT sw.*, w.word, w.definition, w.example_sentence, w.audio_word_path
        FROM session_words sw
        JOIN words w ON w.id = sw.word_id
        WHERE sw.session_id = ?
        ORDER BY sw.ordinal
        """,
        (session_id,),
    ):
        answered = row["answered_at"] is not None
        word_data = {
            "session_word_id": row["id"],
            "ordinal": row["ordinal"],
            "word_length": len(row["word"]),
            "pattern": spaced_pattern(row["revealed_pattern"]),
            "hints_used": row["hints_used"],
            "max_hints": MAX_HINTS_PER_WORD,
            "audio_word_path": row["audio_word_path"],
            "answered": answered,
            "submitted_answer": row["submitted_answer"] if answered else None,
            "correct": bool(row["correct"]) if answered else None,
        }
        if answered:
            word_data.update(
                {
                    "correct_word": row["word"],
                    "definition": row["definition"],
                    "example_sentence": row["example_sentence"],
                }
            )
        words.append(word_data)
    return {
        "id": session["id"],
        "child_id": session["child_id"],
        "child_name": session["child_name"],
        "grade_level": session["grade_level"],
        "theme_id": session["theme_id"],
        "theme_name": session["theme_name"] or "Storybook Quest",
        "theme_accent": session["theme_accent"] or "#14b8a6",
        "theme_background": session["theme_background"] or "paper",
        "theme_icon": session["theme_icon"] or "spark",
        "mode": session["mode"],
        "started_at": session["started_at"],
        "completed_at": session["completed_at"],
        "total_words": session["total_words"],
        "correct_count": session["correct_count"],
        "xp_earned": session["xp_earned"],
        "answered_count": sum(1 for word in words if word["answered"]),
        "words": words,
        "summary": build_session_summary(conn, session_id) if session["finalized"] else None,
    }


def create_session(conn: sqlite3.Connection, body: dict) -> dict:
    try:
        child_id = int(body.get("child_id"))
        grade_level = int(body.get("grade_level"))
    except (TypeError, ValueError):
        raise ApiError(HTTPStatus.BAD_REQUEST, "Choose a child and grade level.")
    if grade_level not in GRADES:
        raise ApiError(HTTPStatus.BAD_REQUEST, "Choose Grade 2, Grade 5, or Grade 7.")
    child = conn.execute("SELECT * FROM children WHERE id = ?", (child_id,)).fetchone()
    if not child:
        raise ApiError(HTTPStatus.NOT_FOUND, "Child profile not found.")
    theme_id = body.get("theme_id") or child["selected_theme_id"] or "storybook"
    if theme_id:
        sync_theme_unlocks(conn, child_id)
        if theme_id not in unlocked_theme_ids(conn, child_id):
            raise ApiError(HTTPStatus.BAD_REQUEST, "That theme is still locked for this profile.")
    mode = "bonus" if body.get("mode") == "bonus" else "practice"
    words = choose_words(conn, child_id, grade_level, theme_id, mode)
    cursor = conn.execute(
        """
        INSERT INTO sessions (child_id, grade_level, theme_id, mode, started_at, total_words)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (child_id, grade_level, theme_id, mode, now_iso(), len(words)),
    )
    session_id = cursor.lastrowid
    for index, word in enumerate(words, start=1):
        conn.execute(
            """
            INSERT INTO session_words (session_id, word_id, ordinal, revealed_pattern)
            VALUES (?, ?, ?, ?)
            """,
            (session_id, word["id"], index, blank_pattern(word["word"])),
        )
    conn.execute(
        "UPDATE children SET selected_theme_id = ? WHERE id = ?",
        (theme_id, child_id),
    )
    return serialize_session(conn, session_id)


def reveal_hint(conn: sqlite3.Connection, session_id: int, body: dict) -> dict:
    session_word_id = int(body.get("session_word_id") or 0)
    row = conn.execute(
        """
        SELECT sw.*, w.word
        FROM session_words sw
        JOIN words w ON w.id = sw.word_id
        JOIN sessions s ON s.id = sw.session_id
        WHERE sw.id = ? AND sw.session_id = ? AND s.finalized = 0
        """,
        (session_word_id, session_id),
    ).fetchone()
    if not row:
        raise ApiError(HTTPStatus.NOT_FOUND, "Word not found in this session.")
    if row["answered_at"]:
        raise ApiError(HTTPStatus.BAD_REQUEST, "That word has already been answered.")
    if row["hints_used"] >= MAX_HINTS_PER_WORD:
        raise ApiError(HTTPStatus.BAD_REQUEST, "No hints remain for this word.")

    pattern = list(row["revealed_pattern"])
    hidden = [index for index, char in enumerate(pattern) if char == "_" and row["word"][index].isalpha()]
    if hidden:
        reveal_index = hidden[0] if row["hints_used"] == 0 else hidden[len(hidden) // 2]
        pattern[reveal_index] = row["word"][reveal_index]
    updated = "".join(pattern)
    conn.execute(
        """
        UPDATE session_words
        SET hints_used = hints_used + 1, revealed_pattern = ?
        WHERE id = ?
        """,
        (updated, session_word_id),
    )
    return {
        "session_word_id": session_word_id,
        "pattern": spaced_pattern(updated),
        "hints_used": row["hints_used"] + 1,
        "max_hints": MAX_HINTS_PER_WORD,
    }


def submit_answer(conn: sqlite3.Connection, session_id: int, body: dict) -> dict:
    session_word_id = int(body.get("session_word_id") or 0)
    submitted = str(body.get("answer", "")).strip()
    row = conn.execute(
        """
        SELECT sw.*, w.word, w.definition, w.example_sentence, w.grade_level,
               w.theme_tags, s.finalized, s.mode
        FROM session_words sw
        JOIN words w ON w.id = sw.word_id
        JOIN sessions s ON s.id = sw.session_id
        WHERE sw.id = ? AND sw.session_id = ?
        """,
        (session_word_id, session_id),
    ).fetchone()
    if not row:
        raise ApiError(HTTPStatus.NOT_FOUND, "Word not found in this session.")
    if row["finalized"]:
        raise ApiError(HTTPStatus.BAD_REQUEST, "This session is already complete.")
    if row["answered_at"]:
        raise ApiError(HTTPStatus.BAD_REQUEST, "That word has already been answered.")

    correct = submitted.casefold() == row["word"].casefold()
    xp_earned = xp_for_word(row, row["mode"]) if correct else 0
    conn.execute(
        """
        UPDATE session_words
        SET submitted_answer = ?, correct = ?, answered_at = ?
        WHERE id = ?
        """,
        (submitted, 1 if correct else 0, now_iso(), session_word_id),
    )
    remaining = conn.execute(
        """
        SELECT COUNT(*) AS total
        FROM session_words
        WHERE session_id = ? AND answered_at IS NULL
        """,
        (session_id,),
    ).fetchone()["total"]
    summary = finalize_session(conn, session_id) if remaining == 0 else None
    return {
        "session_word_id": session_word_id,
        "correct": correct,
        "submitted_answer": submitted,
        "correct_word": row["word"],
        "definition": row["definition"],
        "example_sentence": row["example_sentence"],
        "xp_earned": xp_earned,
        "session_complete": remaining == 0,
        "summary": summary,
    }


def finalize_session(conn: sqlite3.Connection, session_id: int) -> dict:
    session = conn.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
    if not session:
        raise ApiError(HTTPStatus.NOT_FOUND, "Session not found.")
    if session["finalized"]:
        return build_session_summary(conn, session_id)
    incomplete = conn.execute(
        "SELECT COUNT(*) AS total FROM session_words WHERE session_id = ? AND answered_at IS NULL",
        (session_id,),
    ).fetchone()["total"]
    if incomplete:
        raise ApiError(HTTPStatus.BAD_REQUEST, "Finish all words before completing the session.")

    child_id = session["child_id"]
    unlocked_before = unlocked_theme_ids(conn, child_id)
    correct_count = 0
    session_xp = 0
    for row in conn.execute(
        """
        SELECT sw.*, w.word, w.grade_level, w.theme_tags
        FROM session_words sw
        JOIN words w ON w.id = sw.word_id
        WHERE sw.session_id = ?
        ORDER BY sw.ordinal
        """,
        (session_id,),
    ):
        correct = int(row["correct"] or 0)
        correct_count += correct
        xp_earned = xp_for_word(row, session["mode"]) if correct else 0
        session_xp += xp_earned
        conn.execute(
            """
            INSERT INTO word_attempts (
              session_id, session_word_id, child_id, word_id, submitted_answer,
              correct, hints_used, xp_earned, attempted_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                session_id,
                row["id"],
                child_id,
                row["word_id"],
                row["submitted_answer"] or "",
                correct,
                row["hints_used"],
                xp_earned,
                row["answered_at"],
            ),
        )
        update_mastery(conn, child_id, row["word_id"], bool(correct), row["answered_at"])

    conn.execute(
        """
        UPDATE sessions
        SET completed_at = ?, correct_count = ?, xp_earned = ?, finalized = 1
        WHERE id = ?
        """,
        (now_iso(), correct_count, session_xp, session_id),
    )
    sync_theme_unlocks(conn, child_id)
    crate_reward = None
    if session["theme_id"] == "blockworks":
        crate_reward = award_blockworks_crate(conn, child_id, session_id, correct_count)
    summary = build_session_summary(conn, session_id)
    summary["crate_reward"] = crate_reward
    summary["newly_unlocked_themes"] = [
        public_theme(theme)
        for theme in conn.execute(
            f"SELECT * FROM themes WHERE id IN ({','.join('?' for _ in (unlocked_theme_ids(conn, child_id) - unlocked_before))})",
            tuple(unlocked_theme_ids(conn, child_id) - unlocked_before),
        )
    ] if unlocked_theme_ids(conn, child_id) - unlocked_before else []
    return summary


def update_mastery(
    conn: sqlite3.Connection,
    child_id: int,
    word_id: str,
    correct: bool,
    attempted_at: str,
) -> None:
    existing = conn.execute(
        "SELECT * FROM word_mastery WHERE child_id = ? AND word_id = ?",
        (child_id, word_id),
    ).fetchone()
    if existing:
        streak = int(existing["correct_streak"] or 0) + 1 if correct else 0
        total = int(existing["total_attempts"] or 0) + 1
        correct_total = int(existing["correct_attempts"] or 0) + (1 if correct else 0)
        misses = int(existing["missed_count"] or 0) + (0 if correct else 1)
    else:
        streak = 1 if correct else 0
        total = 1
        correct_total = 1 if correct else 0
        misses = 0 if correct else 1
    conn.execute(
        """
        INSERT INTO word_mastery (
          child_id, word_id, correct_streak, total_attempts, correct_attempts,
          missed_count, mastered, last_attempt_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(child_id, word_id) DO UPDATE SET
          correct_streak=excluded.correct_streak,
          total_attempts=excluded.total_attempts,
          correct_attempts=excluded.correct_attempts,
          missed_count=excluded.missed_count,
          mastered=excluded.mastered,
          last_attempt_at=excluded.last_attempt_at
        """,
        (child_id, word_id, streak, total, correct_total, misses, 1 if streak >= 3 else 0, attempted_at),
    )


def build_session_summary(conn: sqlite3.Connection, session_id: int) -> dict:
    session = conn.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
    if not session:
        raise ApiError(HTTPStatus.NOT_FOUND, "Session not found.")
    rows = list(
        conn.execute(
            """
            SELECT sw.ordinal, sw.submitted_answer, sw.correct, sw.hints_used,
                   w.word, w.definition
            FROM session_words sw
            JOIN words w ON w.id = sw.word_id
            WHERE sw.session_id = ?
            ORDER BY sw.ordinal
            """,
            (session_id,),
        )
    )
    correct = sum(1 for row in rows if row["correct"])
    crate_row = conn.execute(
        """
        SELECT collectible_id, theme_id, rarity, name, image_path, description,
               source_session_id, unlocked_at
        FROM child_collectibles
        WHERE source_session_id = ?
        ORDER BY unlocked_at DESC, id DESC
        LIMIT 1
        """,
        (session_id,),
    ).fetchone()
    misses = [
        {
            "ordinal": row["ordinal"],
            "word": row["word"],
            "submitted_answer": row["submitted_answer"],
            "definition": row["definition"],
        }
        for row in rows
        if not row["correct"]
    ]
    return {
        "session_id": session_id,
        "correct_count": correct,
        "total_words": len(rows),
        "xp_earned": int(session["xp_earned"] or 0),
        "accuracy": round((correct / len(rows)) * 100) if rows else 0,
        "misses": misses,
        "child_stats": child_stats(conn, session["child_id"]),
        "reward_events": blockworks_reward_events(correct) if session["theme_id"] == "blockworks" else [],
        "crate_reward": {
            "opened": True,
            "theme_id": "blockworks",
            "message": f"{crate_row['rarity'].title()} crate pull",
            "collectible": row_to_dict(crate_row),
        }
        if crate_row
        else None,
        "newly_unlocked_themes": [],
    }


def abandon_session(conn: sqlite3.Connection, session_id: int) -> dict:
    session = conn.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
    if not session:
        raise ApiError(HTTPStatus.NOT_FOUND, "Session not found.")
    if session["finalized"]:
        raise ApiError(HTTPStatus.BAD_REQUEST, "Completed sessions cannot be abandoned.")
    conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
    return {"abandoned": True}


def dashboard(conn: sqlite3.Connection) -> dict:
    children = [public_child(conn, row) for row in conn.execute("SELECT * FROM children ORDER BY id")]
    leaderboard = sorted(
        [
            {
                "child_id": child["id"],
                "child_name": child["name"],
                "xp": child["stats"]["xp"]["total_xp"],
                "level": child["stats"]["xp"]["level"],
                "rank": child["stats"]["xp"]["rank"],
                "collectibles": child["stats"]["collectibles"],
                "correct_attempts": child["stats"]["correct_attempts"],
            }
            for child in children
        ],
        key=lambda item: (-item["xp"], -item["correct_attempts"], item["child_name"]),
    )
    recent_sessions = [
        {
            "id": row["id"],
            "child_name": row["child_name"],
            "grade_level": row["grade_level"],
            "theme_name": row["theme_name"],
            "completed_at": row["completed_at"],
            "correct_count": row["correct_count"],
            "total_words": row["total_words"],
            "xp_earned": row["xp_earned"],
            "accuracy": round((row["correct_count"] / row["total_words"]) * 100)
            if row["total_words"]
            else 0,
        }
        for row in conn.execute(
            """
            SELECT s.*, c.name AS child_name, t.name AS theme_name
            FROM sessions s
            JOIN children c ON c.id = s.child_id
            LEFT JOIN themes t ON t.id = s.theme_id
            WHERE s.finalized = 1
            ORDER BY s.completed_at DESC
            LIMIT 12
            """
        )
    ]
    recent_collectibles = [
        row_to_dict(row)
        for row in conn.execute(
            """
            SELECT cc.*, c.name AS child_name
            FROM child_collectibles cc
            JOIN children c ON c.id = cc.child_id
            ORDER BY cc.unlocked_at DESC, cc.id DESC
            LIMIT 12
            """
        )
    ]
    review_words = [
        {
            "child_name": row["child_name"],
            "word": row["word"],
            "grade_level": row["grade_level"],
            "missed_count": row["missed_count"],
            "correct_streak": row["correct_streak"],
            "definition": row["definition"],
        }
        for row in conn.execute(
            """
            SELECT c.name AS child_name, w.word, w.grade_level, w.definition,
                   wm.missed_count, wm.correct_streak
            FROM word_mastery wm
            JOIN children c ON c.id = wm.child_id
            JOIN words w ON w.id = wm.word_id
            WHERE wm.mastered = 0 AND wm.missed_count > 0
            ORDER BY wm.last_attempt_at DESC
            LIMIT 20
            """
        )
    ]
    return {
        "children": children,
        "leaderboard": leaderboard,
        "recent_sessions": recent_sessions,
        "recent_collectibles": recent_collectibles,
        "review_words": review_words,
    }


def list_words(conn: sqlite3.Connection, params: dict[str, list[str]]) -> dict:
    grade = params.get("grade_level", [""])[0]
    args: list[object] = []
    where = "WHERE active = 1"
    if grade:
        where += " AND grade_level = ?"
        args.append(int(grade))
    rows = []
    for row in conn.execute(
        f"SELECT * FROM words {where} ORDER BY grade_level, word COLLATE NOCASE",
        args,
    ):
        item = row_to_dict(row)
        item["difficulty_tags"] = json.loads(item["difficulty_tags"] or "[]")
        item["theme_tags"] = json.loads(item["theme_tags"] or "[]")
        rows.append(item)
    return {"words": rows}


def unique_word_id(conn: sqlite3.Connection, grade_level: int, word: str) -> str:
    base = f"g{grade_level}-{slugify(word)}"
    candidate = base
    suffix = 2
    while conn.execute("SELECT 1 FROM words WHERE id = ?", (candidate,)).fetchone():
        candidate = f"{base}-{suffix}"
        suffix += 1
    return candidate


def create_word(conn: sqlite3.Connection, body: dict) -> dict:
    word = str(body.get("word", "")).strip()
    if not word:
        raise ApiError(HTTPStatus.BAD_REQUEST, "Word is required.")
    try:
        grade_level = int(body.get("grade_level"))
    except (TypeError, ValueError):
        raise ApiError(HTTPStatus.BAD_REQUEST, "Grade level is required.")
    if grade_level not in (*GRADES, 0):
        raise ApiError(HTTPStatus.BAD_REQUEST, "Grade must be 2, 5, 7, or 0 for bonus words.")
    word_id = unique_word_id(conn, grade_level, word)
    conn.execute(
        """
        INSERT INTO words (
          id, word, grade_level, definition, example_sentence, difficulty_tags,
          theme_tags, audio_word_path, audio_sentence_path, active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', 1)
        """,
        (
            word_id,
            word,
            grade_level,
            str(body.get("definition", "")).strip(),
            str(body.get("example_sentence", "")).strip(),
            json.dumps(parse_tags(body.get("difficulty_tags"))),
            json.dumps(parse_tags(body.get("theme_tags"))),
            make_audio_path(word_id),
        ),
    )
    return row_to_dict(conn.execute("SELECT * FROM words WHERE id = ?", (word_id,)).fetchone())


def update_word(conn: sqlite3.Connection, word_id: str, body: dict) -> dict:
    row = conn.execute("SELECT * FROM words WHERE id = ?", (word_id,)).fetchone()
    if not row:
        raise ApiError(HTTPStatus.NOT_FOUND, "Word not found.")
    fields = {
        "word": str(body.get("word", row["word"])).strip(),
        "definition": str(body.get("definition", row["definition"])).strip(),
        "example_sentence": str(body.get("example_sentence", row["example_sentence"])).strip(),
        "difficulty_tags": json.dumps(parse_tags(body.get("difficulty_tags", json.loads(row["difficulty_tags"])))),
        "theme_tags": json.dumps(parse_tags(body.get("theme_tags", json.loads(row["theme_tags"])))),
        "active": 1 if body.get("active", bool(row["active"])) else 0,
    }
    conn.execute(
        """
        UPDATE words
        SET word = ?, definition = ?, example_sentence = ?, difficulty_tags = ?,
            theme_tags = ?, active = ?
        WHERE id = ?
        """,
        (
            fields["word"],
            fields["definition"],
            fields["example_sentence"],
            fields["difficulty_tags"],
            fields["theme_tags"],
            fields["active"],
            word_id,
        ),
    )
    updated = row_to_dict(conn.execute("SELECT * FROM words WHERE id = ?", (word_id,)).fetchone())
    updated["difficulty_tags"] = json.loads(updated["difficulty_tags"] or "[]")
    updated["theme_tags"] = json.loads(updated["theme_tags"] or "[]")
    return updated


def update_child(conn: sqlite3.Connection, child_id: int, body: dict) -> dict:
    row = conn.execute("SELECT * FROM children WHERE id = ?", (child_id,)).fetchone()
    if not row:
        raise ApiError(HTTPStatus.NOT_FOUND, "Child profile not found.")
    name = str(body.get("name", row["name"])).strip() or row["name"]
    color = str(body.get("accent_color", row["accent_color"])).strip() or row["accent_color"]
    selected_theme = body.get("selected_theme_id", row["selected_theme_id"])
    if selected_theme:
        sync_theme_unlocks(conn, child_id)
        if selected_theme not in unlocked_theme_ids(conn, child_id):
            raise ApiError(HTTPStatus.BAD_REQUEST, "That theme is still locked for this profile.")
    conn.execute(
        """
        UPDATE children
        SET name = ?, accent_color = ?, selected_theme_id = ?
        WHERE id = ?
        """,
        (name, color, selected_theme, child_id),
    )
    return public_child(conn, conn.execute("SELECT * FROM children WHERE id = ?", (child_id,)).fetchone())


class ApiError(Exception):
    def __init__(self, status: HTTPStatus, message: str):
        super().__init__(message)
        self.status = status
        self.message = message


class AppHandler(SimpleHTTPRequestHandler):
    server_version = "SpellingBee/1.0"

    def log_message(self, format: str, *args: object) -> None:
        sys.stderr.write("%s - - [%s] %s\n" % (self.address_string(), self.log_date_time_string(), format % args))

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self) -> None:
        self.dispatch("GET")

    def do_POST(self) -> None:
        self.dispatch("POST")

    def do_PATCH(self) -> None:
        self.dispatch("PATCH")

    def dispatch(self, method: str) -> None:
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            try:
                with connect() as conn:
                    result = self.route_api(conn, method, parsed.path, parse_qs(parsed.query))
                    conn.commit()
                self.send_json(result)
            except ApiError as exc:
                self.send_json({"error": exc.message}, exc.status)
            except Exception as exc:  # pragma: no cover - visible while developing locally.
                self.send_json({"error": str(exc)}, HTTPStatus.INTERNAL_SERVER_ERROR)
            return
        if method != "GET":
            self.send_error(HTTPStatus.METHOD_NOT_ALLOWED)
            return
        self.serve_static(parsed.path)

    def route_api(
        self,
        conn: sqlite3.Connection,
        method: str,
        path: str,
        params: dict[str, list[str]],
    ) -> dict:
        parts = [part for part in path.strip("/").split("/") if part]
        body = self.read_json_body() if method in {"POST", "PATCH"} else {}
        if method == "GET" and parts == ["api", "health"]:
            return {"ok": True, "db": str(DB_PATH)}
        if method == "GET" and parts == ["api", "bootstrap"]:
            children = [public_child(conn, row) for row in conn.execute("SELECT * FROM children ORDER BY id")]
            themes = [public_theme(row) for row in conn.execute("SELECT * FROM themes ORDER BY unlock_correct_count")]
            return {"children": children, "themes": themes, "grades": list(GRADES), "session_word_count": SESSION_WORD_COUNT}
        if method == "GET" and parts == ["api", "dashboard"]:
            return dashboard(conn)
        if method == "GET" and parts == ["api", "words"]:
            return list_words(conn, params)
        if method == "POST" and parts == ["api", "words"]:
            return create_word(conn, body)
        if method == "PATCH" and len(parts) == 3 and parts[:2] == ["api", "words"]:
            return update_word(conn, parts[2], body)
        if method == "PATCH" and len(parts) == 3 and parts[:2] == ["api", "children"]:
            return update_child(conn, int(parts[2]), body)
        if method == "POST" and parts == ["api", "sessions"]:
            return create_session(conn, body)
        if len(parts) >= 3 and parts[:2] == ["api", "sessions"]:
            session_id = int(parts[2])
            if method == "GET" and len(parts) == 3:
                return serialize_session(conn, session_id)
            if method == "POST" and len(parts) == 4 and parts[3] == "hint":
                return reveal_hint(conn, session_id, body)
            if method == "POST" and len(parts) == 4 and parts[3] == "answer":
                return submit_answer(conn, session_id, body)
            if method == "POST" and len(parts) == 4 and parts[3] == "complete":
                return finalize_session(conn, session_id)
            if method == "POST" and len(parts) == 4 and parts[3] == "abandon":
                return abandon_session(conn, session_id)
        raise ApiError(HTTPStatus.NOT_FOUND, "Endpoint not found.")

    def read_json_body(self) -> dict:
        length = int(self.headers.get("Content-Length") or 0)
        if length == 0:
            return {}
        raw = self.rfile.read(length).decode("utf-8")
        try:
            data = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise ApiError(HTTPStatus.BAD_REQUEST, "Invalid JSON body.") from exc
        if not isinstance(data, dict):
            raise ApiError(HTTPStatus.BAD_REQUEST, "JSON body must be an object.")
        return data

    def send_json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK) -> None:
        encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(encoded)

    def serve_static(self, url_path: str) -> None:
        clean_path = unquote(url_path)
        if clean_path == "/":
            target = STATIC_DIR / "index.html"
        else:
            target = (STATIC_DIR / clean_path.lstrip("/")).resolve()
        try:
            target.relative_to(STATIC_DIR.resolve())
        except ValueError:
            self.send_error(HTTPStatus.FORBIDDEN)
            return
        if not target.exists() or not target.is_file():
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        content_type = mimetypes.guess_type(str(target))[0] or "application/octet-stream"
        data = target.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the local spelling practice app.")
    parser.add_argument("--host", default=os.environ.get("SPELLING_BEE_HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("SPELLING_BEE_PORT", "8787")))
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    init_db()
    address = (args.host, args.port)
    httpd = ThreadingHTTPServer(address, AppHandler)
    print(f"Spelling practice app running at http://{args.host}:{args.port}")
    print("Use --host 0.0.0.0 to make it reachable on the local network.")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
