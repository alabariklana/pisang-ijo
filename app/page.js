'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Phone, Mail, MapPin, Facebook, Instagram, ShoppingCart, Menu as MenuIcon, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signInWithGoogle, user } = useAuth();
  const router = useRouter();
  const [loginLoading, setLoginLoading] = useState(false);
  // Fungsi login Google
  const handleGoogleLogin = async () => {
    setLoginLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        toast.success('Login berhasil');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/popup-blocked') {
        toast.error('Pop-up diblokir. Mohon izinkan pop-up untuk login.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // User closed the popup, no need to show error
        return;
      } else {
        toast.error('Login gagal. Silakan coba lagi.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');

      if (!res.ok) {
        const contentType = res.headers.get('content-type') || '';
        let body = null;
        try {
          body = contentType.includes('application/json') ? await res.json() : await res.text();
        } catch (err) {
          body = '<unable to parse body>';
        }
        console.error('API error:', res.status, body);
        toast.error('Gagal memuat produk. Silakan coba lagi nanti.');
        setProducts([]);
        return;
      }

      const data = await res.json();

      // Validate that data is an array
      if (Array.isArray(data)) {
        setProducts(data.slice(0, 3)); // Show only 3 featured products
      } else {
        console.error('Invalid data format:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Gagal memuat produk. Silakan coba lagi nanti.');
      setProducts([]);
    }
  };

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Mohon masukkan email Anda');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Format email tidak valid');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const result = await res.json();
      
      if (res.ok) {
        toast.success('Terima kasih! Anda telah berlangganan newsletter kami');
        setEmail('');
      } else {
        toast.info(result.message || 'Email sudah terdaftar');
      }
    } catch (error) {
      toast.error('Gagal berlangganan, silakan coba lagi');
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
              <img
                src="https://customer-assets.emergentagent.com/job_120889a2-ce7e-413b-8824-b8c0eeea94ef/artifacts/kekg4cgf_logo%20pisjo%20pendek.png"
                alt="Pisang Ijo Evi Logo"
                className="h-12 w-auto"
              />
               <span className="text-2xl font-bold text-green-700">Pisang Ijo Evi</span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-700 hover:text-green-600 transition">Home</Link>
              <Link href="/tentang" className="text-gray-700 hover:text-green-600 transition">Tentang Kami</Link>
              <Link href="/menu" className="text-gray-700 hover:text-green-600 transition">Menu</Link>
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
                <Link href="/menu" className="text-gray-700 hover:text-green-600 transition" onClick={() => setMobileMenuOpen(false)}>Menu</Link>
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

      {/* Admin Login Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto max-w-6xl px-4 py-2">
          <div className="flex justify-end">
            <Button
              onClick={handleGoogleLogin}
              disabled={loginLoading}
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              {loginLoading ? 'Memproses...' : 'Login Admin'}
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background image (behind everything) */}
        <div
          className="absolute inset-0"
          style={{
            zIndex: 0,
            backgroundImage: "url('https://storage.googleapis.com/biolink_pisjo/images/pisang-ijo-makanan-khas-makassar.webp')",
            backgroundSize: 'cover',
            opacity: 0.5,
            backgroundPosition: 'center',
          }}
        />

        {/* Semi-transparent green overlay so the image is tinted but still visible */}
        <div className="absolute inset-0" style={{ zIndex: 10, background: 'linear-gradient(90deg, rgba(2, 68, 49, 0.6), rgba(4,120,87,0.5))' }} />

        {/* Subtle decorative pattern on top of image + overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 12,
            opacity: 0.3,
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.08) 35px, rgba(255,255,255,.08) 70px)`
          }}
        />
 
        <div className="relative z-20 text-center text-white px-4 max-w-4xl">
          <h1
            className="text-4xl md:text-6xl font-bold mb-4 font-serif"
            style={{ textShadow: '0 6px 9px rgba(4, 49, 31, 0.65)' }}
          >
            Pisang Ijo Khas Makassar
          </h1>
          <p className="text-base md:text-lg mb-8 font-serif">Kelezatan tradisional yang menyegarkan, dibuat dengan cinta dan resep turun temurun</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/menu">
              <Button size="lg" className="bg-white text-green-700 hover:bg-gray-100 w-full sm:w-auto">
                Lihat Menu
              </Button>
            </Link>
            <Link href="/pesan">
              <Button size="lg" variant="outline" className="bg-white text-green-700 hover:bg-gray-100 w-full sm:w-auto">
                Pesan Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-green-700 mb-6">Tentang Pisang Ijo Evi</h2>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-4">
                Pisang Ijo Evi adalah usaha keluarga yang telah melayani masyarakat Makassar dengan es pisang ijo autentik selama bertahun-tahun. 
                Kami menggunakan bahan-bahan pilihan dan resep tradisional yang telah diwariskan turun temurun.
              </p>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6">
                Setiap porsi es pisang ijo kami dibuat dengan penuh perhatian dan cinta, 
                memastikan rasa yang konsisten dan kualitas terbaik untuk pelanggan kami.
              </p>
              <Link href="/tentang">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  Selengkapnya
                </Button>
              </Link>
            </div>
            <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden shadow-2xl bg-gradient-to-br from-green-100 to-green-300">
                <div className="w-full h-full">
                  <img
                    src="https://storage.googleapis.com/biolink_pisjo/images/498602876_29703158232665862_3556139579327850024_n.jpg"
                    alt="Pisang Ijo terbaik Makassar"
                    className="w-full h-full object-cover"
                  />
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      
      <section className="py-16 px-4 bg-green-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-green-700 mb-4">Menu Favorit Kami</h2>
            <p className="text-gray-600 text-base md:text-lg">Pilihan es pisang ijo terbaik untuk Anda</p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products.length > 0 ? (
              products.map((product, idx) => {
                const key = product._id ?? product.id ?? product.slug ?? `${product.name}-${idx}`;
                const imgSrc = product.imageUrl ?? product.image ?? (Array.isArray(product.photos) ? product.photos[0] : null);
                return (
                  <Card key={String(key)} className="hover:shadow-xl transition">
                    <CardHeader>
                      <div className="h-48 bg-gray-200 rounded-md mb-4 overflow-hidden">
                        {imgSrc ? (
                          <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                            <span className="text-green-700 text-6xl">🍌</span>
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-green-700">{product.name}</CardTitle>
                      <CardDescription>{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-600">
                        Rp {(Number(product.price) || 0).toLocaleString('id-ID')}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/menu#${product.slug ?? key}`} className="w-full">
                        <Button className="w-full bg-green-600 hover:bg-green-700">Lihat Detail</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 mb-4">Produk akan segera hadir...</p>
                <Link href="/dashboard">
                  <Button variant="outline" className="border-green-600 text-green-600">
                    Tambah Produk (Admin)
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {products.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/menu">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Lihat Semua Menu
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-green-700 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Dapatkan Promo & Update Terbaru</h2>
          <p className="text-green-100 mb-8">Berlangganan newsletter kami dan dapatkan info promo menarik</p>
          <form onSubmit={handleNewsletterSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Masukkan email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white text-gray-900"
              disabled={loading}
            />
            <Button type="submit" variant="secondary" disabled={loading} className="sm:w-auto">
              {loading ? 'Memproses...' : 'Subscribe'}
            </Button>
          </form>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-green-700 mb-4">Hubungi Kami</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition">
              <CardContent className="pt-6">
                <Phone className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold text-lg mb-2">Telepon</h3>
                <a href="tel:+6281234567890" className="text-gray-600 hover:text-green-600">
                  +62 812-3456-7890
                </a>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition">
              <CardContent className="pt-6">
                <Mail className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold text-lg mb-2">Email</h3>
                <a href="mailto:info@pisangijoevi.com" className="text-gray-600 hover:text-green-600">
                  info@pisangijoevi.com
                </a>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition">
              <CardContent className="pt-6">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold text-lg mb-2">Lokasi</h3>
                <p className="text-gray-600">Makassar, Sulawesi Selatan</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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
                <li><Link href="/dashboard" className="text-green-200 hover:text-white transition">Dashboard Admin</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Ikuti Kami</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-green-200 hover:text-white transition">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="text-green-200 hover:text-white transition">
                  <Instagram className="h-6 w-6" />
                </a>
              </div>
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