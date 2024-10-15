import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { drawPointers, isClicking, isHovering, keyPressed, mouse, pointers } from "./src/js/listeners.js";
import { button, camera, hitbox, hitboxCircleFixed, hitboxFixed, object, slider, sliderv, sound2, sound } from "./src/js/classes.js";
import { loadFont, loadImage, loadSound } from "./src/js/loader.js";
import { setup, clear, drawtext, shakeScreen, lerp } from "./src/js/functions.js";
import { player } from "./player.js";
import { map } from "./map.js";

export const chunker_config = {
    "size": 1000,
    "radius": 1.5,
    "ref": map,
    "mapMin": [960, 540],
    "maps": {
        "the-range": [
            [ // 0,x
                [new hitboxFixed([300, 300], [200, 200]), new hitboxFixed([0, 0], [50, 750]), new hitboxFixed([50, 0], [700, 50])], //0,0
            ],

        ]
    }
}
//chunkX = player.x / chunker_config.size

export let chunker = {
    map: "the-range",
    // active chunks axis [y,x]
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
        // Check if y or x is negative
        if (y < 0 || x < 0) {
            return false;
        }

        // Check if the map, y level, or x level is undefined or does not exist
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
                hitbox.x = hitbox.initialX - map.x
                hitbox.y = hitbox.initialY - map.y


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
        for (let i = 0; i < chunker_config["maps"][this.map].length; i++) {
            for (let k = 0; k < chunker_config["maps"][this.map][i].length; k++) {
                for (let l = 0; l < chunker_config["maps"][this.map][i][k].length; l++) {
                    var hitbox = chunker_config["maps"][this.map][i][k][l]
                    hitbox.draw()
                    hitbox.color = "blue"
                }
            }
        }
    },
    drawChunk() {
        this.updatePos()
        for (let i = 0; i < this.size.width; i++) {
            for (let k = 0; k < this.size.height; k++) {
                ctx.beginPath();
                if (i == this.chunk.trunc.x && k == this.chunk.trunc.y) {
                    ctx.strokeStyle = "red"
                }
                else if (this.chunk_radius(i, k)) {
                    ctx.strokeStyle = "blue"
                }
                else {
                    ctx.strokeStyle = "white"
                }

                ctx.strokeStyle = "white"

                ctx.save()
                ctx.globalAlpha = 1
                ctx.lineWidth = 1
                ctx.rect(-chunker_config["ref"].x + (chunker_config["size"] * i), -chunker_config["ref"].y + (chunker_config["size"] * k), chunker_config["size"], chunker_config["size"]);
                ctx.stroke();
                ctx.restore()
            }

        }

    },
    generateChunks() {
        // Create an outer array of length 'height'
        const chunks = new Array(chunker.size.height);
        // Fill each element of the outer array with a new array of length 'width'
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
            // If the row doesn't exist, create it
            if (!chunks[y]) {
                chunks[y] = new Array(chunker.size.width);
            }

            for (let x = 0; x < chunker.size.width; x++) {
                // If the chunk at (y, x) doesn't exist, create an empty array
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