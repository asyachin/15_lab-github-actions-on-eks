FROM nginx:alpine
# Copy custom Nginx config (proxies /api to the backend when not using an Ingress)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Static assets
COPY public/ /usr/share/nginx/html/
EXPOSE 80