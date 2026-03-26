# User Service

Django REST Framework microservice — quản lý user với JWT authentication.

## Tính năng

- User model với roles: `customer`, `staff`, `admin`
- JWT authentication (access + refresh token)
- Register / Login / Logout
- Change password
- Reset password (request + confirm)
- Token refresh
- Xem thông tin user hiện tại (`/me`)

## Tech stack

- Python 3.12
- Django 5.1
- Django REST Framework
- SimpleJWT (token blacklist)
- MySQL 8.0
- Gunicorn
- Docker / Docker Compose

## Cấu trúc project

```
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── manage.py
└── user_service/
    ├── settings.py
    ├── urls.py
    ├── wsgi.py
    └── users/
        ├── models.py
        ├── serializers.py
        ├── views.py
        ├── urls.py
        ├── admin.py
        └── migrations/
```

## Chạy với Docker Compose (khuyên dùng)

```bash
docker compose up --build
```

Service sẽ chạy tại `http://localhost:8000`. MySQL tự động được tạo và migrate.

Tắt:

```bash
docker compose down          # giữ data
docker compose down -v       # xoá luôn data MySQL
```

## Chạy local (không Docker)

### 1. Cài MySQL

Đảm bảo MySQL đang chạy, tạo database:

```sql
CREATE DATABASE user_service_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Tạo virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Set biến môi trường (tuỳ chọn)

```bash
export MYSQL_HOST=127.0.0.1
export MYSQL_PORT=3306
export MYSQL_DATABASE=user_service_db
export MYSQL_USER=root
export MYSQL_PASSWORD=root
export DJANGO_SECRET_KEY=your-secret-key
```

Hoặc dùng giá trị mặc định trong `settings.py`.

### 4. Migrate & chạy

```bash
python manage.py migrate
python manage.py runserver
```

### 5. Tạo superuser (tuỳ chọn)

```bash
python manage.py createsuperuser
```

Admin panel: `http://localhost:8000/admin/`

## API Endpoints

Base URL: `http://localhost:8000/api/users/`

| Method | Endpoint                | Mô tả                          | Auth    |
|--------|-------------------------|---------------------------------|---------|
| POST   | `/register/`            | Đăng ký, trả về JWT            | Không   |
| POST   | `/login/`               | Đăng nhập, trả về JWT          | Không   |
| POST   | `/logout/`              | Blacklist refresh token         | Bearer  |
| POST   | `/token/refresh/`       | Lấy access token mới           | Không   |
| GET    | `/me/`                  | Thông tin user hiện tại         | Bearer  |
| POST   | `/change-password/`     | Đổi mật khẩu                   | Bearer  |
| POST   | `/password-reset/`      | Yêu cầu reset password         | Không   |
| POST   | `/password-reset/confirm/` | Xác nhận reset password      | Không   |

## Ví dụ sử dụng (curl)

### Đăng ký

```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "StrongPass123!",
    "password_confirm": "StrongPass123!",
    "role": "customer"
  }'
```

### Đăng nhập

```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "password": "StrongPass123!"}'
```

### Xem thông tin user

```bash
curl http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer <access_token>"
```

### Đổi mật khẩu

```bash
curl -X POST http://localhost:8000/api/users/change-password/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "StrongPass123!",
    "new_password": "NewPass456!",
    "new_password_confirm": "NewPass456!"
  }'
```

### Reset password

```bash
# Bước 1: Yêu cầu reset
curl -X POST http://localhost:8000/api/users/password-reset/ \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'

# Bước 2: Xác nhận reset (dùng uid và token từ response bước 1)
curl -X POST http://localhost:8000/api/users/password-reset/confirm/ \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "<uid>",
    "token": "<token>",
    "new_password": "ResetPass789!",
    "new_password_confirm": "ResetPass789!"
  }'
```

### Refresh token

```bash
curl -X POST http://localhost:8000/api/users/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "<refresh_token>"}'
```

### Logout

```bash
curl -X POST http://localhost:8000/api/users/logout/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"refresh": "<refresh_token>"}'
```

## Biến môi trường

| Biến                | Mặc định                          | Mô tả              |
|---------------------|-----------------------------------|---------------------|
| `DJANGO_SECRET_KEY` | `django-insecure-change-me-...`   | Secret key Django   |
| `DEBUG`             | `True`                            | Debug mode          |
| `ALLOWED_HOSTS`     | `*`                               | Comma-separated     |
| `MYSQL_HOST`        | `127.0.0.1`                       | MySQL host          |
| `MYSQL_PORT`        | `3306`                            | MySQL port          |
| `MYSQL_DATABASE`    | `user_service_db`                 | Tên database        |
| `MYSQL_USER`        | `root`                            | MySQL user          |
| `MYSQL_PASSWORD`    | `root`                            | MySQL password      |
