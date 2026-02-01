
# Requirements Document: Guddan's Parking Parikhya

## 1. Project Overview

**Game Title:** Guddan's Parking Parikhya (Guddan's Parking Exam)
**Platform:** Web (HTML5/Canvas) - To be deployed on GitHub Pages.
**Tech Stack:** Vanilla JavaScript, HTML, CSS (Single file preferred for simplicity).
**Genre:** Top-down "Rage-bait" Driving & Logic Game.
**Core Loop:** The player drives a slippery car, blasts obstacles with a horn, collects 3 specific items to unlock the parking spot, and parks while avoiding "Chaos Mode" (control reversal).

## 2. Gameplay Mechanics

### A. Car Physics (The "Rage" Factor)

* **Drift Physics:** The car should feel like it is driving on butter or ice. High inertia, low friction.
* **Movement:** Up (Gas), Down (Reverse), Left/Right (Steer).
* **Collision:** Touching *any* wall or static obstacle results in an instant "Crash" (Reset position).

### B. The "Chaos Mode"

* **Trigger:** Every 5 to 10 seconds (random interval).
* **Effect:** Left and Right steering controls swap.
* **Duration:** Lasts for 3-5 seconds.
* **UI Indicator:** A flashing red warning text appears on screen.

### C. Mission: The Collection Phase

The parking spot is initially **LOCKED** (visualized by a padlock icon). The player must collect 3 items scattered around the map to unlock it:

1. **The Kitten:** (Emoji: 🐱) - Reference to "Save the Kitten".
2. **The Treat:** (Emoji: 🍫 or 💄) - Chocolate or Lipstick.
3. **The Key:** (Emoji: 🔑) - Unlocks the spot.

* **Penalty:** If the player crashes, they *drop* the last collected item and must retrieve it again.

### D. The "Honk Blaster" (Shooter Mechanic)

* **Action:** Pressing `SPACE` (or a "Honk" button on mobile) fires a sound wave cone in front of the car.
* **Targets:** "Bad Vibes" (Angry Emoji 😡) that float randomly across the road.
* **Interaction:** If a Bad Vibe touches the car -> Crash. If the Honk Wave hits the Bad Vibe -> It pops/disappears.

### E. Static Obstacles (The "Indian Road")

* **The Holy Cow:** (Emoji: 🐄) - Stationary obstacle. Hitting it causes a crash.
* **The Judging Uncle:** (Emoji: 👴) - Stationary obstacle near the parking spot.
* **Potholes:** (Dark circle on road) - Driving over them spins the car uncontrollably for 1 second.

## 3. User Interface (UI) & UX

### Visual Style

* **Theme:** Cute but chaotic. Bright colors (Hot Pink car, Asphalt grey road).
* **Font:** Playful, comic-style font (e.g., 'Comic Sans MS' or similar).
* **Mobile Responsiveness:**
* Must have on-screen D-Pad (Left/Right) and Gas/Brake buttons.
* Must have a dedicated "HONK" button.



### HUD Elements

1. **Collection Bar:** Shows 3 slots for the Kitten, Treat, and Key. Slots light up as items are collected.
2. **Chaos Warning:** A large, flashing text overlay: *"Aye Bhokua! (Controls Swapped)"*.
3. **Win Screen:** A modal overlay with confetti, birthday wishes, and a "Play Again" button.

## 4. Localization (Odia Text Scripts)

The game must use the following strings for specific events. Use English characters for readability.

| Event | Text Displayed | Context |
| --- | --- | --- |
| **Crash (Generic)** | *"Dhire chala!"* | "Drive slowly!" |
| **Crash (Into Wall)** | *"Kan Karuchu?!"* | "What are you doing?!" |
| **Crash (Into Cow)** | *"Arey! Gai ku badhei dela!"* | "Hey! You hit the cow!" |
| **Crash (Into Uncle)** | *"Eita kana driving?"* | "Is this driving?" |
| **Chaos Mode Starts** | *"Aye Bhokua!"* | "You Fool!" (Affectionate/Funny) |
| **Chaos Mode Ends** | *"Thik Achhi"* | "It's okay now" |
| **Honk Action** | *"Hato!"* | "Move!" (Visual text pops up) |
| **Parking Spot** | *"Eithi Rakha"* | "Park Here" |
| **Win Message** | *"Janmadina Ra Hardhika Shubhechha!"* | "Heartfelt Birthday Wishes!" |

## 5. Technical Implementation Details for Copilot

1. **Single File:** Generate the code as a single `index.html` file containing HTML, CSS, and JS.
2. **Assets:** DO NOT use external image files (png/jpg). Use **Emojis** as sprites for the Car, Cow, Kitten, Uncle, and Items. This ensures the game works immediately without broken image links.
3. **Canvas:** Use HTML5 Canvas for the game loop and rendering.
4. **Audio:** Use simple synthesized beeps (Oscillators) for the "Honk" and "Crash" sounds if possible, to avoid external dependencies.
5. **Logic:**
* Implement a `update()` and `draw()` loop.
* Use simple rectangular bounding box collision detection.
* Ensure touch events are handled for mobile play.