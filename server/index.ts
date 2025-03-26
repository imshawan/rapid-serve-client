import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { getEnv, getEnvValue, getPort, isDevelopment } from '../lib/config'
import initializeWebSocketServer from './websocket'
 
const port = getPort()
const dev = isDevelopment()
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  }).listen(port)

  initializeWebSocketServer(server)
 
  console.log(
    `> Server listening at ${getEnvValue("NEXT_PUBLIC_SERVER_URL")} in ${
      getEnv()
    } mode`
  )
})