"""The rules that protect customers' data and the shop's honesty.

Each of these was once broken, or was added to stop something specific. A test
that fails here means a promise the site makes has stopped being true.
"""

from app.api.routes import auth as auth_routes
from app.services.orders import _generate_reference, compute_delivery_fee

from .conftest import ADMIN

API = "/api/v1"


# ── orders ────────────────────────────────────────────────────────────────

def test_order_list_needs_the_admin_key(client, order):
    assert client.get(f"{API}/orders").status_code == 401
    listed = client.get(f"{API}/orders", headers=ADMIN)
    assert listed.status_code == 200 and len(listed.json()) == 1


def test_public_order_lookup_hides_personal_details(client, order):
    seen = client.get(f"{API}/orders/{order}").json()
    assert seen["customer_name"] == "Test"  # first name only
    assert seen["phone"] == seen["email"] == seen["delivery_address"] == seen["notes"] == ""
    assert seen["status"] == "delivered" and seen["delivery_town"] == "Kampala"

    full = client.get(f"{API}/orders/{order}", headers=ADMIN).json()
    assert full["customer_name"] == "Test Customer" and full["phone"] == "0700000000"
    assert full["delivery_address"] == "Plot 1, Test Road"


def test_guessing_order_numbers_is_cut_off(client, order):
    # A different "first hop" every time, as a script forging the header would send.
    codes = [
        client.get(f"{API}/orders/OTU-WRONG{i:03d}", headers={"X-Forwarded-For": f"9.9.9.{i}, 5.5.5.5"}).status_code
        for i in range(32)
    ]
    assert codes[:30] == [404] * 30 and codes[30:] == [429, 429]
    # Once cut off, even a correct number is refused from that address…
    assert client.get(f"{API}/orders/{order}", headers={"X-Forwarded-For": "1.1.1.1, 5.5.5.5"}).status_code == 429
    # …but not from anyone else, and never for the admin.
    assert client.get(f"{API}/orders/{order}", headers={"X-Forwarded-For": "1.1.1.1, 6.6.6.6"}).status_code == 200
    assert client.get(f"{API}/orders/{order}", headers={"X-Forwarded-For": "1.1.1.1, 5.5.5.5", **ADMIN}).status_code == 200


def test_order_references_are_long():
    ref = _generate_reference()
    assert ref.startswith("OTU-") and len(ref) == 12


def test_delivery_is_charged_by_distance_and_never_free():
    # A base charge, then a rate per kilometre: nearer is cheaper, farther
    # costs more, and nowhere is free.
    assert compute_delivery_fee("Kampala") == 10_000
    assert compute_delivery_fee("Jinja") == 21_000  # 80 km
    assert compute_delivery_fee("Arua") == 81_000  # 480 km
    assert compute_delivery_fee("Somewhere unknown") == 31_000  # taken as 150 km
    assert compute_delivery_fee("Kampala") < compute_delivery_fee("Jinja") < compute_delivery_fee("Arua")


def test_security_headers_are_sent(client):
    headers = client.get(f"{API}/health").headers
    assert headers["x-content-type-options"] == "nosniff"
    assert headers["x-frame-options"] == "DENY"
    assert "strict-transport-security" in headers


# ── documents ─────────────────────────────────────────────────────────────

def test_documents_are_private_end_to_end(client):
    pdf = b"%PDF-1.4 test letter"
    upload = {"file": ("Internship-acceptance-Test.pdf", pdf, "application/pdf")}
    assert client.get(f"{API}/documents").status_code == 401
    assert client.post(f"{API}/documents", files=upload, data={"kind": "x"}).status_code == 401

    added = client.post(f"{API}/documents", headers=ADMIN, files=upload, data={"kind": "internship-acceptance", "title": "Test Student"})
    assert added.status_code == 201
    doc_id = added.json()["id"]

    assert client.get(f"{API}/documents/{doc_id}/file").status_code == 401
    got = client.get(f"{API}/documents/{doc_id}/file", headers=ADMIN)
    assert got.status_code == 200 and got.content == pdf
    assert len(client.get(f"{API}/documents?kind=internship", headers=ADMIN).json()) == 1
    assert client.get(f"{API}/documents?kind=receipt", headers=ADMIN).json() == []

    assert client.delete(f"{API}/documents/{doc_id}", headers=ADMIN).status_code == 200
    assert client.get(f"{API}/documents", headers=ADMIN).json() == []


def test_documents_accept_only_pdfs(client):
    bad = client.post(f"{API}/documents", headers=ADMIN, files={"file": ("a.exe", b"x")}, data={"kind": "x"})
    assert bad.status_code == 400


# ── reviews ───────────────────────────────────────────────────────────────

def _review(**over):
    return {"product_slug": "test-laptop", "order_reference": "OTU-TEST0001", "name": "Test Customer", "rating": 5, "comment": "Works well.", **over}


def test_a_review_needs_an_order_that_contained_the_product(client, order):
    assert client.post(f"{API}/reviews", json=_review(order_reference="OTU-NOPE0000")).status_code == 400
    assert client.post(f"{API}/reviews", json=_review(product_slug="something-else")).status_code == 400
    assert client.post(f"{API}/reviews", json=_review(rating=6)).status_code == 422


def test_a_review_is_hidden_until_approved_and_counted_after(client, order):
    assert client.post(f"{API}/reviews", json=_review()).status_code == 201
    # Not public yet, and not counted.
    assert client.get(f"{API}/reviews?product=test-laptop").json() == []
    assert client.get(f"{API}/reviews/summary").json() == {}

    assert client.get(f"{API}/reviews/admin").status_code == 401
    pending = client.get(f"{API}/reviews/admin", headers=ADMIN).json()
    assert len(pending) == 1 and pending[0]["status"] == "pending"

    assert client.post(f"{API}/reviews/{pending[0]['id']}/approve").status_code == 401
    assert client.post(f"{API}/reviews/{pending[0]['id']}/approve", headers=ADMIN).status_code == 200

    public = client.get(f"{API}/reviews?product=test-laptop").json()
    assert len(public) == 1 and public[0]["name"] == "Test"  # first name only
    assert "order_reference" not in public[0]
    assert client.get(f"{API}/reviews/summary").json() == {"test-laptop": {"average": 5.0, "count": 1}}


def test_one_review_per_product_per_order(client, order):
    assert client.post(f"{API}/reviews", json=_review()).status_code == 201
    assert client.post(f"{API}/reviews", json=_review(rating=1)).status_code == 409


# ── password reset ────────────────────────────────────────────────────────

def _register(client, monkeypatch):
    async def quiet(**_):
        return True

    monkeypatch.setattr(auth_routes, "send_verification_code", quiet)
    made = client.post(f"{API}/auth/register", json={"name": "Reset Tester", "email": "reset@example.com", "password": "old-password"})
    assert made.status_code == 201


def test_password_reset_with_the_emailed_code(client, monkeypatch):
    _register(client, monkeypatch)
    sent = {}

    async def capture(*, to, name, code):
        sent["code"] = code
        return True

    monkeypatch.setattr(auth_routes, "send_password_reset_code", capture)
    assert client.post(f"{API}/auth/forgot", json={"email": "reset@example.com"}).json() == {"ok": True}
    assert len(sent["code"]) == 6

    wrong = "000000" if sent["code"] != "000000" else "111111"
    assert client.post(f"{API}/auth/reset", json={"email": "reset@example.com", "code": wrong, "password": "new-password"}).status_code == 400
    assert client.post(f"{API}/auth/reset", json={"email": "reset@example.com", "code": sent["code"], "password": "new-password"}).status_code == 200

    assert client.post(f"{API}/auth/login", json={"email": "reset@example.com", "password": "old-password"}).status_code == 401
    assert client.post(f"{API}/auth/login", json={"email": "reset@example.com", "password": "new-password"}).status_code == 200
    # A code works once.
    assert client.post(f"{API}/auth/reset", json={"email": "reset@example.com", "code": sent["code"], "password": "third-password"}).status_code == 400


def test_forgot_does_not_reveal_who_has_an_account(client, monkeypatch):
    calls = []

    async def capture(**kw):
        calls.append(kw)
        return True

    monkeypatch.setattr(auth_routes, "send_password_reset_code", capture)
    answer = client.post(f"{API}/auth/forgot", json={"email": "nobody@example.com"})
    assert answer.status_code == 200 and answer.json() == {"ok": True}
    assert calls == []  # nothing was sent, and the reply did not say so


# ── notifications ─────────────────────────────────────────────────────────

def test_notifications_every_three_hours_in_the_kampala_day(db_factory):
    from datetime import datetime

    from app.models.campaign import Campaign
    from app.services import campaign_auto

    def utc(hour, minute=30):  # 7 Oct 2026; Kampala is UTC+3
        return datetime(2026, 10, 7, hour, minute)

    with db_factory() as db:
        for n in range(8):
            db.add(Campaign(slug=f"c{n}", title=f"Offer {n}", placement="home", active=True))
        db.commit()

        def send(now):
            due = campaign_auto.due_for_announcement(db, now)
            if due:
                due.notified_at = now
                db.commit()
            return bool(due)

        assert not send(utc(0))   # 03:30 in Kampala — nobody is awake
        assert not send(utc(5))   # 08:30 — still too early
        assert send(utc(6))       # 09:30 — the 9am one
        assert not send(utc(7))   # 10:30 — the next is not until noon
        assert send(utc(9))       # 12:30
        assert send(utc(12))      # 15:30
        assert send(utc(15))      # 18:30
        assert not send(utc(16))  # 19:30 — waits for 9pm
        assert send(utc(18))      # 21:30 — the last of the day
        assert not send(utc(20))  # 23:30 — five have gone; no more today


# ── vendors ───────────────────────────────────────────────────────────────

def _vendor(client):
    """A vendor the owner added from the dashboard, signed in."""
    made = client.post(f"{API}/vendor/admin/create", headers=ADMIN, json={"business_name": "Phone Corner", "email": "vendor@example.com", "password": "vendor-pass"})
    assert made.status_code == 200
    token = client.post(f"{API}/auth/login", json={"email": "vendor@example.com", "password": "vendor-pass"}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


CASE = {
    "name": "Silicone case for iPhone 15",
    "category": "Accessories",
    "price_ugx": 25000,
    "old_price_ugx": 30000,
    "brand": "Spigen",
    "condition": "Brand New",
    "description": "Soft-touch case with raised edges.",
    "specs": [{"label": "Compatible with", "value": "iPhone 15"}, {"label": "Material", "value": "Silicone"}],
}


def test_a_vendor_lists_a_product_with_its_full_specification(client, monkeypatch):
    from app.api.routes import vendor as vendor_routes

    async def quiet(**_):
        return None

    monkeypatch.setattr(vendor_routes.notify, "alert_owner", quiet)
    auth = _vendor(client)
    made = client.post(f"{API}/vendor/products", headers=auth, json=CASE)
    assert made.status_code == 201
    pid = made.json()["id"]

    public = client.get(f"{API}/vendor/marketplace/{pid}").json()
    assert public["brand"] == "Spigen" and public["old_price_ugx"] == 30000
    assert public["specs"] == CASE["specs"]
    assert public["vendor_name"] == "Phone Corner"
    assert client.get(f"{API}/vendor/marketplace").json()[0]["specs"] == CASE["specs"]

    # Editing replaces the specification.
    edited = client.put(f"{API}/vendor/products/{pid}", headers=auth, json={**CASE, "specs": [{"label": "Colour", "value": "Black"}]})
    assert edited.status_code == 200 and edited.json()["specs"] == [{"label": "Colour", "value": "Black"}]


def test_a_vendor_cannot_reach_the_admin_or_another_vendors_products(client, monkeypatch):
    from app.api.routes import vendor as vendor_routes

    async def quiet(**_):
        return None

    monkeypatch.setattr(vendor_routes.notify, "alert_owner", quiet)
    auth = _vendor(client)
    pid = client.post(f"{API}/vendor/products", headers=auth, json=CASE).json()["id"]

    # A vendor's sign-in is not the admin key: every admin list refuses it.
    for path in ("/orders", "/contact", "/documents", "/reviews/admin", "/vendor/admin/list", "/products/admin/inventory"):
        assert client.get(f"{API}{path}", headers=auth).status_code == 401, path
    # Nor can it change the shop's own catalogue.
    assert client.post(f"{API}/products", headers=auth, json={"name": "x"}).status_code in (401, 422)

    # A second vendor cannot edit or delete the first one's product.
    client.post(f"{API}/vendor/admin/create", headers=ADMIN, json={"business_name": "Other Shop", "email": "other@example.com", "password": "other-pass"})
    other = {"Authorization": "Bearer " + client.post(f"{API}/auth/login", json={"email": "other@example.com", "password": "other-pass"}).json()["access_token"]}
    assert client.put(f"{API}/vendor/products/{pid}", headers=other, json=CASE).status_code == 404
    assert client.delete(f"{API}/vendor/products/{pid}", headers=other).status_code == 404
    assert client.get(f"{API}/vendor/products", headers=other).json() == []


def test_the_owner_is_told_when_a_vendors_product_is_reviewed(client, db_factory):
    from app.models.order import Order, OrderItem

    auth = _vendor(client)
    pid = client.post(f"{API}/vendor/products", headers=auth, json=CASE).json()["id"]
    with db_factory() as db:
        o = Order(reference="OTU-VEND0001", customer_name="Buyer One", phone="0700000001", subtotal=25000, delivery_fee=10000, total=35000, payment_method="pay_at_shop", payment_status="paid", status="delivered")
        db.add(o)
        db.flush()
        db.add(OrderItem(order_id=o.id, product_slug=f"vp-{pid}", name=CASE["name"], unit_price=25000, quantity=1, line_total=25000))
        db.commit()
    db_factory.alerts.clear()

    sent = client.post(f"{API}/reviews", json={"product_slug": f"vp-{pid}", "order_reference": "OTU-VEND0001", "name": "Buyer One", "rating": 2, "comment": "Fits loosely."})
    assert sent.status_code == 201
    assert len(db_factory.alerts) == 1
    pairs = dict(db_factory.alerts[0]["pairs"])
    assert pairs["Sold by"] == "Phone Corner" and pairs["Product"] == CASE["name"]
    assert "2-star" in db_factory.alerts[0]["title"] and db_factory.alerts[0]["note"] == "Fits loosely."


# ── colours ───────────────────────────────────────────────────────────────

def test_the_colour_a_customer_chose_is_written_on_the_order(db_factory):
    from app.models.product import Product
    from app.schemas.order import OrderCreate
    from app.services.orders import create_order

    with db_factory() as db:
        db.add(Product(slug="two-tone-laptop", name="Two Tone Laptop", category="Laptops", price_ugx=900_000, in_stock=True, stock_qty=5, specs={"colors": "Silver, Space Grey"}))
        db.commit()
        placed = create_order(db, OrderCreate(
            customer_name="Test Customer", phone="0700000000", delivery_town="Kampala",
            items=[{"slug": "two-tone-laptop", "quantity": 1, "option": "  Space   Grey "}],
        ))
        assert [i.name for i in placed.items] == ["Two Tone Laptop — Space Grey"]
        # Reviews and stock still find the product by its own slug.
        assert placed.items[0].product_slug == "two-tone-laptop"

        plain = create_order(db, OrderCreate(
            customer_name="Test Customer", phone="0700000000", delivery_town="Kampala",
            items=[{"slug": "two-tone-laptop", "quantity": 1}],
        ))
        assert plain.items[0].name == "Two Tone Laptop"


def test_selling_the_last_one_does_not_mark_it_out_of_stock(db_factory):
    from app.models.product import Product
    from app.schemas.order import OrderCreate
    from app.services.orders import create_order

    with db_factory() as db:
        db.add(Product(slug="last-one", name="Last One", category="Laptops", price_ugx=500_000, in_stock=True, stock_qty=1))
        db.commit()
        buyer = dict(customer_name="Test Customer", phone="0700000000", delivery_town="Kampala")
        create_order(db, OrderCreate(**buyer, items=[{"slug": "last-one", "quantity": 1}]))
        row = db.query(Product).filter_by(slug="last-one").one()
        assert (row.stock_qty, row.in_stock) == (0, True)
        # And it can be ordered again.
        create_order(db, OrderCreate(**buyer, items=[{"slug": "last-one", "quantity": 1}]))


def test_a_review_can_be_proved_with_the_phone_number_ordered_with(client, order):
    review = {"product_slug": "test-laptop", "name": "Test Customer", "rating": 5, "comment": "very good"}
    # Somebody else's number proves nothing.
    assert client.post(f"{API}/reviews", json={**review, "order_reference": "0711111111"}).status_code == 400
    # The number on the order does, however it is written.
    assert client.post(f"{API}/reviews", json={**review, "order_reference": "+256 700 000 000"}).status_code == 201
    # And it is still one review per order.
    assert client.post(f"{API}/reviews", json={**review, "order_reference": "0700000000"}).status_code == 409


def test_vendor_listings_reach_the_owner_as_one_daily_summary(db_factory):
    import asyncio
    from datetime import datetime

    from app.models.user import User
    from app.models.vendor_product import VendorProduct
    from app.services import vendor_summary

    with db_factory() as db:
        v = User(name="Abu", email="abu@example.com", password_hash="x", role="vendor", business_name="Techsoults")
        db.add(v)
        db.flush()
        for n in range(3):
            db.add(VendorProduct(vendor_id=v.id, name=f"Phone {n}", category="Phones", price_ugx=500_000, approved=True))
        db.commit()

        evening = datetime.utcnow().replace(hour=16, minute=0)
        assert vendor_summary.due(evening)
        out = asyncio.run(vendor_summary.run(db, evening))
        assert out == {"sent": True, "products": 3, "vendors": 1}
        # One alert for the three products, naming the vendor and the count.
        assert len(db_factory.alerts) == 1
        assert db_factory.alerts[0]["pairs"][0][0] == "Techsoults — 3 new"
        # Not again the same day, and a day with nothing new sends nothing.
        assert not vendor_summary.due(evening)
        assert asyncio.run(vendor_summary.run(db, evening))["sent"] is False
        assert len(db_factory.alerts) == 1
