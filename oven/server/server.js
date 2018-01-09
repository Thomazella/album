let http = require('http');
let fs = require('fs');
let path = require('path')
let port = 8077
let c = {
  'green'   : '\033[32m',
  'red'     : '\033[31m',
  'yellow'  : '\033[33m',
  'w'       : '\033[39m', //white
}
let debug = false
http.createServer((request,response) => {
  console.groupEnd(); //this req's console.group will be closed by the next req
  debug && console.group(`⭐️  ${c.green}Request:${c.w}`);
  debug && console.dir({
    "method" : request.method,
    "url" : request.url,
    // "user-agent" : request.headers["user-agent"],
  });
  let file = `${process.cwd()}${request.url}` //make absolute path
  if (request.url === "/") file = process.cwd() //we avoid a case where file ends in "/"
  let headers = {'Content-Type': 'text/html'}
  let mimeTypes = {
    '.html' :   'text/html',
    '.js'   :   'text/javascript',
    '.css'  :   'text/css',
    '.sass' :   'text/css',
    '.scss' :   'text/css',
    '.map'  :   'text/css', //css source map to allow browser edit sass
    '.json' :   'application/json',
    '.txt'  :   'text/plain',
    '.png'  :   'image/png',
    '.jpg'  :   'image/jpeg',
    '.gif'  :   'image/gif',
    '.svg'  :   'image/svg+xml',
    '.wav'  :   'audio/wav',
    '.ogg'  :   'audio/ogg',
    '.mp3'  :   'audio/mpeg',
    '.midi' :   'audio/midi',
    '.webm' :   'video/webm',
    '.mp4'  :   'video/mp4',
    '.pdf'  :   'application/pdf',
    '.woff' :   'application/font-woff',
    '.ttf'  :   'application/font-ttf',
    '.eot'  :   'application/vnd.ms-fontobject',
    '.otf'  :   'application/font-otf',
    '.rar'  :   'application/x-rar-compressed',
  };
  fs.readFile(file, (err, data) => {
    if (err) {
      switch (err.code) {
        case 'ENOENT':
          console.error(`${c.red} 🔥 ${file} does not exist, serving 404${c.w} 🔥`);
          response.writeHead(404, headers)
          response.write(`
            <body style="font-family: arial">
              <h1>404</h1>
              <p>${request.headers.host}${request.url} was not found</p>
              <a href="http://${request.headers.host}">go home</a>
            </body>`)
          response.end()
          return;
        case 'EISDIR':
          file = `${file}/index.html` //browser asked for a dir, give the index.html of that dir
          console.log(`${c.yellow}dir request: "${request.url}", serving "${file}${c.w}"`);
          break;
        default:
          throw err;
          return
      }
    }
    let extention = String(path.extname(file)).toLowerCase()
    headers['Content-Type'] = mimeTypes[extention] || 'application/octet-stream' //<= unknown type
    fs.readFile(file, (err, data) => {
      if (err) {
        console.dir(err)
        response.writeHead(500, {'Content-Type':'text/html'})
        response.write(`
          <body style="font-family: arial">
          <h1>500</h1>
          <p>Internal error, we're sorry</p>
          <a href="http://${request.headers.host}">go home</a>
          </body>`)
          response.end()
          return;
      }
      debug && console.dir(headers)
      response.writeHead(200, headers);
      response.write(data)
      response.end();
    })
  })
}).listen(port)
console.log(`Running on http://localhost:${port}/`);
