import tempfile
import unittest
from pathlib import Path

import server


class ServerRulesTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.original_db = server.DB_PATH
        server.DB_PATH = Path(self.tmp.name) / "test.sqlite"
        server.init_db()

    def tearDown(self):
        server.DB_PATH = self.original_db
        self.tmp.cleanup()

    def test_three_correct_in_a_row_master_word(self):
        with server.connect() as conn:
            for _ in range(3):
                server.update_mastery(conn, 1, "g2-about", True, server.now_iso())
            row = conn.execute(
                "SELECT correct_streak, mastered FROM word_mastery WHERE child_id = 1 AND word_id = 'g2-about'"
            ).fetchone()
            self.assertEqual(row["correct_streak"], 3)
            self.assertEqual(row["mastered"], 1)

            server.update_mastery(conn, 1, "g2-about", False, server.now_iso())
            row = conn.execute(
                "SELECT correct_streak, mastered FROM word_mastery WHERE child_id = 1 AND word_id = 'g2-about'"
            ).fetchone()
            self.assertEqual(row["correct_streak"], 0)
            self.assertEqual(row["mastered"], 0)

    def test_hint_limit_is_two_letters(self):
        with server.connect() as conn:
            session = server.create_session(conn, {"child_id": 1, "grade_level": 2, "theme_id": "storybook"})
            word = session["words"][0]
            first = server.reveal_hint(conn, session["id"], {"session_word_id": word["session_word_id"]})
            second = server.reveal_hint(conn, session["id"], {"session_word_id": word["session_word_id"]})
            self.assertEqual(first["hints_used"], 1)
            self.assertEqual(second["hints_used"], 2)
            with self.assertRaises(server.ApiError):
                server.reveal_hint(conn, session["id"], {"session_word_id": word["session_word_id"]})

    def test_abandon_unfinished_session_loses_progress(self):
        with server.connect() as conn:
            session = server.create_session(conn, {"child_id": 1, "grade_level": 2, "theme_id": "storybook"})
            session_word = session["words"][0]
            real_word = conn.execute(
                """
                SELECT w.word
                FROM session_words sw
                JOIN words w ON w.id = sw.word_id
                WHERE sw.id = ?
                """,
                (session_word["session_word_id"],),
            ).fetchone()["word"]
            server.submit_answer(
                conn,
                session["id"],
                {"session_word_id": session_word["session_word_id"], "answer": real_word},
            )
            server.abandon_session(conn, session["id"])
            self.assertEqual(conn.execute("SELECT COUNT(*) AS total FROM sessions").fetchone()["total"], 0)
            self.assertEqual(conn.execute("SELECT COUNT(*) AS total FROM word_attempts").fetchone()["total"], 0)

    def test_correct_answers_award_xp_on_completed_session(self):
        with server.connect() as conn:
            session = server.create_session(conn, {"child_id": 1, "grade_level": 2, "theme_id": "storybook"})
            for session_word in session["words"]:
                real_word = conn.execute(
                    """
                    SELECT w.word
                    FROM session_words sw
                    JOIN words w ON w.id = sw.word_id
                    WHERE sw.id = ?
                    """,
                    (session_word["session_word_id"],),
                ).fetchone()["word"]
                result = server.submit_answer(
                    conn,
                    session["id"],
                    {"session_word_id": session_word["session_word_id"], "answer": real_word},
                )
            self.assertTrue(result["session_complete"])
            self.assertEqual(result["summary"]["xp_earned"], 100)
            stats = server.child_stats(conn, 1)
            self.assertEqual(stats["xp"]["total_xp"], 100)
            self.assertEqual(stats["xp"]["level"], 2)

    def test_blockworks_seven_correct_awards_collectible_crate(self):
        with server.connect() as conn:
            conn.execute(
                """
                INSERT OR IGNORE INTO child_theme_unlocks (child_id, theme_id, unlocked_at)
                VALUES (1, 'blockworks', ?)
                """,
                (server.now_iso(),),
            )
            session = server.create_session(conn, {"child_id": 1, "grade_level": 2, "theme_id": "blockworks"})
            result = None
            for index, session_word in enumerate(session["words"]):
                real_word = conn.execute(
                    """
                    SELECT w.word
                    FROM session_words sw
                    JOIN words w ON w.id = sw.word_id
                    WHERE sw.id = ?
                    """,
                    (session_word["session_word_id"],),
                ).fetchone()["word"]
                answer = real_word if index < 7 else "miss"
                result = server.submit_answer(
                    conn,
                    session["id"],
                    {"session_word_id": session_word["session_word_id"], "answer": answer},
                )
            self.assertTrue(result["session_complete"])
            self.assertEqual(result["summary"]["correct_count"], 7)
            self.assertIsNotNone(result["summary"]["crate_reward"])
            self.assertEqual(
                conn.execute("SELECT COUNT(*) AS total FROM child_collectibles WHERE child_id = 1").fetchone()["total"],
                1,
            )


if __name__ == "__main__":
    unittest.main()
