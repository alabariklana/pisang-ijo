import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'Pisang Ijo Evi - Es Pisang Ijo Makassar',
  description: 'Website resmi Pisang Ijo Evi - Es Pisang Ijo khas Makassar yang lezat dan segar',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  )
}