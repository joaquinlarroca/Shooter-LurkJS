import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { drawPointers, isClicking, isHovering, keyPressed, mouse, pointers } from "./src/js/listeners.js";
import { button, camera, hitbox, hitboxCircleFixed, hitboxFixed, object, slider, sliderv } from "./src/js/classes.js";
import { loadFont, loadImage } from "./src/js/loader.js";
import { setup, clear, drawtext, shakeScreen, lerp } from "./src/js/functions.js";
import { animatePlayer, player } from "./player.js";
import { map } from "./map.js";
import { ParticleGenerator } from "./src/plugins/particles/particles.js";

import { bullets, gun, gunDraw, gunUpdate, shoot, reload, switchGun, drawBullets, updateBullets } from "./guns.js"

//import "./src/plugins/gui/gui.js"
import { ui } from "./ui.js";
import { chunker, chunker_config } from "./chunker.js";
import { bullet_decay, drawBulletDecay, updateEntities } from "./entities.js";
import { crosshair, crosshairAngle, updateCrosshair } from "./crosshair.js";


await setup(1920, 1080, 0.99, 60);

export let partGen = new ParticleGenerator(969, 540, 2, 16, "rgba(255,255,255,0.25)", 0, 0, 1500, 1e-75)

window.addEventListener("started", () => {
})
window.addEventListener("update", () => {
    clear()

    // #############
    // MAP
    // #############
    ctx.save()
    ctx.translate(-map.x, -map.y)

    map.object.draw()

    drawBulletDecay()
    drawBullets()

    ctx.restore()
    // #############
    // END
    // #############
    animatePlayer();
    player.draw()

    //player.hitboxes[1].x = player.x
    //player.hitboxes[1].y = player.y + player.height * 0.5
    //player.hitboxes[1].draw()

    gunDraw()



    // #############
    // MAP
    // #############
    ctx.save()
    ctx.translate(-map.x, -map.y)

    partGen.draw()


    ctx.restore()
    // #############
    // END
    // #############
    //chunker.updateHitboxes()
    //chunker.drawChunkHitbox()
    //chunker.drawChunk()

    crosshair.draw()
    ui.weapon_info.draw()

    if (keyPressed("q") || ui.weapon_selector.active) {
        mouse.show = true;
        ui.weapon_selector.draw()
    }
    else {
        mouse.show = false
    }
    drawtext("World: " + (map.x + mouse.x).toFixed(0) + ", " + (map.y + mouse.y).toFixed(0), [0, 0], 24, "sans-serif", "top", "start", 0, 1.0)
    drawtext("Player: " + (map.x + mouse.x - screen.canvas.width / 2).toFixed(0) + ", " + (map.y + mouse.y - screen.canvas.height / 2).toFixed(0), [0, 24], 24, "sans-serif", "top", "start", 0, 1.0)
    drawtext("Chunk: " + (((chunker.chunk.x * chunker_config["size"]) + mouse.x - screen.canvas.width / 2 + player.halfwidth) % chunker_config["size"]).toFixed(0) + ", " + (((chunker.chunk.y * chunker_config["size"]) + mouse.y - screen.canvas.height / 2 + player.halfheight) % chunker_config["size"]).toFixed(0), [0, 48], 24, "sans-serif", "top", "start", 0, 1.0)
});

window.addEventListener("fixedUpdate", () => {
    partGen.update()
    // ############################
    //CHUNKER
    // ############################
    chunker.updatePos()
    chunker.updateHitboxes()
    if (chunker.exists(chunker.chunk.trunc.x, chunker.chunk.trunc.y) == true) {
        chunker.updateActiveChunks()
        for (let i = 0; i < chunker.activeChunks.length; i++) {
            var y = chunker.activeChunks[i][0]
            var x = chunker.activeChunks[i][1]

            for (let l = 0; l < chunker_config["maps"][chunker.map][y][x].length; l++) {
                const hitbox = chunker_config["maps"][chunker.map][y][x][l];
                // BULLET COLLISION
                bullets.forEach((bullet, index) => {
                    bullet.x -= map.x
                    bullet.y -= map.y
                    let hitted = false
                    let per = 0
                    let savedPOS = { x: 0, y: 0 }
                    while (per < 1) {
                        per += 0.1
                        bullet.x += bullet.vel.x * time.deltaTime * time.scale * per
                        bullet.y += bullet.vel.y * time.deltaTime * time.scale * per
                        if (bullet.hitboxes[1].collide(hitbox)) {
                            hitted = true
                            savedPOS = { x: bullet.x, y: bullet.y }
                            break
                        }
                        bullet.x -= bullet.vel.x * time.deltaTime * time.scale * per
                        bullet.y -= bullet.vel.y * time.deltaTime * time.scale * per
                    }
                    if (hitted) {
                        bullet.vel.x = 0
                        bullet.vel.y = 0
                        bullets.splice(index, 1)
                        bullet.toDelete = true
                        new bullet_decay(image[`${bullet.type}bullet`], savedPOS.x, savedPOS.y, bullet.width, bullet.height, bullet.angle + (Math.random() - 0.5) * 22.5)
                    }

                    bullet.x += map.x
                    bullet.y += map.y
                })
                // PLAYER COLLISION
                const dir = {
                    x: Math.sign((hitbox.x + hitbox.width / 2) - player.x - player.halfwidth),
                    y: Math.sign((hitbox.y + hitbox.height / 2) - player.y - player.halfheight)
                }
                player.hitboxes[1].x = player.x
                player.hitboxes[1].y = player.y + player.height * 0.5

                if (player.hitboxes[1].collide(hitbox)) {
                    player.hitboxes[1].y += player.halfheight / 2;
                    player.hitboxes[1].height -= player.halfheight;
                    while (player.hitboxes[1].collide(hitbox)) {
                        map.x -= dir.x;
                        chunker.updateHitboxes();
                    }
                    player.hitboxes[1].y -= player.halfheight / 2;
                    player.hitboxes[1].height += player.halfheight;
                    map.vel.x = lerp(map.vel.x, 0, (1 ** time.fixedDeltaTime) * time.scale * 0.2)
                }
                if (player.hitboxes[1].collide(hitbox)) {

                    while (player.hitboxes[1].collide(hitbox)) {
                        map.y -= dir.y;
                        chunker.updateHitboxes();
                    }

                    map.vel.y = 0
                }
            }
        }
    }

    // ############################
    // GUNS
    // ############################
    updateBullets()
    gunUpdate()
    if (!ui.weapon_selector.active) {
        updateCrosshair();
    }
    if (mouse.click) {
        shoot(gun.equiped, gun.angle)
    }

    if (keyPressed("r") && gun.mag.current < gun.mag.max) {
        reload(gun.equiped)
    }

    // ############################
    // ENTITIES
    // ############################
    updateEntities()

    // ############################
    // UI
    // ############################
    if (keyPressed("q") || ui.weapon_selector.active) {
        ui.weapon_selector.update()
    }
    if (!ui.weapon_selector.active) {
        if (keyPressed("n")) {
            time.scale = lerp(time.scale, 0.5, (1 ** time.fixedDeltaTime) * 0.1)
        }
        else {
            time.scale = lerp(time.scale, 1, (1 ** time.fixedDeltaTime) * 0.1)
        }
    }


    // ############################
    // MAP
    // ############################
    map.vector.x = keyPressed("a") - keyPressed("d");
    map.vector.y = keyPressed("w") - keyPressed("s");

    if (map.vector.x != 0 && map.vector.y != 0) {
        map.currentVelocity = 0.707106781187 * map.velocity;
    }
    else {
        map.currentVelocity = map.velocity;
    }
    if (map.vector.x == 1) {
        map.vel.x -= map.currentVelocity * time.fixedDeltaTime * time.scale;
    }
    if (map.vector.x == -1) {
        map.vel.x += map.currentVelocity * time.fixedDeltaTime * time.scale;
    }

    if (map.vector.y == 1) {
        map.vel.y -= map.currentVelocity * time.fixedDeltaTime * time.scale;
    }

    if (map.vector.y == -1) {
        map.vel.y += map.currentVelocity * time.fixedDeltaTime * time.scale;
    }


    map.vel.x *= Math.pow(0.03, time.fixedDeltaTime);
    map.vel.y *= Math.pow(0.03, time.fixedDeltaTime);

    map.x += map.vel.x * time.fixedDeltaTime * time.scale;
    map.y += map.vel.y * time.fixedDeltaTime * time.scale;


    map.x = Math.round(Math.max(Math.min(map.x, map.max.x), map.min.x));
    map.y = Math.round(Math.max(Math.min(map.y, map.max.y), map.min.y));
})
