import os
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncpg
from neo4j import AsyncGraphDatabase

# PostgreSQL Configurations
DB_HOST = os.getenv("DB_HOST", "postgres")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "coursenavigator")
DB_USER = os.getenv("DB_USER", "admin")
DB_PASSWORD = os.getenv("DB_PASSWORD", "secure_password_please_change")

# Neo4j Configurations
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://neo4j:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "secure_password_please_change")

# Input Schemas
class PostgresTestInput(BaseModel):
    title: str
    description: str | None = None

class Neo4jTestInput(BaseModel):
    title: str
    description: str | None = None
    prerequisite_title: str | None = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- PostgreSQL 接続プールの初期化 ---
    pool = await asyncpg.create_pool(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )
    app.state.db_pool = pool
    
    # テスト用テーブルの作成
    async with pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS test_postgres (
                id UUID PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

    # --- Neo4j ドライバ初期化 ---
    neo4j_driver = AsyncGraphDatabase.driver(
        NEO4J_URI,
        auth=(NEO4J_USER, NEO4J_PASSWORD)
    )
    app.state.neo4j_driver = neo4j_driver

    yield

    # --- シャットダウン処理 ---
    await pool.close()
    await neo4j_driver.close()

app = FastAPI(lifespan=lifespan)

# --- PostgreSQL エンドポイント ---

@app.post("/test/postgres")
async def test_postgres_insert(data: PostgresTestInput):
    pool = app.state.db_pool
    record_id = uuid.uuid4()
    async with pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO test_postgres (id, title, description) VALUES ($1, $2, $3)",
            record_id, data.title, data.description
        )
    return {"id": record_id, "title": data.title, "description": data.description}

@app.get("/test/postgres")
async def test_postgres_search(q: str = ""):
    pool = app.state.db_pool
    async with pool.acquire() as conn:
        if q:
            rows = await conn.fetch(
                "SELECT id, title, description, created_at FROM test_postgres WHERE title ILIKE $1 ORDER BY created_at DESC",
                f"%{q}%"
            )
        else:
            rows = await conn.fetch(
                "SELECT id, title, description, created_at FROM test_postgres ORDER BY created_at DESC"
            )
    return [
        {
            "id": str(row["id"]),
            "title": row["title"],
            "description": row["description"],
            "created_at": row["created_at"]
        } for row in rows
    ]

# --- Neo4j エンドポイント ---

@app.post("/test/neo4j")
async def test_neo4j_insert(data: Neo4jTestInput):
    driver = app.state.neo4j_driver
    record_id = str(uuid.uuid4())
    prereq_id = str(uuid.uuid4())
    
    query = """
    MERGE (c:Course {id: $id})
    SET c.title = $title, c.description = $description
    WITH c
    FOREACH (p_title IN CASE WHEN $prerequisite_title <> '' THEN [$prerequisite_title] ELSE [] END |
        MERGE (p:Course {title: p_title})
        ON CREATE SET p.id = $prerequisite_id
        MERGE (c)-[:REQUIRES_PREREQUISITE]->(p)
    )
    RETURN c.id AS id
    """
    
    async with driver.session() as session:
        await session.run(
            query,
            id=record_id,
            title=data.title,
            description=data.description or "",
            prerequisite_title=data.prerequisite_title or "",
            prerequisite_id=prereq_id
        )
    return {
        "id": record_id,
        "title": data.title,
        "description": data.description,
        "prerequisite_title": data.prerequisite_title
    }

@app.get("/test/neo4j")
async def test_neo4j_search(q: str = ""):
    driver = app.state.neo4j_driver
    
    query = """
    MATCH (c:Course)
    WHERE c.title CONTAINS $q OR (c.description IS NOT NULL AND c.description CONTAINS $q)
    OPTIONAL MATCH (c)-[:REQUIRES_PREREQUISITE]->(p:Course)
    RETURN c.id AS id, c.title AS title, c.description AS description, collect(p.title) AS prerequisites
    ORDER BY c.title ASC
    """
    
    async with driver.session() as session:
        result = await session.run(query, q=q)
        records = await result.data()
        
    return [
        {
            "id": record["id"],
            "title": record["title"],
            "description": record["description"],
            "prerequisites": record["prerequisites"]
        } for record in records
    ]
