"""Catalog data + access helpers.

DB-backed when the `products` table is populated; otherwise falls back to this
seed list so the storefront and checkout work during early development.
Keep slugs/prices/specs in sync with apps/web/src/lib/data.ts.
"""

import logging

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.product import Product

logger = logging.getLogger("onlinetech.catalog")

# Spec field order: type, processor, generation, ram, storage, graphics,
# display, os, battery, ports, build, purpose.
_SPEC_KEYS = (
    "type", "processor", "generation", "ram", "storage", "graphics",
    "display", "os", "battery", "ports", "build", "purpose",
)


def _s(*values: str) -> dict:
    return dict(zip(_SPEC_KEYS, values))


def _p(slug, name, category, brand, condition, description, price, rating, old=None, specs=None):
    return {
        "slug": slug,
        "name": name,
        "category": category,
        "brand": brand,
        "condition": condition,
        "description": description,
        "price_ugx": price,
        "old_price_ugx": old,
        "rating": rating,
        "in_stock": True,
        "image_url": "",
        "specs": specs,
    }


SEED_PRODUCTS: list[dict] = [
    # Budget laptops (550k–1M)
    _p("dell-latitude-e6440", "Dell Latitude E6440", "Laptops", "Dell", "UK Used",
       'Core i5 4th Gen, 4GB RAM, 320GB HDD, 14" HD, Windows 10', 650000, 4.3,
       specs=_s("Business Laptop", "Intel Core i5-4300U", "4th Generation",
                "4GB DDR3 (upgradable to 16GB)", "320GB HDD", "Intel HD Graphics 4400 (integrated)",
                '14" HD (1366 x 768)', "Windows 10 Pro", "Up to 4 hours",
                "USB 3.0, HDMI, VGA, Ethernet (RJ-45), SD card reader",
                "Durable business-grade chassis",
                "Everyday office work, browsing and students on a tight budget")),
    _p("hp-elitebook-840-g1", "HP EliteBook 840 G1", "Laptops", "HP", "UK Used",
       'Core i5 4th Gen, 4GB RAM, 500GB HDD, 14" HD, Windows 10', 700000, 4.3,
       specs=_s("Business Laptop", "Intel Core i5-4300U", "4th Generation",
                "4GB DDR3 (upgradable to 16GB)", "500GB HDD", "Intel HD Graphics 4400 (integrated)",
                '14" HD (1366 x 768)', "Windows 10 Pro", "Up to 5 hours",
                "USB 3.0, DisplayPort, VGA, Ethernet (RJ-45)",
                "Premium aluminium-magnesium body",
                "Reliable, affordable business laptop for office and study")),
    _p("lenovo-thinkpad-x240", "Lenovo ThinkPad X240", "Laptops", "Lenovo", "UK Used",
       'Core i5 4th Gen, 8GB RAM, 128GB SSD, 12.5" HD, lightweight', 780000, 4.4,
       specs=_s("Ultraportable Business Laptop", "Intel Core i5-4300U", "4th Generation",
                "8GB DDR3", "128GB SSD", "Intel HD Graphics 4400 (integrated)",
                '12.5" HD (1366 x 768)', "Windows 10 Pro", "Up to 7 hours (dual battery)",
                "USB 3.0, Mini DisplayPort, Ethernet (RJ-45)",
                "Legendary ThinkPad durability, MIL-SPEC tested",
                "Highly portable laptop for travel, meetings and note-taking")),
    _p("hp-probook-640-g2", "HP ProBook 640 G2", "Laptops", "HP", "UK Used",
       'Core i5 6th Gen, 8GB RAM, 256GB SSD, 14" HD', 880000, 4.4,
       specs=_s("Business Laptop", "Intel Core i5-6200U", "6th Generation",
                "8GB DDR4", "256GB SSD", "Intel HD Graphics 520 (integrated)",
                '14" HD (1366 x 768)', "Windows 10 Pro", "Up to 6 hours",
                "USB 3.0, USB-C, HDMI, VGA, Ethernet (RJ-45)",
                "Sturdy business chassis",
                "Faster everyday productivity with quick SSD storage")),
    _p("dell-latitude-e7270", "Dell Latitude E7270", "Laptops", "Dell", "UK Used",
       'Core i5 6th Gen, 8GB RAM, 256GB SSD, 12.5" FHD, ultrabook', 980000, 4.5,
       specs=_s("Ultrabook", "Intel Core i5-6300U", "6th Generation",
                "8GB DDR4", "256GB SSD", "Intel HD Graphics 520 (integrated)",
                '12.5" Full HD (1920 x 1080)', "Windows 10 Pro", "Up to 7 hours",
                "USB 3.0, USB-C, HDMI, Mini DisplayPort",
                "Premium, lightweight ultrabook design",
                "Slim, light laptop for professionals on the move")),
    # Mid-range laptops (1M–2M)
    _p("hp-elitebook-840-g3", "HP EliteBook 840 G3", "Laptops", "HP", "UK Used",
       'Core i5 6th Gen, 8GB RAM, 256GB SSD, 14" FHD', 1250000, 4.5,
       specs=_s("Business Ultrabook", "Intel Core i5-6300U", "6th Generation",
                "8GB DDR4 (upgradable to 32GB)", "256GB SSD", "Intel HD Graphics 520 (integrated)",
                '14" Full HD (1920 x 1080)', "Windows 10 Pro", "Up to 8 hours",
                "USB 3.0, USB-C, DisplayPort, VGA, Ethernet (RJ-45)",
                "Premium aluminium, MIL-STD 810G tested",
                "Professional work, multitasking and presentations")),
    _p("lenovo-thinkpad-t460", "Lenovo ThinkPad T460", "Laptops", "Lenovo", "UK Used",
       'Core i5 6th Gen, 8GB RAM, 256GB SSD, 14" FHD, dual battery', 1350000, 4.6,
       specs=_s("Business Laptop", "Intel Core i5-6300U", "6th Generation",
                "8GB DDR4 (upgradable to 32GB)", "256GB SSD", "Intel HD Graphics 520 (integrated)",
                '14" Full HD (1920 x 1080)', "Windows 10 Pro", "Up to 10 hours (dual battery)",
                "USB 3.0, USB-C, HDMI, Mini DisplayPort, Ethernet (RJ-45)",
                "ThinkPad MIL-SPEC durability",
                "All-day business computing with extra-long battery life")),
    _p("dell-latitude-7390", "Dell Latitude 7390", "Laptops", "Dell", "UK Used",
       'Core i5 8th Gen, 8GB RAM, 256GB SSD, 13.3" FHD', 1650000, 4.6,
       specs=_s("Business Ultrabook", "Intel Core i5-8350U", "8th Generation",
                "8GB DDR4 (upgradable to 16GB)", "256GB NVMe SSD", "Intel UHD Graphics 620 (integrated)",
                '13.3" Full HD (1920 x 1080)', "Windows 11 Pro", "Up to 9 hours",
                "USB-C Thunderbolt, USB 3.1, HDMI, microSD",
                "Compact carbon-fibre, durable",
                "Modern, fast laptop for professionals and students")),
    _p("lenovo-thinkpad-t14", "Lenovo ThinkPad T14", "Laptops", "Lenovo", "UK Used",
       'Core i5 10th Gen, 8GB RAM, 256GB SSD, 14" HD', 1980000, 4.5,
       specs=_s("Business Laptop", "Intel Core i5-10210U", "10th Generation",
                "8GB DDR4 (upgradable to 32GB)", "256GB NVMe SSD", "Intel UHD Graphics (integrated)",
                '14" HD (1366 x 768)', "Windows 11 Pro", "Up to 10 hours",
                "USB-C, USB 3.2, HDMI, Ethernet (RJ-45)",
                "Robust ThinkPad, MIL-SPEC tested",
                "Dependable workhorse for business and coding")),
    # Premium laptops (2M–4M)
    _p("hp-elitebook-840-g8", "HP EliteBook 840 G8", "Laptops", "HP", "UK Used",
       'Core i5 11th Gen, 16GB RAM, 512GB SSD, 14" FHD', 2150000, 4.7, old=2450000,
       specs=_s("Business Ultrabook", "Intel Core i5-1135G7", "11th Generation",
                "16GB DDR4", "512GB NVMe SSD", "Intel Iris Xe (integrated)",
                '14" Full HD (1920 x 1080)', "Windows 11 Pro", "Up to 11 hours",
                "2x USB-C Thunderbolt 4, 2x USB-A, HDMI",
                "Premium aluminium, MIL-STD 810H tested",
                "Powerful everyday performance for professionals and multitasking")),
    _p("dell-latitude-7420", "Dell Latitude 7420", "Laptops", "Dell", "UK Used",
       'Core i7 11th Gen, 16GB RAM, 256GB SSD, 14" FHD', 2380000, 4.6,
       specs=_s("Business Ultrabook", "Intel Core i7-1165G7", "11th Generation",
                "16GB DDR4", "256GB NVMe SSD", "Intel Iris Xe (integrated)",
                '14" Full HD (1920 x 1080)', "Windows 11 Pro", "Up to 12 hours",
                "USB-C Thunderbolt 4, USB-A, HDMI, microSD",
                "Premium carbon-fibre / aluminium",
                "High performance for demanding office workloads")),
    _p("dell-xps-13-9310", "Dell XPS 13 9310", "Laptops", "Dell", "Refurbished",
       'Core i7 11th Gen, 16GB RAM, 512GB SSD, 13.4" FHD+ touch', 3200000, 4.8,
       specs=_s("Premium Ultrabook", "Intel Core i7-1185G7", "11th Generation",
                "16GB LPDDR4x", "512GB NVMe SSD", "Intel Iris Xe (integrated)",
                '13.4" FHD+ (1920 x 1200) touchscreen', "Windows 11 Home", "Up to 12 hours",
                "2x USB-C Thunderbolt 4, microSD",
                "CNC machined aluminium + carbon fibre",
                "Sleek premium laptop for professionals and creators")),
    _p("macbook-air-m1", "Apple MacBook Air M1", "Laptops", "Apple", "Refurbished",
       'Apple M1, 8GB RAM, 256GB SSD, 13.3" Retina', 3650000, 4.9,
       specs=_s("Ultrabook", "Apple M1 (8-core CPU)", "Apple M1",
                "8GB unified memory", "256GB SSD", "7-core Apple GPU",
                '13.3" Retina (2560 x 1600)', "macOS", "Up to 18 hours",
                "2x Thunderbolt / USB 4, 3.5mm audio",
                "Aluminium unibody, fanless (silent)",
                "Long-battery, silent powerhouse for students and creatives")),
    _p("hp-spectre-x360-14", "HP Spectre x360 14", "Laptops", "HP", "Refurbished",
       'Core i7 11th Gen, 16GB RAM, 512GB SSD, 13.5" OLED touch, 2-in-1', 3900000, 4.7,
       specs=_s("2-in-1 Convertible Laptop", "Intel Core i7-1165G7", "11th Generation",
                "16GB LPDDR4x", "512GB NVMe SSD", "Intel Iris Xe (integrated)",
                '13.5" OLED (3000 x 2000) touchscreen', "Windows 11 Home", "Up to 16 hours",
                "2x Thunderbolt 4, USB-A, microSD",
                "Gem-cut aluminium, premium convertible",
                "Premium flip laptop for creativity and entertainment")),
    # High-end & gaming (4M+)
    _p("lenovo-legion-5-15", "Lenovo Legion 5 (RTX 3060)", "Laptops", "Lenovo", "Brand New",
       'Ryzen 7, 16GB RAM, 512GB SSD, RTX 3060 6GB, 15.6" 165Hz', 4500000, 4.7,
       specs=_s("Gaming Laptop", "AMD Ryzen 7 5800H (8-core)", "Ryzen 5000 Series",
                "16GB DDR4", "512GB NVMe SSD", "NVIDIA GeForce RTX 3060 6GB (dedicated)",
                '15.6" Full HD (1920 x 1080) 165Hz', "Windows 11 Home", "Up to 6 hours",
                "USB-C, 3x USB-A, HDMI, Ethernet (RJ-45)",
                "Gaming chassis with advanced cooling",
                "Smooth gaming, video editing and 3D rendering")),
    _p("asus-rog-strix-g15", "ASUS ROG Strix G15", "Laptops", "ASUS", "Brand New",
       'Ryzen 7, 16GB RAM, 1TB SSD, RTX 3060 6GB, 15.6" 144Hz', 4800000, 4.7,
       specs=_s("Gaming Laptop", "AMD Ryzen 7 5800H (8-core)", "Ryzen 5000 Series",
                "16GB DDR4", "1TB NVMe SSD", "NVIDIA GeForce RTX 3060 6GB (dedicated)",
                '15.6" Full HD (1920 x 1080) 144Hz', "Windows 11 Home", "Up to 6 hours",
                "USB-C, USB-A, HDMI, Ethernet (RJ-45)",
                "ROG gaming build with RGB and intelligent cooling",
                "High-FPS gaming and heavy creative workloads")),
    _p("dell-xps-15-9520", "Dell XPS 15 9520", "Laptops", "Dell", "Refurbished",
       'Core i7 12th Gen, 16GB RAM, 512GB SSD, 15.6" OLED, RTX graphics', 5200000, 4.8,
       specs=_s("Creator Laptop", "Intel Core i7-12700H (14-core)", "12th Generation",
                "16GB DDR5", "512GB NVMe SSD", "NVIDIA GeForce RTX 3050 4GB (dedicated)",
                '15.6" 3.5K OLED (3456 x 2160) touchscreen', "Windows 11 Pro", "Up to 10 hours",
                "2x Thunderbolt 4, USB-C, SD card reader",
                "CNC aluminium + carbon fibre, premium",
                "Professional content creation, design and editing")),
    _p("macbook-pro-14-m3", 'Apple MacBook Pro 14" M3', "Laptops", "Apple", "Brand New",
       'Apple M3, 16GB RAM, 512GB SSD, 14.2" Liquid Retina XDR', 6500000, 4.9,
       specs=_s("Professional Laptop", "Apple M3 (8-core CPU)", "Apple M3",
                "16GB unified memory", "512GB SSD", "10-core Apple GPU",
                '14.2" Liquid Retina XDR (3024 x 1964)', "macOS", "Up to 18 hours",
                "3x Thunderbolt 4, HDMI, SDXC, MagSafe 3",
                "Aluminium unibody, premium pro build",
                "Demanding creative and development work at pro performance")),
    # Desktops (550k+)
    _p("hp-prodesk-600-g1", "HP ProDesk 600 G1 (Tower)", "Desktops", "HP", "UK Used",
       "Core i5 4th Gen, 4GB RAM, 500GB HDD, DVD, no monitor", 550000, 4.2,
       specs=_s("Desktop Tower (CPU only, no monitor)", "Intel Core i5-4570 (quad-core)", "4th Generation",
                "4GB DDR3 (upgradable to 16GB)", "500GB HDD", "Intel HD Graphics 4600 (integrated)",
                "No monitor included - DisplayPort / VGA output", "Windows 10 Pro", "Not applicable (mains powered)",
                "USB 3.0, USB 2.0, DisplayPort, VGA, Ethernet (RJ-45)",
                "Compact business-grade tower",
                "Affordable home or office desktop")),
    _p("dell-optiplex-7010-sff", "Dell OptiPlex 7010 SFF", "Desktops", "Dell", "UK Used",
       "Core i5 3rd Gen, 8GB RAM, 500GB HDD, compact", 620000, 4.3,
       specs=_s("Desktop Small Form Factor (no monitor)", "Intel Core i5-3470 (quad-core)", "3rd Generation",
                "8GB DDR3", "500GB HDD", "Intel HD Graphics 2500 (integrated)",
                "No monitor included - DisplayPort / VGA output", "Windows 10 Pro", "Not applicable (mains powered)",
                "USB 3.0, DisplayPort, VGA, Ethernet (RJ-45)",
                "Space-saving Small Form Factor",
                "Compact office desktop for everyday tasks")),
    _p("hp-280-g6-desktop", "HP 280 G6 Desktop PC", "Desktops", "HP", "Brand New",
       "Core i5 10th Gen, 8GB RAM, 1TB HDD, DOS, 1-year warranty", 1750000, 4.5,
       specs=_s("Desktop Tower (no monitor)", "Intel Core i5-10400 (6-core)", "10th Generation",
                "8GB DDR4 (upgradable to 32GB)", "1TB HDD", "Intel UHD Graphics 630 (integrated)",
                "No monitor included - HDMI / VGA output", "FreeDOS (Windows can be installed)", "Not applicable (mains powered)",
                "USB 3.2, USB 2.0, HDMI, VGA, Ethernet (RJ-45)",
                "Brand-new tower with 1-year warranty",
                "New, reliable desktop for office and business")),
    _p("dell-optiplex-7090-i7", "Dell OptiPlex 7090 (i7)", "Desktops", "Dell", "Brand New",
       "Core i7 11th Gen, 16GB RAM, 512GB SSD, Windows 11 Pro", 2650000, 4.6,
       specs=_s("Desktop Tower (no monitor)", "Intel Core i7-11700 (8-core)", "11th Generation",
                "16GB DDR4", "512GB NVMe SSD", "Intel UHD Graphics 750 (integrated)",
                "No monitor included - DisplayPort / HDMI output", "Windows 11 Pro", "Not applicable (mains powered)",
                "USB 3.2, USB-C, DisplayPort, HDMI, Ethernet (RJ-45)",
                "Brand-new business desktop",
                "Powerful desktop for demanding business workloads")),
    # Apple & ASUS (extra)
    _p("macbook-air-m2", "Apple MacBook Air M2", "Laptops", "Apple", "Refurbished",
       'Apple M2, 8GB RAM, 256GB SSD, 13.6" Liquid Retina', 4200000, 4.9, old=4600000,
       specs=_s("Ultrabook", "Apple M2 (8-core CPU)", "Apple M2", "8GB unified memory", "256GB SSD",
                "10-core Apple GPU", '13.6" Liquid Retina (2560 x 1664)', "macOS", "Up to 18 hours",
                "2x Thunderbolt / USB 4, MagSafe, 3.5mm", "Aluminium unibody, fanless",
                "Slim, silent, long-battery laptop for students and creatives")),
    _p("macbook-pro-13-m2", 'Apple MacBook Pro 13" M2', "Laptops", "Apple", "Refurbished",
       'Apple M2, 8GB RAM, 256GB SSD, 13.3" Retina', 5500000, 4.8,
       specs=_s("Professional Laptop", "Apple M2 (8-core CPU)", "Apple M2", "8GB unified memory", "256GB SSD",
                "10-core Apple GPU", '13.3" Retina (2560 x 1600)', "macOS", "Up to 20 hours",
                "2x Thunderbolt / USB 4, 3.5mm", "Aluminium unibody with active cooling",
                "Pro performance with all-day battery for creators and developers")),
    _p("asus-vivobook-15", "ASUS VivoBook 15", "Laptops", "ASUS", "Brand New",
       'Core i5 11th Gen, 8GB RAM, 512GB SSD, 15.6" FHD', 1850000, 4.5,
       specs=_s("Everyday Laptop", "Intel Core i5-1135G7", "11th Generation", "8GB DDR4 (upgradable)",
                "512GB NVMe SSD", "Intel Iris Xe (integrated)", '15.6" Full HD (1920 x 1080)',
                "Windows 11 Home", "Up to 7 hours", "USB-C, USB 3.2, HDMI, USB 2.0",
                "Slim, lightweight everyday design", "Affordable, modern laptop for study, work and home")),
    _p("asus-zenbook-14", "ASUS ZenBook 14 OLED", "Laptops", "ASUS", "Brand New",
       'Core i7 12th Gen, 16GB RAM, 512GB SSD, 14" OLED', 3800000, 4.7,
       specs=_s("Premium Ultrabook", "Intel Core i7-1260P", "12th Generation", "16GB LPDDR5",
                "512GB NVMe SSD", "Intel Iris Xe (integrated)", '14" 2.8K OLED (2880 x 1800)',
                "Windows 11 Home", "Up to 12 hours", "2x Thunderbolt 4, USB-A, HDMI, microSD",
                "Premium metal, ultra-slim", "Stunning OLED ultrabook for professionals and creators")),
    _p("asus-tuf-gaming-f15", "ASUS TUF Gaming F15", "Laptops", "ASUS", "Brand New",
       'Core i7 11th Gen, 16GB RAM, 512GB SSD, RTX 3050, 15.6" 144Hz', 4200000, 4.6,
       specs=_s("Gaming Laptop", "Intel Core i7-11800H (8-core)", "11th Generation", "16GB DDR4",
                "512GB NVMe SSD", "NVIDIA GeForce RTX 3050 4GB (dedicated)", '15.6" Full HD (1920 x 1080) 144Hz',
                "Windows 11 Home", "Up to 6 hours", "USB-C, 3x USB-A, HDMI, Ethernet (RJ-45)",
                "Military-grade durable gaming chassis", "Affordable gaming and heavy multitasking")),
    # 2-in-1 convertible
    _p("hp-pavilion-x360-13", "HP Pavilion x360 13", "Laptops", "HP", "UK Used",
       'Core i5 11th Gen, 8GB RAM, 256GB SSD, 13.3" FHD touch, convertible', 2250000, 4.6,
       specs=_s("2-in-1 Convertible Laptop", "Intel Core i5-1135G7", "11th Generation",
                "8GB DDR4 (upgradable to 16GB)", "256GB NVMe SSD", "Intel Iris Xe (integrated)",
                '13.3" Full HD (1920 x 1080) touchscreen', "Windows 11 Home", "Up to 10 hours",
                "USB-C, 2x USB-A, HDMI, microSD, fingerprint reader",
                "Slim silver aluminium, 360-degree flip hinge",
                "Flexible 2-in-1 for study, work and entertainment")),
    # Accessories (no structured specs)
    _p("logitech-mk270", "Logitech MK270 Wireless Combo", "Accessories", "Logitech", "Brand New",
       "Keyboard + Mouse, 2.4GHz wireless, long battery life", 95000, 4.4),
    _p("logitech-c270-webcam", "Logitech C270 HD Webcam", "Accessories", "Logitech", "Brand New",
       "720p HD, built-in mic, plug & play", 120000, 4.5),
    _p("laptop-backpack-grey", "Slim Laptop Backpack (Grey)", "Accessories", "Generic", "Brand New",
       'Fits up to 15.6", padded laptop compartment, water-resistant', 80000, 4.6),
    _p("laptop-sleeve-grey", "Laptop Sleeve Bag (Grey)", "Accessories", "Generic", "Brand New",
       'Fits 14"-15.6", slim carry handles, soft protective lining', 80000, 4.5),
    _p("lenovo-thinkbook-backpack", "Lenovo ThinkBook Backpack (Grey)", "Accessories", "Lenovo", "Brand New",
       "Padded laptop compartment, durable grey fabric, Lenovo ThinkBook", 80000, 4.7),
    # Power & charging
    _p("laptop-charger-universal", "Universal Laptop Charger", "Power", "Generic", "Brand New",
       "Multiple tips, 65W-90W, HP/Dell/Lenovo compatible", 65000, 4.2),
    _p("mercury-ups-650va", "Mercury 650VA UPS", "Power", "Mercury", "Brand New",
       "650VA / 360W, surge protection, backup for PC + router", 180000, 4.3),
    _p("usb-c-charger-65w", "USB-C 65W Laptop Charger", "Power", "Generic", "Brand New",
       "65W USB-C PD, fast charging for laptops, tablets & phones", 95000, 4.5),
    _p("laptop-charger-pin-90w", "90W Pin Laptop Charger (HP/Dell)", "Power", "Generic", "Brand New",
       "90W output, HP/Dell/Lenovo tips, surge-safe", 80000, 4.3),
    _p("power-bank-20000", "20,000mAh Power Bank", "Power", "Generic", "Brand New",
       "20,000mAh, fast charge, dual USB + USB-C", 150000, 4.5),
    _p("power-bank-10000", "10,000mAh Power Bank", "Power", "Generic", "Brand New",
       "10,000mAh, slim & portable, USB-C in/out", 90000, 4.4),
    # Components (RAM & SSD upgrades)
    _p("ram-ddr4-8gb-sodimm", "8GB DDR4 Laptop RAM (SODIMM)", "Components", "Generic", "Brand New",
       "8GB DDR4 SODIMM (laptop), 3200MHz", 130000, 4.7),
    _p("ram-ddr4-16gb-sodimm", "16GB DDR4 Laptop RAM (SODIMM)", "Components", "Generic", "Brand New",
       "16GB DDR4 SODIMM (laptop), 3200MHz", 240000, 4.7),
    _p("ram-ddr4-8gb-dimm", "8GB DDR4 Desktop RAM (DIMM)", "Components", "Generic", "Brand New",
       "8GB DDR4 DIMM (desktop), 3200MHz", 140000, 4.6),
    _p("ssd-nvme-500gb", "500GB NVMe M.2 SSD", "Components", "Generic", "Brand New",
       "500GB NVMe M.2, up to 3500MB/s", 280000, 4.8),
    _p("ssd-480gb-sata", "480GB SATA SSD", "Components", "Generic", "Brand New",
       '480GB 2.5" SATA SSD, up to 550MB/s', 220000, 4.7),
    # Networking
    _p("tp-link-archer-c6", "TP-Link Archer C6 Router", "Networking", "TP-Link", "Brand New",
       "AC1200 dual-band, 4 antennas, MU-MIMO", 165000, 4.6),
    _p("tp-link-tl-sg108", "TP-Link 8-Port Gigabit Switch", "Networking", "TP-Link", "Brand New",
       "8 x Gigabit ports, plug & play, metal case", 145000, 4.6),
    # Storage
    _p("sandisk-ssd-1tb", "SanDisk Extreme 1TB Portable SSD", "Storage", "SanDisk", "Brand New",
       "1TB, USB-C, up to 1050MB/s", 420000, 4.8),
    _p("wd-elements-1tb-hdd", "WD Elements 1TB External HDD", "Storage", "Western Digital", "Brand New",
       "1TB, USB 3.0, plug & play", 220000, 4.6),
    _p("kingston-240gb-ssd", "Kingston A400 240GB SSD", "Storage", "Kingston", "Brand New",
       "240GB SATA SSD, up to 500MB/s, speeds up any laptop", 130000, 4.7),
    # Storage / flash (earlier additions)
    _p("sandisk-flash-64gb", "SanDisk 64GB Flash Drive", "Storage", "SanDisk", "Brand New", "64GB, USB 3.0, plug & play", 35000, 4.6),
    _p("kingston-flash-32gb", "Kingston 32GB Flash Drive", "Storage", "Kingston", "Brand New", "32GB, USB 2.0, compact", 25000, 4.5),
    _p("microsd-64gb", "64GB MicroSD Card + Adapter", "Storage", "Generic", "Brand New", "64GB, Class 10, SD adapter included", 40000, 4.5),
    # More brand products
    _p("kingston-ssd-480gb", "Kingston A400 480GB SSD", "Storage", "Kingston", "Brand New", "480GB SATA SSD, up to 500MB/s", 220000, 4.7),
    _p("kingston-nvme-500gb", "Kingston NV2 500GB NVMe SSD", "Components", "Kingston", "Brand New", "500GB NVMe M.2, up to 3500MB/s", 280000, 4.8),
    _p("kingston-flash-64gb", "Kingston 64GB Flash Drive", "Storage", "Kingston", "Brand New", "64GB, USB 3.2, compact", 38000, 4.5),
    _p("logitech-m170-mouse", "Logitech M170 Wireless Mouse", "Accessories", "Logitech", "Brand New", "2.4GHz wireless, plug & play", 45000, 4.5),
    _p("logitech-k380-keyboard", "Logitech K380 Bluetooth Keyboard", "Accessories", "Logitech", "Brand New", "Bluetooth, multi-device, compact", 130000, 4.6),
    _p("logitech-h111-headset", "Logitech H111 Stereo Headset", "Accessories", "Logitech", "Brand New", "3.5mm, mic + volume control", 70000, 4.4),
    _p("mercury-ups-850va", "Mercury 850VA UPS", "Power", "Mercury", "Brand New", "850VA / 480W, surge protection", 230000, 4.4),
    _p("mercury-power-bank", "Mercury 10,000mAh Power Bank", "Power", "Mercury", "Brand New", "10,000mAh, dual USB, fast charge", 95000, 4.3),
    _p("sandisk-flash-128gb", "SanDisk Ultra 128GB Flash Drive", "Storage", "SanDisk", "Brand New", "128GB, USB 3.0, up to 130MB/s", 55000, 4.7),
    _p("sandisk-microsd-128gb", "SanDisk 128GB MicroSD Card", "Storage", "SanDisk", "Brand New", "128GB, Class 10/U1, SD adapter", 65000, 4.7),
    _p("sandisk-ssd-500gb", "SanDisk SSD Plus 500GB", "Storage", "SanDisk", "Brand New", "500GB portable SSD, USB-C", 320000, 4.7),
    _p("tp-link-archer-c20", "TP-Link Archer C20 Router", "Networking", "TP-Link", "Brand New", "AC750 dual-band, 3 antennas", 110000, 4.5),
    _p("tp-link-re200-extender", "TP-Link RE200 WiFi Extender", "Networking", "TP-Link", "Brand New", "AC750, extends Wi-Fi range, plug-in", 95000, 4.5),
    _p("wd-elements-2tb", "WD Elements 2TB External HDD", "Storage", "Western Digital", "Brand New", "2TB, USB 3.0, plug & play", 320000, 4.7),
    _p("wd-passport-1tb", "WD My Passport 1TB", "Storage", "Western Digital", "Brand New", "1TB, USB 3.0, password protection", 260000, 4.7),
    _p("wd-blue-ssd-500gb", "WD Blue 500GB SSD", "Storage", "Western Digital", "Brand New", '500GB 2.5" SATA, reliable upgrade', 300000, 4.7),
]

_SEED_BY_SLUG = {p["slug"]: p for p in SEED_PRODUCTS}

SORTS = {
    "popular": lambda p: -float(p["rating"]),
    "price-asc": lambda p: float(p["price_ugx"]),
    "price-desc": lambda p: -float(p["price_ugx"]),
}


def _seed_list(category: str | None, search: str | None) -> list[dict]:
    items = SEED_PRODUCTS
    if category and category.lower() != "all":
        items = [p for p in items if p["category"].lower() == category.lower()]
    if search:
        q = search.lower()
        items = [p for p in items if q in p["name"].lower() or q in p["brand"].lower()]
    return items


def list_products(
    db: Session | None = None,
    *,
    category: str | None = None,
    search: str | None = None,
    sort: str = "popular",
    limit: int = 24,
    offset: int = 0,
) -> list[dict]:
    """List products from the DB if populated, else from the seed list."""
    if db is not None:
        try:
            stmt = select(Product)
            if category and category.lower() != "all":
                stmt = stmt.where(Product.category == category)
            if search:
                like = f"%{search}%"
                stmt = stmt.where(Product.name.ilike(like) | Product.brand.ilike(like))
            rows = db.execute(stmt).scalars().all()
            if rows:
                items = [_to_dict(r) for r in rows]
                items.sort(key=SORTS.get(sort, SORTS["popular"]))
                return items[offset : offset + limit]
        except SQLAlchemyError as exc:
            db.rollback()
            logger.warning("Catalog DB query failed, using seed: %s", exc)

    items = list(_seed_list(category, search))
    items.sort(key=SORTS.get(sort, SORTS["popular"]))
    return [{"id": i + 1, **p} for i, p in enumerate(items)][offset : offset + limit]


def get_product(db: Session | None, slug: str) -> dict | None:
    if db is not None:
        try:
            row = db.execute(select(Product).where(Product.slug == slug)).scalar_one_or_none()
            if row:
                return _to_dict(row)
        except SQLAlchemyError as exc:
            db.rollback()
            logger.warning("Catalog DB lookup failed, using seed: %s", exc)
    seed = _SEED_BY_SLUG.get(slug)
    if seed:
        idx = next(i for i, p in enumerate(SEED_PRODUCTS) if p["slug"] == slug)
        return {"id": idx + 1, **seed}
    return None


def create_product(db: Session, data: dict) -> dict:
    """Insert a new product into the DB. Raises ValueError if the slug exists."""
    existing = db.execute(
        select(Product).where(Product.slug == data["slug"])
    ).scalar_one_or_none()
    if existing:
        raise ValueError(f"Slug already exists: {data['slug']}")
    product = Product(
        slug=data["slug"],
        name=data["name"],
        category=data["category"],
        brand=data.get("brand", ""),
        condition=data.get("condition", "Brand New"),
        description=data.get("description", ""),
        price_ugx=int(data["price_ugx"]),
        old_price_ugx=(int(data["old_price_ugx"]) if data.get("old_price_ugx") else None),
        rating=float(data.get("rating", 0) or 0),
        in_stock=bool(data.get("in_stock", True)),
        image_url=data.get("image_url", ""),
        specs=data.get("specs") or None,
    )
    product.stock_qty = int(data.get("stock_qty", 0) or 0)
    db.add(product)
    db.commit()
    db.refresh(product)
    return _to_dict(product)


def list_inventory(db: Session) -> list[dict]:
    """All DB products with stock levels, lowest stock first (admin inventory)."""
    rows = db.execute(select(Product)).scalars().all()
    items = [_to_dict(r) for r in rows]
    items.sort(key=lambda x: (x["stock_qty"], x["name"]))
    return items


def update_stock(db: Session, slug: str, stock_qty: int, in_stock: bool | None = None) -> dict | None:
    row = db.execute(select(Product).where(Product.slug == slug)).scalar_one_or_none()
    if not row:
        return None
    row.stock_qty = max(0, int(stock_qty))
    # Auto-set the in-stock flag from quantity unless explicitly overridden.
    row.in_stock = (row.stock_qty > 0) if in_stock is None else in_stock
    db.commit()
    db.refresh(row)
    return _to_dict(row)


def decrement_stock(db: Session, slug: str, qty: int) -> None:
    """Reduce stock when an order is placed. No-op if the product isn't tracked in the DB."""
    row = db.execute(select(Product).where(Product.slug == slug)).scalar_one_or_none()
    if not row or row.stock_qty <= 0:
        return
    row.stock_qty = max(0, row.stock_qty - qty)
    if row.stock_qty == 0:
        row.in_stock = False


def _to_dict(p: Product) -> dict:
    return {
        "id": p.id,
        "slug": p.slug,
        "name": p.name,
        "category": p.category,
        "brand": p.brand,
        "condition": p.condition,
        "description": p.description,
        "price_ugx": int(p.price_ugx),
        "old_price_ugx": int(p.old_price_ugx) if p.old_price_ugx is not None else None,
        "rating": float(p.rating),
        "in_stock": p.in_stock,
        "stock_qty": getattr(p, "stock_qty", 0) or 0,
        "image_url": p.image_url,
        "specs": p.specs,
    }
