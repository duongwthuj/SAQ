# SAQ — E-commerce Microservices

Hệ thống e-commerce bán thiết bị điện tử & quần áo, kiến trúc microservices với Django REST Framework.

## Yêu cầu hệ thống

- **Docker** >= 24.0
- **Docker Compose** >= 2.20

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
          ┌──────────┬──────┬────┴────┬──────┬──────────┐
          ▼          ▼      ▼         ▼      ▼          ▼
    ┌──────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
    │Customer  │ │Staff │ │Laptop│ │Clothes│ │ Cart │ │Order │
    │ Service  │ │Svc   │ │ Svc  │ │ Svc  │ │ Svc  │ │ Svc  │
    │  :8001   │ │:8002 │ │:8003 │ │:8004 │ │:8005 │ │:8006 │
    │  MySQL   │ │MySQL │ │PgSQL │ │PgSQL │ │PgSQL │ │PgSQL │
    └──────────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘
```

## Services

| Service | Port | Gateway Path | Database | Mô tả |
|---------|------|-------------|----------|-------|
| **API Gateway** | **80** | `/api/*` | — | Nginx reverse proxy |
| Customer Service | 8001 | `/api/customers/` | MySQL 8.0 | Đăng ký/đăng nhập khách hàng, JWT |
| Staff Service | 8002 | `/api/staff/` | MySQL 8.0 | Đăng ký/đăng nhập nhân viên, JWT |
| Laptop Service | 8003 | `/api/laptops/` | PostgreSQL 16 | CRUD laptop, tồn kho, filter/search |
| Clothes Service | 8004 | `/api/clothes/` | PostgreSQL 16 | CRUD quần áo, tồn kho, filter/search |
| Cart Service | 8005 | `/api/cart/` | PostgreSQL 16 | Giỏ hàng |
| Order Service | 8006 | `/api/orders/` | PostgreSQL 16 | Đơn hàng |

## Quick Start

### 1. Chạy tất cả

```bash
cd SAQ
docker compose up --build
```

Lần đầu ~3-5 phút (build images + pull databases). Mỗi service tự động migrate và khởi động gunicorn.

### 2. Kiểm tra

```bash
curl http://localhost/health
# {"status": "ok"}
```

### 3. Test full flow

```bash
# 1. Đăng ký customer
curl -s -X POST http://localhost/api/customers/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "StrongPass123!",
    "password_confirm": "StrongPass123!"
  }'
```

```json
{
  "user": {"id": 1, "username": "john", "email": "john@example.com"},
  "tokens": {"access": "eyJ...", "refresh": "eyJ..."}
}
```

```bash
# 2. Tạo category laptop
curl -s -X POST http://localhost/api/laptops/categories/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Gaming"}'
```

```bash
# 3. Tạo laptop
curl -s -X POST http://localhost/api/laptops/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MacBook Pro 16",
    "brand": "Apple",
    "price": "2499.99",
    "description": "M3 Max chip",
    "specs": {"chip": "M3 Max", "ram": "36GB"},
    "category": 1
  }'
```

```bash
# 4. Tạo tồn kho cho laptop
curl -s -X POST http://localhost/api/laptops/inventory/ \
  -H "Content-Type: application/json" \
  -d '{"laptop_id": 1, "quantity": 50}'
```

```bash
# 5. Thêm vào giỏ hàng
curl -s -X POST http://localhost/api/cart/create/ \
  -H "Content-Type: application/json" \
  -d '{"customer_id": 1}'

curl -s -X POST http://localhost/api/cart/add/ \
  -H "Content-Type: application/json" \
  -d '{"customer_id": 1, "product_id": 1, "product_type": "laptop", "quantity": 2}'
```

```bash
# 6. Đặt hàng
curl -s -X POST http://localhost/api/orders/ \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [{"product_id": 1, "product_type": "laptop", "quantity": 2}],
    "shipping_address": "123 Main St, HCMC"
  }'
```

```json
{
  "id": 1,
  "customer_id": 1,
  "status": "confirmed",
  "total_amount": "4999.98",
  "items": [
    {
      "product_id": 1,
      "product_type": "laptop",
      "product_name": "MacBook Pro 16",
      "unit_price": "2499.99",
      "quantity": 2,
      "line_total": "4999.98"
    }
  ]
}
```

```bash
# 7. Kiểm tra tồn kho đã giảm
curl -s http://localhost/api/laptops/inventory/1/
# quantity: 48

# 8. Huỷ đơn (tự restock)
curl -s -X POST http://localhost/api/orders/1/cancel/
```

### 4. Tắt hệ thống

```bash
docker compose down          # giữ data
docker compose down -v       # xoá luôn data
```

## API Endpoints

### Customer Service — `/api/customers/`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `register/` | Đăng ký | — |
| POST | `login/` | Đăng nhập | — |
| POST | `logout/` | Đăng xuất | Bearer |
| POST | `token/refresh/` | Refresh JWT | — |
| GET | `me/` | Thông tin customer | Bearer |
| POST | `change-password/` | Đổi mật khẩu | Bearer |
| POST | `password-reset/` | Yêu cầu reset | — |
| POST | `password-reset/confirm/` | Xác nhận reset | — |

**Đăng nhập:**

```bash
curl -X POST http://localhost/api/customers/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "password": "StrongPass123!"}'
```

**Dùng token:**

```bash
curl http://localhost/api/customers/me/ \
  -H "Authorization: Bearer <access_token>"
```

### Staff Service — `/api/staff/`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `register/` | Đăng ký staff | — |
| POST | `login/` | Đăng nhập | — |
| POST | `logout/` | Đăng xuất | Bearer |
| POST | `token/refresh/` | Refresh JWT | — |
| GET | `me/` | Thông tin staff | Bearer |

### Laptop Service — `/api/laptops/`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/laptops/` | Danh sách laptop (phân trang) |
| POST | `/api/laptops/` | Tạo laptop |
| GET | `/api/laptops/{id}/` | Chi tiết |
| PUT/PATCH | `/api/laptops/{id}/` | Cập nhật |
| DELETE | `/api/laptops/{id}/` | Xoá |
| GET | `/api/laptops/categories/` | Danh sách category |
| POST | `/api/laptops/categories/` | Tạo category |
| POST | `/api/laptops/inventory/` | Tạo tồn kho |
| GET | `/api/laptops/inventory/{laptop_id}/` | Xem tồn kho |

**Filter & Search:**

```bash
curl "http://localhost/api/laptops/?brand=Apple"
curl "http://localhost/api/laptops/?min_price=1000&max_price=3000"
curl "http://localhost/api/laptops/?search=MacBook"
curl "http://localhost/api/laptops/?ordering=-price"
```

### Clothes Service — `/api/clothes/`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/clothes/` | Danh sách quần áo |
| POST | `/api/clothes/` | Tạo |
| GET | `/api/clothes/{id}/` | Chi tiết |
| PUT/PATCH | `/api/clothes/{id}/` | Cập nhật |
| DELETE | `/api/clothes/{id}/` | Xoá |
| GET | `/api/clothes/categories/` | Categories |
| POST | `/api/clothes/categories/` | Tạo category |
| POST | `/api/clothes/inventory/` | Tạo tồn kho |
| GET | `/api/clothes/inventory/{item_id}/` | Xem tồn kho |

### Cart Service — `/api/cart/`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/cart/?customer_id=1` | Xem giỏ hàng |
| POST | `/api/cart/create/` | Tạo giỏ | `{customer_id}` |
| POST | `/api/cart/add/` | Thêm sản phẩm | `{customer_id, product_id, product_type, quantity}` |
| PUT | `/api/cart/items/{id}/` | Cập nhật số lượng | `{quantity}` |
| DELETE | `/api/cart/items/{id}/` | Xoá item |
| POST | `/api/cart/clear/` | Xoá toàn bộ giỏ | `{customer_id}` |

`product_type`: `"laptop"` hoặc `"clothes"`

### Order Service — `/api/orders/`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/orders/` | Tạo đơn hàng |
| GET | `/api/orders/?customer_id=1` | Danh sách đơn |
| GET | `/api/orders/{id}/` | Chi tiết đơn |
| PATCH | `/api/orders/{id}/status/` | Cập nhật trạng thái |
| POST | `/api/orders/{id}/cancel/` | Huỷ đơn |

**Tạo đơn:**

```bash
curl -X POST http://localhost/api/orders/ \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [
      {"product_id": 1, "product_type": "laptop", "quantity": 1},
      {"product_id": 1, "product_type": "clothes", "quantity": 2}
    ],
    "shipping_address": "123 Main St, HCMC"
  }'
```

**Trạng thái:** `pending` → `confirmed` → `shipped` → `delivered` | `cancelled`

## API Gateway

Nginx reverse proxy tại port **80**.

| Path | Service |
|------|---------|
| `/api/customers/*` | Customer Service |
| `/api/staff/*` | Staff Service |
| `/api/laptops/*` | Laptop Service |
| `/api/clothes/*` | Clothes Service |
| `/api/cart/*` | Cart Service |
| `/api/orders/*` | Order Service |
| `/health` | Health check |
| `*/internal/*` | **BLOCKED (403)** |

## Giao tiếp giữa services

Khi tạo đơn hàng, Order Service gọi:

```
POST /api/orders/
  │
  ├─→ Customer Service: GET  /api/customers/internal/validate/{id}/
  ├─→ Laptop Service:   POST /api/laptops/internal/laptops/bulk/
  ├─→ Laptop Service:   POST /api/laptops/internal/inventory/check-stock/
  ├─→ Laptop Service:   POST /api/laptops/internal/inventory/deduct/
  ├─→ Clothes Service:  POST /api/clothes/internal/clothes/bulk/
  ├─→ Clothes Service:  POST /api/clothes/internal/inventory/check-stock/
  ├─→ Clothes Service:  POST /api/clothes/internal/inventory/deduct/
  └─→ Tạo Order + OrderItems → 201
```

Huỷ đơn:

```
POST /api/orders/{id}/cancel/
  │
  ├─→ Laptop/Clothes:  POST .../internal/inventory/restock/ (mỗi item)
  └─→ status = cancelled → 200
```

Internal endpoints bảo vệ bằng header `X-Internal-Token` (env `INTERNAL_API_KEY`).

## Cấu trúc thư mục

```
SAQ/
├── docker-compose.yml
├── README.md
├── gateway/
│   ├── Dockerfile
│   └── nginx.conf
├── customer_service/          # MySQL
│   ├── manage.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── customer_service/
│       ├── settings.py
│       ├── urls.py
│       ├── wsgi.py
│       └── customers/
│           ├── models.py      # Customer (AbstractUser)
│           ├── serializers.py
│           ├── views.py
│           ├── admin.py
│           └── urls.py
├── staff_service/             # MySQL
│   ├── manage.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── staff_service/
│       └── staff/
│           ├── models.py      # Staff (AbstractUser + position, department)
│           └── ...
├── laptop_service/            # PostgreSQL
│   ├── manage.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── laptop_service/
│       └── laptops/
│           ├── models.py      # Category, Laptop, Inventory
│           ├── filters.py
│           ├── services.py    # stock logic
│           └── ...
├── clothes_service/           # PostgreSQL
│   ├── manage.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── clothes_service/
│       └── clothes/
│           ├── models.py      # Category, ClothingItem, Inventory
│           ├── filters.py
│           ├── services.py    # stock logic
│           └── ...
├── cart_service/              # PostgreSQL
│   ├── manage.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── cart_service/
│       └── cart/
│           ├── models.py      # Cart, CartItem
│           ├── clients.py     # LaptopClient, ClothesClient
│           └── ...
└── order_service/             # PostgreSQL
    ├── manage.py
    ├── Dockerfile
    ├── requirements.txt
    └── order_service/
        └── orders/
            ├── models.py      # Order, OrderItem
            ├── clients.py     # CustomerClient, LaptopClient, ClothesClient
            ├── services.py    # orchestration
            └── ...
```

## Biến môi trường

| Biến | Mặc định | Dùng ở |
|------|----------|--------|
| `DJANGO_SECRET_KEY` | `django-insecure-...` | Tất cả |
| `DEBUG` | `True` | Tất cả |
| `ALLOWED_HOSTS` | `*` | Tất cả |
| `INTERNAL_API_KEY` | `internal-secret-key` | Tất cả |
| `MYSQL_HOST/PORT/DATABASE/USER/PASSWORD` | `127.0.0.1:3306` | Customer, Staff |
| `POSTGRES_HOST/PORT/DB/USER/PASSWORD` | `127.0.0.1:5432` | Laptop, Clothes, Cart, Order |
| `CUSTOMER_SERVICE_URL` | `http://localhost:8001` | Order |
| `LAPTOP_SERVICE_URL` | `http://localhost:8003` | Cart, Order |
| `CLOTHES_SERVICE_URL` | `http://localhost:8004` | Cart, Order |
| `CART_SERVICE_URL` | `http://localhost:8005` | Order |

## Chạy riêng 1 service (dev không Docker)

```bash
cd laptop_service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Cần PostgreSQL chạy sẵn
export POSTGRES_HOST=127.0.0.1
export POSTGRES_DB=laptop_service_db

python manage.py migrate
python manage.py runserver 8003
```

## Troubleshooting

**Port 80 bị dùng:**

```bash
# Đổi trong docker-compose.yml: "8080:80"
# Truy cập: http://localhost:8080/api/...
```

**Database chưa sẵn sàng:**

```bash
# Docker compose tự restart, hoặc:
docker compose restart laptop_service
```

**Xem logs:**

```bash
docker compose logs -f                     # tất cả
docker compose logs -f order_service       # 1 service
docker compose logs -f gateway             # gateway
```

**Rebuild 1 service:**

```bash
docker compose up --build order_service
```
