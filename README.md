# 🔥 Spice & Ember

**Where Fire Meets Flavor**

A premium restaurant website for Spice & Ember — a fire-crafted dining experience featuring wood-fired cooking, smoked specialties, and craft cocktails.

## Features

- **Responsive Design** — Works on desktop, tablet, and mobile
- **Dark/Light Mode** — Toggle between themes
- **Full Menu** — Browse by category, search, and sort
- **Shopping Cart** — Add items, adjust quantities, checkout
- **Table Booking** — Reserve a table with date/time/guests
- **Admin Panel** — Dashboard, manage bookings, orders, and menu
- **Service Worker** — Offline support via cache
- **PWA Ready** — Manifest.json for installable web app

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Homepage with hero, featured dishes, testimonials |
| `menu.html` | Full menu with search, filters, and sorting |
| `book-table.html` | Table reservation form |
| `order.html` | Shopping cart and checkout |
| `about.html` | About us, team, values, review form |
| `404.html` | Custom 404 error page |
| `admin/index.html` | Admin login |
| `admin/dashboard.html` | Admin dashboard with stats |
| `admin/bookings.html` | Manage reservations |
| `admin/orders.html` | Manage orders |
| `admin/menu-manage.html` | Add/edit menu items |

## Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, animations, responsive grid
- **JavaScript** — Vanilla JS, localStorage for data persistence
- **Supabase** — PostgreSQL schema included (`SUPABASE_SCHEMA.sql`)

## Getting Started

1. Clone or download the repository
2. Open `index.html` in your browser
3. No build tools or server required — it's a static site

### Admin Access

- URL: `admin/index.html`
- Default credentials: `admin` / `admin123`

## Project Structure

```
spice-ember/
├── index.html
├── menu.html
├── book-table.html
├── order.html
├── about.html
├── 404.html
├── manifest.json
├── robots.txt
├── worker.js
├── README.md
├── SUPABASE_SCHEMA.sql
├── css/
│   ├── style.css
│   └── admin.css
├── js/
│   ├── config.js
│   ├── menu-data.js
│   ├── cart.js
│   ├── main.js
│   └── admin.js
└── admin/
    ├── index.html
    ├── dashboard.html
    ├── bookings.html
    ├── orders.html
    └── menu-manage.html
```

## Data Persistence

The site uses `localStorage` for:
- Cart items
- Bookings
- Orders
- Reviews
- Custom menu items (admin)
- Theme preference

## Supabase Integration

The `SUPABASE_SCHEMA.sql` file contains the full PostgreSQL schema for:
- `menu_items` — Menu catalog
- `bookings` — Table reservations
- `orders` — Customer orders
- `reviews` — Guest reviews
- `contact_messages` — Contact form submissions
- `newsletter_subscribers` — Email subscribers

Update `js/config.js` with your Supabase URL and anon key to enable backend integration.

## License

© 2026 Spice & Ember. All rights reserved.