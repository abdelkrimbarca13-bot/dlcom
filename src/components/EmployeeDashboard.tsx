'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  MessageSquare, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  X,
  ClipboardList,
  LayoutDashboard,
  Save,
  Bell,
  Trash2
} from 'lucide-react';
import InterventionEntryForm from './InterventionEntryForm';

type Intervention = {
  id: string;
  numeroDossier: string;
  dateCreation: string;
  articleType: string;
  commentaireTechnicien: string;
  retourAdmin: string | null;
  luParTechnicien: boolean;
  isNonClos: boolean;
};

export default function EmployeeDashboard() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [articleTypes, setArticleTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyNonClos, setOnlyNonClos] = useState(false);

  const fetchData = async () => {
    try {
      const [intRes, artRes] = await Promise.all([
        fetch('/api/interventions'),
        fetch('/api/article-types')
      ]);
      const [intData, artData] = await Promise.all([
        intRes.json(),
        artRes.json()
      ]);
      setInterventions(intData);
      if (Array.isArray(artData)) {
        setArticleTypes(artData.map((t: any) => t.name));
      }
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

  const stats = useMemo(() => {
    return {
      total: interventions.length,
      nonClos: interventions.filter(i => i.isNonClos).length,
      clos: interventions.filter(i => !i.isNonClos).length,
      nonLus: interventions.filter(i => i.retourAdmin && !i.luParTechnicien).length,
    };
  }, [interventions]);

  const handleUpdate = async (id: string, updates: Partial<Intervention>) => {
    try {
      const res = await fetch('/api/interventions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) {
        fetchData();
        if (selectedIntervention && selectedIntervention.id === id) {
          setSelectedIntervention(prev => prev ? { ...prev, ...updates } : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openIntervention = (intervention: Intervention) => {
    setSelectedIntervention(intervention);
    if (intervention.retourAdmin && !intervention.luParTechnicien) {
      handleUpdate(intervention.id, { luParTechnicien: true });
    }
  };

  const filtered = useMemo(() => {
    return interventions
      .filter(i => {
        const matchesSearch = i.numeroDossier.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesNonClos = !onlyNonClos || i.isNonClos === true;
        return matchesSearch && matchesNonClos;
      })
      .sort((a, b) => {
        // Default sort by dateCreation (newest first)
        return new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime();
      });
  }, [interventions, searchTerm, onlyNonClos]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-8">
      {/* Welcome & KPI Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <LayoutDashboard className="text-blue-600" /> Mon Espace
            </h2>
            <p className="text-slate-500 font-medium">Suivi et gestion de vos interventions techniques</p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 font-bold"
          >
            <Plus size={20} /> Nouvelle Saisie
          </button>
        </div>

        <KPICard title="Total Dossiers" value={stats.total} icon={<ClipboardList className="text-blue-500" />} />
        <KPICard title="Non Clos" value={stats.nonClos} icon={<AlertCircle className="text-red-500" />} />
        <KPICard title="Clos" value={stats.clos} icon={<CheckCircle2 className="text-green-500" />} highlight={false} />
        <KPICard title="Retours Admin" value={stats.nonLus} icon={<Bell className={stats.nonLus > 0 ? "text-red-500 animate-bounce" : "text-slate-400"} />} highlight={stats.nonLus > 0} />
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h3 className="text-xl font-bold flex items-center gap-2">
            Liste des interventions 
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs px-2.5 py-1 rounded-full">{filtered.length}</span>
          </h3>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent">
              <input 
                type="checkbox" 
                id="empFilterNonClos"
                checked={onlyNonClos}
                onChange={(e) => setOnlyNonClos(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="empFilterNonClos" className="text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer uppercase whitespace-nowrap">
                Non Clos Uniquement
              </label>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Rechercher un numéro de dossier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl outline-none transition-all font-medium text-sm"
              />
            </div>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(i => (
              <InterventionCard 
                key={i.id} 
                intervention={i} 
                onClick={() => openIntervention(i)} 
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Search size={32} />
            </div>
            <p className="text-slate-500 font-medium">Aucun dossier trouvé pour cette recherche.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedIntervention && (
        <DetailModal 
          intervention={selectedIntervention} 
          articleTypes={articleTypes}
          onClose={() => setSelectedIntervention(null)}
          onSave={(updates) => handleUpdate(selectedIntervention.id, updates)}
          onDelete={(id) => handleDelete(id)}
        />
      )}

      {/* Creation Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative bg-white dark:bg-slate-900 w-full max-md rounded-[2.5rem] shadow-2xl p-8 border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setShowForm(false)} 
              className="absolute right-6 top-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <InterventionEntryForm onSuccess={() => { setShowForm(false); fetchData(); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({ title, value, icon, highlight }: { title: string; value: number; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border ${highlight ? 'border-red-200 bg-red-50/30' : 'border-slate-100 dark:border-slate-800'} shadow-sm transition-all hover:translate-y-[-4px]`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">{icon}</div>
        {highlight && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>}
      </div>
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function InterventionCard({ intervention, onClick }: { intervention: Intervention; onClick: () => void }) {
  const hasUnread = intervention.retourAdmin && !intervention.luParTechnicien;
  
  return (
    <div 
      onClick={onClick}
      className={`group relative bg-white dark:bg-slate-900 p-6 rounded-[2rem] border ${hasUnread ? 'border-blue-400 bg-blue-50/10' : 'border-slate-100 dark:border-slate-800'} hover:border-blue-600 dark:hover:border-blue-500 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/5`}
    >
      {hasUnread && (
        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg border-2 border-white dark:border-slate-900 flex items-center gap-1 animate-pulse">
          NOUVEAU RETOUR
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 rounded-md">
              {intervention.articleType}
            </span>
            <span className="text-slate-300 text-[10px]">•</span>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
              <Calendar size={12} />
              {new Date(intervention.dateCreation).toLocaleDateString()}
            </div>
          </div>
          <h4 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
            {intervention.numeroDossier}
          </h4>
        </div>
        <StatusBadge isNonClos={intervention.isNonClos} />
      </div>

      <p className="text-sm text-slate-500 line-clamp-2 mb-6 font-medium leading-relaxed">
        {intervention.commentaireTechnicien || "Aucun commentaire..."}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {intervention.retourAdmin && (
            <div className={`p-2 rounded-lg ${hasUnread ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
              <MessageSquare size={16} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-blue-600 font-bold text-xs group-hover:translate-x-1 transition-transform">
          Ouvrir <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
}

function DetailModal({ intervention, articleTypes, onClose, onSave, onDelete }: { intervention: Intervention; articleTypes: string[]; onClose: () => void; onSave: (updates: any) => void; onDelete: (id: string) => void }) {
  const [isNonClos, setIsNonClos] = useState(intervention.isNonClos);
  const [articleType, setArticleType] = useState(intervention.articleType);
  const [comment, setComment] = useState(intervention.commentaireTechnicien);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({ isNonClos, articleType, commentaireTechnicien: comment });
    setIsSaving(false);
    onClose();
  };

  const isOther = !articleTypes.includes(articleType) || articleType === 'Autre';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded uppercase">{intervention.articleType}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Dossier technique</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">N° {intervention.numeroDossier}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onDelete(intervention.id)}
              className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
              title="Supprimer mon dossier"
            >
              <Trash2 size={24} />
            </button>
            <button onClick={onClose} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">État du dossier</label>
              <div className="flex items-center space-x-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <input 
                  type="checkbox"
                  id="modalIsNonClos"
                  checked={isNonClos}
                  onChange={(e) => setIsNonClos(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="modalIsNonClos" className="text-sm font-black uppercase cursor-pointer">NON CLOS</label>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Type d'article</label>
              <select 
                value={articleTypes.includes(articleType) ? articleType : 'Autre'}
                onChange={(e) => {
                  const val = e.target.value;
                  setArticleType(val === 'Autre' ? (articleTypes.includes(articleType) ? '' : articleType) : val);
                }}
                className="w-full p-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                {articleTypes.map(t => <option key={t} value={t}>{t}</option>)}
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>

          {isOther && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Précisez le type d'article</label>
              <input 
                type="text"
                value={articleType === 'Autre' ? '' : articleType}
                onChange={(e) => setArticleType(e.target.value)}
                placeholder="Saisissez le type..."
                className="w-full p-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          )}

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Edit3 size={14} /> Votre Commentaire
            </label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full p-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
          </div>

          {intervention.retourAdmin && (
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100 dark:border-blue-800">
              <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-3 block">Retour de l'administration</label>
              <p className="text-sm text-slate-700 dark:text-blue-100 font-bold leading-relaxed italic">
                "{intervention.retourAdmin}"
              </p>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-end gap-4">
          <button onClick={onClose} className="px-8 py-4 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
            Fermer sans enregistrer
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? 'Enregistrement...' : <><Save size={20} /> Enregistrer les modifications</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ isNonClos }: { isNonClos: boolean }) {
  if (isNonClos) {
    return (
      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
        NON CLOS
      </span>
    );
  }
  return (
    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
      CLOS
    </span>
  );
}
