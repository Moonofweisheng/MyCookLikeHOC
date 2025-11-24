-- 创建菜谱表
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  ingredients TEXT NOT NULL,
  steps TEXT NOT NULL,
  cover_image TEXT, -- base64编码的图片
  image_path VARCHAR(500), -- 原始图片路径
  process_image_url TEXT, -- 菜谱手绘流程图URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes(title);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at);
CREATE INDEX IF NOT EXISTS idx_recipes_process_image_url ON recipes(process_image_url) WHERE process_image_url IS NOT NULL;

-- 启用行级安全策略
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有用户读取菜谱
CREATE POLICY "Allow public read access" ON recipes
  FOR SELECT USING (true);

-- 创建策略：允许认证用户插入菜谱
CREATE POLICY "Allow authenticated insert" ON recipes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 创建策略：允许认证用户更新菜谱
CREATE POLICY "Allow authenticated update" ON recipes
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 创建策略：允许认证用户删除菜谱
CREATE POLICY "Allow authenticated delete" ON recipes
  FOR DELETE USING (auth.role() = 'authenticated');

-- 授权给anon和authenticated角色
GRANT SELECT ON recipes TO anon;
GRANT ALL PRIVILEGES ON recipes TO authenticated;
