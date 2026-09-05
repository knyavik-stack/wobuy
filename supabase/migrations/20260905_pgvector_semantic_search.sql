-- SQL миграция для активации и настройки семантического векторного поиска pgvector в wobuy.

-- 1. Убедимся, что расширение vector активно
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Добавляем колонку для хранения эмбеддингов (768 размерностей для Google text-embedding-004)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'embedding'
    ) THEN
        ALTER TABLE products ADD COLUMN embedding vector(768);
    END IF;
END $$;

-- 3. Создаем индекс IVFFlat / HNSW для быстрого косинусного поиска
CREATE INDEX IF NOT EXISTS products_embedding_hnsw_idx 
ON products USING hnsw (embedding vector_cosine_ops);

-- 4. Создаем функцию поиска по семантическому сходству с фильтрами по цене и категории
CREATE OR REPLACE FUNCTION match_products_by_embedding (
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 20,
  filter_category text DEFAULT NULL,
  min_price numeric DEFAULT NULL,
  max_price numeric DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  canonical_name text,
  brand text,
  category text,
  description text,
  image_url text,
  is_active boolean,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.canonical_name,
    p.brand,
    p.category,
    p.description,
    p.image_url,
    p.is_active,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM products p
  WHERE p.is_active = true
    AND p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
    AND (filter_category IS NULL OR p.category ILIKE '%' || filter_category || '%')
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
