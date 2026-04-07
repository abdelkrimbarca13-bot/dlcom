import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Lister les types d'articles
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const types = await prisma.articleType.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(types);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST: Créer un type d'article
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: "Nom manquant" }, { status: 400 });

    const type = await prisma.articleType.create({
      data: { name }
    });
    return NextResponse.json(type);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Ce type d'article existe déjà." }, { status: 409 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE: Supprimer un type d'article
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    await prisma.articleType.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
