# ============================================================
#  Chase the Pizza - Basis-Spiel (wie im MakeCode-Arcade-Tutorial)
#  Einfügen unter: https://arcade.makecode.com  ->  Neues Projekt
#  -> oben auf "Python" umschalten -> alles ersetzen -> Play
#
#  Mit den Pfeiltasten die Figur bewegen und in 10 Sekunden
#  so viele Pizzas wie möglich einsammeln.
# ============================================================

# ---------- Pizza gegessen: Punkt + Pizza an neue Stelle ----------
def on_on_overlap(sprite, otherSprite):
    info.change_score_by(1)
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
