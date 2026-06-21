import { userInfoMainDb } from '@/server/db.ts'
import { DB } from 'sqlite'

export function createUser(uname: string) {
    userInfoMainDb.query('INSERT INTO user_info(uname, secretary_id) VALUES (?,1)', [uname])
    const playerDb = new DB(`./playerData/${uname}.db`)
    playerDb.execute(`
CREATE TABLE heroes (
    id               INTEGER PRIMARY KEY AUTOINCREMENT
                             UNIQUE,
    ship_id          INTEGER NOT NULL,
    template_id      INTEGER NOT NULL,
    level            INTEGER NOT NULL
                             DEFAULT (1),
    exp              INTEGER NOT NULL
                             DEFAULT (0),
    married_time     INTEGER NOT NULL
                             DEFAULT (0),
    marry_type       INTEGER,
    name             TEXT    DEFAULT "",
    locked           INTEGER NOT NULL
                             DEFAULT (0),
    create_time      INTEGER NOT NULL
                              DEFAULT (0),
    skills           TEXT    NOT NULL
                             DEFAULT "[]",
    adv              INTEGER NOT NULL
                             DEFAULT (0),
    equips           TEXT    NOT NULL
                             DEFAULT [{}],
    remould          TEXT    DEFAULT "[]"
                             NOT NULL,
    intensify        TEXT    NOT NULL
                             DEFAULT [{}],
    combination_info TEXT    DEFAULT ('{"Combine":0,"ComGrade":0,"ComLv":0,"BeCombined":0}') 
                             NOT NULL
);
INSERT INTO heroes(ship_id, template_id) VALUES (1021051, 10210511);
CREATE TABLE equips (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id        INTEGER NOT NULL,
    enhance_lv         INTEGER NOT NULL
                                DEFAULT (0),
    enhance_exp        INTEGER NOT NULL
                                DEFAULT (0),
    star               INTEGER NOT NULL
                                DEFAULT (1),
    hero_id            INTEGER NOT NULL
                                DEFAULT (0),
    pskill_list        TEXT    NOT NULL
                                DEFAULT ('[]'),
    rise_common_equips TEXT    DEFAULT ('[]') 
                                NOT NULL
);
CREATE TABLE fleets (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL,
    heros     TEXT    NOT NULL
                      DEFAULT ('[]'),
    mode      INTEGER NOT NULL,
    strategy  INTEGER DEFAULT (101) 
                      NOT NULL,
    formation INTEGER DEFAULT (1001) 
                      NOT NULL,
    type      INTEGER NOT NULL
                      DEFAULT (1) 
);
INSERT INTO fleets(name,mode) VALUES ('第一舰队',1),('第二舰队',2),('第三舰队',3),('第四舰队',4);
CREATE TABLE interaction_items (
    furniture_visible TEXT NOT NULL DEFAULT '{}',
    poster_state TEXT NOT NULL DEFAULT '[]',
    decorate TEXT NOT NULL DEFAULT '[]'
);
INSERT INTO interaction_items DEFAULT VALUES;
CREATE TABLE vow_info (
    hero_list TEXT NOT NULL DEFAULT '[]',
    count INTEGER NOT NULL DEFAULT 0
);
INSERT INTO vow_info DEFAULT VALUES;
    `)
}
