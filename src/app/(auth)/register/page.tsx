import Image from "next/image";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { GuestGuard } from "@/components/auth/GuestGuard";

export default function RegisterPage() {
  return (
    <GuestGuard>
      <div className="w-full max-w-110 rounded-(--mz-radius-xl) border-[0.5px] border-(--mz-green-border) bg-white p-10 text-center shadow-sm">
        <Image
          src="/logo/mizanee-primary.svg"
          alt="Mizanee"
          width={150}
          height={36}
          className="mx-auto mb-8 h-9 w-auto"
          priority
        />
        <h1 className="mb-1.5 text-[22px] font-bold text-(--mz-ink)">Créer votre compte</h1>
        <p className="mb-8 text-sm leading-relaxed text-(--mz-ink-muted)">
          Créez votre compte et votre foyer en quelques secondes
        </p>
        <div className="text-left">
          <RegisterForm />
        </div>
      </div>
    </GuestGuard>
  );
}
