import { NextResponse } from "next/server";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import type { Material } from "@/lib/types";

const DATA_DIR = join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "materials.json");

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readMaterials(): Material[] {
  ensureDataDir();
  if (!existsSync(DATA_FILE)) {
    return [];
  }
  try {
    const raw = readFileSync(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data as Material[];
  } catch {
    return [];
  }
}

function writeMaterials(materials: Material[]): void {
  ensureDataDir();
  writeFileSync(DATA_FILE, JSON.stringify(materials, null, 2), "utf-8");
}

/* ---- GET: list all materials ---- */
export async function GET() {
  try {
    const materials = readMaterials();
    return NextResponse.json({ materials });
  } catch {
    return NextResponse.json({ error: "读取资料失败。" }, { status: 500 });
  }
}

/* ---- POST: create material ---- */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { title?: unknown; content?: unknown };

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!title) {
      return NextResponse.json({ error: "标题不能为空。" }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ error: "内容不能为空。" }, { status: 400 });
    }

    const materials = readMaterials();
    const material: Material = {
      id: `mat_${Date.now()}`,
      title,
      content,
      createdAt: new Date().toISOString(),
    };
    materials.push(material);
    writeMaterials(materials);

    return NextResponse.json({ material }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "创建资料失败。" }, { status: 500 });
  }
}

/* ---- DELETE: remove material by id ---- */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少资料 ID。" }, { status: 400 });
    }

    const materials = readMaterials();
    const index = materials.findIndex((m) => m.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "资料未找到。" }, { status: 404 });
    }

    materials.splice(index, 1);
    writeMaterials(materials);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "删除失败。" }, { status: 500 });
  }
}
