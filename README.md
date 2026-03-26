# SAQ — E-commerce Microservices

Hệ thống e-commerce bán thiết bị điện tử, kiến trúc microservices với Django REST Framework.

## Yêu cầu hệ thống

- **Docker** >= 24.0
- **Docker Compose** >= 2.20

Kiểm tra:

```bash
docker --version
docker compose version
```

## Kiến trúc

```
                        ┌──────────────┐
                        │    Client    │
                        └──────┬───────┘
                               │
                        ┌──────┴───────┐
                        │ API Gateway  │
                        │  Nginx :80   │
                        └──────┬───────┘
               ┌───────────┬───┴───┬───────────┐
               ▼           ▼       ▼           ▼
        ┌──────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
        │  User    │ │Product │ │ Order  │ │Inventory │
        │ Service  │ │Service │ │Service │ │ Service  │
        │  :8001   │ │ :8002  │ │ :8003  │ │  :8004   │
        │  MySQL   │ │  PgSQL │ │ PgSQL  │ │  PgSQL   │
        └──────────┘ └────────┘ └───┬────┘ └──────────┘
                                    │ REST (internal)
                              ┌─────┼─────┐
                              ▼     ▼     ▼
                           User  Product Inventory
```

## Services

| Service | Port | Gateway Path | Database | Mô tả |
|---------|------|-------------|----------|-------|
| **API Gateway** | **80** | `/api/*` | — | Nginx reverse proxy |
| User Service | 8001 | `/api/users/` | MySQL 8.0 | JWT auth, roles |
| Product Service | 8002 | `/api/products/`, `/api/categories/` | PostgreSQL 16 | CRUD, filter, search |
| Order Service | 8003 | `/api/orders/` | PostgreSQL 16 | Đơn hàng |
| Inventory Service | 8004 | `/api/inventory/` | PostgreSQL 16 | Tồn kho |

## Quick Start

### 1. Clone và chạy

```bash
cd SAQ
docker compose up --build
```

Lần đầu sẽ mất ~2-3 phút để build images và pull databases. Sau đó mỗi service tự động:
- Chạy `migrate` tạo tables
- Khởi động gunicorn

### 2. Kiểm tra hệ thống hoạt động

```bash
# Gateway health check
curl http://localhost/health

# Trả về: {"status": "ok"}
```

### 3. Test full flow

```bash
# Bước 1: Đăng ký user
curl -s -X POST http://localhost/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "StrongPass123!",
    "password_confirm": "StrongPass123!",
    "role": "customer"
  }'
```

Response:

```json
{
  "user": {
    "id": 1,
    "username": "john",
    "email": "john@example.com",
    "role": "customer",
    "is_active": true,
    "date_joined": "2026-03-26T..."
  },
  "tokens": {
    "access": "eyJ...",
    "refresh": "eyJ..."
  }
}
```

```bash
# Bước 2: Tạo category
curl -s -X POST http://localhost/api/categories/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptops"}'
```

```bash
# Bước 3: Tạo sản phẩm
curl -s -X POST http://localhost/api/products/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MacBook Pro 16",
    "brand": "Apple",
    "price": "2499.99",
    "description": "M3 Max chip, 36GB RAM",
    "specs": {"chip": "M3 Max", "ram": "36GB", "storage": "1TB SSD"},
    "category": 1
  }'
```

```bash
# Bước 4: Set tồn kho
curl -s -X POST http://localhost/api/inventory/ \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 50}'
```

```bash
# Bước 5: Đặt hàng
curl -s -X POST http://localhost/api/orders/ \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "items": [{"product_id": 1, "quantity": 2}],
    "shipping_address": "123 Main St, HCMC"
  }'
```

Response:

```json
{
  "id": 1,
  "user_id": 1,
  "status": "confirmed",
  "total_amount": "4999.98",
  "shipping_address": "123 Main St, HCMC",
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "MacBook Pro 16",
      "unit_price": "2499.99",
      "quantity": 2,
      "line_total": "4999.98"
    }
  ]
}
```

```bash
# Bước 6: Kiểm tra tồn kho đã giảm
curl -s http://localhost/api/inventory/1/
# quantity: 48 (giảm 2)
```

```bash
# Bước 7: Huỷ đơn (tự động restock)
curl -s -X POST http://localhost/api/orders/1/cancel/
```

### 4. Tắt hệ thống

```bash
docker compose down          # giữ data
docker compose down -v       # xoá luôn data databases
```

## API Endpoints chi tiết

### User Service — `/api/users/`

| Method | Endpoint | Mô tả | Auth | Request Body |
|--------|----------|-------|------|-------------|
| POST | `/register/` | Đăng ký | Không | `{username, email, password, password_confirm, role}` |
| POST | `/login/` | Đăng nhập | Không | `{username, password}` |
| POST | `/logout/` | Đăng xuất | Bearer | `{refresh}` |
| POST | `/token/refresh/` | Refresh JWT | Không | `{refresh}` |
| GET | `/me/` | Thông tin user | Bearer | — |
| POST | `/change-password/` | Đổi mật khẩu | Bearer | `{old_password, new_password, new_password_confirm}` |
| POST | `/password-reset/` | Yêu cầu reset | Không | `{email}` |
| POST | `/password-reset/confirm/` | Xác nhận reset | Không | `{uid, token, new_password, new_password_confirm}` |

**Roles:** `customer`, `staff`, `admin`

**Đăng nhập:**

```bash
curl -X POST http://localhost/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "password": "StrongPass123!"}'
```

**Sử dụng token:**

```bash
curl http://localhost/api/users/me/ \
  -H "Authorization: Bearer <access_token>"
```

### Product Service — `/api/products/`, `/api/categories/`

| Method | Endpoint | Mô tả | Request Body |
|--------|----------|-------|-------------|
| GET | `/api/products/` | List (phân trang) | — |
| POST | `/api/products/` | Tạo | `{name, brand, price, description, specs, category}` |
| GET | `/api/products/{id}/` | Chi tiết | — |
| PUT | `/api/products/{id}/` | Cập nhật toàn bộ | `{name, brand, price, ...}` |
| PATCH | `/api/products/{id}/` | Cập nhật 1 phần | `{price: "1999.99"}` |
| DELETE | `/api/products/{id}/` | Xoá | — |
| GET | `/api/categories/` | List categories | — |
| POST | `/api/categories/` | Tạo category | `{name, parent?}` |

**Filter & Search:**

```bash
# Filter theo brand
curl "http://localhost/api/products/?brand=Apple"

# Filter theo giá
curl "http://localhost/api/products/?min_price=1000&max_price=3000"

# Filter theo category
curl "http://localhost/api/products/?category=1"

# Search theo tên
curl "http://localhost/api/products/?search=MacBook"

# Sắp xếp theo giá giảm dần
curl "http://localhost/api/products/?ordering=-price"

# Kết hợp
curl "http://localhost/api/products/?brand=Apple&min_price=500&ordering=price"
```

### Order Service — `/api/orders/`

| Method | Endpoint | Mô tả | Request Body |
|--------|----------|-------|-------------|
| POST | `/api/orders/` | Tạo đơn | `{user_id, items: [{product_id, quantity}], shipping_address}` |
| GET | `/api/orders/` | List | `?user_id=1` |
| GET | `/api/orders/{id}/` | Chi tiết | — |
| PATCH | `/api/orders/{id}/status/` | Đổi trạng thái | `{status}` |
| POST | `/api/orders/{id}/cancel/` | Huỷ đơn | — |

**Trạng thái đơn hàng:** `pending` → `confirmed` → `shipped` → `delivered` | `cancelled`

### Inventory Service — `/api/inventory/`

| Method | Endpoint | Mô tả | Request Body |
|--------|----------|-------|-------------|
| POST | `/api/inventory/` | Tạo stock | `{product_id, quantity, low_stock_threshold?}` |
| GET | `/api/inventory/{product_id}/` | Xem stock | — |

## API Gateway

Nginx reverse proxy tại port **80** — entry point duy nhất cho client.

| Path | Upstream |
|------|----------|
| `/api/users/*` | User Service |
| `/api/products/*` | Product Service |
| `/api/categories/*` | Product Service |
| `/api/orders/*` | Order Service |
| `/api/inventory/*` | Inventory Service |
| `/health` | Health check |
| `*/internal/*` | **BLOCKED (403)** |

Tất cả `/internal/` endpoints bị gateway chặn — chỉ service-to-service trong Docker network mới gọi được.

## Giao tiếp giữa services

Khi tạo đơn hàng, Order Service gọi 3 service khác qua REST:

```
POST /api/orders/ (client gửi: user_id, items, shipping_address)
  │
  ├─→ User Service:      GET  /api/users/internal/validate/{user_id}/
  ├─→ Product Service:   POST /api/internal/products/bulk/
  ├─→ Inventory Service: POST /api/internal/inventory/check-stock/
  ├─→ Inventory Service: POST /api/internal/inventory/deduct/
  └─→ Tạo Order + OrderItems → Response 201
```

Khi huỷ đơn:

```
POST /api/orders/{id}/cancel/
  │
  ├─→ Inventory Service: POST /api/internal/inventory/restock/ (mỗi item)
  └─→ Update status = cancelled → Response 200
```

Internal endpoints bảo vệ bằng header `X-Internal-Token` (env var `INTERNAL_API_KEY`).

## Cấu trúc thư mục

```
SAQ/
├── docker-compose.yml
├── README.md
├── gateway/
│   ├── Dockerfile
│   └── nginx.conf
├── user_service/
│   ├── manage.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── user_service/
│       ├── settings.py
│       ├── urls.py
│       ├── wsgi.py
│       └── users/
│           ├── models.py         # User (AbstractUser + role)
│           ├── serializers.py
│           ├── views.py
│           ├── admin.py
│           └── urls.py
├── product_service/
│   ├── manage.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── product_service/
│       ├── settings.py
│       ├── urls.py
│       ├── wsgi.py
│       └── products/
│           ├── models.py         # Category, Product
│           ├── serializers.py
│           ├── views.py
│           ├── filters.py        # django-filter
│           ├── admin.py
│           └── urls.py
├── order_service/
│   ├── manage.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── order_service/
│       ├── settings.py
│       ├── urls.py
│       ├── wsgi.py
│       └── orders/
│           ├── models.py         # Order, OrderItem
│           ├── serializers.py
│           ├── views.py
│           ├── services.py       # orchestration logic
│           ├── clients.py        # HTTP wrappers
│           ├── admin.py
│           └── urls.py
└── inventory_service/
    ├── manage.py
    ├── Dockerfile
    ├── requirements.txt
    └── inventory_service/
        ├── settings.py
        ├── urls.py
        ├── wsgi.py
        └── inventory/
            ├── models.py         # Inventory
            ├── serializers.py
            ├── views.py
            ├── services.py       # stock logic (select_for_update)
            ├── admin.py
            └── urls.py
```

## Biến môi trường

Tất cả đã có giá trị mặc định trong `settings.py`, nhưng **phải đổi trong production**.

| Biến | Mặc định | Dùng ở |
|------|----------|--------|
| `DJANGO_SECRET_KEY` | `django-insecure-...` | Tất cả |
| `DEBUG` | `True` | Tất cả |
| `ALLOWED_HOSTS` | `*` | Tất cả |
| `INTERNAL_API_KEY` | `internal-secret-key` | Tất cả |
| `MYSQL_HOST` | `127.0.0.1` | User |
| `MYSQL_PORT` | `3306` | User |
| `MYSQL_DATABASE` | `user_service_db` | User |
| `MYSQL_USER` | `root` | User |
| `MYSQL_PASSWORD` | `root` | User |
| `POSTGRES_HOST` | `127.0.0.1` | Product, Order, Inventory |
| `POSTGRES_PORT` | `5432` | Product, Order, Inventory |
| `POSTGRES_DB` | `*_service_db` | Product, Order, Inventory |
| `POSTGRES_USER` | `postgres` | Product, Order, Inventory |
| `POSTGRES_PASSWORD` | `postgres` | Product, Order, Inventory |
| `USER_SERVICE_URL` | `http://localhost:8001` | Order |
| `PRODUCT_SERVICE_URL` | `http://localhost:8002` | Order |
| `INVENTORY_SERVICE_URL` | `http://localhost:8004` | Order |

## Chạy từng service riêng (dev không Docker)

```bash
# Ví dụ: Product Service
cd product_service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Cần PostgreSQL đang chạy với database product_service_db
export POSTGRES_HOST=127.0.0.1
export POSTGRES_DB=product_service_db

python manage.py migrate
python manage.py runserver 8002
```

## Troubleshooting

**Port 80 đã bị dùng:**

```bash
# Đổi port gateway trong docker-compose.yml
# Thay "80:80" thành "8080:80"
# Truy cập: http://localhost:8080/api/...
```

**MySQL chưa sẵn sàng:**

```bash
# User service có thể fail lần đầu vì MySQL cần thời gian init
# docker compose sẽ tự restart, hoặc:
docker compose restart user_service
```

**Xem logs:**

```bash
docker compose logs -f                    # tất cả
docker compose logs -f order_service      # 1 service
docker compose logs -f gateway            # gateway
```

**Rebuild 1 service:**

```bash
docker compose up --build order_service
```
