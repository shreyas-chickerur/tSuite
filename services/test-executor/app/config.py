from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Server
    environment: str = "development"
    port: int = 8000
    api_version: str = "v1"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # API Gateway
    api_gateway_url: str = "http://localhost:3001"
    
    # Celery
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/0"
    
    # Test Execution
    max_concurrent_tests: int = 5
    test_timeout: int = 300
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
