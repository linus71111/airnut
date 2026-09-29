# ============================================================
#  Chase the Pizza - MakeCode Arcade (Python)
#  Einfügen unter: https://arcade.makecode.com  ->  Neues Projekt
#  -> oben auf "Python" umschalten -> alles ersetzen -> Play
#
#  Extras gegenüber dem Original-Tutorial (alles auch mit Blöcken machbar):
#   - Startbildschirm mit Anleitung
#   - Figur bleibt im Bildschirm
#   - 3 Leben + Geist, der dich verfolgt (Geister fliegen durch Wände!)
#   - Sound + Effekte beim Pizza-Essen
#   - Alle 5 Punkte: Level up (du und der Geist werden schneller,
#     aber nur bis zu einer Höchstgeschwindigkeit)
#   - Alle 10 Punkte: neue Welt - andere Farbe + neue Wände,
#     durch die man nicht laufen kann
#   - Jede Pizza gibt Extra-Zeit, damit es nie unmöglich wird
#   - Goldene Bonus-Pizza (3 Punkte + Zeit), verschwindet nach 3 Sekunden
#   - Herz: gibt ein Extra-Leben, verschwindet nach 4 Sekunden
#   - Kamera wackelt, wenn der Geist dich erwischt
# ============================================================

@namespace
class SpriteKind:
    Bonus = SpriteKind.create()
    Wall = SpriteKind.create()
    Heart = SpriteKind.create()

# ---------- Variablen ----------
level = 1
world = 0
speed = 100
ghost_speed = 30
next_level_score = 5
next_world_score = 10
last_x = 80
last_y = 60
MAX_SPEED = 160
MAX_GHOST_SPEED = 70
MAX_WALLS = 5
MAX_LIFE = 5
world_colors = [7, 9, 6, 13, 11, 3]

# ---------- Start ----------
scene.set_background_color(7)
game.splash("Chase the Pizza!", "Pfeiltasten: bewegen")
game.splash("Iss Pizza, meide den Geist!", "Alle 10 Punkte: neue Wände")

# ---------- Spieler ----------
player_sprite = sprites.create(img("""
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
"""), SpriteKind.player)
controller.move_sprite(player_sprite, speed, speed)
player_sprite.set_stay_in_screen(True)

# ---------- Hilfsfunktionen für Wände ----------
def touches_wall(s: Sprite):
    for w in sprites.all_of_kind(SpriteKind.Wall):
        if s.overlaps_with(w):
            return True
    return False

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
info.set_life(3)
info.start_countdown(30)

# ---------- Neue Welt: Farbe wechseln + Wände neu bauen ----------
def build_world():
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
        wall.set_position(randint(20, 140), randint(20, 100))
        # Nie direkt auf dem Spieler bauen
        tries = 0
        while wall.overlaps_with(player_sprite) and tries < 30:
            wall.set_position(randint(20, 140), randint(20, 100))
            tries += 1
    place_free(pizza)
    music.power_up.play()
    player_sprite.say_text("Welt " + str(world + 1) + "!", 1500)

# ---------- Fortschritt prüfen (Level + Welt) ----------
def check_progress():
    global level, world, speed, ghost_speed, next_level_score, next_world_score
    if info.score() >= next_level_score:
        next_level_score += 5
        level += 1
        speed = Math.min(speed + 10, MAX_SPEED)
        ghost_speed = Math.min(ghost_speed + 5, MAX_GHOST_SPEED)
        controller.move_sprite(player_sprite, speed, speed)
        ghost.follow(player_sprite, ghost_speed)
        player_sprite.say_text("Level " + str(level) + "!", 1000)
    if info.score() >= next_world_score:
        next_world_score += 10
        world += 1
        build_world()

# ---------- Pizza gegessen ----------
def on_eat_pizza(sprite, other_sprite):
    info.change_score_by(1)
    info.change_countdown_by(2)   # +2 Sekunden pro Pizza
    music.ba_ding.play()
    other_sprite.start_effect(effects.confetti, 300)
    place_free(other_sprite)
    check_progress()
sprites.on_overlap(SpriteKind.player, SpriteKind.food, on_eat_pizza)

# ---------- Wände: nicht durchlaufen ----------
def on_update():
    global last_x, last_y
    # Letzte freie Position merken
    if not touches_wall(player_sprite):
        last_x = player_sprite.x
        last_y = player_sprite.y
game.on_update(on_update)

def on_hit_wall(sprite, other_sprite):
    # Zurück an die letzte freie Position
    sprite.set_position(last_x, last_y)
sprites.on_overlap(SpriteKind.player, SpriteKind.Wall, on_hit_wall)

# ---------- Geist erwischt dich ----------
def on_hit_ghost(sprite, other_sprite):
    info.change_life_by(-1)
    music.zapped.play()
    scene.camera_shake(4, 500)
    # Geist in eine Ecke zurücksetzen, weit weg vom Spieler
    if sprite.x < 80:
        other_sprite.set_position(150, randint(10, 110))
    else:
        other_sprite.set_position(10, randint(10, 110))
sprites.on_overlap(SpriteKind.player, SpriteKind.enemy, on_hit_ghost)

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
