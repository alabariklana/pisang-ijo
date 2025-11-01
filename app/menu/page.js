'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, ArrowLeft, Menu as MenuIcon, X } from 'lucide-react';

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      
      if (!res.ok) {
        console.error('API error:', res.status);
        setProducts([]);
        return;
      }
      
      const data = await res.json();
      
      // Validate that data is an array
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('Invalid data format:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">PJ</span>
              </div>
              <span className="text-2xl font-bold text-green-700">Pisang Ijo Evi</span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-700 hover:text-green-600 transition">Home</Link>
              <Link href="/tentang" className="text-gray-700 hover:text-green-600 transition">Tentang Kami</Link>
              <Link href="/menu" className="text-green-600 font-semibold">Menu</Link>
              <Link href="/cara-pemesanan" className="text-gray-700 hover:text-green-600 transition">Cara Pemesanan</Link>
              <Link href="/kontak" className="text-gray-700 hover:text-green-600 transition">Kontak</Link>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/pesan" className="hidden md:block">
                <Button className="bg-green-600 hover:bg-green-700">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Pesan Sekarang
                </Button>
              </Link>
              
              {/* Mobile Menu Button */}
              <button 
                className="md:hidden text-gray-700"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col space-y-3">
                <Link href="/" className="text-gray-700 hover:text-green-600 transition" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link href="/tentang" className="text-gray-700 hover:text-green-600 transition" onClick={() => setMobileMenuOpen(false)}>Tentang Kami</Link>
                <Link href="/menu" className="text-green-600 font-semibold" onClick={() => setMobileMenuOpen(false)}>Menu</Link>
                <Link href="/cara-pemesanan" className="text-gray-700 hover:text-green-600 transition" onClick={() => setMobileMenuOpen(false)}>Cara Pemesanan</Link>
                <Link href="/kontak" className="text-gray-700 hover:text-green-600 transition" onClick={() => setMobileMenuOpen(false)}>Kontak</Link>
                <Link href="/pesan" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Pesan Sekarang
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 md:py-16 px-4 bg-green-700 text-white">
        <div className="container mx-auto max-w-6xl">
          <Link href="/" className="inline-flex items-center text-green-200 hover:text-white mb-4 transition">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Home
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Menu Kami</h1>
          <p className="text-lg md:text-xl text-green-100">Pilihan Es Pisang Ijo terbaik untuk Anda dan keluarga</p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Memuat produk...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {products.map((product, idx) => {
                const key = product._id ?? product.id ?? product.slug ?? `${product.name}-${idx}`;
                const imgSrc = product.imageUrl ?? product.image ?? (Array.isArray(product.photos) ? product.photos[0] : null);
                return (
                  <Card key={String(key)} className="hover:shadow-xl transition" id={product.slug ?? key}>
                    <CardHeader>
                      <div className="h-48 md:h-64 bg-gray-200 rounded-md mb-4 overflow-hidden">
                        {imgSrc ? (
                          <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                            <span className="text-green-700 text-5xl md:text-6xl">🍌</span>
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-green-700 text-lg md:text-xl">{product.name}</CardTitle>
                      <CardDescription className="text-sm">{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <p className="text-xl md:text-2xl font-bold text-green-600">
                          Rp {(Number(product.price) || 0).toLocaleString('id-ID')}
                        </p>
                        {product.available ? (
                          <span className="text-xs md:text-sm text-green-600 bg-green-100 px-2 py-1 rounded">Tersedia</span>
                        ) : (
                          <span className="text-xs md:text-sm text-red-600 bg-red-100 px-2 py-1 rounded">Habis</span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Link href={`/menu/${product.slug ?? key}`} className="flex-1">
                        <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                          Detail
                        </Button>
                      </Link>
                      <Link href="/pesan" className="flex-1">
                        <Button className="w-full bg-green-600 hover:bg-green-700" disabled={!product.available}>
                          {product.available ? 'Pesan' : 'Habis'}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🍌</div>
              <p className="text-gray-500 mb-4">Belum ada produk tersedia</p>
              <Link href="/dashboard">
                <Button variant="outline" className="border-green-600 text-green-600">
                  Tambah Produk (Admin)
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      {products.length > 0 && (
        <section className="py-12 px-4 bg-green-50">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-4">
              Siap Memesan?
            </h2>
            <p className="text-gray-600 mb-6">
              Hubungi kami sekarang untuk pemesanan atau pertanyaan lebih lanjut
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pesan">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Pesan Sekarang
                </Button>
              </Link>
              <Link href="/kontak">
                <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 w-full sm:w-auto">
                  Hubungi Kami
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-green-900 text-white py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Pisang Ijo Evi</h3>
              <p className="text-green-200 text-sm">Es Pisang Ijo Khas Makassar yang lezat dan menyegarkan</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Menu</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-green-200 hover:text-white transition">Home</Link></li>
                <li><Link href="/tentang" className="text-green-200 hover:text-white transition">Tentang Kami</Link></li>
                <li><Link href="/menu" className="text-green-200 hover:text-white transition">Menu</Link></li>
                <li><Link href="/pesan" className="text-green-200 hover:text-white transition">Pesan</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Informasi</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/cara-pemesanan" className="text-green-200 hover:text-white transition">Cara Pemesanan</Link></li>
                <li><Link href="/kontak" className="text-green-200 hover:text-white transition">Kontak</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Kontak</h3>
              <ul className="space-y-2 text-sm text-green-200">
                <li>Makassar, Sulawesi Selatan</li>
                <li>+62 812-3456-7890</li>
                <li>info@pisangijoevi.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-green-800 pt-6 text-center text-sm text-green-200">
            <p>&copy; 2025 Pisang Ijo Evi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}