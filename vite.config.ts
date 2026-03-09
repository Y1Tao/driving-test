import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

// Custom plugin to handle data persistence
const dataPersistencePlugin = () => {
  return {
    name: 'data-persistence',
    configureServer(server) {
      server.middlewares.use('/api/data', (req, res, next) => {
        const filePath = path.resolve(__dirname, 'userData.json')
        
        if (req.method === 'GET') {
          try {
            if (fs.existsSync(filePath)) {
              const data = fs.readFileSync(filePath, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(data)
            } else {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ wrongQuestions: [], answeredQuestions: [], practiceIndex: 0 }))
            }
          } catch (e) {
            console.error('Error reading userData.json:', e)
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Failed to read data' }))
          }
        } else if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk.toString()
          })
          req.on('end', () => {
            try {
              // Validate JSON
              JSON.parse(body)
              fs.writeFileSync(filePath, body, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true }))
            } catch (e) {
              console.error('Error writing userData.json:', e)
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'Failed to save data' }))
            }
          })
        } else {
          next()
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  // 如果部署到 Gitee Pages/GitHub Pages，需要设置 base 路径
  // 例如：base: '/driving-test/'
  base: './', 
  plugins: [
    vue(),
    tailwindcss(),
    dataPersistencePlugin()
  ],
})
