// const express = require ("express")
// const cors = require ("cors")
// const multer =require("multer")
// const path=require ("path")

// const app=express()
// app.use(cors())
// app.use(express.json())


// const storage =multer.diskStorage({
//     destination:"./uploads/images",
//     filename:(req, file, cb)=>{
//      const ext = path.extname(file.originalname)
//      const uniqueSuffix= file.fieldname + Date.now()
//      cb(null, uniqueSuffix +ext)
//     }
// })

// const upload = multer({storage})
// app.use("/uploads",express.static(path.join(__dirname, "uploads")))
// app.post("/upload_file", upload.single("upload"), (req, res)=>{
//     res.status(201).json({
//         message:"Success",
//         image_url:"http://localhost:3000/uploads/images/"+ req.file.filename
//     })
// })

// app.listen(3000, ()=>{
//     console.log("ishlavottiyuu");
    
// })




const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Roomga kirish
    socket.on("join.room", (room) => {
        if (typeof room !== "string" || !room.trim()) return;

        // Oldingi roomdan chiqish
        if (socket.data.room) {
            socket.leave(socket.data.room);
        }

        const roomName = room.trim();

        socket.join(roomName);
        socket.data.room = roomName;

        console.log(`${socket.id} joined ${roomName}`);
    });

    // Chat xabarlarini qabul qilish
    socket.on("chat message", (data) => {
        const { message } = data || {};
        const room = socket.data.room;

        if (!room || typeof message !== "string" || !message.trim()) {
            return;
        }

        io.to(room).emit("chat message", {
            message: message.trim(),
            username: "User",
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(3000, () => {
    console.log("Ishlab duripti");
});
