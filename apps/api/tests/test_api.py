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
    assert compute_delivery_fee("Kampala") == 10_000
    assert compute_delivery_fee("Jinja") == 20_000
    assert compute_delivery_fee("Arua") == 75_000
    assert compute_delivery_fee("Somewhere unknown") == 35_000


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
