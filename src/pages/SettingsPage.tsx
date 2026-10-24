import { useRef, useState } from "react";
import {
  DownloadSimpleIcon,
  TrashIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { buildBackup, parseBackup } from "../lib/schema";
import type { BackupData } from "../lib/schema";
import { useStore } from "../hooks/useStore";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { CardioProfileForm } from "../components/CardioProfileForm";

type Notice = { kind: "ok" | "error"; text: string } | null;

export function SettingsPage() {
  const store = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [pendingImport, setPendingImport] = useState<BackupData | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const exportBackup = () => {
    const json = buildBackup({
      exercises: store.exercises,
      sets: store.sets,
      workouts: store.workouts,
      sessions: store.sessions,
      cardioSessions: store.cardioSessions,
      cardioProfile: store.cardioProfile,
    });
    const url = URL.createObjectURL(
      new Blob([json], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `fitlog-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice({ kind: "ok", text: "Backup exportado." });
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setPendingImport(parseBackup(await file.text()));
      setNotice(null);
    } catch (err) {
      setNotice({
        kind: "error",
        text: err instanceof Error ? err.message : "Não foi possível ler o arquivo.",
      });
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-6">
      <Section
        title="Perfil"
        description="Usado nas estimativas de calorias e frequência cardíaca da aba Cardio."
      >
        <CardioProfileForm />
      </Section>

      <Section
        title="Backup"
        description="Seus dados ficam apenas neste aparelho. Exporte um backup para guardá-los ou levá-los para outro dispositivo."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <ActionButton onClick={exportBackup} icon={<DownloadSimpleIcon size={20} weight="bold" />}>
            Exportar backup
          </ActionButton>
          <ActionButton
            onClick={() => fileRef.current?.click()}
            icon={<UploadSimpleIcon size={20} weight="bold" />}
          >
            Importar backup
          </ActionButton>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        {notice && (
          <p
            role="status"
            className={
              notice.kind === "error"
                ? "text-sm font-medium text-destructive"
                : "text-sm font-medium text-accent"
            }
          >
            {notice.text}
          </p>
        )}
      </Section>

      <Section
        title="Zona de perigo"
        description="Apaga exercícios, treinos, sessões e registros deste aparelho."
      >
        <button
          onClick={() => setConfirmClear(true)}
          className="flex items-center justify-center gap-2 rounded-xl border border-destructive/40 py-3 font-semibold text-destructive hover:bg-destructive/10"
        >
          <TrashIcon size={18} weight="bold" /> Apagar todos os dados
        </button>
      </Section>

      <p className="text-center text-xs text-muted-foreground">
        FitLog · {store.exercises.length} exercícios · {store.sets.length}{" "}
        séries · {store.finishedSessions.length} sessões
      </p>

      {pendingImport && (
        <ConfirmDialog
          title="Substituir seus dados?"
          description={`O backup tem ${pendingImport.exercises.length} exercícios, ${pendingImport.workouts.length} treinos e ${pendingImport.sets.length} séries. Tudo o que está no app agora será substituído.`}
          confirmLabel="Importar"
          onCancelLabel="Cancelar"
          onConfirm={() => {
            store.replaceAll(pendingImport);
            setPendingImport(null);
            setNotice({ kind: "ok", text: "Backup importado com sucesso." });
          }}
          onCancel={() => setPendingImport(null)}
        />
      )}

      {confirmClear && (
        <ConfirmDialog
          title="Apagar todos os dados?"
          description="Essa ação não pode ser desfeita. Exporte um backup antes se quiser guardar seu histórico."
          confirmLabel="Apagar tudo"
          onCancelLabel="Cancelar"
          onConfirm={() => {
            store.clearAll();
            setConfirmClear(false);
            setNotice({ kind: "ok", text: "Dados apagados." });
          }}
          onCancel={() => setConfirmClear(false)}
        />
      )}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function ActionButton({
  onClick,
  icon,
  children,
}: {
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 font-semibold hover:bg-muted"
    >
      {icon}
      {children}
    </button>
  );
}
