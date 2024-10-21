import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { drawPointers, isClicking, isHovering, keyPressed, mouse, pointers } from "./src/js/listeners.js";
import { button, camera, hitbox, hitboxCircleFixed, hitboxFixed, object, slider, sliderv, sound2, sound } from "./src/js/classes.js";
import { loadFont, loadImage, loadSound } from "./src/js/loader.js";
import { setup, clear, drawtext, shakeScreen, lerp } from "./src/js/functions.js";
import { player } from "./player.js";
import { map } from "./map.js";

export const chunker_config = {
    "size": 1040,
    "radius": 1.5,
    "ref": map,
    "mapMin": [960, 540],
    "maps": {
        "0": [
            [
                [new hitboxFixed([400, 400], [160, 160]), new hitboxFixed([0, 0], [80, 1000]), new hitboxFixed([0, 0], [1000, 80])],
                [new hitboxFixed([0, 0], [920, 80]), new hitboxFixed([840, 0], [80, 1000])]
            ],
            [
                [new hitboxFixed([0, 0], [80, 920]), new hitboxFixed([0, 840], [1000, 80])],
                [new hitboxFixed([840, 0], [80, 920]), new hitboxFixed([0, 840], [920, 80])],
            ]
        ],
        "1": [
            [
                [new hitboxFixed([880, 560], [160, 160]), new hitboxFixed([560, 400], [80, 400]), new hitboxFixed([560, 80], [80, 80]), new hitboxFixed([0, 0], [80, 1040]), new hitboxFixed([0, 0], [1040, 80])],
                [new hitboxFixed([0, 0], [160, 320]), new hitboxFixed([160, 0], [160, 240]), new hitboxFixed([320, 0], [720, 80]), new hitboxFixed([720, 80], [80, 160]), new hitboxFixed([0, 560], [320, 160]), new hitboxFixed([240, 480], [160, 160]), new hitboxFixed([320, 400], [720, 160]), new hitboxFixed([960, 560], [80, 80]), new hitboxFixed([720, 800], [80, 160])],
                [new hitboxFixed([0, 400], [1040, 160]), new hitboxFixed([0, 0], [1040, 80]), new hitboxFixed([960, 240], [80, 480]), new hitboxFixed([880, 560], [80, 80]), new hitboxFixed([80, 320], [160, 80]), new hitboxFixed([160, 240], [80, 80]), new hitboxFixed([640, 80], [80, 80]), new hitboxFixed([240, 880], [480, 160]), new hitboxFixed([400, 720], [160, 80]), new hitboxFixed([320, 800], [320, 80])],
                [new hitboxFixed([0, 400], [720, 160]), new hitboxFixed([0, 0], [1040, 80]), new hitboxFixed([0, 320], [80, 80]), new hitboxFixed([320, 80], [160, 80]), new hitboxFixed([320, 160], [80, 80]), new hitboxFixed([960, 80], [80, 80]), new hitboxFixed([640, 320], [400, 160]), new hitboxFixed([880, 480], [80, 80]), new hitboxFixed([480, 720], [240, 160]), new hitboxFixed([160, 960], [80, 80])],
                [new hitboxFixed([0, 0], [1040, 80]), new hitboxFixed([880, 0], [160, 1040]), new hitboxFixed([320, 80], [80, 80]), new hitboxFixed([320, 400], [80, 400]), new hitboxFixed([0, 320], [80, 160])]
            ]
        ]
    }
}

export let chunker = {
    map: map.map,
    activeChunks: [],
    objects: [],
    chunk: {
        x: 0,
        y: 0,
        trunc: {
            x: 0,
            y: 0
        }
    },
    size: {
        width: 0,
        height: 0
    },
    updatePos() {
        this.chunk.x = (chunker_config["mapMin"][0] + chunker_config["ref"].x - player.halfwidth) / chunker_config["size"]
        this.chunk.y = (chunker_config["mapMin"][1] + chunker_config["ref"].y - player.halfheight) / chunker_config["size"]
        this.chunk.trunc.x = Math.trunc(this.chunk.x)
        this.chunk.trunc.y = Math.trunc(this.chunk.y)
    },
    exists(x, y) {
        if (y < 0 || x < 0) {
            return false;
        }
        if (typeof chunker_config["maps"][this.map] === "undefined" ||
            typeof chunker_config["maps"][this.map][y] === "undefined" ||
            typeof chunker_config["maps"][this.map][y][x] === "undefined") {
            return false;
        }

        return true;
    },
    updateHitboxes() {
        for (let i = 0; i < chunker.activeChunks.length; i++) {
            var y = chunker.activeChunks[i][0]
            var x = chunker.activeChunks[i][1]
            for (let l = 0; l < chunker_config["maps"][this.map][y][x].length; l++) {
                var hitbox = chunker_config["maps"][this.map][y][x][l]
                if (typeof hitbox.initialX == "undefined") {
                    hitbox.initialX = hitbox.x
                    hitbox.initialY = hitbox.y
                }
                hitbox.x = hitbox.initialX - map.x + chunker_config["size"] * x
                hitbox.y = hitbox.initialY - map.y + chunker_config["size"] * y
            }
        }
    },
    updateActiveChunks() {
        this.activeChunks = []
        for (let i = 0; i < this.size.width; i++) {
            for (let k = 0; k < this.size.height; k++) {
                if (this.chunk_radius(i, k)) {
                    this.activeChunks.push([i, k])
                }
            }
        }
    },
    chunk_radius(chunkx, chunky) {
        this.updatePos()
        var distancex = chunkx - this.chunk.trunc.y;
        var distancey = chunky - this.chunk.trunc.x;
        var distance = Math.sqrt(distancex ** 2 + distancey ** 2);
        return distance <= chunker_config["radius"];
    },
    drawChunkHitbox() {
        //for (let i = 0; i < chunker_config["maps"][this.map].length; i++) {
        //    for (let k = 0; k < chunker_config["maps"][this.map][i].length; k++) {
        //        for (let l = 0; l < chunker_config["maps"][this.map][i][k].length; l++) {
        //            var hitbox = chunker_config["maps"][this.map][i][k][l]
        //            hitbox.color = "blue"
        //            hitbox.draw()
        //        }
        //    }
        //}
        for (let i = 0; i < chunker.activeChunks.length; i++) {
            var y = chunker.activeChunks[i][0]
            var x = chunker.activeChunks[i][1]
            for (let l = 0; l < chunker_config["maps"][this.map][y][x].length; l++) {
                var hitbox = chunker_config["maps"][this.map][y][x][l]
                hitbox.color = "red"
                hitbox.draw()
            }
        }
    },
    drawChunk() {
        this.updatePos()
        for (let i = 0; i < this.size.width; i++) {
            for (let k = 0; k < this.size.height; k++) {
                ctx.save();
                ctx.beginPath();
                ctx.strokeStyle = "white"
                ctx.globalAlpha = 1
                ctx.lineWidth = 1
                ctx.rect(-chunker_config["ref"].x + (chunker_config["size"] * i), -chunker_config["ref"].y + (chunker_config["size"] * k), chunker_config["size"], chunker_config["size"]);
                ctx.stroke();
                ctx.restore()
            }
        }
    },
    generateChunks() {
        const chunks = new Array(chunker.size.height);
        for (let y = 0; y < chunker.size.height; y++) {
            chunks[y] = new Array(chunker.size.width);
            for (let x = 0; x < chunker.size.width; x++) {
                chunks[y][x] = [];
            }
        }
        return chunks;
    },
    refillChunks() {
        const chunks = chunker_config["maps"][chunker.map].length ? chunker_config["maps"][chunker.map] : new Array(chunker.size.height);
        for (let y = 0; y < chunker.size.height; y++) {
            if (!chunks[y]) {
                chunks[y] = new Array(chunker.size.width);
            }
            for (let x = 0; x < chunker.size.width; x++) {
                if (!chunks[y][x]) {
                    chunks[y][x] = [];
                }
            }
        }
        return chunks;
    }
}

chunker.size.width = Math.trunc(chunker_config["ref"].width / chunker_config["size"])
chunker.size.height = Math.trunc(chunker_config["ref"].height / chunker_config["size"])
chunker_config["maps"][chunker.map] = chunker.refillChunks()
window.addEventListener("started", () => {
    for (let i = 0; i < chunker_config["maps"][chunker.map].length; i++) {
        for (let k = 0; k < chunker_config["maps"][chunker.map][i].length; k++) {
            for (let l = 0; l < chunker_config["maps"][chunker.map][i][k].length; l++) {
                var hitbox = chunker_config["maps"][chunker.map][i][k][l]
                if (typeof hitbox.initialX == "undefined") {
                    hitbox.initialX = hitbox.x
                    hitbox.initialY = hitbox.y
                }
                hitbox.x = hitbox.initialX - map.x + chunker_config["size"] * i
                hitbox.y = hitbox.initialY - map.y + chunker_config["size"] * k
            }
        }
    }
})