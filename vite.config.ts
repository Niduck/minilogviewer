import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import * as fs from "fs";
import * as path from "path";

// https://vitejs.dev/config/
export default function(){
  const baseURL = "/minilogviewer"

  return defineConfig({
    base:baseURL,
    server: {
      https: {
        key: fs.readFileSync(path.resolve(__dirname, 'localhost-key.pem')),
        cert: fs.readFileSync(path.resolve(__dirname, 'localhost.pem')),
      },
    },
    build: {
      outDir: 'docs'
    },
    resolve: {
      alias: [{ find: '@', replacement: '/src' }, { find: 'src', replacement: '/src' }],
    },
    plugins: [react()],
  })
}
