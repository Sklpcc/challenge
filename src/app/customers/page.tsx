import { Suspense } from "react";
import { CustomerList } from "~/app/customers/_components/customer-list";
import { CreateCustomer } from "~/app/customers/_components/create-customer";

export default function CustomersPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <CreateCustomer />
      </div>

      <Suspense fallback={<div>Cargando...</div>}>
        <CustomerList />
      </Suspense>
    </div>
  );
}
