#!/bin/bash

# Script bẻ khóa "Con gà và quả trứng" cho Nginx và Certbot

# 1. Cấu hình thông tin
domains=(quizflow.systems www.quizflow.systems)
rsa_key_size=4096
email="doduongnghiem03@gmail.com" # Email để nhận cảnh báo nếu chứng chỉ sắp hết hạn
staging=0 # Đặt bằng 1 nếu bạn sợ cấu hình sai bị khóa IP (Mặc định 0 là chạy thật)

# Sửa lỗi: Cấp biến môi trường tên đăng nhập DockerHub để docker-compose chạy được
export DOCKERHUB_USERNAME=nghiemdd

if ! [ -x "$(command -v docker)" ]; then
  echo 'Lỗi: Máy chủ chưa cài đặt Docker.' >&2
  exit 1
fi

# Rất quan trọng: Di chuyển vào đúng thư mục chứa docker-compose.yml
cd "$(dirname "$0")"

echo "### BƯỚC 1: Xây dựng chứng chỉ GIẢ mạo để Nginx chịu khởi động..."
docker compose run --rm --entrypoint "\
  sh -c 'mkdir -p /etc/letsencrypt/live/${domains[0]} && \
  openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1 \
    -keyout /etc/letsencrypt/live/${domains[0]}/privkey.pem \
    -out /etc/letsencrypt/live/${domains[0]}/fullchain.pem \
    -subj /CN=localhost'" certbot

echo "### BƯỚC 2: Tải về các thuật toán mã hóa (SSL Options)..."
docker compose run --rm --entrypoint "\
  sh -c 'wget -q -O /etc/letsencrypt/options-ssl-nginx.conf https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf && \
         wget -q -O /etc/letsencrypt/ssl-dhparams.pem https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem'" certbot

echo "### BƯỚC 3: Bật công tắc Nginx..."
docker compose up -d frontend

echo "### BƯỚC 4: Hủy chứng chỉ GIẢ mạo..."
docker compose run --rm --entrypoint "\
  sh -c 'rm -Rf /etc/letsencrypt/live/${domains[0]} && \
  rm -Rf /etc/letsencrypt/archive/${domains[0]} && \
  rm -Rf /etc/letsencrypt/renewal/${domains[0]}.conf'" certbot

echo "### BƯỚC 5: Mời Let's Encrypt cấp chứng chỉ THẬT..."
domain_args=""
for domain in "${domains[@]}"; do
  domain_args="$domain_args -d $domain"
done

if [ $staging != "0" ]; then staging_arg="--staging"; fi

docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    $domain_args \
    --email $email \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --force-renewal" certbot

echo "### BƯỚC 6: Khởi động lại Nginx để hấp thụ chứng chỉ mới..."
docker compose restart frontend

echo "🎉 HOÀN TẤT! Web đã khoác lên mình chiếc Ổ KHÓA XANH!"