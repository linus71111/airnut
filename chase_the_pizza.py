# ============================================================
#  Chase the Pizza - MakeCode Arcade (Python)
#  Einfügen unter: https://arcade.makecode.com  ->  Neues Projekt
#  -> oben auf "Python" umschalten -> alles ersetzen -> Play
#
#  Extras gegenüber dem Original-Tutorial (alles auch mit Blöcken machbar):
#   - Startbildschirm mit Anleitung
#   - Figur bleibt im Bildschirm
#   - 3 Leben + Geist, der dich verfolgt (auch er kommt nicht durch Wände)
#   - Sound + Effekte beim Pizza-Essen
#   - Alle 5 Punkte: Level up (du und der Geist werden schneller,
#     aber nur bis zu einer Höchstgeschwindigkeit)
#   - Alle 10 Punkte: neue Welt - andere Farbe + neue Wände,
#     durch die man nicht laufen kann. Wände halten Abstand zum Rand
#     und zueinander, damit man immer überall durchkommt
#   - Jede Pizza gibt Extra-Zeit, damit es nie unmöglich wird
#   - Goldene Bonus-Pizza (3 Punkte + Zeit), verschwindet nach 3 Sekunden
#   - Herz: gibt ein Extra-Leben, verschwindet nach 4 Sekunden
#   - Schlamm: wer durchläuft (du oder der Geist), ist 3 Sekunden lang
#     halb so schnell. Danach ist der Schlamm weg. Wenn keiner
#     durchläuft, verschwindet er nach 5 Sekunden
#   - Kamera wackelt, wenn der Geist dich erwischt
#   - Bei 67 Punkten: Six-Seven-Party mit bunt blinkendem Hintergrund,
#     Konfetti und +7 Sekunden
#   - Schwierigkeit am Anfang: Leicht, Mittel oder Schwer
#   - Skin-Auswahl am Anfang: 5 Skins, mit links/rechts wählen, A = OK
#   - Alle 20 Punkte: BOSS-LEVEL! Ein großer Boss jagt dich und schießt
#     Feuerbälle. Auch er kommt nicht durch Wände. Iss Pizzas, um ihn
#     zu besiegen. Jeder Boss ist schneller als der davor.
# ============================================================

@namespace
class SpriteKind:
    Bonus = SpriteKind.create()
    Wall = SpriteKind.create()
    Heart = SpriteKind.create()
    Mud = SpriteKind.create()
    Boss = SpriteKind.create()

# ---------- Variablen ----------
level = 1
world = 0
speed = 100
ghost_speed = 25
next_level_score = 5
next_world_score = 10
last_x = 80
last_y = 60
ghost_last_x = 150
ghost_last_y = 110
GAP = 22   # Mindestabstand von Wänden zum Rand und zu anderen Wänden
MAX_SPEED = 160
MAX_GHOST_SPEED = 50
MAX_WALLS = 5
MAX_LIFE = 5
player_slowed = False
player_slow_until = 0
ghost_slowed = False
ghost_slow_until = 0
SLOW_TIME = 3000   # so lange (in ms) macht Schlamm langsam
party_done = False
party_until = 0
PARTY_SCORE = 67
world_colors = [7, 9, 6, 13, 11, 3]
skin_index = 0
choosing = True
phase = 0                # 0 = Schwierigkeit wählen, 1 = Skin wählen
difficulty = 1           # 0 = Leicht, 1 = Mittel, 2 = Schwer
difficulty_names = ["Leicht", "Mittel", "Schwer"]
# Werte je Schwierigkeit:     Leicht, Mittel, Schwer
DIFF_GHOST_START =           [15,     20,     25]
DIFF_GHOST_STEP =            [2,      3,      4]
DIFF_GHOST_MAX =             [35,     45,     55]
DIFF_LIVES =                 [5,      3,      3]
DIFF_TIME =                  [40,     30,     25]
DIFF_BOSS_PIZZAS =           [3,      4,      5]
DIFF_BOSS_MAX_SPEED =        [40,     55,     70]
DIFF_BOSS_SHOT_TICKS =       [4,      3,      2]   # x 0,5 s zwischen Schüssen
DIFF_TRIPLE_FROM_BOSS =      [99,     3,      2]   # ab welchem Boss 3 Schüsse
ghost_step = 3
boss_shot_tick = 0
boss_last_x = 0
boss_last_y = 0
boss_active = False
boss_count = 0
boss_hits = 0
BOSS_PIZZAS = 5          # wird durch die Schwierigkeit gesetzt
next_boss_score = 20     # alle 20 Punkte kommt ein Boss
boss: Sprite = None

# ---------- Start ----------
scene.set_background_color(7)
game.splash("Chase the Pizza!", "Pfeiltasten: bewegen")
game.splash("Iss Pizza, meide den Geist!", "Alle 10 Punkte: neue Wände")
game.splash("Alle 20 Punkte: BOSS!", "Iss Pizzas, um ihn zu besiegen")

# ---------- Skins ----------
skin_names = ["Klassiker", "Ninja", "Roboter", "Prinzessin", "Frosch"]
skins = [
    # 1: Klassiker
    img("""
        . . . . . f f f f f . . . . . .
        . . . . f 2 2 2 2 2 f . . . . .
        . . . f 2 2 2 2 2 2 2 f . . . .
        . . . f f f d d d d f f . . . .
        . . . f d f d d d f d f . . . .
        . . . f d d d d d d d f . . . .
        . . . . f d d 2 d d f . . . . .
        . . . . . f f f f f . . . . . .
        . . . . f 8 8 8 8 8 f . . . . .
        . . . f d 8 8 8 8 8 d f . . . .
        . . . f d 8 8 8 8 8 d f . . . .
        . . . . f 8 8 8 8 8 f . . . . .
        . . . . f 8 8 f 8 8 f . . . . .
        . . . . f 8 8 f 8 8 f . . . . .
        . . . . f e e f e e f . . . . .
        . . . . f f f . f f f . . . . .
    """),
    # 2: Ninja
    img("""
        . . . . . f f f f f . . . . . .
        . . . . f f f f f f f . . . . .
        . . . f f f f f f f f f . . . .
        . . . f f f d d d d f f . . . .
        . . . f d f d d d f d f . . . .
        . . . f d d d d d d d f . . . .
        . . . . f d d 2 d d f . . . . .
        . . . . . f f f f f . . . . . .
        . . . . f f f f f f f . . . . .
        . . . f d f f f f f d f . . . .
        . . . f d f f f f f d f . . . .
        . . . . f f f f f f f . . . . .
        . . . . f f f f f f f . . . . .
        . . . . f f f f f f f . . . . .
        . . . . f e e f e e f . . . . .
        . . . . f f f . f f f . . . . .
    """),
    # 3: Roboter
    img("""
        . . . . . f f f f f . . . . . .
        . . . . f c c c c c f . . . . .
        . . . f c c c c c c c f . . . .
        . . . f f f 1 1 1 1 f f . . . .
        . . . f 1 f 1 1 1 f 1 f . . . .
        . . . f 1 1 1 1 1 1 1 f . . . .
        . . . . f 1 1 2 1 1 f . . . . .
        . . . . . f f f f f . . . . . .
        . . . . f b b b b b f . . . . .
        . . . f 1 b b b b b 1 f . . . .
        . . . f 1 b b b b b 1 f . . . .
        . . . . f b b b b b f . . . . .
        . . . . f c c f c c f . . . . .
        . . . . f c c f c c f . . . . .
        . . . . f e e f e e f . . . . .
        . . . . f f f . f f f . . . . .
    """),
    # 4: Prinzessin
    img("""
        . . . . . f f f f f . . . . . .
        . . . . f 5 5 5 5 5 f . . . . .
        . . . f 5 5 5 5 5 5 5 f . . . .
        . . . f f f d d d d f f . . . .
        . . . f d f d d d f d f . . . .
        . . . f d d d d d d d f . . . .
        . . . . f d d 2 d d f . . . . .
        . . . . . f f f f f . . . . . .
        . . . . f 3 3 3 3 3 f . . . . .
        . . . f d 3 3 3 3 3 d f . . . .
        . . . f d 3 3 3 3 3 d f . . . .
        . . . . f 3 3 3 3 3 f . . . . .
        . . . . f 3 3 f 3 3 f . . . . .
        . . . . f 3 3 f 3 3 f . . . . .
        . . . . f e e f e e f . . . . .
        . . . . f f f . f f f . . . . .
    """),
    # 5: Frosch
    img("""
        . . . . . f f f f f . . . . . .
        . . . . f 7 7 7 7 7 f . . . . .
        . . . f 7 7 7 7 7 7 7 f . . . .
        . . . f f f 7 7 7 7 f f . . . .
        . . . f 7 f 7 7 7 f 7 f . . . .
        . . . f 7 7 7 7 7 7 7 f . . . .
        . . . . f 7 7 2 7 7 f . . . . .
        . . . . . f f f f f . . . . . .
        . . . . f 6 6 6 6 6 f . . . . .
        . . . f 7 6 6 6 6 6 7 f . . . .
        . . . f 7 6 6 6 6 6 7 f . . . .
        . . . . f 6 6 6 6 6 f . . . . .
        . . . . f 7 7 f 7 7 f . . . . .
        . . . . f 7 7 f 7 7 f . . . . .
        . . . . f e e f e e f . . . . .
        . . . . f f f . f f f . . . . .
    """)
]

# ---------- Auswahl: erst Schwierigkeit, dann Skin ----------
game.splash("Wähle die Schwierigkeit!", "Links/Rechts wechseln, A = OK")
preview = sprites.create(skins[0], SpriteKind.player)
preview.scale = 3

def show_difficulty():
    preview.say_text("< " + difficulty_names[difficulty] + " >")

def show_skin():
    preview.set_image(skins[skin_index])
    preview.say_text("< " + str(skin_index + 1) + "/5 " + skin_names[skin_index] + " >")

def on_left_pressed():
    global skin_index, difficulty
    if choosing:
        if phase == 0:
            difficulty = (difficulty + 2) % 3
            show_difficulty()
        else:
            skin_index = (skin_index + 4) % 5
            show_skin()
controller.left.on_event(ControllerButtonEvent.PRESSED, on_left_pressed)

def on_right_pressed():
    global skin_index, difficulty
    if choosing:
        if phase == 0:
            difficulty = (difficulty + 1) % 3
            show_difficulty()
        else:
            skin_index = (skin_index + 1) % 5
            show_skin()
controller.right.on_event(ControllerButtonEvent.PRESSED, on_right_pressed)

def on_a_pressed():
    global phase, choosing
    if choosing:
        music.ba_ding.play()
        if phase == 0:
            phase = 1
        else:
            choosing = False
controller.A.on_event(ControllerButtonEvent.PRESSED, on_a_pressed)

# Schwierigkeit wählen
show_difficulty()
while phase == 0:
    pause(20)

# Skin wählen
preview.say_text("")
game.splash("Wähle deinen Skin!", "Links/Rechts wechseln, A = OK")
show_skin()
while choosing:
    pause(20)
preview.destroy()

# Werte der gewählten Schwierigkeit übernehmen
ghost_speed = DIFF_GHOST_START[difficulty]
ghost_step = DIFF_GHOST_STEP[difficulty]
MAX_GHOST_SPEED = DIFF_GHOST_MAX[difficulty]
BOSS_PIZZAS = DIFF_BOSS_PIZZAS[difficulty]

# ---------- Spieler ----------
player_sprite = sprites.create(skins[skin_index], SpriteKind.player)
controller.move_sprite(player_sprite, speed, speed)
player_sprite.set_stay_in_screen(True)

# ---------- Hilfsfunktionen für Wände ----------
def touches_wall(s: Sprite):
    for w in sprites.all_of_kind(SpriteKind.Wall):
        if s.overlaps_with(w):
            return True
    return False

# Ist eine Wand zu nah an einer anderen Wand?
def too_close(wall: Sprite):
    for other in sprites.all_of_kind(SpriteKind.Wall):
        if other != wall:
            if wall.left < other.right + GAP and wall.right > other.left - GAP and wall.top < other.bottom + GAP and wall.bottom > other.top - GAP:
                return True
    return False

# Setzt eine Wand an eine Stelle mit genug Abstand zum Rand
def place_wall(wall: Sprite):
    wall.set_position(randint(GAP + wall.width // 2, 160 - GAP - wall.width // 2), randint(GAP + wall.height // 2, 120 - GAP - wall.height // 2))

# Bewegt ein Sprite aus der Wand zurück. Probiert erst nur waagrecht
# bzw. nur senkrecht, damit man an der Wand entlangrutschen kann.
def push_out_of_wall(s: Sprite, old_x: number, old_y: number):
    new_x = s.x
    new_y = s.y
    s.set_position(new_x, old_y)
    if touches_wall(s):
        s.set_position(old_x, new_y)
        if touches_wall(s):
            s.set_position(old_x, old_y)

# Setzt ein Sprite an eine zufällige Stelle, die nicht in einer Wand ist
def place_free(s: Sprite):
    s.set_position(randint(10, 150), randint(10, 110))
    tries = 0
    while touches_wall(s) and tries < 30:
        s.set_position(randint(10, 150), randint(10, 110))
        tries += 1

# ---------- Pizza ----------
pizza = sprites.create(img("""
    . . . . . . . e e . . . . . . .
    . . . . . . e 5 5 e . . . . . .
    . . . . . e 5 2 5 5 e . . . . .
    . . . . . e 5 5 5 2 e . . . . .
    . . . . e 5 2 5 5 5 5 e . . . .
    . . . . e 5 5 5 7 5 5 e . . . .
    . . . e 5 5 5 2 5 5 2 5 e . . .
    . . . e 5 7 5 5 5 5 5 5 e . . .
    . . e 5 5 5 5 5 2 5 5 7 5 e . .
    . . e 5 2 5 5 5 5 5 5 5 5 e . .
    . e 5 5 5 5 7 5 5 5 2 5 5 5 e .
    . e 5 5 2 5 5 5 5 5 5 5 5 2 e .
    e e e e e e e e e e e e e e e e
    e 4 4 4 4 4 4 4 4 4 4 4 4 4 4 e
    . e e e e e e e e e e e e e e .
    . . . . . . . . . . . . . . . .
"""), SpriteKind.food)
place_free(pizza)

# ---------- Geist (Gegner) ----------
ghost = sprites.create(img("""
    . . . . . 1 1 1 1 1 . . . . . .
    . . . 1 1 1 1 1 1 1 1 1 . . . .
    . . 1 1 1 1 1 1 1 1 1 1 1 . . .
    . 1 1 1 f f 1 1 1 f f 1 1 1 . .
    . 1 1 1 f f 1 1 1 f f 1 1 1 . .
    . 1 1 1 1 1 1 1 1 1 1 1 1 1 . .
    . 1 1 1 1 1 f f f 1 1 1 1 1 . .
    . 1 1 1 1 1 f f f 1 1 1 1 1 . .
    . 1 1 1 1 1 1 1 1 1 1 1 1 1 . .
    . 1 1 1 1 1 1 1 1 1 1 1 1 1 . .
    . 1 1 1 1 1 1 1 1 1 1 1 1 1 . .
    . 1 1 . 1 1 1 . 1 1 1 . 1 1 . .
    . 1 . . . 1 . . . 1 . . . 1 . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
"""), SpriteKind.enemy)
ghost.set_position(150, 110)
ghost.follow(player_sprite, ghost_speed)

# ---------- Punkte, Leben, Zeit ----------
info.set_score(0)
info.set_life(DIFF_LIVES[difficulty])
info.start_countdown(DIFF_TIME[difficulty])

# ---------- Neue Welt: Farbe wechseln + Wände neu bauen ----------
def build_world():
    if not boss_active:
        scene.set_background_color(world_colors[world % len(world_colors)])
    for old in sprites.all_of_kind(SpriteKind.Wall):
        old.destroy()
    wall_count = Math.min(world, MAX_WALLS)
    for i in range(wall_count):
        if randint(0, 1) == 0:
            pic = image.create(6, randint(30, 60))   # senkrechte Wand
        else:
            pic = image.create(randint(30, 60), 6)   # waagrechte Wand
        pic.fill(14)
        pic.draw_rect(0, 0, pic.width, pic.height, 12)
        wall = sprites.create(pic, SpriteKind.Wall)
        place_wall(wall)
        # Nie auf Spieler oder Geist bauen, nie zu nah an anderen Wänden
        tries = 0
        while (wall.overlaps_with(player_sprite) or wall.overlaps_with(ghost) or too_close(wall)) and tries < 50:
            place_wall(wall)
            tries += 1
        if tries >= 50:
            wall.destroy()   # kein Platz gefunden -> diese Wand weglassen
    place_free(pizza)
    music.power_up.play()
    player_sprite.say_text("Welt " + str(world + 1) + "!", 1500)

# ---------- Geschwindigkeit setzen (halb so schnell im Schlamm) ----------
def apply_speeds():
    if player_slowed:
        controller.move_sprite(player_sprite, speed // 2, speed // 2)
    else:
        controller.move_sprite(player_sprite, speed, speed)
    if ghost_slowed:
        ghost.follow(player_sprite, ghost_speed // 2)
    else:
        ghost.follow(player_sprite, ghost_speed)

# ---------- Fortschritt prüfen (Level + Welt) ----------
def check_progress():
    global level, world, speed, ghost_speed, next_level_score, next_world_score
    global party_done, party_until
    # 67 Punkte: Six-Seven-Party!
    if info.score() >= PARTY_SCORE and not party_done:
        party_done = True
        party_until = game.runtime() + 6700
        effects.confetti.start_screen_effect(6700)
        music.power_up.play()
        info.change_countdown_by(7)
        player_sprite.say_text("SIX SEVEN!", 2000)
        ghost.say_text("6 7!!", 2000)
    if info.score() >= next_level_score:
        next_level_score += 5
        level += 1
        speed = Math.min(speed + 10, MAX_SPEED)
        ghost_speed = Math.min(ghost_speed + ghost_step, MAX_GHOST_SPEED)
        apply_speeds()
        player_sprite.say_text("Level " + str(level) + "!", 1000)
    if info.score() >= next_world_score:
        next_world_score += 10
        world += 1
        build_world()
    if info.score() >= next_boss_score and not boss_active:
        start_boss()

# ---------- Boss-Level ----------
def start_boss():
    global boss, boss_active, boss_count, boss_hits, next_boss_score
    boss_active = True
    boss_count += 1
    boss_hits = 0
    next_boss_score += 20
    scene.set_background_color(2)
    scene.camera_shake(6, 1000)
    music.power_down.play()
    info.change_countdown_by(10)   # etwas Extra-Zeit für den Kampf
    boss = sprites.create(img("""
        . . f . . . . . . . . . . f . .
        . f 2 f . . . . . . . . f 2 f .
        . f 2 2 f f f f f f f f 2 2 f .
        . . f 2 2 2 2 2 2 2 2 2 2 f . .
        . f 2 2 2 2 2 2 2 2 2 2 2 2 f .
        . f 2 5 5 2 2 2 2 2 2 5 5 2 f .
        . f 2 5 f 5 2 2 2 2 5 f 5 2 f .
        . f 2 2 5 5 2 2 2 2 5 5 2 2 f .
        . f 2 2 2 2 2 2 2 2 2 2 2 2 f .
        . f 2 2 f 1 f 1 f 1 f 1 f 2 f .
        . f 2 2 f f f f f f f f f 2 f .
        . f 2 2 2 2 2 2 2 2 2 2 2 2 f .
        . f 2 2 2 2 2 2 2 2 2 2 2 2 f .
        . f 2 f 2 2 f 2 2 f 2 2 f 2 f .
        . f f . f f . f f . f f . f f .
        . . . . . . . . . . . . . . . .
    """), SpriteKind.Boss)
    boss.scale = 2
    # Boss erscheint auf der anderen Seite, nicht in einer Wand
    place_boss_far(boss)
    # Jeder Boss ist schneller, aber nie schneller als die Grenze
    boss.follow(player_sprite, Math.min(20 + boss_count * 10, DIFF_BOSS_MAX_SPEED[difficulty]))
    boss.say_text("0/" + str(BOSS_PIZZAS))
    player_sprite.say_text("BOSS " + str(boss_count) + "! Iss " + str(BOSS_PIZZAS) + " Pizzas!", 2500)

# Setzt den Boss auf die Seite, die weit weg vom Spieler ist
def place_boss_far(b: Sprite):
    global boss_last_x, boss_last_y
    if player_sprite.x < 80:
        x = 140
    else:
        x = 20
    b.set_position(x, randint(20, 100))
    tries = 0
    while touches_wall(b) and tries < 30:
        b.set_position(x, randint(20, 100))
        tries += 1
    boss_last_x = b.x
    boss_last_y = b.y

def defeat_boss():
    global boss_active
    boss_active = False
    boss.destroy(effects.disintegrate, 500)
    for p in sprites.all_of_kind(SpriteKind.projectile):
        p.destroy()
    scene.set_background_color(world_colors[world % len(world_colors)])
    music.power_up.play()
    effects.confetti.start_screen_effect(2000)
    player_sprite.say_text("Boss besiegt!", 1500)
    # Belohnung
    info.change_score_by(5)
    info.change_countdown_by(10)
    if info.life() < MAX_LIFE:
        info.change_life_by(1)

# Boss schießt jede Sekunde Feuerbälle auf den Spieler
def shoot(vx: number, vy: number):
    sprites.create_projectile_from_sprite(img("""
        . 4 4 .
        4 5 5 4
        4 5 5 4
        . 4 4 .
    """), boss, vx, vy)

def on_boss_shoot():
    global boss_shot_tick
    if boss_active:
        boss_shot_tick += 1
        if boss_shot_tick % DIFF_BOSS_SHOT_TICKS[difficulty] != 0:
            return
        dx = player_sprite.x - boss.x
        dy = player_sprite.y - boss.y
        dist = Math.max(1, Math.sqrt(dx * dx + dy * dy))
        shot_speed = Math.min(40 + boss_count * 10, 60 + difficulty * 20)
        vx = dx / dist * shot_speed
        vy = dy / dist * shot_speed
        shoot(vx, vy)
        # Ab einem bestimmten Boss: zusätzlich zwei schräge Schüsse
        if boss_count >= DIFF_TRIPLE_FROM_BOSS[difficulty]:
            shoot(vx - vy * 0.4, vy + vx * 0.4)
            shoot(vx + vy * 0.4, vy - vx * 0.4)
game.on_update_interval(500, on_boss_shoot)

# ---------- Pizza gegessen ----------
def on_eat_pizza(sprite, other_sprite):
    global boss_hits
    info.change_score_by(1)
    info.change_countdown_by(2)   # +2 Sekunden pro Pizza
    music.ba_ding.play()
    other_sprite.start_effect(effects.confetti, 300)
    place_free(other_sprite)
    # Im Boss-Level zählt jede Pizza gegen den Boss
    if boss_active:
        boss_hits += 1
        boss.say_text(str(boss_hits) + "/" + str(BOSS_PIZZAS))
        if boss_hits >= BOSS_PIZZAS:
            defeat_boss()
    check_progress()
sprites.on_overlap(SpriteKind.player, SpriteKind.food, on_eat_pizza)

# ---------- Wände: nicht durchlaufen ----------
def on_update():
    global last_x, last_y, ghost_last_x, ghost_last_y, player_slowed, ghost_slowed
    global boss_last_x, boss_last_y
    # Schlamm-Zeit vorbei? -> wieder normal schnell
    if player_slowed and game.runtime() > player_slow_until:
        player_slowed = False
        apply_speeds()
        player_sprite.say_text("Wieder schnell!", 800)
    if ghost_slowed and game.runtime() > ghost_slow_until:
        ghost_slowed = False
        apply_speeds()
    # Spieler
    if touches_wall(player_sprite):
        push_out_of_wall(player_sprite, last_x, last_y)
    last_x = player_sprite.x
    last_y = player_sprite.y
    # Geist
    if touches_wall(ghost):
        push_out_of_wall(ghost, ghost_last_x, ghost_last_y)
    ghost_last_x = ghost.x
    ghost_last_y = ghost.y
    # Boss
    if boss_active:
        if touches_wall(boss):
            push_out_of_wall(boss, boss_last_x, boss_last_y)
        boss_last_x = boss.x
        boss_last_y = boss.y
game.on_update(on_update)

# ---------- Geist erwischt dich ----------
def on_hit_ghost(sprite, other_sprite):
    global ghost_last_x, ghost_last_y
    info.change_life_by(-1)
    music.zapped.play()
    scene.camera_shake(4, 500)
    # Geist in eine Ecke zurücksetzen, weit weg vom Spieler
    if sprite.x < 80:
        other_sprite.set_position(150, randint(10, 110))
    else:
        other_sprite.set_position(10, randint(10, 110))
    # Am Rand stehen nie Wände, trotzdem neue Position merken
    ghost_last_x = other_sprite.x
    ghost_last_y = other_sprite.y
sprites.on_overlap(SpriteKind.player, SpriteKind.enemy, on_hit_ghost)

# ---------- Boss erwischt dich ----------
def on_hit_boss(sprite, other_sprite):
    info.change_life_by(-1)
    music.zapped.play()
    scene.camera_shake(6, 500)
    # Boss auf die andere Seite zurücksetzen
    place_boss_far(other_sprite)
sprites.on_overlap(SpriteKind.player, SpriteKind.Boss, on_hit_boss)

# ---------- Feuerball trifft dich ----------
def on_hit_fireball(sprite, other_sprite):
    info.change_life_by(-1)
    music.zapped.play()
    scene.camera_shake(3, 300)
    other_sprite.destroy()
sprites.on_overlap(SpriteKind.player, SpriteKind.projectile, on_hit_fireball)

# Feuerbälle bleiben an Wänden hängen -> Wände sind Deckung
def on_fireball_wall(sprite, other_sprite):
    sprite.destroy(effects.ashes, 100)
sprites.on_overlap(SpriteKind.projectile, SpriteKind.Wall, on_fireball_wall)

# ---------- Goldene Bonus-Pizza ----------
def on_spawn_bonus():
    bonus = sprites.create(img("""
        . . . . . . 5 5 5 5 . . . . . .
        . . . . 5 5 4 4 4 4 5 5 . . . .
        . . . 5 4 4 5 5 5 5 4 4 5 . . .
        . . 5 4 5 5 1 5 5 5 5 5 4 5 . .
        . 5 4 5 5 1 5 5 5 5 5 5 5 4 5 .
        . 5 4 5 5 5 5 5 5 5 5 5 5 4 5 .
        5 4 5 5 5 5 5 5 5 5 5 5 5 5 4 5
        5 4 5 5 5 5 5 5 5 5 5 5 5 5 4 5
        5 4 5 5 5 5 5 5 5 5 5 5 5 5 4 5
        5 4 5 5 5 5 5 5 5 5 5 5 5 5 4 5
        . 5 4 5 5 5 5 5 5 5 5 5 5 4 5 .
        . 5 4 5 5 5 5 5 5 5 5 5 5 4 5 .
        . . 5 4 5 5 5 5 5 5 5 5 4 5 . .
        . . . 5 4 4 5 5 5 5 4 4 5 . . .
        . . . . 5 5 4 4 4 4 5 5 . . . .
        . . . . . . 5 5 5 5 . . . . . .
    """), SpriteKind.Bonus)
    place_free(bonus)
    bonus.lifespan = 3000
    bonus.start_effect(effects.halo, 3000)
game.on_update_interval(8000, on_spawn_bonus)

def on_eat_bonus(sprite, other_sprite):
    info.change_score_by(3)
    info.change_countdown_by(5)   # +5 Sekunden
    music.magic_wand.play()
    other_sprite.destroy(effects.fire, 200)
    check_progress()
sprites.on_overlap(SpriteKind.player, SpriteKind.Bonus, on_eat_bonus)

# ---------- Herz: Extra-Leben ----------
def on_spawn_heart():
    # Nur wenn nicht schon volle Leben
    if info.life() < MAX_LIFE:
        heart = sprites.create(img("""
            . . . . . . . . . . . . . . . .
            . . f f f f . . . . f f f f . .
            . f 2 2 2 2 f . . f 2 2 2 2 f .
            f 2 2 1 1 2 2 f f 2 2 2 2 2 2 f
            f 2 1 2 2 2 2 2 2 2 2 2 2 2 2 f
            f 2 2 2 2 2 2 2 2 2 2 2 2 2 2 f
            f 2 2 2 2 2 2 2 2 2 2 2 2 2 2 f
            . f 2 2 2 2 2 2 2 2 2 2 2 2 f .
            . . f 2 2 2 2 2 2 2 2 2 2 f . .
            . . . f 2 2 2 2 2 2 2 2 f . . .
            . . . . f 2 2 2 2 2 2 f . . . .
            . . . . . f 2 2 2 2 f . . . . .
            . . . . . . f 2 2 f . . . . . .
            . . . . . . . f f . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
        """), SpriteKind.Heart)
        place_free(heart)
        heart.lifespan = 4000
game.on_update_interval(15000, on_spawn_heart)

def on_eat_heart(sprite, other_sprite):
    info.change_life_by(1)
    music.power_up.play()
    other_sprite.destroy(effects.hearts, 300)
    sprite.say_text("+1 Leben!", 800)
sprites.on_overlap(SpriteKind.player, SpriteKind.Heart, on_eat_heart)

# ---------- Schlamm: macht langsam ----------
def on_spawn_mud():
    mud = sprites.create(img("""
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . e e e e e e . . . . .
        . . . e e e e e e e e e e . . .
        . . e e e f e e e e e e e e . .
        . e e e e e e e e e f e e e e .
        . e e e e e e e f e e e e e e .
        e e e f e e e e e e e e e f e e
        e e e e e e e e e e e e e e e e
        . e e e e e f e e e e e e e e .
        . . e e e e e e e e e f e e . .
        . . . e e e e e e e e e e . . .
        . . . . . e e e e e e . . . . .
        . . . . . . . . . . . . . . . .
    """), SpriteKind.Mud)
    place_free(mud)
    mud.lifespan = 5000
game.on_update_interval(12000, on_spawn_mud)

# Spieler läuft durch Schlamm -> nur der Spieler wird langsam
def on_player_in_mud(sprite, other_sprite):
    global player_slowed, player_slow_until
    player_slowed = True
    player_slow_until = game.runtime() + SLOW_TIME
    apply_speeds()
    music.wawawawaa.play()
    other_sprite.destroy(effects.bubbles, 300)
    sprite.say_text("Schlamm!", 800)
sprites.on_overlap(SpriteKind.player, SpriteKind.Mud, on_player_in_mud)

# Geist fliegt durch Schlamm -> nur der Geist wird langsam
def on_ghost_in_mud(sprite, other_sprite):
    global ghost_slowed, ghost_slow_until
    ghost_slowed = True
    ghost_slow_until = game.runtime() + SLOW_TIME
    apply_speeds()
    other_sprite.destroy(effects.bubbles, 300)
    sprite.say_text("Iiih!", 800)
sprites.on_overlap(SpriteKind.enemy, SpriteKind.Mud, on_ghost_in_mud)

# ---------- 67-Party: bunter Hintergrund ----------
def on_party_colors():
    if party_done:
        if game.runtime() < party_until:
            scene.set_background_color(randint(1, 14))
        elif game.runtime() < party_until + 200:
            # Party vorbei -> wieder die Farbe der aktuellen Welt (im Boss-Level rot)
            if boss_active:
                scene.set_background_color(2)
            else:
                scene.set_background_color(world_colors[world % len(world_colors)])
game.on_update_interval(150, on_party_colors)
