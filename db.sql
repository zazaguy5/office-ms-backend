TRUNCATE TABLE users;

DROP TABLE refresh_tokens;
DROP TABLE users;

CREATE TABLE hospital (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address_line  TEXT,
  latitude      DECIMAL(10, 7) NOT NULL,      -- เช่น 13.7563309
  longitude     DECIMAL(10, 7) NOT NULL,      -- เช่น 100.5017651
  location      GEOGRAPHY(POINT, 4326),       -- ใช้ถ้ามี PostGIS (query ระยะทางได้เร็ว)
  operating_hours JSONB,                      -- {"mon": "08:00-20:00", ...}
  is_active      BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- Index สำหรับ query ตามพื้นที่ (ถ้าใช้ PostGIS)
CREATE INDEX idx_hospitals_location ON hospitals USING GIST (location);



CREATE TYPE user_role AS ENUM('user', 'admin');

-- ประเภท department ของระบบ Office
-- ('Human Resources', 'HR'),
-- ('Accounting', 'ACC'),
-- ('Sales', 'SALE'),
-- ('Marketing', 'MKT'),
-- ('Engineering', 'ENG'),
-- ('Operations', 'OPS'),
-- ('Customer Service', 'CS')
CREATE TYPE depart_type AS ENUM('HR', 'ACC', 'SALE', 'MKT', 'ENG', 'OPS', 'CS');

CREATE TYPE position_type AS ENUM ('staff', 'senior', 'lead', 'manager', 'director');


-- สร้างฐานข้อมูลผู้ใช้
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sirname VARCHAR(255) NOT NULL,
  accname VARCHAR(255) NOT NULL,
  password TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  department depart_type NOT NULL DEFAULT 'ENG',
  position position_type NOT NULL DEFAULT 'staff',
  startdate DATE NOT NULL,
  createddate DATE NOT NULL,
  createdtime TIME NOT NULL
);

-- Access Token	
-- อายุสั้น (15 นาที - 1 ชม.)	
-- ใช้แนบไปกับทุก API request	ป้องกันการแฮกระบบ
-- วิธีการเก็บ memory หรือ localStorage
-- ไม่เช็คกับ DB (verify แค่ signature เร็ว)

-- Refresh Token
-- อายุยาว (7-30 วัน)
-- ใช้แลก access token ใหม่เท่านั้น
-- วิธีการเก็บ httpOnly cookie (ปลอดภัยกว่า)
-- เช็คกับ DB (เทียบกับที่เก็บใน DB)
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);