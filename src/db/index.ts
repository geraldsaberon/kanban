import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

function TursoAdapter() {
  const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return new PrismaLibSQL(libsql);
}

const adapter = process.env.TURSO ? TursoAdapter() : null

export const prisma = new PrismaClient({ adapter });
