import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { GuestGuard } from "@/components/auth/GuestGuard";

export default function LoginPage() {
  return (
    <GuestGuard>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Accédez à votre foyer Mizanee avec votre e-mail et mot de passe.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </GuestGuard>
  );
}
