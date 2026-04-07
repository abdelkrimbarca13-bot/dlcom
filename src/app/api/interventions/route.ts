import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Lister les interventions
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const role = (session.user as any).role;

  // Filtre: l'employé ne voit que ses dossiers, l'admin voit tout (ou filtré par userId)
  const where: any = {};
  if (role === 'EMPLOYEE') {
    where.userId = (session.user as any).id;
  } else if (userId && userId !== 'all') {
    where.userId = userId;
  }

  try {
    const interventions = await prisma.intervention.findMany({
      where,
      orderBy: { dateCreation: 'desc' },
      include: {
        user: {
          select: { fullName: true, username: true }
        }
      }
    });
    return NextResponse.json(interventions);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST: Créer une intervention
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await req.json();
    
    // Convertir la date de création si fournie
    const data = {
      ...body,
      dateCreation: body.dateCreation ? new Date(body.dateCreation) : new Date(),
      userId: (session.user as any).id,
    };

    const intervention = await prisma.intervention.create({
      data
    });
    return NextResponse.json(intervention);
  } catch (error: any) {
    console.error("Erreur Prisma:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Ce numéro de dossier existe déjà." }, { status: 409 });
    }
    return NextResponse.json({ error: "Erreur lors de la création sur le serveur" }, { status: 500 });
  }
}

// PATCH: Mettre à jour une intervention
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { id, ...updates } = await req.json();
    const role = (session.user as any).role;
    const currentUserId = (session.user as any).id;

    // Vérifier si l'intervention existe et si l'utilisateur a le droit
    const existing = await prisma.intervention.findUnique({
      where: { id }
    });

    if (!existing) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

    // Sécurité: Un employé ne peut modifier que ses dossiers
    if (role === 'EMPLOYEE' && existing.userId !== currentUserId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Mise à jour
    const updated = await prisma.intervention.update({
      where: { id },
      data: updates
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

// DELETE: Supprimer une intervention
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    const role = (session.user as any).role;
    const currentUserId = (session.user as any).id;

    const existing = await prisma.intervention.findUnique({
      where: { id }
    });

    if (!existing) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

    // Sécurité: Seul l'admin ou le propriétaire peut supprimer
    if (role !== 'ADMIN' && existing.userId !== currentUserId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await prisma.intervention.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
