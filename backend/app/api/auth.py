import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Header
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.core.database import get_database

router = APIRouter(prefix="/api/auth", tags=["auth"])

_in_memory_users = {}

def get_user_by_email(email: str):
    email_lower = email.lower().strip()
    try:
        db = get_database()
        user_doc = db.users.find_one({"email": email_lower})
        if user_doc:
            return user_doc
    except Exception:
        pass

    return _in_memory_users.get(email_lower)


def save_user(user_doc: dict):
    email_lower = user_doc["email"].lower().strip()
    user_doc["email"] = email_lower
    _in_memory_users[email_lower] = user_doc

    try:
        db = get_database()
        db.users.insert_one(user_doc)
    except Exception as e:
        print("MongoDB save user fallback to memory:", e)


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    email_clean = user_data.email.lower().strip()

    existing = get_user_by_email(email_clean)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="An account with this email address already exists."
        )

    user_id = f"usr-{uuid.uuid4().hex[:8]}"
    role = user_data.role if user_data.role in ["user", "admin"] else "user"
    now_iso = datetime.utcnow().isoformat()

    user_doc = {
        "id": user_id,
        "name": user_data.name.strip(),
        "email": email_clean,
        "hashed_password": hash_password(user_data.password),
        "role": role,
        "created_at": now_iso
    }

    save_user(user_doc)

    token = create_access_token({
        "sub": user_id,
        "email": email_clean,
        "name": user_doc["name"],
        "role": role
    })

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user_id,
            name=user_doc["name"],
            email=email_clean,
            role=role,
            created_at=now_iso
        )
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    email_clean = credentials.email.lower().strip()

    user_doc = get_user_by_email(email_clean)
    if not user_doc or not verify_password(credentials.password, user_doc["hashed_password"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid email address or password."
        )

    token = create_access_token({
        "sub": user_doc["id"],
        "email": user_doc["email"],
        "name": user_doc["name"],
        "role": user_doc["role"]
    })

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user_doc["id"],
            name=user_doc["name"],
            email=user_doc["email"],
            role=user_doc["role"],
            created_at=user_doc.get("created_at", datetime.utcnow().isoformat())
        )
    )


@router.get("/me", response_model=UserResponse)
async def get_me(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication token required.")

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired session token.")

    user_doc = get_user_by_email(payload.get("email", ""))
    if not user_doc:
        return UserResponse(
            id=payload.get("sub", "usr-unknown"),
            name=payload.get("name", "User"),
            email=payload.get("email", ""),
            role=payload.get("role", "user"),
            created_at=datetime.utcnow().isoformat()
        )

    return UserResponse(
        id=user_doc["id"],
        name=user_doc["name"],
        email=user_doc["email"],
        role=user_doc["role"],
        created_at=user_doc.get("created_at", datetime.utcnow().isoformat())
    )
