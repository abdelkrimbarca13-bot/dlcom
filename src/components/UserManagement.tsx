'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus, UserCircle, User, Key, Shield, AlertCircle, CheckCircle2, Trash2, Users } from 'lucide-react';

const userSchema = z.object({
  fullName: z.string().min(2, "Nom trop court"),
  username: z.string().min(3, "Nom d'utilisateur trop court (min 3)"),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
  role: z.enum(['ADMIN', 'EMPLOYEE']),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserManagementProps {
  onUserCreated?: () => void;
  users?: any[];
  onDeleteUser?: (id: string) => Promise<void>;
}

export default function UserManagement({ onUserCreated, users = [], onDeleteUser }: UserManagementProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { role: 'EMPLOYEE' }
  });

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Une erreur est survenue");
      }

      setSuccess(`Compte ${data.role} créé avec succès pour ${data.fullName}`);
      reset();
      if (onUserCreated) onUserCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 max-w-2xl mx-auto shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg text-blue-600">
          <UserPlus size={24} />
        </div>
        <h2 className="text-xl font-bold">Gestion des profils</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/10 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100 dark:border-red-900/20">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 dark:bg-green-900/10 text-green-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-green-100 dark:border-green-900/20">
            <CheckCircle2 size={16} /> {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <UserCircle size={14} /> Nom Complet
            </label>
            <input 
              {...register('fullName')} 
              className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Ex: Jean Dupont"
            />
            {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User size={14} /> Nom d'utilisateur
            </label>
            <input 
              {...register('username')} 
              type="text"
              className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Ex: jdupont"
            />
            {errors.username && <p className="text-red-500 text-xs">{errors.username.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Key size={14} /> Mot de passe
            </label>
            <input 
              {...register('password')} 
              type="password"
              className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Shield size={14} /> Rôle & Permissions
            </label>
            <select 
              {...register('role')} 
              className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="EMPLOYEE">EMPLOYEE (Technicien)</option>
              <option value="ADMIN">ADMIN (Superviseur)</option>
            </select>
          </div>
        </div>

        <button 
          disabled={isSubmitting}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Création en cours...' : 'Confirmer la création'}
        </button>
      </form>

      {/* Liste des utilisateurs */}
      <div className="mt-12 border-t border-slate-100 dark:border-slate-800 pt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-600">
            <Users size={20} />
          </div>
          <h3 className="text-lg font-bold">Membres de l'équipe ({users.length})</h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {users.map((user) => (
            <div 
              key={user.id}
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold">
                  {user.fullName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{user.fullName}</p>
                  <p className="text-xs text-slate-500">@{user.username} • <span className="uppercase font-black text-[9px] tracking-tighter opacity-70">{user.role}</span></p>
                </div>
              </div>
              
              {onDeleteUser && (
                <button 
                  onClick={() => onDeleteUser(user.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  title="Supprimer le compte"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
