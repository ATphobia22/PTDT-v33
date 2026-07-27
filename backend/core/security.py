import re
from fastapi import Request, HTTPException, status
from jose import JWTError, jwt
from datetime import datetime, timedelta
from backend.core.config import settings

GLP_BLOCKS = [
    r"(?i)drop\s+table",
    r"(?i)rm\s+-rf",
    r"(?i)exploit",
    r"(?i)malware",
    r"(?i)bioweapon",
    r"(?i)unauthorized\s+access",
    r"(?i)modify\s+safety\s+limits"
]

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

async def bible_regex_firewall(request: Request, call_next):
    """
    Basic Instructions Before Logic Execution (B.I.B.L.E.) Middleware.
    Scans all incoming HTTP request bodies and queries to prevent ethical drift.
    """
    query_params = str(request.query_params)
    for pattern in GLP_BLOCKS:
        if re.search(pattern, query_params):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Payload violates B.I.B.L.E. ethical guardrails. Action aborted."
            )

    if request.method in ["POST", "PUT", "PATCH"]:
        body = await request.body()
        body_str = body.decode("utf-8", errors="ignore")
        for pattern in GLP_BLOCKS:
            if re.search(pattern, body_str):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Inbound packet contains illegal state-mutation patterns. Access Blocked."
                )

    response = await call_next(request)
    return response
