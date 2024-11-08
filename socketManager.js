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

        this.user = ""

        this.publicKeyPem = undefined;

        this.ping = -1

        this.joined = false

        this.rank = "undefined"
        this.role = "undefined"

        this.gamemode = 0

        this.players_list = {}
        this.other_players_list = {}

        this.displayError = document.getElementById("errormsg");
        this.userInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.registerbtn = document.getElementById("registerb")
        this.loginbtn = document.getElementById("loginb")

        this.registerbtn.addEventListener("click", () => {
            this.user = this.userInput.value
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
            if (data.type == "server") {
                if (data.version != this.clientVersion) {
                    this.client.close(1000, `Client version ${this.clientVersion} does not match server version ${data.version}`);
                }
                else {
                    this.publicKeyPem = data['public-key']
                    // output an event listenr for the client to use
                    window.dispatchEvent(new Event('cwsconnected'));
                }

            }
            else if (data.type == "pong") {
                const client_timestamp = Date.now();  // Accurate timestamp in milliseconds
                const server_timestamp = data.data;
                this.ping = (client_timestamp - server_timestamp).toFixed(1);
            }
            else if (data.type == "sign_response") {
                console.log(data);
                
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
            else if (data.type == "fetched_players") {
                this.players_list = data.players
                this.rank = this.players_list[this.user]["rank"]
                this.role = this.players_list[this.user].role
                this.other_players_list = data.players
                delete this.other_players_list[this.user]
                window.dispatchEvent(new Event('cwsfetchedData'));
            }
            else if (data.type == "player_update") {
                if (data.by !== this.user) {
                    this.send("fetch_online_players")
                }
            }
            else if (data.type == "players") {
                this.players_list = data.data
            }
            else {
                console.log('Message:', data);
            }
        };
        this.client.onclose = (event) => {
            const currentUrl = new URL(window.location.href);
            if (event.reason == "" || event.reason == undefined) {
                console.log('Disconnected: No reason');
                currentUrl.searchParams.set("error", "Disconnected: No reason");
            }
            else {
                console.log('Disconnected:', event.reason);
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
    async send(type) {
        if (this.client.readyState == 1) {
            let data = {}
            if (type == "pos") {
                data = {
                    type: type,
                    username: this.user,
                    x: this.x,
                    y: this.y
                }
            }
            else if (type == "register" || type == "login") {
                this.user = this.userInput.value
                console.log(this.user);
                
                data = {
                    type: type,
                    username: String(this.user),
                    password: await encryptData(this.publicKeyPem, this.passwordInput.value)
                }
            }
            else if (type == "ping") {
                data = {
                    type: type,
                }
            }

            this.client.send(JSON.stringify(data));
        }
    }
}
