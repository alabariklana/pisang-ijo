'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Upload, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardProductsPage() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef();
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
    // cleanup preview on unmount
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) {
        // ambil body response untuk debug
        const text = await res.text().catch(() => null);
        console.error('fetch /api/products failed', res.status, res.statusText, text);
        toast.error(`Gagal memuat produk (status ${res.status})`);
        setProducts([]);
        return;
      }
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetch /api/products exception', err);
      toast.error('Gagal memuat produk. Periksa koneksi atau konfigurasi server.');
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setImageFile(f);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (f) {
      setImagePreview(URL.createObjectURL(f));
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    const fd = new FormData();
    fd.append('file', file);
    // Adjust endpoint as your backend expects. Should return { imageUrl: "/uploads/..." }
    const res = await fetch('/api/uploads', {
      method: 'POST',
      body: fd,
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error('Upload gagal: ' + txt);
    }
    const data = await res.json();
    return data?.imageUrl ?? null;
  };

  const handleAddProduct = async (e) => {
    e?.preventDefault();
    if (!name || !category || !price) {
      toast.error('Lengkapi nama, kategori, dan harga.');
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) throw new Error('Gagal mendapatkan URL gambar');
      }

      const payload = {
        name,
        category,
        price: Number(price),
        description,
        imageUrl: imageUrl || '',
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error('Gagal menyimpan produk: ' + txt);
      }

      toast.success('Produk berhasil ditambahkan');
      // reset form
      setName('');
      setCategory('');
      setPrice('');
      setDescription('');
      setImageFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';

      // refresh list
      await fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Gagal menambahkan produk');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus produk ini?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus produk');
      toast.success('Produk dihapus');
      setProducts((p) => p.filter(item => item.id !== id && item._id !== id));
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus produk');
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header: tombol kembali */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tambah Produk Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label htmlFor="p-name" className="text-sm font-medium text-gray-700">Nama Produk</label>
                <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Pisang ijo Paket Keluarga" required />
              </div>

              <div>
                <label htmlFor="p-category" className="text-sm font-medium text-gray-700">Kategori</label>
                <Input id="p-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Paket Frozen" required />
              </div>

              <div>
                <label htmlFor="p-price" className="text-sm font-medium text-gray-700">Harga (IDR)</label>
                <Input id="p-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="50000" required />
              </div>

              <div>
                <label htmlFor="p-desc" className="text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea
                  id="p-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="Paket 3 Porsi pisang ijo frozen lengkap dengan sausnya"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Gambar Produk</label>
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block"
                  />
                  <Button type="button" onClick={() => fileInputRef.current?.click()} variant="outline" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Pilih Gambar
                  </Button>
                </div>
                {imagePreview && (
                  <div className="mt-3">
                    <img src={imagePreview} alt="preview" className="w-36 h-36 object-cover rounded-md border" />
                  </div>
                )}
              </div>

              <div>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan Produk'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Produk</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingProducts ? (
              <div className="text-center py-6 text-gray-600">Memuat produk...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-6 text-gray-600">Belum ada produk.</div>
            ) : (
              <div className="grid gap-4">
                {products.map((p) => {
                  const id = p.id ?? p._id ?? p._key;
                  return (
                    <div key={id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                          {p.imageUrl ? (
                            // imageUrl may be absolute or relative
                            // prefer using <img> directly; optimize later
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm text-gray-500">No Image</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.category} — Rp {Number(p.price || 0).toLocaleString('id-ID')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}