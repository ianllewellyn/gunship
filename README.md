# gunship

Score points by shooting enemies.

Die when you are hit 3 times.

Kill 10 enemies to increase your score multiplier.

Multiplier is reset if an enemy escapes.

You can use your ship to hit an enemy to keep your multiplier.

before: 6,898 bytes
draw.js: 16431 > 6367
effects.js: 16431 > 6367
game_loop.js: 17161 > 6817

## must have

* Enemies: 2 circles (2 hits)
* Enemies: 3 circles (3 hits)

* Powerup: 5 round burst
* Powerup: Armour peircing
* Powerup: Fully auto
* Powerup: Faster rounds
* Powerup: Double damage

* Game: A start screen with controls etc
* Game: Pause button

## nice to have

* Code: Optimise app.update() to not loop through all enemies twice
* Code: Composit bitmap data instead of drawing vectors each frame
* Code: Make particle and bullets share code

* Ship: Smoke particles when damaged
* Ship: Limit the rotation of the cannon
* Ship: Make the ship bob up and down to show motion
* Ship: Have the cannon push the helicopter backwards when it fires
* Ship: Rotate the ship a little when it moves left/right
* Ship: Make smaller?

* Weapon: Homing rockets

* Game: Localstorage leaderboard
* Game: Sounds!!
* Game: Display total enemies killed on the Game Over screen
* Game: Display highest multiplier on the Game Over screen
* Game: Display bullets fired on the Game Over screen
* Game: Kill everything when your ship is hit?
* Game: Particles inflict damage on enemies? Not so sure they should
