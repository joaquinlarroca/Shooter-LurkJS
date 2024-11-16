import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { drawPointers, isClicking, isHovering, keyPressed, mouse, pointers } from "./src/js/listeners.js";
import { button, camera, hitbox, hitboxCircleFixed, hitboxFixed, object, slider, sliderv } from "./src/js/classes.js";
import { loadFont, loadImage } from "./src/js/loader.js";
import { setup, clear, drawtext, shakeScreen, lerp, lerpAngle } from "./src/js/functions.js";
import { player } from "./player.js";
import { map } from "./map.js";
import { ParticleGenerator } from "./src/plugins/particles/particles.js";
import { localStoragePlugin } from "./src/plugins/localStorage/ls.js";
import { client } from "./socketManager.js";

import { bullets, gun, gunDraw, gunUpdate, shoot, reload, switchGun, drawBullets, updateBullets } from "./guns.js"

//import "./src/plugins/gui/gui.js"
import { ui } from "./ui.js";
import { chunker, chunker_config } from "./chunker.js";
import { bullet_decay, drawBulletDecay, updateEntities } from "./entities.js";
import { crosshair, crosshairAngle, updateCrosshair } from "./crosshair.js";

export let gameClient;
const urlParams = new URLSearchParams(window.location.search);

const errorValue = urlParams.get("error");

// ######################################################
// # screen connect                                     #
// ######################################################
const content = document.getElementById("con")
const connect = document.getElementById("connect")
const connect_input = document.getElementById("serverip")
const connect_btn = document.getElementById("connectbtn")
const connect_errordisplay = document.getElementById("connect_error")

if (errorValue) {
    connect_errordisplay.innerText = errorValue
}

let current_ip = localStoragePlugin.get("ip") || "127.0.0.1:443";
connect_input.value = current_ip
connect_btn.addEventListener("click", () => {
    connect_errordisplay.innerText = ""
    current_ip = localStoragePlugin.set("ip", connect_input.value)
    const ip = current_ip.split(":")
    gameClient = new client(ip[0], ip[1])
})

//! TO BE DELETED
//connect_errordisplay.innerText = ""
//current_ip = localStoragePlugin.set("ip", connect_input.value)
//const ip = current_ip.split(":")
//setTimeout(() => {
//    gameClient = new client(ip[0], ip[1])
//}, 100)

//! TO BE DELETED

// ######################################################
// # screen register                                    #
// ######################################################

const logreg = document.getElementById("logreg")
const eyeIcon = document.getElementById("showpass");
const passwordInput = document.getElementById('password');
const logregPing = document.getElementById("ping-logreg")
eyeIcon.addEventListener('mouseover', () => {
    passwordInput.type = 'text';
});
eyeIcon.addEventListener('mouseout', () => {
    passwordInput.type = 'password';
});

// ######################################################
// # SETUP AND LOOPS                                    #
// ######################################################
let GameScreen = "connect"
updateGameScreen(GameScreen)
function updateGameScreen(gamescreen) {
    GameScreen = gamescreen
    switch (gamescreen) {
        case "connect":
            global._disable_mouse_events = true;
            document.title = "Connect to a server"

            if (canvas.style.display != "none") {
                canvas.style.display = "none"
            }
            if (connect.style.display == "none") {
                connect.style.display = "flex"
            }
            break;
        case "logreg":
            global._disable_mouse_events = true;
            document.title = "Sign to server"


            if (connect.style.display != "none") {
                connect.style.display = "none"
            }


            if (logreg.style.display == "none") {
                logreg.style.display = "flex"
            }
            break;
        case "lobby":
            global._disable_mouse_events = false;
            document.title = "Lobby"

            if (connect.style.display != "none") {
                connect.style.display = "none"
            }
            if (canvas.style.display != "flex") {
                canvas.style.display = "flex"
            }
            if (logreg.style.display != "none") {
                logreg.style.display = "none"
            }
            break;
        case "game":
            global._disable_mouse_events = false;
            document.title = "Game"

            if (connect.style.display != "none") {
                connect.style.display = "none"
            }
            if (canvas.style.display != "flex") {
                canvas.style.display = "flex"
            }
            if (logreg.style.display != "none") {
                logreg.style.display = "none"
            }
            break;

        default:
            break;
    }
}
await setup(1920, 1080, 0.99, 60);

export let partGen = new ParticleGenerator(969, 540, 2, 16, "rgba(255,255,255,0.25)", 0, 0, 1500, 1e-75)

window.addEventListener("cwsconnected", () => {
    updateGameScreen("logreg")
})
window.addEventListener("cwsSignSucces", () => {
    updateGameScreen("lobby")
})
window.addEventListener("cwsGameSucces", () => {
    updateGameScreen("game")
})
window.addEventListener("started", () => {
})
window.addEventListener("update", () => {
    if (GameScreen == "logreg") {
        logregPing.innerText = `PING: ${gameClient.ping}`
    }
    if (GameScreen == "lobby") {
        clear()

        ctx.fillStyle = "rgba(17,17,17,1)"
        ctx.fillRect(0, 0, 1920, 1080)

        ui.lobby.draw()
        ctx.fillStyle = "rgb(255,255,255)"
        drawtext(`PING: ${gameClient.ping}ms`, [960, 32], 20, "sans-serif", "top", "center", 0, 1)
        drawtext(`FPS: ${global.fps}`, [960, 52], 20, "sans-serif", "top", "center", 0, 1)
        drawtext(mouse.x.toFixed(0) + ", " + mouse.y.toFixed(0), [0, 0], 20, "sans-serif", "top", "left", 0, 1)
    }
    if (GameScreen == "game") {

        clear()

        // #############
        // MAP
        // #############
        ctx.save()
        ctx.translate(-map.x, -map.y)

        map.object.draw()

        drawBulletDecay()
        drawBullets()

        for (const key in gameClient.other_players_list) {
            var p = gameClient.other_players_list[key]
            var oldP = gameClient.old_other_players_list[key] || p
            p.x = Number(p.x)
            p.y = Number(p.y)
            p.vx = 0 || Number(p.vx)
            p.vy = 0 || Number(p.vy)
            p.direction = Number(p.direction)


            p.x = lerp(oldP.x, p.x, (1 ** time.deltaTime) * 0.1)
            p.y = lerp(oldP.y, p.y, (1 ** time.deltaTime) * 0.1)

            //p.direction = lerp(oldP.direction, p.direction, (1 ** time.deltaTime))
            p.direction = lerpAngle(oldP.direction, p.direction, (1 ** time.deltaTime) * 0.5)

            p.x += p.vx * time.deltaTime * time.scale
            p.y += p.vy * time.deltaTime * time.scale

            p.x += 960 - player.halfwidth;
            p.y += 540 - player.halfheight;
            ctx.fillStyle = "rgba(255,255,255,1)"
            drawtext(p.name, [p.x + player.halfwidth, p.y - 20], 20, "sans-serif", "top", "center", 0, 1)

            ctx.fillStyle = "rgba(255,0,0,0.5)"
            ctx.drawImage(image["peperoni"], p.x, p.y, 85, 85)

            ctx.fillStyle = "rgba(255,255,255,1)"
            drawtext("██████", [p.x + 42.5, p.y + 42.5], 20, "sans-serif", "middle", "start", p.direction, 0.5)
            p.x -= 960 - player.halfwidth;
            p.y -= 540 - player.halfheight;


            gameClient.old_other_players_list[key] = { x: p.x, y: p.y, direction: p.direction }
        };

        ctx.restore()
        // #############
        // END
        // #############
        player.draw()

        //player.hitboxes[2].x = player.x + player.halfwidth
        //player.hitboxes[2].y = player.y  + player.halfheight
        //player.hitboxes[2].draw()

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
        chunker.updateHitboxes()
        chunker.drawChunkHitbox()
        chunker.drawChunk()

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
        drawtext("PING: " + gameClient.ping, [0, 1080 - 24], 24, "sans-serif", "top", "start", 0, 1.0)
    }

});

window.addEventListener("fixedUpdate", () => {
    if (GameScreen == "game") {
        partGen.update()
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
                        map.vel.x = 0
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
        gameClient.vx = map.vel.x
        gameClient.vy = map.vel.y
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
        


        map.vel.x *= Math.pow(0.03, time.fixedDeltaTime);
        map.vel.y *= Math.pow(0.03, time.fixedDeltaTime);

        map.x += map.vel.x * time.fixedDeltaTime * time.scale;
        map.y += map.vel.y * time.fixedDeltaTime * time.scale;


        map.x = Math.round(Math.max(Math.min(map.x, map.max.x), map.min.x));
        map.y = Math.round(Math.max(Math.min(map.y, map.max.y), map.min.y));
    }
})
let sendDAT = setInterval(() => {
    if (GameScreen == "game") {
        gameClient.send("receive_packet", { x: map.x.toFixed(3), y: map.y.toFixed(3), vx: gameClient.vx.toFixed(3), vy: gameClient.vy.toFixed(3), direction: gun.angle.toFixed(0) })
    }
}, 100)