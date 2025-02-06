"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Users, Package, ShoppingCart } from "lucide-react";

const routes = [
  {
    href: "/orders",
    label: "Pedidos",
    icon: ShoppingCart,
  },
  {
    href: "/customers",
    label: "Clientes",
    icon: Users,
  },
  {
    href: "/products",
    label: "Productos",
    icon: Package,
  },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex h-screen w-64 flex-col space-y-2 border-r p-4">
      <div className="mb-6 text-xl font-bold">CompanyName</div>
      {routes.map((route) => (
        <Link key={route.href} href={route.href}>
          <Button
            variant={pathname === route.href ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            <route.icon className="mr-2 h-4 w-4" />
            {route.label}
          </Button>
        </Link>
      ))}
    </nav>
  );
}
