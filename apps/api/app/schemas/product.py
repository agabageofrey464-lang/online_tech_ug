from pydantic import BaseModel, ConfigDict


class ProductSpecs(BaseModel):
    """Structured computer specification (null for accessories)."""

    type: str = ""
    processor: str = ""
    generation: str = ""
    ram: str = ""
    storage: str = ""
    graphics: str = ""
    display: str = ""
    os: str = ""
    battery: str = ""
    ports: str = ""
    build: str = ""
    purpose: str = ""


class ProductBase(BaseModel):
    slug: str
    name: str
    category: str
    brand: str = ""
    condition: str = "Brand New"
    description: str = ""
    price_ugx: int
    old_price_ugx: int | None = None
    rating: float = 0
    in_stock: bool = True
    stock_qty: int = 0
    image_url: str = ""
    specs: ProductSpecs | None = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    """Partial update — every field optional; only the ones sent are changed."""

    name: str | None = None
    category: str | None = None
    brand: str | None = None
    condition: str | None = None
    description: str | None = None
    price_ugx: int | None = None
    old_price_ugx: int | None = None
    rating: float | None = None
    in_stock: bool | None = None
    stock_qty: int | None = None
    image_url: str | None = None
    specs: ProductSpecs | None = None


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
