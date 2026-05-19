import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { GuestGuard } from "@/components/auth/GuestGuard";

export default function RegisterPage() {
  return (
    <GuestGuard>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Inscription</CardTitle>
          <CardDescription>Créez votre compte et votre foyer en quelques secondes.</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </GuestGuard>
  );
}
