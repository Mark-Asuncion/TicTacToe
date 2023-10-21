const http = require('http');
const fs = require('fs');
const port = 6969

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile('index.html',(e,v) => {
            if (e) {
                res.writeHead(404);
                res.end();
            }
            else {
                res.setHeader('Content-Type','text/html');
                res.write(v);
                res.end()
            }
        })
    }
    else if (req.url === '/style.css') {
        fs.readFile('style.css',(e,v) => {
            if (e) {
                res.writeHead(404);
                res.end();
            }
            else {
                res.setHeader('Content-Type','text/css');
                res.write(v);
                res.end()
            }
        })
    }
    else if (req.url === '/index.js') {
        fs.readFile('index.js',(e,v) => {
            if (e) {
                res.writeHead(404);
                res.end();
            }
            else {
                res.setHeader('Content-Type','text/javascript');
                res.write(v);
                res.end()
            }
        })
    }
    else {
        res.writeHead(404)
        res.end()
    }
})
server.listen(port);

console.log("Http Server running at port " + port)
