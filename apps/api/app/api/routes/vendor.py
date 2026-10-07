import secrets

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.order import OrderItem
from app.models.referral import Referral
from app.models.user import User
from app.models.vendor_message import VendorMessage
from app.models.vendor_payout import VendorPayout
from app.models.vendor_product import VendorProduct
from app.schemas.vendor_product import MarketplaceItem, PayoutIn, VendorProductIn, VendorProductOut
from app.services import auth as auth_service
from app.services import notify
from app.services import storage, vendor_products
from app.services.email import send_email


class AdminVendorCreate(BaseModel):
    business_name: str
    owner_name: str = ""
    email: str
    phone: str = ""
    password: str = ""  # optional — auto-generated if blank


class VendorProfileIn(BaseModel):
    name: str = ""
    business_name: str = ""
    business_category: str = ""
    location: str = ""
    phone: str = ""


class VendorMessageIn(BaseModel):
    customer_name: str = ""
    customer_phone: str = ""
    customer_email: str = ""
    product: str = ""
    message: str

router = APIRouter()


def require_vendor(user: User = Depends(get_current_user)) -> User:
    """A vendor, or the admin who runs the place.

    `role` is one field doing two jobs, so making the owner an admin used to
    cost them their own shop. An admin can already do all of this from the
    admin app; refusing them here only stopped them using their own site.
    """
    if user.role not in ("vendor", "admin"):
        raise HTTPException(status_code=403, detail="Vendor account required")
    return user


def require_admin_key(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


def require_approved_vendor(user: User = Depends(require_vendor)) -> User:
    if user.role != "admin" and not user.vendor_approved:
        raise HTTPException(status_code=403, detail="Your vendor account is pending approval")
    return user


def require_listing_vendor(user: User = Depends(require_approved_vendor)) -> User:
    """Admin approval is the authority to list — no separate email gate.

    (Email verification was blocking approved vendors from posting, so admin
    approval alone now grants listing access.)
    """
    return user


@router.get("/products", response_model=list[VendorProductOut])
def my_products(user: User = Depends(require_vendor), db: Session = Depends(get_db)) -> list:
    return vendor_products.list_for_vendor(db, user.id)


@router.post("/products", response_model=VendorProductOut, status_code=201)
async def add_product(
    payload: VendorProductIn,
    user: User = Depends(require_listing_vendor),
    db: Session = Depends(get_db),
):
    # Only approved vendors reach this point, so their listings go live
    # immediately — no redundant second approval gate. Admins can still
    # unapprove a specific product later from the dashboard.
    data = payload.model_dump()
    data["approved"] = True
    row = vendor_products.create(db, user.id, data)

    # This one goes live the moment it is posted, which is exactly why the
    # owner should hear about it rather than find it later.
    await notify.alert_owner(
        icon="🏪",
        title="Vendor listed a product",
        reference=f"OTU-V{row.id:05d}",
        pairs=[
            ("Product", data.get("name", "")),
            ("Price", f"UGX {int(data.get('price_ugx') or 0):,}"),
            ("Vendor", user.business_name or user.name),
            ("Phone", user.phone or ""),
        ],
        note=data.get("description", ""),
        where="It is live now — Admin › Vendors to unapprove it",
        db=db,
        url="/vendors",
    )
    return row


@router.put("/products/{product_id}", response_model=VendorProductOut)
def edit_product(
    product_id: int,
    payload: VendorProductIn,
    user: User = Depends(require_listing_vendor),
    db: Session = Depends(get_db),
):
    """A vendor edits their own product (name, price, image, stock, …)."""
    row = vendor_products.update(db, user.id, product_id, payload.model_dump())
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    return row


@router.delete("/products/{product_id}", status_code=204)
def remove_product(
    product_id: int, user: User = Depends(require_vendor), db: Session = Depends(get_db)
) -> None:
    if not vendor_products.delete(db, user.id, product_id):
        raise HTTPException(status_code=404, detail="Product not found")


_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


@router.post("/upload")
async def vendor_upload(file: UploadFile = File(...), user: User = Depends(require_vendor)) -> dict:
    """A vendor uploads a product image. Returns its stored path."""
    content = await file.read()
    try:
        stored = storage.save_file("images", file.filename or "image", content, allowed=_IMAGE_EXT, max_bytes=8 * 1024 * 1024)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"path": f"images/{stored}"}


@router.get("/profile")
def my_profile(user: User = Depends(require_vendor)) -> dict:
    """The vendor's editable store profile."""
    return {
        "name": user.name, "business_name": user.business_name,
        "business_category": user.business_category, "location": user.location,
        "phone": user.phone, "email": user.email,
    }


@router.put("/profile")
def update_profile(payload: VendorProfileIn, user: User = Depends(require_vendor), db: Session = Depends(get_db)) -> dict:
    """A vendor updates their own store profile."""
    if payload.name.strip():
        user.name = payload.name.strip()
    if payload.business_name.strip():
        user.business_name = payload.business_name.strip()
    user.business_category = payload.business_category.strip()
    user.location = payload.location.strip()
    user.phone = payload.phone.strip()
    db.commit()
    return {"ok": True}


@router.get("/messages")
def my_messages(user: User = Depends(require_vendor), db: Session = Depends(get_db)) -> list[dict]:
    """Messages customers have sent this vendor."""
    rows = db.execute(
        select(VendorMessage).where(VendorMessage.vendor_id == user.id).order_by(VendorMessage.created_at.desc())
    ).scalars().all()
    return [
        {"id": m.id, "customer_name": m.customer_name, "customer_phone": m.customer_phone,
         "customer_email": m.customer_email, "product": m.product, "message": m.message,
         "created_at": m.created_at.isoformat() if m.created_at else None}
        for m in rows
    ]


@router.get("/earnings")
def my_earnings(user: User = Depends(require_vendor), db: Session = Depends(get_db)) -> dict:
    """The vendor's sales, commission taken and net payout owed."""
    return vendor_products.vendor_earnings(db, user.id)


@router.get("/verification")
def my_verification(user: User = Depends(require_vendor)) -> dict:
    """The vendor's own KYC/verification status."""
    status = "verified" if user.verified else ("pending" if user.id_doc_filename else "unverified")
    return {"verified": user.verified, "status": status, "id_number": user.id_number,
            "business_reg": user.business_reg, "has_document": bool(user.id_doc_filename)}


@router.post("/verify")
async def submit_verification(
    id_number: str = Form(""),
    business_reg: str = Form(""),
    document: UploadFile = File(...),
    user: User = Depends(require_vendor),
    db: Session = Depends(get_db),
) -> dict:
    """Vendor submits ID / business registration + a document for admin review."""
    content = await document.read()
    try:
        stored = storage.save_file("vendor_id", document.filename or "id", content)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    user.id_number = id_number.strip()
    user.business_reg = business_reg.strip()
    user.id_doc_filename = stored
    user.verified = False  # resets to pending on new submission
    db.commit()
    return {"ok": True, "status": "pending"}


# Public marketplace feed of all vendor products.
@router.get("/marketplace", response_model=list[MarketplaceItem])
def marketplace(db: Session = Depends(get_db)) -> list:
    return vendor_products.list_public(db)


@router.get("/marketplace/{product_id}", response_model=MarketplaceItem)
def marketplace_item(product_id: int, db: Session = Depends(get_db)) -> dict:
    """Public: one marketplace product, with its full specification."""
    item = vendor_products.get_public(db, product_id)
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")
    return item


@router.post("/{vendor_id}/message", status_code=201)
async def message_vendor(vendor_id: int, payload: VendorMessageIn, db: Session = Depends(get_db)) -> dict:
    """A customer sends a message to a vendor. Stored + emailed to the vendor."""
    vendor = db.get(User, vendor_id)
    if not vendor or vendor.role != "vendor":
        raise HTTPException(status_code=404, detail="Vendor not found")
    msg = VendorMessage(
        vendor_id=vendor_id,
        customer_name=payload.customer_name.strip(),
        customer_phone=payload.customer_phone.strip(),
        customer_email=payload.customer_email.strip(),
        product=payload.product.strip(),
        message=payload.message.strip(),
    )
    db.add(msg)
    db.commit()
    if vendor.email:
        try:
            await send_email(
                to=vendor.email,
                subject=f"New customer message on OnlineTechUg{f' — {payload.product}' if payload.product else ''}",
                html=(
                    f"<p>You have a new message from a customer on Online Tech Uganda:</p>"
                    f"<p><b>{payload.customer_name or 'Customer'}</b>"
                    f"{f' · {payload.customer_phone}' if payload.customer_phone else ''}</p>"
                    f"{f'<p>Product: {payload.product}</p>' if payload.product else ''}"
                    f"<blockquote>{payload.message}</blockquote>"
                    f"<p>Reply from your vendor dashboard or contact them back directly.</p>"
                ),
                reply_to=payload.customer_email or None,
            )
        except Exception:  # noqa: BLE001
            pass
    # The owner hears about it too: these are their customers, and a question
    # a vendor leaves unanswered is the shop's reputation, not the vendor's.
    try:
        await notify.alert_owner(
            icon="💬",
            title="Customer message to a vendor",
            pairs=[
                ("Vendor", vendor.business_name or vendor.name),
                ("Product", payload.product.strip() or "—"),
                ("From", payload.customer_name.strip() or "Customer"),
                ("Phone", payload.customer_phone.strip()),
            ],
            note=payload.message.strip(),
            where="Admin › Vendors",
            db=db,
            url="/vendors",
        )
    except Exception:  # noqa: BLE001
        pass
    return {"ok": True}


# --- Admin vendor management (admin-key gated) ---
@router.get("/admin/list", dependencies=[Depends(require_admin_key)])
def admin_list_vendors(db: Session = Depends(get_db)) -> list[dict]:
    users = db.execute(select(User).where(User.role == "vendor").order_by(User.created_at.desc())).scalars().all()
    out = []
    for u in users:
        count = db.execute(
            select(func.count()).select_from(VendorProduct).where(VendorProduct.vendor_id == u.id)
        ).scalar_one()
        out.append({
            "id": u.id, "name": u.name, "email": u.email, "phone": u.phone,
            "business_name": u.business_name, "vendor_approved": u.vendor_approved, "products": count,
            "verified": u.verified, "id_number": u.id_number, "business_reg": u.business_reg,
            "has_document": bool(u.id_doc_filename),
            "subscription_ends": u.subscription_ends.isoformat() if u.subscription_ends else None,
            "business_category": u.business_category, "location": u.location,
        })
    return out


@router.post("/admin/{vendor_id}/verify", dependencies=[Depends(require_admin_key)])
def admin_verify_vendor(vendor_id: int, verified: bool = True, db: Session = Depends(get_db)) -> dict:
    u = db.get(User, vendor_id)
    if not u or u.role != "vendor":
        raise HTTPException(status_code=404, detail="Vendor not found")
    u.verified = verified
    db.commit()
    return {"id": u.id, "verified": u.verified}


@router.get("/admin/{vendor_id}/document", dependencies=[Depends(require_admin_key)])
def admin_vendor_document(vendor_id: int, db: Session = Depends(get_db)):
    u = db.get(User, vendor_id)
    if not u or not u.id_doc_filename:
        raise HTTPException(status_code=404, detail="No document on file")
    path = storage.file_path("vendor_id", u.id_doc_filename)
    if not path:
        raise HTTPException(status_code=404, detail="Document missing")
    return FileResponse(path, filename=u.id_doc_filename.split("_", 1)[-1])


@router.post("/admin/create", dependencies=[Depends(require_admin_key)])
def admin_create_vendor(payload: AdminVendorCreate, db: Session = Depends(get_db)) -> dict:
    """Admin: add a vendor directly (e.g. a shop that applied offline). Pre-approved."""
    password = payload.password.strip() or secrets.token_urlsafe(6)
    try:
        user = auth_service.create_user(
            db,
            name=payload.owner_name.strip() or payload.business_name.strip(),
            email=payload.email,
            password=password,
            phone=payload.phone,
            role="vendor",
            business_name=payload.business_name,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    user.vendor_approved = True  # admin-added vendors are approved immediately
    db.commit()
    return {
        "id": user.id,
        "business_name": user.business_name,
        "email": user.email,
        "vendor_approved": True,
        # Returned once so the admin can share login details with the vendor.
        "password": password if not payload.password.strip() else "",
    }


@router.post("/admin/{vendor_id}/approve", dependencies=[Depends(require_admin_key)])
def admin_approve_vendor(vendor_id: int, approved: bool = True, db: Session = Depends(get_db)) -> dict:
    u = db.get(User, vendor_id)
    if not u or u.role != "vendor":
        raise HTTPException(status_code=404, detail="Vendor not found")
    u.vendor_approved = approved
    db.commit()
    return {"id": u.id, "vendor_approved": u.vendor_approved}


@router.get("/admin/{vendor_id}/impact", dependencies=[Depends(require_admin_key)])
def admin_vendor_impact(vendor_id: int, db: Session = Depends(get_db)) -> dict:
    """What would be removed if this vendor is deleted — shown to the admin as a
    confirmation summary before they commit to it."""
    u = db.get(User, vendor_id)
    if not u or u.role != "vendor":
        raise HTTPException(status_code=404, detail="Vendor not found")
    products = db.execute(
        select(func.count()).select_from(VendorProduct).where(VendorProduct.vendor_id == vendor_id)
    ).scalar_one()
    messages = db.execute(
        select(func.count()).select_from(VendorMessage).where(VendorMessage.vendor_id == vendor_id)
    ).scalar_one()
    payouts = db.execute(
        select(func.count()).select_from(VendorPayout).where(VendorPayout.vendor_id == vendor_id)
    ).scalar_one()
    sold_items = db.execute(
        select(func.count()).select_from(OrderItem).where(OrderItem.vendor_id == vendor_id)
    ).scalar_one()
    return {
        "id": u.id,
        "name": u.business_name or u.name,
        "email": u.email,
        "products": products,
        "messages": messages,
        "payouts": payouts,
        "sold_items": sold_items,  # kept for records — order history is never deleted
    }


@router.delete("/admin/{vendor_id}", dependencies=[Depends(require_admin_key)])
def admin_delete_vendor(vendor_id: int, db: Session = Depends(get_db)) -> dict:
    """Permanently delete a vendor and everything they own: their marketplace
    products, customer messages and payout records, then the account itself.

    Past ORDER history is deliberately KEPT (an order is a record of a real sale);
    those line items are simply detached from the deleted vendor.
    """
    u = db.get(User, vendor_id)
    if not u:
        raise HTTPException(status_code=404, detail="Vendor not found")
    if u.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete an admin account")
    if u.role != "vendor":
        raise HTTPException(status_code=400, detail="This account is not a vendor")

    name = u.business_name or u.name

    products = db.execute(select(VendorProduct).where(VendorProduct.vendor_id == vendor_id)).scalars().all()
    for p in products:
        db.delete(p)
    messages = db.execute(select(VendorMessage).where(VendorMessage.vendor_id == vendor_id)).scalars().all()
    for m in messages:
        db.delete(m)
    payouts = db.execute(select(VendorPayout).where(VendorPayout.vendor_id == vendor_id)).scalars().all()
    for p in payouts:
        db.delete(p)
    referrals = db.execute(select(Referral).where(Referral.referrer_id == vendor_id)).scalars().all()
    for r in referrals:
        db.delete(r)

    # Detach past sales so order history survives without a dangling vendor id.
    detached = 0
    for item in db.execute(select(OrderItem).where(OrderItem.vendor_id == vendor_id)).scalars().all():
        item.vendor_id = None
        detached += 1

    # These child rows reference users.id by raw ForeignKey with no ORM
    # relationship, so SQLAlchemy doesn't know it must delete them first. Flush
    # here to push the child deletes to the database before the user row goes,
    # otherwise Postgres rejects it with a foreign-key violation.
    db.flush()

    db.delete(u)
    db.commit()
    return {
        "deleted": True,
        "id": vendor_id,
        "name": name,
        "products_removed": len(products),
        "messages_removed": len(messages),
        "payouts_removed": len(payouts),
        "order_items_kept": detached,
    }


@router.get("/admin/commissions", dependencies=[Depends(require_admin_key)])
def admin_commissions(db: Session = Depends(get_db)) -> dict:
    """Platform commission earned + payout owed/paid/outstanding to each vendor."""
    return vendor_products.platform_commissions(db)


# --- Admin product moderation (approval before publishing) ---
@router.get("/admin/products", dependencies=[Depends(require_admin_key)])
def admin_products(pending_only: bool = False, db: Session = Depends(get_db)) -> list[dict]:
    return vendor_products.list_all_for_admin(db, pending_only=pending_only)


@router.post("/admin/products/{product_id}/approve", dependencies=[Depends(require_admin_key)])
def admin_approve_product(product_id: int, approved: bool = True, db: Session = Depends(get_db)) -> dict:
    row = vendor_products.set_product_approved(db, product_id, approved)
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"id": row.id, "approved": row.approved}


@router.post("/admin/{vendor_id}/products", status_code=201, dependencies=[Depends(require_admin_key)])
def admin_add_product_for_vendor(
    vendor_id: int, payload: VendorProductIn, db: Session = Depends(get_db)
) -> dict:
    """Admin: add a product ON BEHALF OF a vendor. Approved & live immediately."""
    vendor = db.get(User, vendor_id)
    if not vendor or vendor.role != "vendor":
        raise HTTPException(status_code=404, detail="Vendor not found")
    vp = vendor_products.create(db, vendor_id, payload.model_dump())
    vp.approved = True  # admin-created products go live right away
    db.commit()
    db.refresh(vp)
    return {"id": vp.id, "name": vp.name, "vendor_id": vp.vendor_id, "approved": vp.approved}


# --- Admin payouts (settle what the owner owes vendors) ---
@router.get("/admin/payouts", dependencies=[Depends(require_admin_key)])
def admin_payouts(db: Session = Depends(get_db)) -> list[dict]:
    return vendor_products.list_payouts(db)


@router.post("/admin/payouts", dependencies=[Depends(require_admin_key)])
def admin_record_payout(payload: PayoutIn, db: Session = Depends(get_db)) -> dict:
    if not db.get(User, payload.vendor_id):
        raise HTTPException(status_code=404, detail="Vendor not found")
    row = vendor_products.record_payout(
        db, payload.vendor_id,
        {"amount": payload.amount, "method": payload.method,
         "reference": payload.reference, "note": payload.note},
    )
    return {"id": row.id, "vendor_id": row.vendor_id, "amount": row.amount}
