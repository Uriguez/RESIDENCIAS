# Guía de Despliegue - Sistema Griver

## Opciones de Despliegue

### 1. Vercel (Recomendado para React)

#### Preparación
```bash
# Instalar Vercel CLI
npm i -g vercel

# En el directorio del proyecto
vercel login
```

#### Configuración (vercel.json)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "@api_url",
    "REACT_APP_ENVIRONMENT": "production"
  }
}
```

#### Despliegue
```bash
# Despliegue automático
vercel

# Con dominio personalizado
vercel --prod --domain griver-training.vercel.app
```

### 2. Netlify

#### Configuración (netlify.toml)
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  REACT_APP_API_URL = "https://api.griver.com"
  REACT_APP_ENVIRONMENT = "production"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 3. AWS S3 + CloudFront

#### Script de despliegue (deploy-aws.sh)
```bash
#!/bin/bash
set -e

# Variables
BUCKET_NAME="griver-training-app"
CLOUDFRONT_ID="E1234567890123"
REGION="us-east-1"

echo "Building application..."
npm run build

echo "Uploading to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete --region $REGION

echo "Setting cache headers..."
aws s3 cp s3://$BUCKET_NAME s3://$BUCKET_NAME --recursive \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=31536000" \
  --exclude "*.html" \
  --exclude "service-worker.js"

aws s3 cp s3://$BUCKET_NAME s3://$BUCKET_NAME --recursive \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=0, must-revalidate" \
  --include "*.html" \
  --include "service-worker.js"

echo "Invalidating CloudFront..."
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_ID \
  --paths "/*"

echo "Deployment completed!"
```

### 4. Docker

#### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    sendfile        on;
    keepalive_timeout  65;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/x-javascript
        application/javascript
        application/xml+rss
        application/json;
    
    server {
        listen       80;
        server_name  localhost;
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        
        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # Cache static assets
        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:;" always;
        
        # Error pages
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
    }
}
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  griver-training:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.griver-training.rule=Host(`training.griver.com`)"
      - "traefik.http.routers.griver-training.tls=true"
      - "traefik.http.routers.griver-training.tls.certresolver=letsencrypt"
```

## Variables de Entorno

### Desarrollo (.env.development)
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0
REACT_APP_ENABLE_MOCK_DATA=true
REACT_APP_LOG_LEVEL=debug
```

### Producción (.env.production)
```env
REACT_APP_API_URL=https://api.griver.com/v1
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
REACT_APP_ENABLE_MOCK_DATA=false
REACT_APP_LOG_LEVEL=error
REACT_APP_SENTRY_DSN=https://your-sentry-dsn
REACT_APP_GTM_ID=GTM-XXXXXXX
```

## CI/CD Pipeline

### GitHub Actions (.github/workflows/deploy.yml)
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Type check
      run: npm run type-check
    
    - name: Build application
      run: npm run build
      env:
        REACT_APP_API_URL: ${{ secrets.API_URL }}
        REACT_APP_ENVIRONMENT: production
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: dist/

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-files
        path: dist/
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## Optimización para Producción

### Vite Configuration (vite.config.ts)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { splitVendorChunkPlugin } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          charts: ['recharts'],
          utils: ['date-fns', 'clsx']
        }
      }
    },
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  preview: {
    port: 4173
  }
});
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:analyze": "npm run build && npx vite-bundle-analyzer dist/assets/*.js",
    "preview": "vite preview",
    "test": "vitest",
    "test:ci": "vitest run --coverage",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "npm run lint -- --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "deploy:vercel": "vercel --prod",
    "deploy:netlify": "netlify deploy --prod --dir=dist",
    "deploy:aws": "./scripts/deploy-aws.sh"
  }
}
```

## Monitoreo y Analytics

### Error Tracking (Sentry)
```typescript
// src/lib/sentry.ts
import * as Sentry from "@sentry/react";

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.REACT_APP_ENVIRONMENT,
    tracesSampleRate: 0.1,
    beforeSend(event) {
      // Filtrar errores conocidos
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.value?.includes('Non-Error promise rejection')) {
          return null;
        }
      }
      return event;
    }
  });
}
```

### Google Analytics
```typescript
// src/lib/analytics.ts
import { gtag } from 'ga-gtag';

export const GA_TRACKING_ID = process.env.REACT_APP_GTM_ID;

export const trackEvent = (action: string, parameters?: any) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', action, parameters);
  }
};

export const trackPageView = (url: string) => {
  if (typeof gtag !== 'undefined') {
    gtag('config', GA_TRACKING_ID, {
      page_location: url
    });
  }
};
```

## Performance Optimization

### Service Worker (public/sw.js)
```javascript
const CACHE_NAME = 'griver-training-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
```

### Lazy Loading
```typescript
// Lazy load de componentes
const Dashboard = lazy(() => import('./components/Dashboard'));
const CourseManagement = lazy(() => import('./components/CourseManagement'));
const AdvancedAnalytics = lazy(() => import('./components/AdvancedAnalytics'));

// En el componente principal
<Suspense fallback={<LoadingSpinner text="Cargando..." />}>
  <Dashboard />
</Suspense>
```

## Security Checklist

- [ ] HTTPS habilitado
- [ ] Variables de entorno configuradas correctamente
- [ ] Secrets no expuestos en el código
- [ ] Headers de seguridad configurados
- [ ] CSP (Content Security Policy) implementado
- [ ] Autenticación y autorización funcionando
- [ ] Rate limiting en API endpoints
- [ ] Logs de seguridad habilitados
- [ ] Dependencias actualizadas
- [ ] Vulnerabilidades escaneadas

## Monitoring y Alertas

### Health Check Endpoint
```typescript
// Endpoint para verificar estado de la aplicación
export const healthCheck = () => {
  return {
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.REACT_APP_VERSION,
    environment: process.env.REACT_APP_ENVIRONMENT
  };
};
```

### Alertas recomendadas
- Error rate > 5%
- Response time > 2s
- Availability < 99%
- Memory usage > 85%
- Disk space < 15%

## Rollback Strategy

### Plan de Rollback
1. **Identificar el problema**
2. **Revertir a versión anterior**
   ```bash
   # Vercel
   vercel rollback
   
   # Netlify
   netlify sites:rollback --site-id SITE_ID
   
   # Docker
   docker service update --rollback griver-training
   ```
3. **Verificar funcionalidad**
4. **Comunicar a usuarios**
5. **Analizar causa raíz**

Esta guía proporciona múltiples opciones de despliegue adaptadas a diferentes necesidades y presupuestos, desde soluciones gratuitas hasta infraestructura empresarial completa.