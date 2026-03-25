-- Enable RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE conclusoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE avisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_status ENABLE ROW LEVEL SECURITY;

-- Public read policies for tarefas
CREATE POLICY "Public read tarefas" ON tarefas FOR SELECT USING (true);

-- Public read policies for avisos
CREATE POLICY "Public read avisos" ON avisos FOR SELECT USING (true);

-- Public read/write policies for usuarios (for auth)
CREATE POLICY "Public read usuarios" ON usuarios FOR SELECT USING (true);
CREATE POLICY "Public insert usuarios" ON usuarios FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update usuarios" ON usuarios FOR UPDATE USING (true);

-- Public read/write policies for posts
CREATE POLICY "Public read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Public insert posts" ON posts FOR INSERT WITH CHECK (true);

-- Public read/write policies for conclusoes
CREATE POLICY "Public read conclusoes" ON conclusoes FOR SELECT USING (true);
CREATE POLICY "Public insert conclusoes" ON conclusoes FOR INSERT WITH CHECK (true);

-- Public read/write policies for historico
CREATE POLICY "Public read historico" ON historico FOR SELECT USING (true);
CREATE POLICY "Public insert historico" ON historico FOR INSERT WITH CHECK (true);

-- Public read/write policies for daily_status
CREATE POLICY "Public read daily_status" ON daily_status FOR SELECT USING (true);
CREATE POLICY "Public insert daily_status" ON daily_status FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update daily_status" ON daily_status FOR UPDATE USING (true);
