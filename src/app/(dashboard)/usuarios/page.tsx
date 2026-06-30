import { UsersRound } from "lucide-react";
import { ModulePage } from "@/components/ui/module-page";
import { EnterpriseCard } from "@/components/ui/enterprise-card";

const users = [
  ["Luis Miguel", "Administrador", "Activo"],
  ["Cristina", "Usuario", "Activo"],
  ["rrhh", "Usuario", "Activo"],
];

export default function UsuariosPage() {
  return (
    <ModulePage
      eyebrow="Seguridad"
      title="Usuarios"
      description="Usuarios hardcodeados de la primera versión. Luego podrán administrarse desde base de datos."
      icon={<UsersRound className="h-10 w-10" />}
    >
      <EnterpriseCard>
        <div className="grid gap-4 md:grid-cols-3">
          {users.map(([name, role, status]) => (
            <div key={name} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-lg font-black text-[#04224a]">{name}</p>
              <p className="mt-2 text-sm font-bold text-[#005eb8]">{role}</p>
              <p className="mt-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                {status}
              </p>
            </div>
          ))}
        </div>
      </EnterpriseCard>
    </ModulePage>
  );
}
