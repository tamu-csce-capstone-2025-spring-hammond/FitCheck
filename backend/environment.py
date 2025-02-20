### Load environment variables from .env file and perform validation


from functools import cache
import os

from dotenv import load_dotenv

def get(key: str) -> str:
    """
    Get the value of an environment variable.
    """
    env = __Environment()
    if key not in env:
        raise KeyError(f"Environment variable is not declared in .env.template: {key}")
    return env[key]

def reload() -> None:
    """
    Reload the environment variables from the .env file.
    """
    __Environment.cache_clear()

@cache
def __Environment() -> dict:
    """
    Load environment variables from .env file and perform validation.
    """
    # Load environment variables from .env
    load_dotenv()

    # Read required environment variables from .env.template and validate
    vars_in_template = []
    missing_vars = []
    with open(".env.template", "r") as f:
        for line in f:
            # Skip comments and empty lines
            if line.startswith("#") or not line.strip():
                continue

            # Split key and value
            key, value = line.split("=", 1)
            
            # Remove whitespace and quotes
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            vars_in_template.append(key)

            # Check if the key is in the environment variables
            if key not in os.environ:
                missing_vars.append(key)
    
    # If there are missing environment variables, raise an error
    if missing_vars:
        raise ValueError(f"Missing environment variables specified in .env.template: {', '.join(missing_vars)}")

    # Return the loaded environment variables as a dictionary
    env_vars = {key: os.environ[key] for key in vars_in_template}
    return env_vars

