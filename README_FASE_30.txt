FASE 30 - Analíticas + Recuperación automática

Copiar/agregar:
- src/lib/analytics-engine.ts
- src/lib/work-draft-store.ts
- src/components/ui/work-recovery-card.tsx
- src/app/(dashboard)/reportes/page.tsx

Luego actualiza comparador/page.tsx manualmente:

1) Agrega imports:
import { WorkRecoveryCard } from "@/components/ui/work-recovery-card";
import {
  clearComparadorDraft,
  getComparadorDraft,
  saveComparadorDraft,
  ComparadorDraft,
} from "@/lib/work-draft-store";

2) Dentro de ComparadorPage:
const [draft, setDraft] = useState<ComparadorDraft | null>(null);

3) Agrega useEffect:
useEffect(() => {
  setDraft(getComparadorDraft());
}, []);

4) Después de generar respuesta y hacer setTablaVidaLey(...):
saveComparadorDraft({
  resultado: respuesta,
  tablaSctr: respuesta.tramaSctr,
  tablaVidaLey: respuesta.tramaVidaLey,
});
setDraft(getComparadorDraft());

5) Agrega funciones:
function restaurarDraft() {
  const currentDraft = getComparadorDraft();
  if (!currentDraft) return;
  setResultado(currentDraft.resultado);
  setTablaSctr(currentDraft.tablaSctr);
  setTablaVidaLey(currentDraft.tablaVidaLey);
  showToast({
    title: "Trabajo restaurado",
    description: "Se restauró la última comparación guardada automáticamente.",
    variant: "success",
  });
}

function limpiarDraft() {
  clearComparadorDraft();
  setDraft(null);
  showToast({
    title: "Borrador eliminado",
    description: "Se limpió la comparación guardada automáticamente.",
    variant: "warning",
  });
}

6) En el JSX, después de las tarjetas de carga:
<WorkRecoveryCard
  draft={draft}
  onRestore={restaurarDraft}
  onClear={limpiarDraft}
/>

Después:
npm run build
git add .
git commit -m "Fase 30 analiticas y autoguardado"
git push
