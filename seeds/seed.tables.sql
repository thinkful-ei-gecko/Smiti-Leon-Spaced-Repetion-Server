BEGIN;

TRUNCATE
  "word",
  "language",
  "user";

INSERT INTO "user" ("id", "username", "name", "password")
VALUES
  (
    1,
    'admin',
    'Dunder Mifflin Admin',
    -- password = "pass"
    '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG'
  );

INSERT INTO "language" ("id", "name", "user_id")
VALUES
  (1, 'Spanish', 1);

INSERT INTO "word" ("id", "language_id", "original", "translation", "next")
VALUES
  (1, 1, 'el violín', 'violin', 2),
  (2, 1, 'la trompeta', 'trumpet', 3),
  (3, 1, 'el arpa', 'harp', 4),
  (4, 1, 'el xilófono', 'xylophone', 5),
  (5, 1, 'el batéria', 'drums', 6),
  (6, 1, 'la guitarra', 'guitar', 7),
  (7, 1, 'el violoncelo ', 'cello', 8),
  (8, 1, 'el címbalo', 'cymbal', 9),
  (9, 1, 'la flauta', 'flute', 10),
  (10, 1, 'el órgano', 'organ', null);

UPDATE "language" SET head = 1 WHERE id = 1;

-- because we explicitly set the id fields
-- update the sequencer for future automatic id setting
SELECT setval('word_id_seq', (SELECT MAX(id) from "word"));
SELECT setval('language_id_seq', (SELECT MAX(id) from "language"));
SELECT setval('user_id_seq', (SELECT MAX(id) from "user"));

COMMIT;
