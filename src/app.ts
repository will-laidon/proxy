import express, { Application, Request, Response } from 'express'
import axios from 'axios'
import config from 'dotenv'
import * as _ from 'lodash'
import chalk from 'chalk'

config.config()

const app: Application = express()

enum Ports {
  MAIN = 3000,
  ADMIN = 3001,
}
const PORT = Ports.MAIN

const headers =  {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US",
    "application-interface-key": "52ve7fwy",
    "content-type": "application/json",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Chromium\";v=\"140\", \"Not=A?Brand\";v=\"24\", \"Brave\";v=\"140\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1",
    "x-correlation-id": "amber.nguyen@laidon.com",
    "x-csrf-token": "e658b93b0731c3f9-FpgWETauMRvYYWT0loC2aKD8GZ4",
    "cookie": "__VCAP_ID__=88d21143-f7ac-4daf-5767-30d5; JSESSIONID=s%3AfXjrWniPJJhX0spr-w3OWBPic7UGXCno.liNWNBdxG0rlp6pkxs9ErnbXrGxncOuAriCC4VEAqHg",
    "Referer": "https://edf-qep-simplemdg-web.cfapps.us21.hana.ondemand.com/main/index.html"
  }

// IMPORTANT: put the proxy route BEFORE json/urlencoded middlewares and use a raw body
app.use('/*', async (req: Request, res: Response) => {
  try {
    const SV_URL = new URL(headers.Referer).origin
    const targetUrl = `${SV_URL}${req.originalUrl}`

    console.log(chalk.magenta('[Proxy]'), chalk.cyan(targetUrl))

    const upstream = await axios.request({
      method: req.method as any,
      url: targetUrl,
      data: req.body,               // keep old parsers & behavior
      headers,                      // your existing upstream headers
      responseType: 'stream',       // stream everything; we’ll branch below
      validateStatus: () => true,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    })

    // Determine if it's JSON/text vs binary
    const ct = String(upstream.headers['content-type'] || '').toLowerCase()
    const isTextual =
      ct.includes('application/json') ||
      ct.startsWith('text/') ||
      ct.includes('xml') ||
      ct.includes('javascript')

    // Pass through headers (skip hop-by-hop). If we reserialize text/JSON,
    // drop content-length because the size can change.
    const hopByHop = new Set([
      'connection','transfer-encoding','keep-alive','proxy-authenticate',
      'proxy-authorization','te','trailer','upgrade'
    ])
    for (const [k, v] of Object.entries(upstream.headers)) {
      const key = k.toLowerCase()
      if (hopByHop.has(key)) continue
      if (isTextual && key === 'content-length') continue
      if (v != null) res.setHeader(k, String(v))
    }

    res.status(upstream.status ?? 200)

    if (!isTextual) {
      // === Binary path (images, pdf, etc.) — keep bytes exactly the same ===
      if (req.method === 'HEAD') return res.end()
      return (upstream.data as NodeJS.ReadableStream).pipe(res)
    }

    // === Text/JSON path — keep old semantics ===
    const chunks: Buffer[] = []
    for await (const chunk of upstream.data as NodeJS.ReadableStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    const bodyBuf = Buffer.concat(chunks)

    if (ct.includes('application/json')) {
      // Axios previously gave you parsed JSON; preserve that by parsing here.
      try {
        const json = JSON.parse(bodyBuf.toString('utf8'))
        return res.send(json)                 // Express sets content-type/length
      } catch {
        // If upstream sent invalid JSON with JSON header, just forward as text
        return res.send(bodyBuf.toString('utf8'))
      }
    }

    // text/*, xml, js, etc. — forward as text
    return res.send(bodyBuf.toString('utf8'))

  } catch (error: any) {
    const status = error?.response?.status || 500
    const message = error?.response?.data || error?.message || 'Internal Server Error'
    console.error(chalk.red('[Proxy Error]'), chalk.yellow(String(status)), message)
    // If upstream error body is binary, end with buffer; else send text
    if (Buffer.isBuffer(message)) return res.status(status).end(message)
    return res.status(status).send(message)
  }
})

app.listen(PORT, (): void => {
  console.log(chalk.green('SERVER IS UP ON PORT:'), chalk.yellow(PORT))
})
