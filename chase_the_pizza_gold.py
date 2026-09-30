# ============================================================
#  Chase the Pizza - Basis-Spiel + Extra-Zeit + Gold-Pizza
#  Einfügen unter: https://arcade.makecode.com  ->  Neues Projekt
#  -> oben auf "Python" umschalten -> alles ersetzen -> Play
#
#  Mit den Pfeiltasten die Figur bewegen und so viele Pizzas wie
#  möglich einsammeln. Jede Pizza gibt +2 Sekunden.
#  Gold-Pizza: 3 Punkte + 3 Sekunden, verschwindet nach 3 Sekunden.
# ============================================================

# ---------- Eigene Sprite-Art für die Gold-Pizza ----------
@namespace
class SpriteKind:
    Gold = SpriteKind.create()

# ---------- Pizza gegessen: Punkt + Pizza an neue Stelle ----------
def on_on_overlap(sprite, otherSprite):
    info.change_score_by(1)
    info.change_countdown_by(2)
    otherSprite.set_position(randint(0, 160), randint(0, 120))
sprites.on_overlap(SpriteKind.player, SpriteKind.food, on_on_overlap)

# ---------- Hintergrund ----------
scene.set_background_color(7)

# ---------- Spieler ----------
mySprite = sprites.create(img("""
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
controller.move_sprite(mySprite)

# ---------- Pizza ----------
myFood = sprites.create(img("""
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
myFood.set_position(randint(0, 160), randint(0, 120))

# ---------- Zeit: 10 Sekunden ----------
info.start_countdown(10)

# ---------- Alle 5 Sekunden erscheint eine Gold-Pizza ----------
def on_update_interval():
    gold = sprites.create(img("""
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
    """), SpriteKind.Gold)
    gold.set_position(randint(10, 150), randint(10, 110))
    gold.lifespan = 3000
    gold.start_effect(effects.halo, 3000)
game.on_update_interval(5000, on_update_interval)

# ---------- Gold-Pizza eingesammelt ----------
def on_gold_overlap(sprite, otherSprite):
    info.change_score_by(3)
    info.change_countdown_by(3)
    music.ba_ding.play()
    otherSprite.destroy(effects.fire, 200)
sprites.on_overlap(SpriteKind.player, SpriteKind.Gold, on_gold_overlap)
