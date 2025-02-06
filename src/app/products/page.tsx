import { Suspense } from "react";
import { ProductList } from "~/app/products/_components/product-list";
import { CreateProduct } from "~/app/products/_components/create-product";

export default function ProductsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Productos</h1>
        <CreateProduct />
      </div>

      <Suspense fallback={<div>Cargando...</div>}>
        <ProductList />
      </Suspense>
    </div>
  );
}
