import { useState, useEffect, useCallback } from 'react';
import { Image, Plus, ExternalLink, Trash2, Calendar, Edit2, X, AlertCircle, Sparkles } from 'lucide-react';
import api from '../utils/api';
import { formatDateToInput } from '../utils/date';

const isValidInstagramUrl = (url) => {
  const patterns = [
    /instagram\.com\/p\/[A-Za-z0-9_-]+/,
    /instagram\.com\/reel\/[A-Za-z0-9_-]+/,
    /instagram\.com\/tv\/[A-Za-z0-9_-]+/,
  ];
  return patterns.some(pattern => pattern.test(url));
};

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({ link: '', caption: '', data_post: formatDateToInput() });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/posts');
      setPosts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.link.trim()) {
      setFormError('O link é obrigatório');
      return;
    }

    if (!isValidInstagramUrl(formData.link)) {
      setFormError('O link deve ser do Instagram (instagram.com/p/...)');
      return;
    }

    setSaving(true);
    try {
      if (editingPost) {
        await api.put(`/posts/${editingPost.id}`, formData);
      } else {
        await api.post('/posts', formData);
      }
      await fetchPosts();
      setShowModal(false);
      setEditingPost(null);
      setFormData({ link: '', caption: '', data_post: formatDateToInput() });
    } catch (error) {
      setFormError(error.response?.data?.error || 'Erro ao salvar post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      await fetchPosts();
    } catch (error) {
      console.error('Erro ao excluir post:', error);
    }
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setFormData({ link: post.link, caption: post.caption || '', data_post: post.data_post });
    setFormError('');
    setShowModal(true);
  };

  const openNewModal = () => {
    setEditingPost(null);
    setFormData({ link: '', caption: '', data_post: formatDateToInput() });
    setFormError('');
    setShowModal(true);
  };

  const groupedPosts = posts.reduce((acc, post) => {
    const date = post.data_post;
    if (!acc[date]) acc[date] = [];
    acc[date].push(post);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="stat-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
              <Image className="text-rose-500" size={22} />
              Posts do Dia
            </h2>
            <p className="text-text-secondary text-sm mt-1">Gerencie os posts para engajamento</p>
          </div>
          <button onClick={openNewModal} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Novo Post
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-rose-300 border-t-transparent"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="stat-card text-center py-16">
          <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Image className="text-text-muted" size={40} />
          </div>
          <h3 className="text-xl font-semibold text-text-primary">Nenhum post cadastrado</h3>
          <button onClick={openNewModal} className="btn-primary mt-5">Adicionar primeiro post</button>
        </div>
      ) : (
        Object.entries(groupedPosts)
          .sort(([a], [b]) => new Date(b) - new Date(a))
          .map(([date, datePosts]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                  <Calendar className="text-rose-500" size={18} />
                </div>
                <h3 className="font-semibold text-text-primary">
                  {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">
                  {datePosts.length} post{datePosts.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {datePosts.map((post) => (
                  <div key={post.id} className="stat-card card-hover">
                    {post.caption && <p className="text-text-primary text-sm line-clamp-2 mb-4">{post.caption}</p>}
                    <div className="flex items-center justify-between">
                      <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:underline text-sm font-semibold flex items-center gap-1">
                        <ExternalLink size={14} />
                        Ver post
                      </a>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditModal(post)} className="p-2 text-text-muted hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(post.id)} className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-text-muted mt-4 pt-4 border-t border-cream-100">Por {post.criado_por_nome || 'Admin'}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Sparkles className="text-rose-500" size={20} />
                {editingPost ? 'Editar Post' : 'Novo Post'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-text-muted hover:text-text-primary hover:bg-cream-100 rounded-lg transition-all">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle size={18} />
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Link do Instagram *</label>
                <input 
                  type="url" 
                  value={formData.link} 
                  onChange={(e) => { setFormData({ ...formData, link: e.target.value }); setFormError(''); }} 
                  placeholder="https://www.instagram.com/p/..." 
                  className="input" 
                />
                <p className="text-xs text-text-muted mt-2">Deve começar com https://www.instagram.com/</p>
              </div>
              <div>
                <label className="label">Legenda (opcional)</label>
                <textarea 
                  value={formData.caption} 
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })} 
                  placeholder="Descrição..." 
                  className="input min-h-[100px] resize-none" 
                />
              </div>
              <div>
                <label className="label">Data do Post</label>
                <input type="date" value={formData.data_post} onChange={(e) => setFormData({ ...formData, data_post: e.target.value })} className="input" required />
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary py-3" disabled={saving}>Cancelar</button>
                <button type="submit" className="flex-1 btn-primary py-3" disabled={saving}>
                  {saving ? 'Salvando...' : (editingPost ? 'Salvar' : 'Adicionar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;
