
import os

from cryptography.hazmat.primitives.kdf.scrypt import Scrypt
from cryptography.exceptions import InvalidKey

SALT_SIZE = 16
KDF_LENGTH = 32
KDF_N = 2**14
KDF_R = 8
KDF_P = 1


def derive_password(password: str) -> str:
    """Derive a password and return the salt and hash."""
    salt = os.urandom(SALT_SIZE)
    kdf = Scrypt(
        salt=salt,
        length=KDF_LENGTH,
        n=KDF_N,
        r=KDF_R,
        p=KDF_P,
    )
    return salt.hex() + kdf.derive(password.encode()).hex()


def verify_password(password: str, salt_and_hash: str) -> bool:
    """Verify a password."""
    salt = bytes.fromhex(salt_and_hash)[:SALT_SIZE]
    password_hash = bytes.fromhex(salt_and_hash)[SALT_SIZE:]
    kdf = Scrypt(
        salt=salt,
        length=KDF_LENGTH,
        n=KDF_N,
        r=KDF_R,
        p=KDF_P,
    )
    try:
        kdf.verify(password.encode(), password_hash)
    except InvalidKey:
        return False
    return True

