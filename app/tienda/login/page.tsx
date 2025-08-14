import { default as dynamicImport } from 'next/dynamic'

const ClientLoginForm = dynamicImport(
  () => import('@/components/Core/Login/ClientLoginForm'),
  { ssr: false }
)

export default function TiendaLoginPage() {
  return (
    <div>
      <ClientLoginForm />
    </div>
  );
}

export const dynamic = 'force-dynamic';
