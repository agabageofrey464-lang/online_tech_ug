# Online Tech Uganda — Site Pages (demo / video shot-list)

Live site: **https://www.onlinetechug.com**  ·  Admin: **https://admin.onlinetechug.com** (user `agaba`)

Use this as a walkthrough order when recording a screen video of the system.

## Storefront (customer-facing)
| # | Page | URL | What to show |
|---|------|-----|--------------|
| 1 | Home | `/` | Hero (desktop), "Explore our top categories" circles, feature strip, flash sales, product grids |
| 2 | Shop | `/shop` | Jumia-style product grid, category/brand/price filters, "Newest arrivals" sort |
| 3 | Product detail | `/shop/hp-elitebook-840-g3` | Gallery, Official Store badge, flash-sale price box, items-left bar, Add to cart, Delivery & Returns |
| 4 | Cart drawer | (click Cart) | Product images, qty stepper, subtotal, Checkout |
| 5 | Checkout | `/checkout` | Numbered steps (Address, Delivery, Payment MTN/Airtel/COD), Order summary |
| 6 | Services | `/services` | Web, software, repairs, IT support |
| 7 | Portfolio | `/portfolio` | "Systems we build" — capabilities, work grid, process, CTA |
| 8 | Learn | `/learn` | Courses, live classes; open a course to show lessons + unlock flow |
| 9 | Request Software | `/request` | Custom system request form |
| 10 | Track Project | `/track` | Client project tracker |
| 11 | Videos | `/videos` | Video showcase |
| 12 | Blog | `/blog` | Tech articles |
| 13 | Sell with us | `/sell` | Vendor onboarding |
| 14 | About / Contact | `/about`, `/contact` | Company info, CEO, contacts |

## Accounts & vendor
| # | Page | URL | Notes |
|---|------|-----|-------|
| 15 | Sign up | `/signup` | Customer or **Sell as vendor** toggle |
| 16 | Login | `/login` | Email + password |
| 17 | My Account | `/account` | Jumia-style dashboard: Orders, Address, Details + header dropdown |
| 18 | Wishlist | `/wishlist` | Saved items |
| 19 | Vendor dashboard | `/vendor` | Approval status, stats, add/list/delete products |

## Admin panel (https://admin.onlinetechug.com)
- Dashboard, Products (add/list), Orders, Courses (unlock-code manager), Leads, Settings.

## Backend status
The API at https://api.onlinetechug.com is deployed with the `/auth`, `/vendor` and
`/unlock-codes` routes, so Login, Sign up, Vendor and the course auto-code are live.
(Checked 2026-10-05: every page above returned 200 and no link or image on them was broken.)

Backend changes only reach the live site when `bash deploy/deploy.sh` is run — pushing to
GitHub updates the two Vercel apps, not the API.
