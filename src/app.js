const fs = require('fs');
const express = require ('express')
const handlebars = require ('express-handlebars')
const { Server } = require ('socket.io')
const PORT = 8080;
const app = express();
const server = app.listen (PORT, () => {
    console.log(`Server Up on PORT: ${PORT}`)})

app.use (express.static("src/public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.engine("handlebars", handlebars.engine());
app.set("views", "./src/public/views");
app.set("view engine", "handlebars");
const io = new Server (server); 

let products = [];
let messages = []; 

app.get ("/", (req, res) => {
    res.render("home");
});

io.on ("connection", (socket) => { console.log("User Connected");

socket.on("product", (data) => {
    products.push(data);
    io.emit("products", products);
});
socket.emit("products", products);

messages = getLogChat();
socket.on ("new-message", (data) => {
    messages.push(data);
    io.emit("messages", messages)
    setLogChat(messages)
});
socket.emit ("messages", messages);
});

const setLogChat = (messages) => {
    messages = JSON.stringify(messages, null, 2);
    try {
        fs.writeFileSync("chatLog.json", messages);
    } catch (err) {
        console.log("There was a mistake", err);
    }
};

const getLogChat = () => {
    try {
        let data = fs.readFileSync("chatLog.json", "utf-8");
        messages = data.length > 0 ? JSON.parse(data) : [];
    } catch (err) {
        console.log("Database error", err)
    }
    return messages;
};
