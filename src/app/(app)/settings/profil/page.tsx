import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsProfilPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Profil compte</h1>
        <p className="text-sm text-slate-500">Paramètres liés à votre compte utilisateur (maquette).</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Alertes projets et résumé mensuel — branché plus tard.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          <p>Connexion NextAuth et préférences à brancher côté backend.</p>
        </CardContent>
      </Card>
    </div>
  );
}
