function str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

async function importRsaKey(pem) {
    // fetch the part of the PEM string between header and footer
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = pem.substring(
        pemHeader.length,
        pem.length - pemFooter.length - 1,
    );
    // base64 decode the string to get the binary data
    const binaryDerString = window.atob(pemContents);
    // convert from a binary string to an ArrayBuffer
    const binaryDer = str2ab(binaryDerString);

    return await window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["encrypt"],
    );
}

async function encryptData(publicKeyPem, data) {
    try {
        const publicKey = await importRsaKey(publicKeyPem);

        const encodedData = new TextEncoder().encode(data);
        const encryptedData = await crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
                hash: "SHA-256",
            },
            publicKey,
            encodedData
        );
        let base64EncodedData = btoa(String.fromCharCode(...new Uint8Array(encryptedData)));

        return base64EncodedData

    } catch (error) {
        console.error("Error importing key or encrypting data:", error);
        return null;
    }
}

export class client {
    constructor(ip, port) {
        this.client = new WebSocket(`ws://${ip}:${port}`);
        this.clientVersion = "1.0"
        this.sign_error_codes = [0, 2, 3, 4, 5]
        this.publicKeyPem = undefined;
        this.packet = {
            vx: 0,
            vy: 0
        }
        this.profile = {
            id: -1,
            username: "",
            tag: "",
            coins: -1,
            banner: 0,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            direction: 0
        }
        this.gameData = {
            "wait_to_start": false,
            "current_time": 0,
            "started_time": 0,
        }
        this.game = {
            "map": 0,
            "mode": 0,
            "players": {},
            "teams": false,
            "team_a": [],
            "team_b": [],
            "time": 0,
            "reset_time": 0,
            "team_score": [0, 0]
        }

        this.ping = -1

        this.joined = false

        this.rank = "undefined"
        this.role = "undefined"

        this.gamemode = 0

        this.other_players_list = {}
        this.old_other_players_list = {}

        this.displayError = document.getElementById("errormsg");
        this.userInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.registerbtn = document.getElementById("registerb")
        this.loginbtn = document.getElementById("loginb")

        this.registerbtn.addEventListener("click", () => {
            this.send("register")
        })
        this.loginbtn.addEventListener("click", () => {
            this.send("login")
        })

        this.client.onopen = () => {
            setInterval(() => {
                this.send("ping")
            }, 1000)

        }
        // Handle incoming messages
        this.client.onmessage = async (event) => {
            var data = JSON.parse(event.data)
            if (data.type == "packet") {
                data.data = data.data.replace(/'/g, '"') //replacing all ' with " > https://stackoverflow.com/questions/41402834/convert-string-array-to-array-in-javascript
                var players = JSON.parse(data.data)

                if (players[`${this.profile.id}`]["name"] == this.profile.username) {
                    this.profile.x = Number(players[`${this.profile.id}`].x)
                    this.profile.y = Number(players[`${this.profile.id}`].y)
                    this.profile.vx = Number(players[`${this.profile.id}`].vx)
                    this.profile.vy = Number(players[`${this.profile.id}`].vy)
                    this.profile.direction = Number(players[`${this.profile.id}`].direction)
                    //delete players[`${this.profile.id}`]
                    this.other_players_list = players

                }
                else {
                    this.client.close(1000, "Invalid packet");
                }


            }
            else if (data.type == "server") {
                if (data.version != this.clientVersion) {
                    this.client.close(1000, `Client version ${this.clientVersion} does not match server version ${data.version}`);
                }
                else {
                    this.publicKeyPem = data['public-key']
                    // output an event listenr for the client to use
                    window.dispatchEvent(new Event('cwsconnected'));
                    //! TO BE DELETED
                    // AUTO-LOGIN
                    this.userInput.value = Math.random().toString(15).substring(10);
                    this.passwordInput.value = "testpassword";
                    this.send("register")
                    //! TO BE DELETED
                }

            }
            else if (data.type == "pong") {
                const client_timestamp = Date.now();  // Accurate timestamp in milliseconds
                const server_timestamp = data.data;
                this.ping = Math.max((client_timestamp - server_timestamp).toFixed(1), 0);
            }
            else if (data.type == "sign_response") {
                if (data.code == 1) {
                    window.dispatchEvent(new Event('cwsSignSucces'));
                }
                else if (this.sign_error_codes.includes(data.code)) {
                    this.displayError.innerText = data.data
                }
                else {
                    this.displayError.innerText = `Unknown Error ${data.code}: ${data.data}`
                }

            }
            else if (data.type == "profile_info") {
                data.data = data.data.replace(/'/g, '"') //replacing all ' with " > https://stackoverflow.com/questions/41402834/convert-string-array-to-array-in-javascript
                var profile = JSON.parse(data.data)
                this.profile.id = profile[0]
                this.profile.tag = profile[1]
                this.profile.username = profile[2]
                this.profile.coins = profile[4]
                this.profile.banner = profile[5]
            }
            else if (data.type == "game_response") {
                if (data.code == 1) {
                    this.gameData.wait_to_start = true;
                    window.dispatchEvent(new Event('cwsGameSucces'));
                }
                else {
                    console.log(`Unknown Error ${data.code}: ${data.data}`)
                }
            }
            else if (data.type == "game_info") {
                data.data = data.data.replace(/'/g, '"') //replacing all ' with " > https://stackoverflow.com/questions/41402834/convert-string-array-to-array-in-javascript
                data.data = data.data.replace("False", "false")
                var gameData = JSON.parse(data.data)
                this.game = gameData
                this.gameData.started_time = Date.now()


            }
            else {
                console.log('Message:', data);
            }
        };
        this.client.onclose = (event) => {
            const currentUrl = new URL(window.location.href);
            if (event.reason == "" || event.reason == undefined) {
                currentUrl.searchParams.set("error", "Disconnected: No reason");
            }
            else {
                currentUrl.searchParams.set("error", event.reason);
            }
            window.location.href = currentUrl.toString();
        };
        // Handle errors
        this.client.onerror = (error) => {
            const currentUrl = new URL(window.location.href);

            currentUrl.searchParams.set("error", error);


            window.location.href = currentUrl.toString();
        };
    }
    async send(type, info = {}) {
        if (this.client.readyState == 1) {
            let data = {}
            if (type == "receive_packet") {
                data = {
                    type: type,
                    x: info.x,
                    y: info.y,
                    vx: info.vx,
                    vy: info.vy,
                    direction: info.direction
                }
            }
            else if (type == "register" || type == "login") {
                data = {
                    type: type,
                    username: String(this.userInput.value),
                    password: await encryptData(this.publicKeyPem, this.passwordInput.value)
                }
            }
            else if (type == "ping") {
                data = {
                    type: type,
                }
            }
            else if (type == "enter_game") {
                data = {
                    type: type,
                    username: this.profile.username,
                }
            }
            else if (type == "join") {
                data = {
                    type: type,
                }
            }
            this.client.send(JSON.stringify(data));
        }
    }
}
