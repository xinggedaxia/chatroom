var express = require("express");
var app = express();
//socket.io公式：
var http = require("http").Server(app);
var io = require("socket.io")(http);
//session公式：
var session = require('express-session');
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
var usernames = [];

//创建静态文件夹
app.use(express.static("public"));
app.get("/",function (req,res) {
    if(req.session.flag == true){
        res.redirect("/chatroom.html");
        return;
    }
    res.redirect("/register.html");
});
app.get("/getname",function (req,res) {
    if(req.session.flag == true){
        res.json({
            "log" : "1",
            "username" : req.session.username
        })
    }else{
        res.json({
            "log" : "0"
        })
    }

})
app.get("/register",function (req,res) {

    var username = req.query.username;
    if(usernames.indexOf(username) != -1){
        res.send("用户名已被占用！");
        return;
    }if(username == ""){
        res.send("用户名不能为空！");
        return;
    }
    if(username.length > 4){
        res.send("用户名太长了！");
        return;
    }
    req.session.username = username;
    req.session.flag = true;
    usernames.push(username);
    res.redirect("/chatroom.html");
});

io.on("connection",function (sockit) {
    sockit.on("userlogin",function (msg) {
        msg.content = msg.username + "进入聊天室，大家欢迎！";
        msg.type = 1;
        io.emit("responese",msg);
    });
    sockit.on("message",function (msg) {
        msg.type = 2;
        io.emit("responese",msg);
    });
})
http.listen(80,"192.168.1.104");
console.log("服务器启动！");