from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import logging
import uuid
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Any, Dict

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, EmailStr

from initial_data import INITIAL_STORE, INITIAL_SUBSCRIPTIONS, INITIAL_GAMES, INITIAL_BUNDLES

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("dukkank")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = "HS256"
JWT_EXPIRY_HOURS = 24

app = FastAPI(title="Dukkank API")
api = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def get_current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> dict:
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]})
        if not user or user.get("role") != "admin":
            raise HTTPException(status_code=401, detail="Admin only")
        user.pop("password_hash", None)
        user.pop("_id", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def strip_id(doc: Optional[dict]) -> Optional[dict]:
    if doc is None:
        return None
    doc.pop("_id", None)
    return doc


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    token: str
    user: Dict[str, Any]


class StoreSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    name_en: Optional[str] = ""
    tagline: str
    tagline_en: Optional[str] = ""
    whatsapp: str
    whatsappDisplay: str
    instagram: Optional[str] = ""


class Duration(BaseModel):
    id: str
    label: str
    label_en: Optional[str] = ""
    four: Optional[float] = None
    five: Optional[float] = None


class Subscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    name_en: Optional[str] = ""
    tagline: str
    tagline_en: Optional[str] = ""
    accent: str = "blue"
    durations: List[Duration] = []


class Game(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    sub: str = ""
    image: str = ""
    gradientFrom: str = "#222"
    gradientTo: str = "#000"
    four: Optional[float] = None
    five: Optional[float] = None
    available: bool = True
    bestSeller: bool = False


class Bundle(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    subId: str
    durationId: str
    gameId: str
    tier: str  # "four" or "five"
    bundlePrice: float
    available: bool = True


# ---------------------------------------------------------------------------
# Public endpoints
# ---------------------------------------------------------------------------
@api.get("/")
async def root():
    return {"app": "Dukkank API", "status": "ok"}


@api.get("/store")
async def get_store():
    doc = await db.settings.find_one({"key": "store"})
    if not doc:
        raise HTTPException(404, "Store not configured")
    strip_id(doc)
    doc.pop("key", None)
    return doc


@api.get("/subscriptions")
async def list_subscriptions():
    items = await db.subscriptions.find({}, {"_id": 0}).to_list(100)
    # preserve seeded order
    order = {"essential": 0, "extra": 1}
    items.sort(key=lambda x: order.get(x.get("id"), 999))
    return items


@api.get("/games")
async def list_games():
    items = await db.games.find({}, {"_id": 0}).sort("order", 1).to_list(500)
    for it in items:
        it.pop("order", None)
    return items


@api.get("/bundles")
async def list_bundles():
    items = await db.bundles.find({}, {"_id": 0}).to_list(100)
    return items


# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------
@api.post("/auth/login", response_model=LoginResponse)
async def login(body: LoginRequest):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Email or password is incorrect")
    token = create_access_token(user["id"], user["email"])
    user.pop("password_hash", None)
    user.pop("_id", None)
    return LoginResponse(token=token, user=user)


@api.get("/auth/me")
async def auth_me(current=Depends(get_current_admin)):
    return current


# ---------------------------------------------------------------------------
# Admin: Store
# ---------------------------------------------------------------------------
@api.put("/admin/store")
async def update_store(payload: StoreSettings, current=Depends(get_current_admin)):
    data = payload.model_dump()
    data["key"] = "store"
    await db.settings.update_one({"key": "store"}, {"$set": data}, upsert=True)
    data.pop("key", None)
    return data


# ---------------------------------------------------------------------------
# Admin: Subscriptions
# ---------------------------------------------------------------------------
@api.post("/admin/subscriptions")
async def create_subscription(payload: Subscription, current=Depends(get_current_admin)):
    if await db.subscriptions.find_one({"id": payload.id}):
        raise HTTPException(400, "Subscription id already exists")
    await db.subscriptions.insert_one(payload.model_dump())
    return payload.model_dump()


@api.put("/admin/subscriptions/{sub_id}")
async def update_subscription(sub_id: str, payload: Subscription, current=Depends(get_current_admin)):
    data = payload.model_dump()
    data["id"] = sub_id
    res = await db.subscriptions.update_one({"id": sub_id}, {"$set": data})
    if res.matched_count == 0:
        raise HTTPException(404, "Subscription not found")
    return data


@api.delete("/admin/subscriptions/{sub_id}")
async def delete_subscription(sub_id: str, current=Depends(get_current_admin)):
    res = await db.subscriptions.delete_one({"id": sub_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Subscription not found")
    return {"deleted": sub_id}


# ---------------------------------------------------------------------------
# Admin: Games
# ---------------------------------------------------------------------------
@api.post("/admin/games")
async def create_game(payload: Game, current=Depends(get_current_admin)):
    if await db.games.find_one({"id": payload.id}):
        raise HTTPException(400, "Game id already exists")
    # append at end
    count = await db.games.count_documents({})
    doc = payload.model_dump()
    doc["order"] = count
    await db.games.insert_one(doc)
    doc.pop("order", None)
    doc.pop("_id", None)
    return doc


@api.put("/admin/games/{game_id}")
async def update_game(game_id: str, payload: Game, current=Depends(get_current_admin)):
    data = payload.model_dump()
    data["id"] = game_id
    res = await db.games.update_one({"id": game_id}, {"$set": data})
    if res.matched_count == 0:
        raise HTTPException(404, "Game not found")
    return data


@api.delete("/admin/games/{game_id}")
async def delete_game(game_id: str, current=Depends(get_current_admin)):
    res = await db.games.delete_one({"id": game_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Game not found")
    return {"deleted": game_id}


# ---------------------------------------------------------------------------
# Admin: Bundles
# ---------------------------------------------------------------------------
@api.post("/admin/bundles")
async def create_bundle(payload: Bundle, current=Depends(get_current_admin)):
    if await db.bundles.find_one({"id": payload.id}):
        raise HTTPException(400, "Bundle id already exists")
    await db.bundles.insert_one(payload.model_dump())
    return payload.model_dump()


@api.put("/admin/bundles/{bundle_id}")
async def update_bundle(bundle_id: str, payload: Bundle, current=Depends(get_current_admin)):
    data = payload.model_dump()
    data["id"] = bundle_id
    res = await db.bundles.update_one({"id": bundle_id}, {"$set": data})
    if res.matched_count == 0:
        raise HTTPException(404, "Bundle not found")
    return data


@api.delete("/admin/bundles/{bundle_id}")
async def delete_bundle(bundle_id: str, current=Depends(get_current_admin)):
    res = await db.bundles.delete_one({"id": bundle_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Bundle not found")
    return {"deleted": bundle_id}


# ---------------------------------------------------------------------------
# Seeding
# ---------------------------------------------------------------------------
async def seed_admin():
    email = os.environ.get("ADMIN_EMAIL", "admin@dukkank.com").lower()
    password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": email,
            "password_hash": hash_password(password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin user: {email}")
    elif not verify_password(password, existing["password_hash"]):
        await db.users.update_one(
            {"email": email},
            {"$set": {"password_hash": hash_password(password)}},
        )
        logger.info(f"Updated admin password for {email}")


async def seed_initial_data():
    # Store
    if not await db.settings.find_one({"key": "store"}):
        doc = dict(INITIAL_STORE)
        doc["key"] = "store"
        await db.settings.insert_one(doc)
        logger.info("Seeded store settings")

    # Subscriptions
    if await db.subscriptions.count_documents({}) == 0:
        await db.subscriptions.insert_many(list(INITIAL_SUBSCRIPTIONS))
        logger.info(f"Seeded {len(INITIAL_SUBSCRIPTIONS)} subscriptions")

    # Games (with order field)
    if await db.games.count_documents({}) == 0:
        docs = []
        for i, g in enumerate(INITIAL_GAMES):
            d = dict(g)
            d["order"] = i
            docs.append(d)
        await db.games.insert_many(docs)
        logger.info(f"Seeded {len(docs)} games")

    # Bundles
    if await db.bundles.count_documents({}) == 0:
        await db.bundles.insert_many(list(INITIAL_BUNDLES))
        logger.info(f"Seeded {len(INITIAL_BUNDLES)} bundles")


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.subscriptions.create_index("id", unique=True)
    await db.games.create_index("id", unique=True)
    await db.bundles.create_index("id", unique=True)
    await seed_admin()
    await seed_initial_data()
    logger.info("Startup complete")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# ---------------------------------------------------------------------------
# Wire up
# ---------------------------------------------------------------------------
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
