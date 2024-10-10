import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { drawPointers, isClicking, isHovering, keyPressed, mouse, pointers } from "./src/js/listeners.js";
import { button, camera, hitbox, hitboxCircleFixed, hitboxFixed, object, slider, sliderv, sound2, sound } from "./src/js/classes.js";
import { loadFont, loadImage, loadSound } from "./src/js/loader.js";
import { setup, clear, drawtext, shakeScreen, lerp } from "./src/js/functions.js";
import { player } from "./player.js";
import { map } from "./map.js";


await loadImage("src/images/guns/howa.png", "gun");
await loadImage("src/images/guns/shotgun.png", "shotgun");
await loadImage("src/images/guns/revolver.png", "revolver");

await loadSound("./src/sounds/rifle.wav", "gun");
await loadSound("./src/sounds/shotgun.wav", "shotgun");

await loadImage("src/images/bullets/shell.png", "shellbullet");
await loadImage("src/images/bullets/medium.png", "mediumbullet");
await loadImage("src/images/bullets/small.png", "smallbullet");

export let gun = new object(image["gun"], [0, 0], [100, 32]);
gun.switching = false;
gun.equiped = "AR_15"; // ARMA EQUIPADA
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
gun.types = {
    "AR_15": {
        image: image["gun"],
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
        move: 48,
        dispersion: 5,
        time: 100,
        bullet_count: 1,
        recoil: 3,
        sound: new sound2("./src/sounds/rifle.wav", 1, 1)
    },
    "shotgun_A": {
        image: image["shotgun"],
        switch_time: 250,
        bullet_type: "shell",
        moving_angle_multiplier: 5,
        size: {
            width: 145,
            height: 48
        },
        damage: 10,
        hold_shot: false,
        mag_size: 5,
        reload_time: 1000,
        move: 48,
        dispersion: 20,
        time: 750,
        bullet_count: 3,
        recoil: 6,
        sound: new sound2("./src/sounds/shotgun.wav", 1, 0.5)
    },
    "minigun": {
        image: image["revolver"],
        switch_time: 500,
        bullet_type: "small",
        moving_angle_multiplier: 15,
        size: {
            width: 100,
            height: 48
        },
        damage: 8,
        hold_shot: true,
        mag_size: 50,
        reload_time: 2500,
        move: 48,
        dispersion: 16,
        time: 50,
        bullet_count: 1,
        recoil: 4,
        sound: new sound2("./src/sounds/rifle.wav", 1, 1)
    },
}

let gunMove = 0;
let gunReloadAngle = 0;
export let bullets = [];
export function drawBullets() {
    bullets.forEach(element => {
        element.draw();
    });
}
export function updateBullets() {
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].x += bullets[i].vel.x * time.deltaTime * time.scale
        bullets[i].y += bullets[i].vel.y * time.deltaTime * time.scale
    }
}
export function gunDraw() {
    gun.setTexture(gun.types[gun.equiped].image)
    gun.y = player.y + player.height / 2 - gun.height / 3;
    gun.x = player.x + player.width / 2 - gun.width / 2;
    gun.move(gunMove)
    gun.draw()
}


export function gunUpdate() {
    bullets = bullets.filter(bullet => bullet.toDelete == false)
    gun.mag.max = gun.types[gun.equiped].mag_size
    gun.mag.current = Math.min(gun.mag.max, gun.mag.current)

    gunMove = gun.width / 2 + 10 - gun.recoil
    gunReloadAngle = lerp(gunReloadAngle, gun.reloading * 25, (1 ** time.fixedDeltaTime) * 0.1)

    gun.recoil = lerp(gun.recoil + gunReloadAngle/7, 0, (1 ** time.fixedDeltaTime) * 0.1)
    gun.width = lerp(gun.width, gun.types[gun.equiped].size.width, (1 ** time.fixedDeltaTime) * 0.1)
    gun.height = lerp(gun.height, gun.types[gun.equiped].size.height, (1 ** time.fixedDeltaTime) * 0.1)
    
    gun.angle = player.angle + gunReloadAngle
}
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
export function switchGun(switchto) {
    if (!gun.switchGun) {
        gun.switching = true
        gun.alpha = 0
        let startTime = Date.now();
        let interval = setInterval(() => {
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
export function shoot(gunType, direction) {
    if (time.scale > 0.1) {
        if (!gun.switching) {
            if (gun.mag.current > 0 && !gun.reloading) {
                if (gun.canShoot && bullets.length < 500) {
                    gun.mag.current -= 1
                    gun.canShoot = false
                    gun.types[gunType].sound.play()

                    for (let i = 0; i < gun.types[gunType].bullet_count; i++) {
                        let bullet = new object(
                            image[`${gun.types[gunType].bullet_type}bullet`],
                            [player.x + player.halfheight + map.x, player.y + player.halfheight + map.y],
                            [gun.bullet_types[gun.types[gunType].bullet_type].width, gun.bullet_types[gun.types[gunType].bullet_type].height]
                        )

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

                        var moving_factor_x = map.vel.x / (map.currentVelocity * time.deltaTime * time.scale)
                        var moving_factor_y = map.vel.y / (map.currentVelocity * time.deltaTime * time.scale)
                        moving_factor_x = Math.abs(Math.min(Math.max(moving_factor_x, -1), 1))
                        moving_factor_y = Math.abs(Math.min(Math.max(moving_factor_y, -1), 1))
                        var moving_factor = gun.types[gunType].moving_angle_multiplier * (moving_factor_x + moving_factor_y) / 2


                        bullet.x -= bullet.halfwidth
                        bullet.y -= bullet.halfheight

                        let gunDir = direction
                        gunDir += (Math.random() - 0.5) * (gun.types[gunType].dispersion + moving_factor)
                        gunDir = gunDir * (Math.PI / 180);
                        bullet.angle = direction
                        bullet.move(gun.types[gunType].size.width)
                        bullet.vel.x = Math.cos(gunDir) * 2000
                        bullet.vel.y = Math.sin(gunDir) * 2000
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