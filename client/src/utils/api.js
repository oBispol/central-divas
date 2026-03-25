import supabase from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = {
  async login(email, senha) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .eq('senha', senha)
      .single();

    if (error) throw new Error('Email ou senha inválidos');
    
    const token = btoa(JSON.stringify({ id: data.id, email: data.email, tipo: data.tipo }));
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(data));
    
    return { token, user: data };
  },

  async register(nome, email, senha, whatsapp) {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ nome, email, senha, whatsapp, tipo: 'usuario', status: 'ativo' }])
      .select()
      .single();

    if (error) {
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
  }
};

export default api;
