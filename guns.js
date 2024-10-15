import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { drawPointers, isClicking, isHovering, keyPressed, mouse, pointers } from "./src/js/listeners.js";
import { button, camera, hitbox, hitboxCircleFixed, hitboxFixed, object, slider, sliderv, sound2, sound } from "./src/js/classes.js";
import { loadFont, loadImage, loadSound } from "./src/js/loader.js";
import { setup, clear, drawtext, shakeScreen, lerp, lerpAngle } from "./src/js/functions.js";
import { player } from "./player.js";
import { map } from "./map.js";
import { ui } from "./ui.js";
import { crosshair, crosshairAngle } from "./crosshair.js";


await loadImage("src/images/guns/rifle.png", "rifle");
await loadImage("src/images/guns/shotgun.png", "shotgun");
await loadImage("src/images/guns/revolver.png", "revolver");
await loadImage("src/images/guns/p90.png", "p90");
await loadImage("src/images/guns/silenced_pistol.png", "silenced_pistol");

await loadSound("./src/sounds/rifle.wav", "gun");
await loadSound("./src/sounds/shotgun.wav", "shotgun");
await loadSound("./src/sounds/p90.wav", "p90");

await loadImage("src/images/bullets/shell.png", "shellbullet");
await loadImage("src/images/bullets/medium.png", "mediumbullet");
await loadImage("src/images/bullets/small.png", "smallbullet");

export let gun = new object(image["gun"], [0, 0], [100, 32]);

let dvd = new sound("./src/sounds/rifle.wav", 1, 1, true);
dvd.play()

gun.switching = false;
gun.equiped = "p90"; // ARMA EQUIPADA
gun.mag = {
    max: 5,
    current: 500
}
gun.recoil = 0
gun.canShoot = true;
gun.reloading = false;
gun.bullet_types = {
    "shell": {
        width: 24,
        height: 12
    },
    "medium": {
        width: 24,
        height: 12
    },
    "small": {
        width: 12,
        height: 12
    }


}
// size reason = 4
gun.types = {
    "rifle": {
        image: image["rifle"],
        switch_time: 250,
        bullet_type: "medium",
        moving_angle_multiplier: 25,
        size: {
            width: 116,
            height: 48
        },
        damage: 20,
        hold_shot: true,
        mag_size: 25,
        reload_time: 1000,
        move: 60,
        dispersion: 5,
        time: 100,
        bullet_count: 1,
        recoil: 3,
        sound: new sound2("./src/sounds/rifle.wav", 1, 1)
    },
    "shotgun": {
        image: image["shotgun"],
        switch_time: 250,
        bullet_type: "shell",
        moving_angle_multiplier: 3,
        size: {
            width: 118,
            height: 48
        },
        damage: 10,
        hold_shot: false,
        mag_size: 5,
        reload_time: 1250,
        move: 55,
        dispersion: 15,
        time: 750,
        bullet_count: 3,
        recoil: 6,
        sound: new sound2("./src/sounds/shotgun.wav", 1, 0.5)
    },
    "p90": {
        image: image["p90"],
        switch_time: 300,
        bullet_type: "small",
        moving_angle_multiplier: 2,
        size: {
            width: 80,
            height: 48
        },
        damage: 8,
        hold_shot: true,
        mag_size: 20,
        reload_time: 1200,
        move: 52,
        dispersion: 10,
        time: 50,
        bullet_count: 1,
        recoil: 8,
        sound: new sound2("./src/sounds/p90.wav", 1, 1)
    },
    "revolver": {
        image: image["revolver"],
        switch_time: 300,
        bullet_type: "medium",
        moving_angle_multiplier: 2,
        size: {
            width: 80,
            height: 48
        },
        damage: 8,
        hold_shot: true,
        mag_size: 4,
        reload_time: 800,
        move: 65,
        dispersion: 5,
        time: 750,
        bullet_count: 1,
        recoil: 8,
        sound: new sound2("./src/sounds/rifle.wav", 1, 1)
    },
    "test": {
        image: image["silenced_pistol"],
        switch_time: 300,
        bullet_type: "small",
        moving_angle_multiplier: 18,
        size: {
            width: 64,
            height: 32
        },
        damage: 80,
        hold_shot: true,
        mag_size: 99,
        reload_time: 1,
        move: 65,
        dispersion: 15,
        time: 20,
        bullet_count: 3,
        recoil: 8,
        sound: new sound2("./src/sounds/p90.wav", 1, 0.1)
    },
}

let gunMove = 0;
let gunReloadAngle = 0;
export let bullets = [];
/**
 * Draws all bullets in the array to the canvas.
 * @function drawBullets
 */
export function drawBullets() {
    bullets.forEach(element => {
        element.draw();
    });
}
/**
 * Updates all bullets in the array, moving them by their velocity times the game's
 * fixed delta time, times the game's scale.
 * @function updateBullets
 */
export function updateBullets() {
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].x += bullets[i].vel.x * time.deltaTime * time.scale
        bullets[i].y += bullets[i].vel.y * time.deltaTime * time.scale
    }
}
/**
 * Draws the current gun at the player's position, with the correct scale and angle, and at the correct position relative to the player.
 * @function gunDraw
 */
export function gunDraw() {
    gun.setTexture(gun.types[gun.equiped].image)
    gun.y = player.y + player.height / 2 - gun.height / 3;
    gun.x = player.x + player.width / 2 - gun.width / 2;
    gun.move(gunMove)
    gun.draw()
}


/**
 * Updates the gun's properties, such as its position, scale, and angle, based on the current crosshair angle and the gun's type.
 * Also updates the gun's recoil and reload angle.
 * @function gunUpdate
 */
export function gunUpdate() {
    bullets = bullets.filter(bullet => bullet.toDelete == false)
    gun.mag.max = gun.types[gun.equiped].mag_size
    gun.mag.current = Math.min(gun.mag.max, gun.mag.current)
    if (time.scale > 0) {
        gunMove = gun.types[gun.equiped].move - gun.recoil
        gunReloadAngle = lerp(gunReloadAngle, gun.reloading * 25, (1 ** time.fixedDeltaTime) * 0.1 * time.scale)

        gun.recoil = lerp(gun.recoil + gunReloadAngle / 7, 0, (1 ** time.fixedDeltaTime) * 0.25 * time.scale)
        gun.width = lerp(gun.width, gun.types[gun.equiped].size.width, (1 ** time.fixedDeltaTime) * 0.25 * time.scale)
        gun.height = lerp(gun.height, gun.types[gun.equiped].size.height, (1 ** time.fixedDeltaTime) * 0.1 * time.scale)
        if (crosshairAngle < -90 || crosshairAngle > 90) {
            gun.scale = [1, -1]
        }
        else {
            gun.scale = [1, 1]
        }
    }
    gun.angle = lerpAngle(gun.angle, crosshairAngle - gunReloadAngle * gun.scale[1], (1 ** time.fixedDeltaTime) * time.scale)
}
export class lerpTime {
    /**
     * Creates a new lerpTime object that linearly interpolates between two values over a given duration.
     * @param {number} startval - The starting value of the interpolation.
     * @param {number} endval - The ending value of the interpolation.
     * @param {number} duration - The duration of the interpolation in milliseconds.
     */
    constructor(startval, endval, duration) {
        this.startTime = Date.now();
        this.lerp = 0;
        this.interval = setInterval(() => {
            let currentTime = Date.now();
            let elapsedTime = currentTime - this.startTime;
            this.lerp = Math.min(Math.max(lerp(startval, endval, elapsedTime / duration), Math.min(startval, endval)), Math.max(startval, endval))
            if (elapsedTime >= (duration / time.scale)) {
                this.lerp = 1
                clearInterval(this.interval);
                delete this
            }
        }, 10)
    }
}
/**
 * Reloads the specified gun type, and sets the gun's mag size to the type's mag size.
 * @param {string} gunType - The type of gun to reload.
 */
export function reload(gunType) {
    if (!gun.reloading) {
        gun.reloading = true
        let startTime = Date.now();
        let interval = setInterval(() => {
            let currentTime = Date.now();
            let elapsedTime = currentTime - startTime;
            let reloadTime = (gun.types[gunType].reload_time * (1 - (gun.mag.current / gun.mag.max)))
            if (reloadTime < gun.types[gunType].reload_time * 1 / 1.5) {
                reloadTime = gun.types[gunType].reload_time * 1 / 1.5
            }
            if (gun.switching) {
                clearInterval(interval);
            }
            if (elapsedTime >= (reloadTime / time.scale)) {
                gun.reloading = false
                gun.mag.current = gun.types[gunType].mag_size
                clearInterval(interval);
            }
        }, 10);
    }
}
/**
 * Switches the gun to the specified type, and sets the gun's mag size to the type's mag size.
 * @param {string} switchto - The type of gun to switch to.
 */
export function switchGun(switchto) {
    if (!gun.switchGun) {
        gun.switching = true
        let alphaLerp = new lerpTime(1, 0, gun.types[switchto].switch_time)
        let startTime = Date.now();
        let interval = setInterval(() => {
            gun.alpha = alphaLerp.lerp
            let currentTime = Date.now();
            let elapsedTime = currentTime - startTime;
            let switch_time = gun.types[switchto].switch_time
            if (elapsedTime >= (switch_time / time.scale)) {
                gun.alpha = 1
                gun.mag.current = gun.types[switchto].mag_size
                gun.equiped = switchto;
                gun.reloading = false
                gun.switching = false
                clearInterval(interval);
            }
        }, 10);
    }
}
/**
 * Shoots a bullet from the gun with the specified type and direction.
 * @param {string} gunType - The type of gun to shoot from.
 * @param {number} direction - The direction to shoot the bullet in.
 */
export function shoot(gunType, direction) {
    if (time.scale > 0.1) {
        if (!gun.switching && gunReloadAngle < 5 && !ui.weapon_selector.active) {
            if (gun.mag.current > 0 && !gun.reloading) {
                if (gun.canShoot && bullets.length < 500) {
                    gun.mag.current -= 1
                    gun.canShoot = false
                    gun.types[gunType].sound.playbackRate = Math.min(Math.max(time.scale, 0.75), 1.25)
                    gun.types[gunType].sound.play()

                    for (let i = 0; i < gun.types[gunType].bullet_count; i++) {
                        let bullet = new object(
                            image[`${gun.types[gunType].bullet_type}bullet`],
                            [player.x + player.halfheight + map.x, player.y + player.halfheight + map.y],
                            [gun.bullet_types[gun.types[gunType].bullet_type].width, gun.bullet_types[gun.types[gunType].bullet_type].height]
                        )
                        bullet.type = gun.types[gunType].bullet_type
                        bullet.vel = { x: 0, y: 0 }
                        let startTime = Date.now();
                        let interval = setInterval(() => {
                            var currentTime = Date.now();
                            var elapsedTime = currentTime - startTime;
                            if (elapsedTime >= (5000 / time.scale)) {
                                bullet.toDelete = true
                                clearInterval(interval)
                            }
                        }, 10);

                        var moving_factor_x = map.vel.x / (map.currentVelocity * time.fixedDeltaTime * time.scale)
                        var moving_factor_y = map.vel.y / (map.currentVelocity * time.fixedDeltaTime * time.scale)
                        moving_factor_x = Math.abs(Math.min(Math.max(moving_factor_x, -1), 1))
                        moving_factor_y = Math.abs(Math.min(Math.max(moving_factor_y, -1), 1))
                        var moving_factor = gun.types[gunType].moving_angle_multiplier * ((moving_factor_x + moving_factor_y) / 2)


                        bullet.x -= bullet.halfwidth
                        bullet.y -= bullet.halfheight

                        let gunDir = direction
                        gunDir += (Math.random() - 0.5) * (gun.types[gunType].dispersion + moving_factor)
                        bullet.angle = gunDir
                        gunDir = gunDir * (Math.PI / 180);
                        bullet.move(gun.types[gunType].size.width)
                        bullet.vel.x = Math.cos(gunDir) * 2000 + map.vel.x
                        bullet.vel.y = Math.sin(gunDir) * 2000 + map.vel.y
                        gun.recoil += gun.types[gunType].recoil

                        bullets.push(bullet)
                    }
                    let startTime = Date.now();
                    let interval = setInterval(() => {
                        let currentTime = Date.now();
                        let elapsedTime = currentTime - startTime;
                        if (elapsedTime >= (gun.types[gunType].time / time.scale)) {
                            gun.canShoot = true
                            clearInterval(interval)
                        }
                    }, 10);
                }
            }
            else {
                reload(gunType)
            }
        }
    }
}