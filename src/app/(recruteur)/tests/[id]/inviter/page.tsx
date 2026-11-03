import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { appUrl } from "@/lib/email";
import { canEdit, requireCompany } from "@/lib/tenant";
import { getCompanyTest } from "@/lib/tests/repository";
import { ActionButton } from "@/components/form";
import { BackLink, btn, Card, Notice, PageTitle , Loading } from "@/components/ui";
import { cancelInvitationAction, remindInvitation, setExtraTime } from "./actions";
import { CopyButton, InviteCandidatesForm, PublicLinkForm, ShareButtons } from "./forms";
import { buildInvitationMessage, isChannelConfigured } from "@/lib/messages";

export const metadata: Metadata = { title: "Inviter des candidats" };
// Envoi de nombreuses invitations à la fois.
export const maxDuration = 300;

const STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Non envoyée", cls: "bg-stone-100 text-stone-800" },
  SENT: { label: "Envoyée", cls: "bg-sky-100 text-sky-900" },
  OPENED: { label: "Ouverte", cls: "bg-indigo-100 text-indigo-900" },
  STARTED: { label: "Commencée", cls: "bg-amber-100 text-amber-900" },
  COMPLETED: { label: "Terminée", cls: "bg-brand-100 text-brand-900" },
  EXPIRED: { label: "Expirée", cls: "bg-stone-200 text-stone-600" },
  CANCELLED: { label: "Annulée", cls: "bg-stone-200 text-stone-600" },
};

async function Content({ params }: PageProps<"/tests/[id]/inviter">) {
  const { id } = await params;
  const user = await requireCompany();
  const test = await getCompanyTest(id, user.companyId);
  const editable = canEdit(user) && test.status === "PUBLISHED";
  const [invitations, publicCount] = await Promise.all([
    db.invitation.findMany({
      where: { testId: id, companyId: user.companyId },
      orderBy: { createdAt: "desc" },
      take: 500,
      include: { candidate: { select: { name: true, email: true, phone: true } } },
    }),
    db.invitation.count({ where: { testId: id, channel: "PUBLIC_LINK" } }),
  ]);
  const counts = {
    invited: invitations.filter((i) => i.status !== "CANCELLED").length,
    started: invitations.filter((i) => i.status === "STARTED").length,
    completed: invitations.filter((i) => i.status === "COMPLETED").length,
  };

  return (
    <>
      <BackLink href={`/tests/${id}`}>{test.title}</BackLink>
      <PageTitle title="Inviter des candidats" subtitle={`${counts.invited} invité(s) · ${counts.started} en cours · ${counts.completed} terminé(s)`} />

      {test.status !== "PUBLISHED" && (
        <div className="mb-4">
          <Notice tone="warning">
            {test.status === "DRAFT" ? "Publiez le test pour pouvoir inviter des candidats." : "Ce test est fermé : il n'accepte plus de nouveaux candidats."}
          </Notice>
        </div>
      )}

      {editable && (!isChannelConfigured("EMAIL") || !isChannelConfigured("WHATSAPP") || appUrl("/").includes("localhost")) && (
        <div className="mb-4 space-y-3">
          {(!isChannelConfigured("EMAIL") || !isChannelConfigured("WHATSAPP")) && (
            <Notice tone="info">
              <strong>Envoi automatique {!isChannelConfigured("EMAIL") && !isChannelConfigured("WHATSAPP") ? "non configuré" : `non configuré pour ${!isChannelConfigured("EMAIL") ? "l'email" : "WhatsApp"}`}.</strong>{" "}
              Après avoir ajouté un candidat, cliquez sur <strong>« WhatsApp »</strong> ou <strong>« Email »</strong> à côté de son nom : votre
              WhatsApp ou votre messagerie s&apos;ouvre avec le message et le lien déjà écrits, il ne reste qu&apos;à appuyer sur Envoyer.
            </Notice>
          )}
          {appUrl("/").includes("localhost") && (
            <Notice tone="warning">
              Le site tourne pour l&apos;instant <strong>sur cet ordinateur</strong> : les liens de test (localhost) ne s&apos;ouvrent que
              sur ce PC. Pour de vrais candidats, le site doit d&apos;abord être mis en ligne.
            </Notice>
          )}
        </div>
      )}

      {editable && (
        <div className="mb-6 grid gap-4 lg:grid-cols-[3fr_2fr]">
          <Card>
            <h2 className="mb-4 text-base font-bold text-stone-900">Inviter par email ou WhatsApp</h2>
            <InviteCandidatesForm testId={id} />
          </Card>
          <Card>
            <h2 className="mb-1 text-base font-bold text-stone-900">Lien public</h2>
            <p className="mb-3 text-sm text-stone-600">
              À coller dans une offre ou sur un groupe WhatsApp. Chaque candidat donne son nom et son email ou téléphone ;
              un même contact ne peut passer le test qu&apos;une fois.
            </p>
            <PublicLinkForm
              testId={id}
              url={test.publicToken ? appUrl(`/p/${test.publicToken}`) : null}
              max={test.publicMaxAttempts}
              used={publicCount}
              shareText={`Test de recrutement « ${test.title} » — ${user.companyName}`}
            />
          </Card>
        </div>
      )}

      <Card>
        <h2 className="mb-1 text-base font-bold text-stone-900">Suivi des candidats</h2>
        {test.deadline ? (
          <p className="mb-3 text-sm text-stone-600">
            Date limite : {test.deadline.toLocaleDateString("fr-FR", { timeZone: "Africa/Bangui" })}. Relances automatiques{" "}
            {test.reminderHours.map((h) => `${h} h`).join(" puis ")} avant, pour ceux qui n&apos;ont pas commencé.
          </p>
        ) : (
          <p className="mb-3 text-sm text-stone-600">
            Sans date limite, les liens sont valables 14 jours et il n&apos;y a pas de relance automatique (relance manuelle possible).
          </p>
        )}
        {invitations.length === 0 ? (
          <p className="text-sm text-stone-600">Aucun candidat invité pour le moment.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {invitations.map((inv) => {
              const st = STATUS[inv.status];
              const waiting = ["PENDING", "SENT", "OPENED"].includes(inv.status);
              return (
                <li key={inv.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-stone-900">
                      {inv.candidate.name}{" "}
                      <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${st.cls}`}>{st.label}</span>
                      {inv.extraTimePercent > 0 && <span className="ml-1 text-xs text-stone-600">· temps +{inv.extraTimePercent} %</span>}
                    </p>
                    <p className="truncate text-sm text-stone-600">
                      {[inv.candidate.email, inv.candidate.phone].filter(Boolean).join(" · ")}
                      {inv.remindersSent > 0 && ` · ${inv.remindersSent} relance(s)`}
                      {inv.channel === "PUBLIC_LINK" && " · lien public"}
                    </p>
                  </div>
                  {editable && (
                    <div className="flex flex-wrap gap-2">
                      {inv.status !== "CANCELLED" && inv.status !== "COMPLETED" && (() => {
                        const m = buildInvitationMessage(
                          { ...inv, test: { title: test.title, durationMinutes: test.durationMinutes }, company: { name: user.companyName } },
                          inv.status === "PENDING" ? "invitation" : "relance",
                        );
                        return <ShareButtons invitationId={inv.id} phone={inv.candidate.phone} email={inv.candidate.email} subject={m.subject} text={m.text} />;
                      })()}
                      {inv.status !== "CANCELLED" && <CopyButton text={appUrl(`/t/${inv.token}`)} />}
                      {waiting && (
                        <>
                          {/* Envoi automatique seulement si un service (Resend, WasenderAPI) est configuré. */}
                          {(isChannelConfigured("EMAIL") || isChannelConfigured("WHATSAPP")) && (
                            <form action={remindInvitation.bind(null, inv.id)}>
                              <ActionButton className={btn.small}>{inv.status === "PENDING" ? "Envoyer" : "Relancer"}</ActionButton>
                            </form>
                          )}
                          <form action={setExtraTime.bind(null, inv.id)}>
                            <input type="hidden" name="extra" value={inv.extraTimePercent ? "0" : "50"} />
                            <ActionButton className={btn.small}>{inv.extraTimePercent ? "Temps normal" : "Temps +50 %"}</ActionButton>
                          </form>
                          <form action={cancelInvitationAction.bind(null, inv.id)}>
                            <ActionButton className={`${btn.small} text-red-700`}>Annuler</ActionButton>
                          </form>
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      <p className="mt-4 text-sm text-stone-600">
        Les résultats des candidats seront visibles dans{" "}
        <Link href={`/tests/${id}`} className="text-brand-800 underline">
          la fiche du test
        </Link>
        .
      </p>
    </>
  );
}

export default function InvitePage(props: PageProps<"/tests/[id]/inviter">) {
  return (
    <Suspense fallback={<Loading />}>
      <Content {...props} />
    </Suspense>
  );
}
