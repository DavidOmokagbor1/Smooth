"""
Database connection and session management
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Base class for SQLAlchemy models
Base = declarative_base()

# Database engine
engine = None
async_session_maker = None


async def init_db():
    """Initialize database connection"""
    global engine, async_session_maker
    
    if not settings.DATABASE_URL:
        logger.warning("DATABASE_URL not set. Database features will be disabled.")
        return None
    
    try:
        # Create async engine
        engine = create_async_engine(
            settings.DATABASE_URL,
            echo=settings.DEBUG,  # Log SQL queries in debug mode
            future=True
        )
        
        # Create session factory
        async_session_maker = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False
        )
        
        # Test connection
        async with engine.begin() as conn:
            await conn.run_sync(lambda sync_conn: None)  # Simple connection test
        
        logger.info("Database connection initialized successfully")
        return engine
        
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        logger.warning("Continuing without database. Some features will be disabled.")
        return None


async def get_db() -> AsyncSession:
    """
    Dependency for getting database session.
    Use this in FastAPI route dependencies.
    
    Returns None if database is not configured (graceful degradation).
    """
    if async_session_maker is None:
        # Return None instead of raising - allows graceful degradation
        yield None
    else:
        async with async_session_maker() as session:
            try:
                yield session
            finally:
                await session.close()


async def close_db():
    """Close database connections"""
    global engine
    if engine:
        await engine.dispose()
        logger.info("Database connections closed")

