"use client";

import { useEffect, useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
  active: boolean;
  display_order: number;
  created_at: string;
};

type Product = {
  id: string;
  name: string;
  category_id: string;
  price: number;
  image: string | null;
  active: boolean;
  created_at: string;
  category: Category | null;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("all");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [isCreating, setIsCreating] =
    useState(false);

  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formCategoryId, setFormCategoryId] =
    useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formActive, setFormActive] =
    useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productsResponse, categoriesResponse] =
        await Promise.all([
          fetch("/api/admin/products", {
            cache: "no-store",
          }),
          fetch("/api/admin/categories", {
            cache: "no-store",
          }),
        ]);

      const productsData =
        await productsResponse.json();

      const categoriesData =
        await categoriesResponse.json();

      if (!productsResponse.ok) {
        throw new Error(
          productsData.error ||
            "No se pudieron cargar los productos"
        );
      }

      if (!categoriesResponse.ok) {
        throw new Error(
          categoriesData.error ||
            "No se pudieron cargar las categorías"
        );
      }

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los datos."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.id
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === "all" ||
        product.category_id === categoryFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          product.active) ||
        (statusFilter === "hidden" &&
          !product.active);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    products,
    search,
    categoryFilter,
    statusFilter,
  ]);

  const openCreate = () => {
    setEditingProduct(null);
    setIsCreating(true);

    setFormId("");
    setFormName("");
    setFormCategoryId(
      categories.find((category) => category.active)
        ?.id || ""
    );
    setFormPrice("");
    setFormImage("");
    setFormActive(true);

    setError("");
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setIsCreating(false);

    setFormId(product.id);
    setFormName(product.name);
    setFormCategoryId(product.category_id);
    setFormPrice(String(product.price));
    setFormImage(product.image || "");
    setFormActive(product.active);

    setError("");
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setEditingProduct(null);
    setIsCreating(false);
  };

  const saveProduct = async () => {
    try {
      setSaving(true);
      setError("");

      if (!formId.trim()) {
        setError(
          "El ID del producto es obligatorio."
        );
        return;
      }

      if (!formName.trim()) {
        setError(
          "El nombre del producto es obligatorio."
        );
        return;
      }

      if (!formCategoryId.trim()) {
        setError(
          "La categoría es obligatoria."
        );
        return;
      }

      const price = Number(formPrice);

      if (!Number.isInteger(price) || price < 0) {
        setError(
          "El precio debe ser un número entero mayor o igual a 0."
        );
        return;
      }

      const payload = {
        id: formId.trim(),
        name: formName.trim(),
        category_id: formCategoryId,
        price,
        image: formImage.trim() || null,
        active: formActive,
      };

      const response = await fetch(
        "/api/admin/products",
        {
          method: isCreating ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No se pudo guardar el producto"
        );
      }

      if (isCreating) {
        setProducts((current) => [
          data,
          ...current,
        ]);
      } else {
        setProducts((current) =>
          current.map((product) =>
            product.id === data.id
              ? data
              : product
          )
        );
      }

      closeForm();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el producto."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (
    product: Product
  ) => {
    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        "/api/admin/products",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: product.id,
            active: !product.active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No se pudo actualizar el estado"
        );
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === data.id
            ? data
            : item
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el producto."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-gray-700">
            Cargando productos...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-950">
              Productos
            </h1>

            <p className="mt-2 text-gray-700">
              Administra el catálogo de productos de Hanami.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="rounded-full bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
          >
            + Nuevo producto
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 font-medium text-red-800">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-3 rounded-2xl border border-gray-300 bg-white p-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Buscar
            </label>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Nombre o ID..."
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500 focus:border-gray-500 focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Categoría
            </label>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-black/10"
            >
              <option value="all">
                Todas las categorías
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Estado
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-black/10"
            >
              <option value="all">
                Todos
              </option>

              <option value="active">
                Activos
              </option>

              <option value="hidden">
                Ocultos
              </option>
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-300 bg-white">
          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1.2fr] gap-4 bg-gray-100 px-6 py-4 text-sm font-bold text-gray-800 md:grid">
            <div>Producto</div>
            <div>Categoría</div>
            <div>Precio</div>
            <div>Estado</div>
            <div>Acciones</div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                No se encontraron productos.
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="grid gap-4 px-6 py-5 md:grid-cols-[2fr_1fr_1fr_1fr_1.2fr] md:items-center"
                >
                  <div className="flex items-center gap-4">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-14 w-14 rounded-xl border border-gray-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-gray-300 bg-gray-100 text-xs font-medium text-gray-600">
                        Sin foto
                      </div>
                    )}

                    <div>
                      <div className="font-semibold text-gray-950">
                        {product.name}
                      </div>

                      <div className="mt-1 text-xs text-gray-600">
                        {product.id}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm font-medium text-gray-700">
                    {product.category?.name ||
                      "Sin categoría"}
                  </div>

                  <div className="font-semibold text-gray-950">
                    ${product.price.toLocaleString("es-CL")}
                  </div>

                  <div>
                    <button
                      disabled={saving}
                      onClick={() =>
                        toggleActive(product)
                      }
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        product.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {product.active
                        ? "Activo"
                        : "Oculto"}
                    </button>
                  </div>

                  <div>
                    <button
                      onClick={() =>
                        openEdit(product)
                      }
                      className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-700">
          Mostrando{" "}
          <span className="font-bold text-gray-950">
            {filteredProducts.length}
          </span>{" "}
          de{" "}
          <span className="font-bold text-gray-950">
            {products.length}
          </span>{" "}
          productos.
        </div>
      </div>

      {(isCreating || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-950">
                  {isCreating
                    ? "Nuevo producto"
                    : "Editar producto"}
                </h2>

                <p className="mt-1 text-gray-700">
                  {isCreating
                    ? "Agrega un producto al catálogo."
                    : "Modifica la información del producto."}
                </p>
              </div>

              <button
                onClick={closeForm}
                disabled={saving}
                className="text-2xl font-medium text-gray-500 hover:text-gray-900 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  ID del producto
                </label>

                <input
                  type="text"
                  value={formId}
                  onChange={(event) =>
                    setFormId(event.target.value)
                  }
                  disabled={!isCreating}
                  placeholder="Ej: mochi-matcha"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500 focus:border-gray-500 focus:ring-2 focus:ring-black/10 disabled:bg-gray-100 disabled:text-gray-600"
                />

                {!isCreating && (
                  <p className="mt-1 text-xs text-gray-600">
                    El ID no se puede modificar porque se utiliza
                    como referencia del producto.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Nombre
                </label>

                <input
                  type="text"
                  value={formName}
                  onChange={(event) =>
                    setFormName(event.target.value)
                  }
                  placeholder="Ej: Mochi Matcha"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500 focus:border-gray-500 focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Categoría
                </label>

                <select
                  value={formCategoryId}
                  onChange={(event) =>
                    setFormCategoryId(event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-black/10"
                >
                  <option value="" disabled>
                    Selecciona una categoría
                  </option>

                  {categories
                    .filter(
                      (category) => category.active
                    )
                    .map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Precio
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formPrice}
                  onChange={(event) =>
                    setFormPrice(event.target.value)
                  }
                  placeholder="Ej: 3000"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500 focus:border-gray-500 focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Imagen
                </label>

                <input
                  type="text"
                  value={formImage}
                  onChange={(event) =>
                    setFormImage(event.target.value)
                  }
                  placeholder="/images/mochis/matcha.jpg"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500 focus:border-gray-500 focus:ring-2 focus:ring-black/10"
                />

                <p className="mt-1 text-xs text-gray-600">
                  Por ahora usamos la ruta de la imagen dentro
                  de /public.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-300 bg-gray-100 p-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    Producto activo
                  </p>

                  <p className="text-sm text-gray-700">
                    Si está oculto, no aparecerá para clientes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFormActive((current) => !current)
                  }
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    formActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {formActive
                    ? "Activo"
                    : "Oculto"}
                </button>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeForm}
                disabled={saving}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-800 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                onClick={saveProduct}
                disabled={saving}
                className="flex-1 rounded-xl bg-black px-4 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {saving
                  ? "Guardando..."
                  : isCreating
                    ? "Crear producto"
                    : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}