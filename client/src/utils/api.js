import supabase from '../lib/supabase';

const getUploadUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `https://xtpwioctpkgtnbriuqop.supabase.co/storage/v1/object/public/uploads/${path}`;
};

const api = {
  async login(email, senha) {
    console.log('Login attempt:', email);
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .eq('senha', senha);

    console.log('Supabase response:', data, error);
    if (error) console.log('Error:', error);
    if (error) throw new Error('Email ou senha inválidos');
    if (!data || data.length === 0) throw new Error('Email ou senha inválidos');
    
    const user = data[0];
    const token = btoa(JSON.stringify({ id: user.id, email: user.email, tipo: user.tipo }));
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    console.log('Login success!');
    
    return { token, user };
  },

  async register(nome, email, senha, whatsapp) {
    console.log('Register attempt:', nome, email);
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ nome, email, senha, whatsapp, tipo: 'usuario', status: 'ativo' }])
      .select()
      .single();

    console.log('Register response:', data, error);
    if (error) {
      console.log('Register error:', error);
      if (error.code === '23505') throw new Error('Email já cadastrado');
      throw new Error(error.message);
    }

    return data;
  },

  async getTarefas() {
    const { data, error } = await supabase
      .from('tarefas')
      .select('*')
      .eq('status', 'ativa')
      .order('dia_semana');

    if (error) throw new Error(error.message);
    return data;
  },

  async getPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*, usuarios(nome, foto_perfil)')
      .order('data_postagem', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  async createPost(conteudo, imagem, usuarioId) {
    const { data, error } = await supabase
      .from('posts')
      .insert([{ conteudo, imagem, usuario_id: usuarioId }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getAvisos() {
    const { data, error } = await supabase
      .from('avisos')
      .select('*')
      .order('data_criacao', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  async getUsuarios() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('nome');

    if (error) throw new Error(error.message);
    return data;
  },

  async getConclusoes(usuarioId, data) {
    const { data: conclusoes, error } = await supabase
      .from('conclusoes')
      .select('*, tarefas(*)')
      .eq('usuario_id', usuarioId);

    if (error) throw new Error(error.message);
    return conclusoes;
  },

  async createConclusao(usuarioId, tarefaId, observacoes) {
    const { data, error } = await supabase
      .from('conclusoes')
      .insert([{ usuario_id: usuarioId, tarefa_id: tarefaId, observacoes }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getUploadUrl
};

export { api as default, getUploadUrl };
