import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Session non identifiée. Veuillez vous reconnecter." }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé. Administrateur requis." }, { status: 403 });
    }

    const { username, password, fullName, role } = await req.json();

    if (!username || !password || !fullName || !role) {
      return NextResponse.json({ error: "Veuillez remplir tous les champs obligatoires." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        fullName,
        role,
        passwordHash: hashedPassword,
      },
    });

    return NextResponse.json({ 
      success: true,
      user: {
        id: newUser.id, 
        username: newUser.username, 
        fullName: newUser.fullName, 
        role: newUser.role 
      }
    });

  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Ce nom d'utilisateur est déjà utilisé." }, { status: 409 });
    }
    return NextResponse.json({ error: "Une erreur serveur est survenue." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
      },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: "ID utilisateur manquant" }, { status: 400 });
    }

    // Empêcher l'admin de se supprimer lui-même via cette API
    if (userId === (session.user as any).id) {
      return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte administrateur." }, { status: 400 });
    }

    // Supprimer les interventions de l'utilisateur d'abord (contrainte d'intégrité)
    // Note: Dans une vraie appli on pourrait vouloir garder les interventions ou les réassigner.
    // Ici on va les supprimer pour permettre la suppression de l'utilisateur.
    await prisma.intervention.deleteMany({
      where: { userId }
    });

    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur suppression utilisateur:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression de l'utilisateur" }, { status: 500 });
  }
}
