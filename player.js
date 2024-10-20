import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { drawPointers, isClicking, isHovering, keyPressed, mouse, pointers } from "./src/js/listeners.js";
import { button, camera, hitbox, hitboxCircleFixed, hitboxFixed, object, slider, sliderv } from "./src/js/classes.js";
import { loadFont, loadImage } from "./src/js/loader.js";
import { setup, clear, drawtext, shakeScreen, lerp } from "./src/js/functions.js";

await loadImage("src/images/player/idle/0.png", "idle0");
await loadImage("src/images/player/idle/1.png", "idle1");
await loadImage("src/images/player/idle/2.png", "idle2");
await loadImage("src/images/player/idle/3.png", "idle3");
await loadImage("src/images/player/idle/4.png", "idle4");
await loadImage("src/images/player/idle/5.png", "idle5");
await loadImage("src/images/player/idle/6.png", "idle6");
await loadImage("src/images/player/idle/7.png", "idle7");

await loadImage("src/images/player/vertical/0.png", "vertical0");
await loadImage("src/images/player/vertical/1.png", "vertical1");
await loadImage("src/images/player/vertical/2.png", "vertical2");
await loadImage("src/images/player/vertical/3.png", "vertical3");
await loadImage("src/images/player/vertical/4.png", "vertical4");
await loadImage("src/images/player/vertical/5.png", "vertical5");
await loadImage("src/images/player/vertical/6.png", "vertical6");
await loadImage("src/images/player/vertical/7.png", "vertical7");

await loadImage("src/images/player/horizontal/0.png", "horizontal0");
await loadImage("src/images/player/horizontal/1.png", "horizontal1");
await loadImage("src/images/player/horizontal/2.png", "horizontal2");
await loadImage("src/images/player/horizontal/3.png", "horizontal3");
await loadImage("src/images/player/horizontal/4.png", "horizontal4");
await loadImage("src/images/player/horizontal/5.png", "horizontal5");
await loadImage("src/images/player/horizontal/6.png", "horizontal6");
await loadImage("src/images/player/horizontal/7.png", "horizontal7");

// player reason = 5
export let player = new object(image["conejo"], [0, 0], [60, 85])
player.hitboxes.push(new hitboxFixed([player.x, player.y + player.height / 2], [player.width, player.height / 2]))
player.frame = {
    x: 0,
    y: 0,
    idle: 0,
    frames: {
        idle: [0, 1, 2, 3, 4, 5, 6, 7],
    },
    definedInterval: {
        x: false,
        y: false,
        idle: false,
    }
};

window.addEventListener("started", () => {
    player.x = screen.canvas.width / 2 - player.width / 2
    player.y = screen.canvas.height / 2 - player.height / 2
})

export function animatePlayer() {
    if (time.scale > 0) {
        if (!player.frame.definedInterval.idle) {
            player.frame.definedInterval.idle = true
            setInterval(() => {
                player.frame.idle++;
                if (player.frame.idle >= 8) {
                    player.frame.idle = 0;
                }
            }, 95);
        }
        player.setTexture(image["idle" + player.frame.idle])

        const isMovingUp = keyPressed("w");
        const isMovingDown = keyPressed("s");
        const isMoving = isMovingUp || isMovingDown;
        if (isMoving) {
            player.scale = [1, 1];
            if (!player.frame.definedInterval.y) {
                player.frame.definedInterval.y = true;
                player.frame.y = 0;
                setInterval(() => player.frame.y = (player.frame.y + 1) % 8, 65);
            }
            player.setTexture(image["vertical" + player.frame.y]);
        } else {
            player.frame.y = 0;
        }


        const direction = keyPressed("a") ? -1 : keyPressed("d") ? 1 : 0;
        if (direction) {
            player.scale[0] = direction;
            if (!player.frame.definedInterval.x) {
                player.frame.definedInterval.x = true
                player.frame.x = 0;
                setInterval(() => player.frame.x = (player.frame.x + 1) % 8, 70);
            }
            player.setTexture(image["horizontal" + player.frame.x]);
        }
        else {
            player.frame.x = 0
        }

    }


}