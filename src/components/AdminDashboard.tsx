'use client';

import React, { useState, useEffect } from 'react';
import UserManagement from '@/components/UserManagement';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { 
  BarChart3, 
  Users, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Search,
  LayoutDashboard,
  Filter,
  Calendar,
  X,
  Save,
  Trash2,
  MessageSquare,
  Settings,
  Plus,
  Tag
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'list' | 'articles'>('stats');
  const [interventions, setInterventions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [articleTypes, setArticleTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntervention, setSelectedIntervention] = useState<any | null>(null);
  
  const [filters, setFilters] = useState({
    startDate: '' as string | null,
    endDate: '' as string | null,
    employeeId: 'all' as string | 'all',
    articleType: 'all' as string | 'all',
    onlyNonClos: false,
  });

  const { filteredData, stats } = useAdminAnalytics(interventions, filters);

  const fetchData = async () => {
    try {
      const [intRes, usersRes, artRes] = await Promise.all([
        fetch('/api/interventions'),
        fetch('/api/users'),
        fetch('/api/article-types')
      ]);
      const [intData, usersData, artData] = await Promise.all([
        intRes.json(),
        usersRes.json(),
        artRes.json()
      ]);
      setInterventions(intData);
      setUsers(usersData);
      setArticleTypes(artData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) return;
    try {
      const res = await fetch(`/api/interventions?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
        setSelectedIntervention(null);
      } else {
        const err = await res.json();
        alert(err.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateFull = async (id: string, updates: any) => {
    try {
      const res = await fetch('/api/interventions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) {
        fetchData();
        setSelectedIntervention(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Panel Administration</h1>
          <div className="flex gap-4 mt-2">
            <TabBtn active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<LayoutDashboard size={16}/>} label="Stats" />
            <TabBtn active={activeTab === 'list'} onClick={() => setActiveTab('list')} icon={<ClipboardList size={16}/>} label="Dossiers" />
            <TabBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={16}/>} label="Équipe & Articles" />
          </div>
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-12">
          <UserManagement 
            onUserCreated={fetchData} 
            users={users} 
            onDeleteUser={async (id) => {
              if (!confirm('Supprimer cet utilisateur et tous ses dossiers associés ?')) return;
              try {
                const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
                if (res.ok) fetchData();
                else {
                  const err = await res.json();
                  alert(err.error || 'Erreur');
                }
              } catch (err) {
                alert('Erreur réseau');
              }
            }}
          />
          
          <ArticleManagement 
            articles={articleTypes} 
            onRefresh={fetchData} 
          />
        </div>
      )}

      {(activeTab === 'stats' || activeTab === 'list') && (
        <>
          {/* Barre de Filtres */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-4 items-end">
            <FilterInput label="Début" type="date" value={filters.startDate} onChange={(v) => setFilters({...filters, startDate: v})} />
            <FilterInput label="Fin" type="date" value={filters.endDate} onChange={(v) => setFilters({...filters, endDate: v})} />
            
            <div className="flex flex-col gap-1.5 min-w-[150px]">
              <label className="text-xs font-semibold text-slate-500">Employé</label>
              <select 
                value={filters.employeeId}
                onChange={(e) => setFilters({...filters, employeeId: e.target.value})}
                className="text-sm p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous</option>
                {users.filter(u => u.role === 'EMPLOYEE').map(u => (
                  <option key={u.id} value={u.id}>{u.fullName}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[150px]">
              <label className="text-xs font-semibold text-slate-500">Type d'Article</label>
              <select 
                value={filters.articleType}
                onChange={(e) => setFilters({...filters, articleType: e.target.value})}
                className="text-sm p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les types</option>
                {articleTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pb-2">
              <input 
                type="checkbox" 
                id="filterNonClos"
                checked={filters.onlyNonClos}
                onChange={(e) => setFilters({...filters, onlyNonClos: e.target.checked})}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="filterNonClos" className="text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer uppercase">
                Non Clos Uniquement
              </label>
            </div>

            <button 
              onClick={() => setFilters({ startDate: '', endDate: '', employeeId: 'all', articleType: 'all', onlyNonClos: false })}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 pb-2.5"
            >
              Réinitialiser
            </button>
          </div>

          {activeTab === 'stats' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Total" value={stats.total} icon={<ClipboardList className="text-blue-500" />} />
                <StatCard title="NON CLOS" value={stats.nonClosCount} icon={<AlertCircle className="text-red-500" />} />
                <StatCard title="CLOS" value={stats.total - stats.nonClosCount} icon={<CheckCircle2 className="text-green-500" />} />
              </div>
              
              <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 size={20} /> Répartition par Article
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.articleTypeDistribution).map(([type, count]) => (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{type}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${(count / (stats.total || 1)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-4">Dossier</th>
                    <th className="px-6 py-4">Employé</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">État</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[...filteredData].sort((a, b) => {
                    // Default sort by dateCreation (newest first)
                    return new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime();
                  }).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-bold">{item.numeroDossier}</td>
                      <td className="px-6 py-4">{item.user?.fullName}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(item.dateCreation).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        {item.isNonClos ? (
                          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full">NON CLOS</span>
                        ) : (
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full">CLOS</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedIntervention(item)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Modifier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal Edition Admin */}
      {selectedIntervention && (
        <AdminEditModal 
          intervention={selectedIntervention} 
          articleTypes={articleTypes}
          onClose={() => setSelectedIntervention(null)} 
          onSave={(updates: any) => handleUpdateFull(selectedIntervention.id, updates)}
          onDelete={(id: string) => handleDelete(id)}
        />
      )}
    </div>
  );
}

function ArticleManagement({ articles, onRefresh }: { articles: any[]; onRefresh: () => void }) {
  const [newType, setNewType] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!newType.trim()) return;
    setIsAdding(true);
    try {
      const res = await fetch('/api/article-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newType.trim().toUpperCase() }),
      });
      if (res.ok) {
        setNewType('');
        onRefresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Erreur');
      }
    } catch (err) {
      alert('Erreur réseau');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce type d\'article ?')) return;
    try {
      const res = await fetch(`/api/article-types?id=${id}`, { method: 'DELETE' });
      if (res.ok) onRefresh();
    } catch (err) {
      alert('Erreur réseau');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 max-w-2xl mx-auto shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg text-blue-600">
          <Tag size={24} />
        </div>
        <h2 className="text-xl font-bold">Gestion des Articles</h2>
      </div>

      <div className="flex gap-2 mb-8">
        <input 
          type="text" 
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          placeholder="Nouveau type (ex: RECOR)"
          className="flex-1 p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={handleAdd}
          disabled={isAdding || !newType}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {articles.map((art) => (
          <div key={art.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group">
            <span className="text-sm font-bold uppercase">{art.name}</span>
            <button 
              onClick={() => handleDelete(art.id)}
              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminEditModal({ intervention, articleTypes, onClose, onSave, onDelete }: any) {
  const [data, setData] = useState({...intervention});

  const articleNames = articleTypes.map((t: any) => t.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-xl font-bold">Édition Prioritaire</h3>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Dossier : {intervention.numeroDossier}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onDelete(intervention.id)}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
              title="Supprimer définitivement"
            >
              <Trash2 size={20} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"><X size={20} /></button>
          </div>
        </div>
        
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">État du Dossier</label>
              <div className="flex items-center space-x-2 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl">
                <input 
                  type="checkbox"
                  id="modalIsNonClos"
                  checked={data.isNonClos}
                  onChange={(e) => setData({...data, isNonClos: e.target.checked})}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="modalIsNonClos" className="text-sm font-bold uppercase cursor-pointer">NON CLOS</label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Type d'article</label>
              <select 
                value={articleNames.includes(data.articleType) ? data.articleType : 'Autre'}
                onChange={(e) => {
                  const val = e.target.value;
                  setData({...data, articleType: val === 'Autre' ? (articleNames.includes(data.articleType) ? '' : data.articleType) : val});
                }}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              >
                {articleNames.map((t: string) => <option key={t} value={t}>{t}</option>)}
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>

          {(data.articleType === 'Autre' || !articleNames.includes(data.articleType)) && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              <label className="text-xs font-bold text-slate-400 uppercase">Préciser le type d'article</label>
              <input 
                type="text"
                value={data.articleType}
                onChange={(e) => setData({...data, articleType: e.target.value})}
                placeholder="Saisissez le type..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Commentaire Technicien (Modifiable par Admin)</label>
            <textarea 
              value={data.commentaireTechnicien}
              onChange={(e) => setData({...data, commentaireTechnicien: e.target.value})}
              rows={3}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase flex items-center gap-2">
              <MessageSquare size={14} /> Votre Retour Administrateur
            </label>
            <textarea 
              value={data.retourAdmin || ''}
              onChange={(e) => setData({...data, retourAdmin: e.target.value})}
              placeholder="Ajouter une instruction ou un retour..."
              className="w-full p-3 bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Annuler
          </button>
          <button 
            onClick={() => onSave(data)}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <Save size={18} /> Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
          : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">{icon}</div>
      </div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  );
}

function FilterInput({ label, type, value, onChange }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500">{label}</label>
      <input 
        type={type} 
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
