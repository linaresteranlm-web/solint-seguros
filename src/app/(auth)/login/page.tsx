"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { PwaRegister } from "@/components/ui/pwa-register";

const USERS = [
  {
    username: "luis",
    password: "Matheito2026",
    name: "Luis Miguel",
    role: "Administrador",
  },
  {
    username: "cristina",
    password: "0508mac",
    name: "Cristina",
    role: "Usuario",
  },
  {
    username: "rrhh",
    password: "rrhh2026",
    name: "RRHH",
    role: "Usuario",
  },
];

export default function LoginPage() {
  const [username, setUsername] = useState("luis");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("solint_user");

    if (raw) {
      window.location.href = "/dashboard";
    }
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const user = USERS.find(
      (item) =>
        item.username.toLowerCase() === username.trim().toLowerCase() &&
        item.password === password
    );

    if (!user) {
      setError("Usuario o contraseña incorrectos.");
      return;
    }

    localStorage.setItem(
      "solint_user",
      JSON.stringify({
        username: user.username,
        name: user.name,
        role: user.role,
      })
    );

    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f7fb]">
      <PwaRegister />

      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-white via-[#eef6ff] to-[#d8ecff] p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute left-[-120px] top-[-120px] h-96 w-96 rounded-full bg-[#005eb8]/10 blur-3xl" />
          <div className="absolute bottom-[-160px] right-[-120px] h-[30rem] w-[30rem] rounded-full bg-[#ff7415]/15 blur-3xl" />

          <div className="relative">
            <div className="relative h-36 w-[28rem] max-w-full">
              <Image
                src="/images/solint-business-systems.png"
                alt="SOLINT Business Systems"
                fill
                sizes="448px"
                className="object-contain object-left"
                priority
              />
            </div>

            <div className="mt-10 max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">
                Sistema inteligente de seguros
              </p>
              <h1 className="mt-4 text-5xl font-black leading-tight text-[#04224a]">
                SOLINT SEGUROS
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Plataforma para gestionar SCTR y Vida Ley: acumulados,
                comparaciones, tramas, reportes ejecutivos y trazabilidad.
              </p>
            </div>
          </div>

          <div className="relative grid gap-4 md:grid-cols-3">
            <FeatureCard title="Excel Engine" text="Procesamiento local." />
            <FeatureCard title="PWA Ready" text="Instalable como app." />
            <FeatureCard title="Matheito" text="Asistente operativo." />
          </div>
        </section>

        <section className="flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex justify-center lg:hidden">
              <div className="relative h-28 w-72">
                <Image
                  src="/images/solint-business-systems.png"
                  alt="SOLINT Business Systems"
                  fill
                  sizes="288px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
              <div className="mb-8">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#005eb8] text-white">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-[#005eb8]">
                  SOLINT SEGUROS
                </p>
                <h2 className="mt-3 text-3xl font-black text-[#04224a]">
                  Iniciar sesión
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sistema Inteligente para la Gestión de SCTR y Vida Ley.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="text-sm font-black text-slate-700">
                    Usuario
                  </span>
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#005eb8]">
                    <UserRound className="h-5 w-5 text-slate-400" />
                    <input
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-slate-800 outline-none"
                      placeholder="luis / cristina / rrhh"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-black text-slate-700">
                    Contraseña
                  </span>
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#005eb8]">
                    <LockKeyhole className="h-5 w-5 text-slate-400" />
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type="password"
                      className="w-full bg-transparent text-sm font-bold text-slate-800 outline-none"
                      placeholder="Ingresa tu contraseña"
                    />
                  </div>
                </label>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                    {error}
                  </div>
                )}

                <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#ff7415] px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition hover:bg-[#04224a]">
                  Ingresar a SOLINT SEGUROS
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-xs font-semibold text-slate-500">
              © LC2026 SOLINT SEGUROS · Powered by SOLINT Business Systems
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-blue-100 bg-white/75 p-5 shadow-lg backdrop-blur">
      <p className="text-sm font-black text-[#04224a]">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{text}</p>
    </div>
  );
}
