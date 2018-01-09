let http = require('http');
let fs = require('fs');
http.createServer((req,res) => {
  console.group("⭐️  Request in:");
  console.dir({
    "method" : req.method,
    "url" : req.url,
    "user-agent" : req.headers["user-agent"],
  });
  console.groupEnd();
  let file = `${process.cwd()}${req.url}`
  if (req.url === "/") file = process.cwd()
  fs.readFile(file, (err, data) =>{
    if (err) {
      switch (err.code) {
        case 'ENOENT':
          console.error(`${file} does not exist`);
          //404
          return;
          break;
        case 'EISDIR':
          file = `${file}/index.html`
          console.log(`dir request: "${req.url}", serving "${file}"`);
          break;
        default:
          console.log(err);
          throw err;
          return
      }
    }
    fs.readFile(file, (err, data) => {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data)
      res.end();
    })
  })
}).listen(8077)
let currentDir = process.cwd()
// console.log(currentDir);
// fs.readdir(currentDir,(err, files) => console.log(files))
// process.exit(0)
