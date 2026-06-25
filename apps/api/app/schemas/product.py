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
    image_url: str = ""
    specs: ProductSpecs | None = None


class ProductCreate(ProductBase):
    pass


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
