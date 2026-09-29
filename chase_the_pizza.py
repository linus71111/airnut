# ============================================================
#  Chase the Pizza - MakeCode Arcade (Python)
#  Einfügen unter: https://arcade.makecode.com  ->  Neues Projekt
#  -> oben auf "Python" umschalten -> alles ersetzen -> Play
#
#  Extras gegenüber dem Original-Tutorial (alles auch mit Blöcken machbar):
#   - Startbildschirm mit Anleitung
#   - Figur bleibt im Bildschirm
#   - 3 Leben + Geist, der dich verfolgt
#   - Sound + Effekte beim Pizza-Essen
#   - Alle 5 Punkte: Level up (du und der Geist werden schneller)
#   - Goldene Bonus-Pizza (3 Punkte), die nach 3 Sekunden verschwindet
#   - Kamera wackelt, wenn der Geist dich erwischt
# ============================================================

@namespace
class SpriteKind:
    Bonus = SpriteKind.create()

# ---------- Variablen ----------
level = 1
speed = 100
ghost_speed = 30

# ---------- Start ----------
scene.set_background_color(7)
game.splash("Chase the Pizza!", "Pfeiltasten: bewegen")
game.splash("Iss Pizza, meide den Geist!", "Gold-Pizza = 3 Punkte")

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
pizza.set_position(randint(10, 150), randint(10, 110))

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

# ---------- Pizza gegessen ----------
def on_eat_pizza(sprite, other_sprite):
    global level, speed, ghost_speed
    info.change_score_by(1)
    music.ba_ding.play()
    other_sprite.start_effect(effects.confetti, 300)
    other_sprite.set_position(randint(10, 150), randint(10, 110))
    # Alle 5 Punkte: Level up
    if info.score() % 5 == 0:
        level += 1
        speed += 15
        ghost_speed += 10
        controller.move_sprite(player_sprite, speed, speed)
        ghost.follow(player_sprite, ghost_speed)
        music.power_up.play()
        player_sprite.say_text("Level " + str(level) + "!", 1000)
sprites.on_overlap(SpriteKind.player, SpriteKind.food, on_eat_pizza)

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
    bonus.set_position(randint(10, 150), randint(10, 110))
    bonus.lifespan = 3000
    bonus.start_effect(effects.halo, 3000)
game.on_update_interval(8000, on_spawn_bonus)

def on_eat_bonus(sprite, other_sprite):
    info.change_score_by(3)
    music.magic_wand.play()
    other_sprite.destroy(effects.fire, 200)
sprites.on_overlap(SpriteKind.player, SpriteKind.Bonus, on_eat_bonus)
