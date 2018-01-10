const http = require('http');
const fs = require('fs');
const path = require('path')
const port = 8077
const c = {
  'green'   : '\033[32m',
  'red'     : '\033[31m',
  'yellow'  : '\033[33m',
  'white'   : '\033[39m',
}
const debug = true
http.createServer((request,response) => {
  if (debug) {
    console.groupEnd(); //this req's console.group will be closed by the next req
    console.group(`⭐️  ${c.green}Request:${c.white}`);
    console.dir({"method" : request.method,"url" : request.url})
  }
  let file = `${process.cwd()}${request.url}` //make absolute path
  if (request.url === "/") file = process.cwd() //we avoid a case where file ends in "/"
  let headers = {}
  const mimeTypes = {
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
          console.error(`${c.red} 🔥 ${file} does not exist, serving 404${c.white} 🔥`);
          response.writeHead(404, {'Content-Type': 'text/html'})
          response.write(`
            <head><meta charset="UTF-8"><link href="css/index.css" rel="stylesheet"></head>
            <body class="errorPage">
              <h1>404</h1>
              <p class="url">${request.headers.host}${request.url}</p>
              <span class="message">not found</span>
              <span class="message"> 🤷🏻‍  </span>
              <p class="link"><span> 👉🏻 </span>
              <a href="http://${request.headers.host}">go home</a></p>
            </body>`)
          response.end()
          return;
        case 'EISDIR':
          file = `${file}/index.html` //browser asked for a dir, give the index.html of that dir
          console.log(`${c.yellow}dir request: "${request.url}", serving "${file}${c.white}"`);
          break;
        default:
          throw err;
          return
      }
    }
    const extention = String(path.extname(file)).toLowerCase()
    headers['Content-Type'] = mimeTypes[extention] || 'application/octet-stream' //<= unknown type
    fs.readFile(file, (err, data) => {
      if (err) {
        console.dir(err)
        response.writeHead(500, {'Content-Type':'text/html'})
        response.write(`
          <head><meta charset="UTF-8"><link href="css/index.css" rel="stylesheet"></head>
          <body class="errorPage">
            <h1>500</h1>
            <p>Internal error, we're sorry</p>
            <span> 👉🏻 </span>
            <a href="http://${request.headers.host}">go home</a>
          </body>`)
          response.end()
          return;
      }
      if (debug) console.dir(headers)
      response.writeHead(200, headers);
      response.write(data)
      response.end();
    })
  })
}).listen(port)
console.log(`Running on http://localhost:${port}/`);
