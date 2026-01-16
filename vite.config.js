import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    open: true,           // Автоматически открывать браузер
    port: 3000,           // Порт (по умолчанию 5173)
    host: true,           // Доступ с других устройств в сети
  },
  preview: {
    open: true            // Также открывать при preview-режиме
  },
  base: './',
});