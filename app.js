var express = require("express");
var app = express();
//socket.io公式：
var http = require("http").Server(app);
var io = require("socket.io")(http);
//session公式：
var session = require('express-session');
//这里传入了一个密钥加session id
var FileStore = require('session-file-store')(session);
var identityKey = 'skey';
app.use(session({
    name: identityKey,
    secret: 'chyingp',  // 用来对session id相关的cookie进行签名
    store: new FileStore(),  // 本地存储session（文本文件，也可以选择其他store，比如redis的）
    saveUninitialized: false,  // 是否自动保存未初始化的会话，建议false
    resave: false,  // 是否每次都重新保存会话，建议false
    cookie: {
        maxAge: 1000000 * 1000  // 有效期，单位是毫秒
    }
}));
var usernames = [];

//创建静态文件夹
app.use(express.static("public"));
app.get("/",function (req,res) {
    if(req.session.flag == true){
        res.redirect("/chatroom.html");
        return;
    }else{
        res.redirect("/register.html");
    }
});
//验证用户是否注册，并获取注册的用户名，
app.get("/getname",function (req,res) {
    if(req.session.flag == true){
        console.log(req.session.username + "进入！")
        res.json({
            "log" : "1",
            "username" : req.session.username
        });
    }else{
        console.log("踢出！!!");
        res.json({
            "log" : "0"
        });
    }

});
app.get("/doRegister",function (req,res) {

    var username = req.query.username;
    if(usernames.indexOf(username) != -1){
        res.json({
            "result" : 0
        });
        return;
    }if(username == ""){
        res.json({
            "result" : 1
        });
        return;
    }
    if(username.length > 6){
        res.json({
            "result" : 2
        });
        return;
    }
    req.session.username = username;
    req.session.flag = true;
    usernames.push(username);
    console.log(req.session.flag);
    res.json({
        "result" : 3
    });
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