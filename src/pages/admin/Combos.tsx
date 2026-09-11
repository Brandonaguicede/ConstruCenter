import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, StackPlus as PackagePlus, MagnifyingGlass as Search, Trash as Trash2, PencilSimple as Pencil, ArrowLeft, FloppyDisk as Save } from '@phosphor-icons/react';
import { comboService, type AdminEnergyCombo } from '@/services/combo.service';
import { productService } from '@/services/product.service';
import { comboFormSchema, type ComboFormData } from '@/schemas/combo.schema';
import { formatColones } from '@/utils/currency';
import { ImageUpload } from '@/components/ui/ImageUpload';

const blank = (): ComboFormData => ({ name: '', description: '', image_url: '', features: [], is_active: false, items: [] });
const field = 'w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-constru-dark';
const primary = 'inline-flex items-center justify-center gap-2 rounded-xl bg-constru-primary px-5 py-3 text-sm font-semibold text-white hover:bg-constru-primary-hover disabled:opacity-50';

export function AdminCombos() {
  const client = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ComboFormData>(blank);
  const [featuresText, setFeaturesText] = useState('');
  const [search, setSearch] = useState('');
  const [validation, setValidation] = useState('');
  const [notice, setNotice] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const combos = useQuery({ queryKey: ['admin-combos'], queryFn: comboService.getCombos });
  const products = useQuery({ queryKey: ['admin-products', 'combo-picker'], queryFn: () => productService.getProducts(), enabled: editing });
  const refresh = async () => { await Promise.all([client.invalidateQueries({ queryKey: ['admin-combos'] }), client.invalidateQueries({ queryKey: ['energy-combos'] })]); };
  const save = useMutation({
    mutationFn: (data: ComboFormData) => comboService.saveCombo(id, data),
    onSuccess: async () => { await refresh(); setEditing(false); setNotice('Combo guardado correctamente.'); },
  });
  const remove = useMutation({ mutationFn: comboService.deleteCombo, onSuccess: async () => { await refresh(); setDeleteId(null); setNotice('Combo eliminado. Los productos se conservaron.'); } });
  function open(combo?: AdminEnergyCombo) {
    setId(combo?.id ?? null);
    setDraft(combo ? { name: combo.name, description: combo.description ?? '', image_url: combo.image_url ?? '', features: combo.features, is_active: combo.is_active, items: combo.items.map(({ product_id, quantity }) => ({ product_id, quantity })) } : blank());
    setFeaturesText(combo?.features.join('\n') ?? ''); setSearch(''); setValidation(''); setNotice(''); save.reset(); setEditing(true);
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = comboFormSchema.safeParse({ ...draft, features: featuresText.split('\n').map(line => line.trim()).filter(Boolean) });
    if (!parsed.success) { setValidation(parsed.error.issues[0].message); return; }
    const unavailable = parsed.data.items.some(item => !products.data?.some(p => p.id === item.product_id && (!parsed.data.is_active || p.is_active)));
    if (unavailable) { setValidation('Revisa los productos seleccionados. Para publicar, todos deben existir y estar activos.'); return; }
    setValidation(''); save.mutate(parsed.data);
  }
  const matches = (products.data ?? []).filter(p => `${p.name} ${p.sku}`.toLowerCase().includes(search.toLowerCase()));
  const total = draft.items.reduce((sum, item) => sum + Number(products.data?.find(p => p.id === item.product_id)?.price ?? 0) * (Number.isFinite(item.quantity) ? item.quantity : 0), 0);

  return <div className="max-w-6xl mx-auto space-y-6 text-constru-dark">
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6">
      <div><h1 className="text-2xl font-bold text-constru-primary">{editing ? id ? 'Editar combo energético' : 'Crear combo energético' : 'Combos energéticos'}</h1><p className="mt-2 text-sm text-gray-600">Combina productos del catálogo, define cantidades y publica tus paquetes en el inicio.</p></div>
      {editing ? <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold" disabled={save.isPending} onClick={() => setEditing(false)}><ArrowLeft size={18} />Volver a combos</button> : <button className={primary} onClick={() => open()}><Plus size={18} />Crear combo</button>}
    </header>
    {notice && <p role="status" className="rounded-xl bg-green-50 p-4 text-green-900">{notice}</p>}
    {!editing ? <>
      {combos.isPending ? <p role="status" className="p-8 bg-white rounded-2xl">Cargando combos…</p> : combos.isError ? <div role="alert" className="p-6 rounded-2xl bg-red-50 text-red-800"><p>{combos.error.message}</p><button className="mt-3 underline" onClick={() => void combos.refetch()}>Reintentar</button></div> : !combos.data.length ? <div className="rounded-2xl bg-white p-10 text-center"><PackagePlus className="mx-auto mb-4 text-constru-primary" size={36} /><h2 className="text-xl font-semibold">Todavía no hay combos</h2><p className="mt-2 text-gray-600">Crea un paquete seleccionando los productos que ya guardaste.</p><button className={`${primary} mt-6`} onClick={() => open()}>Crear primer combo</button></div> : <div className="grid lg:grid-cols-2 gap-5">{combos.data.map(combo => <article key={combo.id} className="rounded-2xl bg-white p-6">
        {combo.image_url ? <img src={combo.image_url} alt="" className="mb-4 h-36 w-full rounded-xl object-cover" /> : <div className="mb-4 flex h-36 w-full items-center justify-center rounded-xl bg-constru-offwhite text-xs text-gray-500">Sin foto</div>}
        <div className="flex items-start justify-between gap-3"><h2 className="text-xl font-semibold break-words">{combo.name}</h2><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${combo.is_active ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-600'}`}>{combo.is_active ? 'Publicado' : 'Borrador'}</span></div>
        <p className="mt-3 text-sm text-gray-600">{combo.description}</p>
        <ul className="my-5 space-y-2 text-sm">{combo.items.map(item => <li key={item.product_id}>{item.quantity} × {item.product?.name ?? 'Producto no disponible'}{item.product && !item.product.is_active && <span className="text-amber-800"> · Inactivo</span>}</li>)}</ul>
        {!combo.items.length && <p className="my-4 text-sm text-amber-800">Este combo todavía no tiene productos vinculados.</p>}
        <div className="flex flex-wrap gap-3"><button className="inline-flex items-center gap-2 rounded-lg bg-constru-offwhite px-4 py-2 text-sm font-semibold" onClick={() => open(combo)}><Pencil size={16} />Editar</button><button className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-700" onClick={() => { remove.reset(); setDeleteId(combo.id); }}><Trash2 size={16} />Eliminar</button></div>
        {deleteId === combo.id && <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4"><p className="text-sm">¿Eliminar este combo? Los productos del catálogo se conservarán.</p>{remove.isError && <p className="mt-2 text-red-800">{remove.error.message}</p>}<div className="mt-3 flex gap-4"><button disabled={remove.isPending} onClick={() => remove.mutate(combo.id)} className="font-semibold text-red-700 disabled:opacity-50">{remove.isPending ? 'Eliminando…' : 'Confirmar eliminación'}</button><button disabled={remove.isPending} onClick={() => setDeleteId(null)}>Cancelar</button></div></div>}
      </article>)}</div>}
    </> : <form onSubmit={submit} className="space-y-6">
      {(validation || save.isError) && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{validation || save.error?.message}</p>}
      <fieldset disabled={save.isPending} className="grid lg:grid-cols-[1fr_1.2fr] gap-6 disabled:opacity-70">
        <div className="rounded-2xl bg-white p-6 space-y-5">
          <h2 className="font-semibold text-lg">Información del paquete</h2>
          <label className="block text-sm font-medium">Nombre del combo<input required minLength={3} maxLength={120} className={`${field} mt-2`} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></label>
          <label className="block text-sm font-medium">Descripción<textarea maxLength={2000} rows={3} className={`${field} mt-2`} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} /></label>
          <ImageUpload
            label="Foto del combo"
            helperText="Se muestra en la tarjeta del inicio y en el detalle. PNG, JPG o WEBP, máximo 2MB."
            value={draft.image_url}
            onChange={(url) => setDraft({ ...draft, image_url: url })}
          />
          <label className="block text-sm font-medium">Beneficios<textarea rows={5} className={`${field} mt-2`} value={featuresText} onChange={e => setFeaturesText(e.target.value)} aria-describedby="features-help" /></label><p id="features-help" className="text-xs text-gray-600">Escribe un beneficio por línea. Se mostrarán en las tarjetas del inicio.</p>
          <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1 accent-constru-primary" checked={draft.is_active} onChange={e => setDraft({ ...draft, is_active: e.target.checked })} /><span className="font-medium">Publicar en el inicio<span className="block mt-1 font-normal text-gray-600">Desmarca esta opción para guardar como borrador.</span></span></label>
        </div>
        <div className="rounded-2xl bg-white p-6 space-y-5">
          <h2 className="font-semibold text-lg">Productos del combo</h2>
          {products.isPending ? <p role="status">Cargando productos…</p> : products.isError ? <div role="alert"><p className="text-red-700">{products.error.message}</p><button type="button" className="mt-2 underline" onClick={() => void products.refetch()}>Reintentar</button></div> : !products.data.length ? <div className="rounded-xl bg-constru-offwhite p-5"><p>Aún no hay productos guardados. Crea un producto antes de armar el combo.</p><Link className="inline-flex mt-3 underline text-constru-primary" to="/admin/products/new">Crear producto</Link></div> : <>
            <label className="block text-sm font-medium">Buscar por nombre o SKU<div className="relative mt-2"><Search className="absolute left-3 top-3 text-gray-500" size={18} /><input className={`${field} pl-10`} value={search} onChange={e => setSearch(e.target.value)} /></div></label>
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">{matches.map(product => {
              const selected = draft.items.some(item => item.product_id === product.id);
              return <label key={product.id} className="flex items-start gap-3 py-3 cursor-pointer"><input type="checkbox" className="mt-1 accent-constru-primary" checked={selected} onChange={() => setDraft({ ...draft, items: selected ? draft.items.filter(item => item.product_id !== product.id) : [...draft.items, { product_id: product.id, quantity: 1 }] })} /><span className="text-sm flex-1"><span className="font-medium">{product.name}</span><span className="block text-xs text-gray-600 mt-1">{product.sku} · {formatColones(product.price)}{!product.is_active ? ' · Inactivo' : ''}</span></span></label>;
            })}{!matches.length && <p className="py-4 text-sm text-gray-600">No hay coincidencias para esta búsqueda.</p>}</div>
          </>}
          {draft.items.length > 0 && <div className="border-t border-gray-200 pt-5 space-y-4"><h3 className="text-sm font-semibold">Cantidades seleccionadas</h3>{draft.items.map(item => { const product = products.data?.find(p => p.id === item.product_id); return <div key={item.product_id} className="flex items-center gap-3"><label className="flex-1 text-sm" htmlFor={`qty-${item.product_id}`}>{product?.name ?? 'Producto no disponible'}</label><input id={`qty-${item.product_id}`} className="w-20 rounded-lg border border-gray-300 p-2 text-sm" type="number" required min={1} max={999} step={1} value={Number.isNaN(item.quantity) ? '' : item.quantity} onChange={e => setDraft({ ...draft, items: draft.items.map(row => row.product_id === item.product_id ? { ...row, quantity: e.target.valueAsNumber } : row) })} /><button type="button" aria-label={`Quitar ${product?.name ?? 'producto'}`} className="p-2 text-red-700" onClick={() => setDraft({ ...draft, items: draft.items.filter(row => row.product_id !== item.product_id) })}><Trash2 size={16} /></button></div>; })}<p className="text-sm font-semibold">Suma de precios del catálogo: {formatColones(total)}</p><p className="text-xs text-gray-600">Referencia para cotizar. Crear un combo no descuenta inventario.</p></div>}
        </div>
      </fieldset>
      <div className="flex flex-wrap justify-end gap-3"><button type="button" disabled={save.isPending} className="px-5 py-3 text-sm" onClick={() => setEditing(false)}>Cancelar</button><button className={primary} disabled={save.isPending || products.isPending || products.isError || !products.data?.length}><Save size={18} />{save.isPending ? 'Guardando…' : 'Guardar combo'}</button></div>
    </form>}
  </div>;
}
