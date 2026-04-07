'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Schéma de validation avec Zod
const interventionSchema = z.object({
  numeroDossier: z.string().min(3, "Le numéro de dossier doit avoir au moins 3 caractères"),
  articleType: z.string().min(1, "Veuillez sélectionner un type d'article"),
  autreArticleType: z.string().optional(),
  isNonClos: z.boolean(),
  commentaire: z.string().min(5, "Le commentaire doit être plus détaillé"),
  date: z.string().min(1, "La date est obligatoire"),
}).refine((data) => {
  if (data.articleType === 'Autre' && !data.autreArticleType) {
    return false;
  }
  return true;
}, {
  message: "Veuillez préciser le type d'article",
  path: ["autreArticleType"],
});

type InterventionFormValues = z.infer<typeof interventionSchema>;

export default function InterventionEntryForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [articleTypes, setArticleTypes] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<InterventionFormValues>({
    resolver: zodResolver(interventionSchema),
    defaultValues: {
      numeroDossier: '',
      isNonClos: false,
      date: new Date().toISOString().split('T')[0],
      articleType: '',
      commentaire: '',
    },
  });

  useEffect(() => {
    fetch('/api/article-types')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setArticleTypes(data.map((t: any) => t.name));
        }
      })
      .catch(err => console.error(err));
  }, []);

  const selectedArticleType = watch('articleType');

  const onSubmit = async (data: InterventionFormValues) => {
    setIsSubmitting(true);
    try {
      const finalArticleType = data.articleType === 'Autre' ? data.autreArticleType : data.articleType;
      
      const response = await fetch('/api/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numeroDossier: data.numeroDossier,
          articleType: finalArticleType,
          isNonClos: data.isNonClos,
          commentaireTechnicien: data.commentaire,
          dateCreation: new Date(data.date).toISOString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création');
      }

      alert('Intervention créée avec succès !');
      reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      alert(error.message || 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Nouvelle Intervention</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Date Field */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium">Date</label>
          <input
            type="date"
            {...register('date')}
            className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
        </div>

        {/* Numéro Dossier */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium">Numéro de dossier</label>
          <input
            {...register('numeroDossier')}
            placeholder="Ex: DOS-2024-001"
            className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.numeroDossier && <p className="text-red-500 text-xs">{errors.numeroDossier.message}</p>}
        </div>

        {/* Type d'Article (Select) */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium">Type d'article</label>
          <select
            {...register('articleType')}
            className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner...</option>
            {articleTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
            <option value="Autre">Autre</option>
          </select>
          {errors.articleType && <p className="text-red-500 text-xs">{errors.articleType.message}</p>}
        </div>

        {/* Autre Type d'Article (Conditional Input) */}
        {selectedArticleType === 'Autre' && (
          <div className="flex flex-col space-y-1.5 animate-in slide-in-from-top-2 duration-200">
            <label className="text-sm font-medium">Précisez le type d'article</label>
            <input
              {...register('autreArticleType')}
              placeholder="Saisissez le type d'article..."
              className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.autreArticleType && <p className="text-red-500 text-xs">{errors.autreArticleType.message}</p>}
          </div>
        )}

        {/* NON CLOS Checkbox */}
        <div className="flex items-center space-x-2 py-2">
          <input
            type="checkbox"
            id="isNonClos"
            {...register('isNonClos')}
            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isNonClos" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer uppercase">
            NON CLOS
          </label>
        </div>

        {/* Commentaire */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium">Commentaire Technicien</label>
          <textarea
            {...register('commentaire')}
            rows={4}
            className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 resize-none outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Détails de l'intervention..."
          />
          {errors.commentaire && <p className="text-red-500 text-xs">{errors.commentaire.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer l\'intervention'}
        </button>
      </form>
    </div>
  );
}
