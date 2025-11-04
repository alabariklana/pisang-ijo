import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { connectToDatabase } from '@/lib/mongodb';
import { Calendar, User, Eye, ArrowLeft, Share2, Facebook, Twitter, Mail } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Generate metadata for SEO
function getBaseUrl() {
  try {
    const h = headers();
    const getHeader = (key) =>
      typeof h?.get === 'function' ? h.get(key) : h?.[key] ?? h?.[key?.toLowerCase?.()] ?? undefined;
    const host = getHeader('x-forwarded-host') || getHeader('host') || process.env.VERCEL_URL || 'localhost:3000';
    const proto = getHeader('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    return `${proto}://${host}`;
  } catch {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }
}

export async function generateMetadata({ params, searchParams }) {
  try {
    const { slug } = await params;
    const preview = (await searchParams)?.preview === '1';
    const { db } = await connectToDatabase();
    const post = await db.collection('blog_posts').findOne({ slug });
    if (!post) return { title: 'Artikel Tidak Ditemukan' };
    const seo = post.seo || {};

    // If draft and not in preview, use minimal metadata
    const isDraft = post.status !== 'published';
    const noIndex = isDraft || (seo.robotsTag && seo.robotsTag.includes('noindex'));

    return {
      title: `${seo.metaTitle || post.title}${preview && isDraft ? ' (Draft Preview)' : ''}`,
      description: seo.metaDescription || post.excerpt || post.content.substring(0, 160),
      keywords: seo.keywords || [],
      authors: [{ name: seo.author || post.author }],
      publisher: seo.publisher || 'Pisang Ijo Evi',
      robots: {
        index: !noIndex,
        follow: seo.robotsTag?.includes('nofollow') ? false : true,
      },
      alternates: {
        canonical: seo.canonicalUrl || `${getBaseUrl()}/blog/${post.slug}`
      },
      openGraph: {
        title: seo.ogTitle || post.title,
        description: seo.ogDescription || post.excerpt,
        images: [seo.ogImage || post.featuredImage],
        type: seo.ogType || 'article',
        publishedTime: post.publishedAt,
        modifiedTime: post.updatedAt,
        authors: [seo.author || post.author],
        tags: post.tags || [],
      },
      twitter: {
        card: seo.twitterCard || 'summary_large_image',
        title: seo.twitterTitle || post.title,
        description: seo.twitterDescription || post.excerpt,
        images: [seo.twitterImage || post.featuredImage],
      },
    };
  } catch (error) {
    return { title: 'Error Loading Article' };
  }
}

async function getBlogPost(slug, { increment = true } = {}) {
  try {
    const { db } = await connectToDatabase();
    const post = await db.collection('blog_posts').findOne({ slug });
    if (post && increment && post.status === 'published') {
      await db.collection('blog_posts').updateOne({ _id: post._id }, { $inc: { views: 1 } });
    }
    return post;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

export default async function BlogDetailPage({ params, searchParams }) {
  const { slug } = await params;
  const preview = (await searchParams)?.preview === '1';
  const post = await getBlogPost(slug, { increment: !preview });

  if (!post || (post.status !== 'published' && !preview)) {
    notFound();
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const shareUrl = `${getBaseUrl()}/blog/${post.slug}`;
  const shareTitle = encodeURIComponent(post.title);

  // Generate JSON-LD structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt || post.content.substring(0, 160),
    "image": post.featuredImage,
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt,
    "author": {
      "@type": "Person",
      "name": post.seo?.author || post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": post.seo?.publisher || "Pisang Ijo Evi",
      "logo": {
        "@type": "ImageObject",
        "url": `${getBaseUrl()}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": shareUrl
    }
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div style={{ fontFamily: 'var(--font-poppins)', backgroundColor: '#EBDEC5', minHeight: '100vh' }}>
        {/* Preview Banner */}
        {post.status !== 'published' && (
          <div className="text-center py-2 text-white" style={{ backgroundColor: '#b45309' }}>
            Anda sedang melihat draft (preview). Artikel ini belum dipublish.
          </div>
        )}
        {/* Article Header */}
        <div className="py-12 px-4" style={{ backgroundColor: '#214929' }}>
          <div className="max-w-4xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Kembali ke Blog</span>
            </Link>

            {/* Category */}
            <div className="mb-4">
              <span
                className="inline-block px-4 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: '#FCD900', color: '#214929' }}
              >
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1
              className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <User size={18} />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={18} />
                <span>{post.views || 0} views</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="max-w-5xl mx-auto px-4 -mt-8">
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Excerpt */}
          {post.excerpt && (
            <div
              className="text-xl italic mb-8 p-6 rounded-lg border-l-4"
              style={{ backgroundColor: 'white', borderColor: '#214929', color: '#666' }}
            >
              {post.excerpt}
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none bg-white p-8 md:p-12 rounded-lg shadow-md"
            style={{ color: '#333', lineHeight: '1.8' }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1
                    {...props}
                    style={{
                      fontFamily: 'var(--font-playfair)',
                      color: '#214929',
                      fontSize: '2.25em',
                      fontWeight: '700',
                      lineHeight: '1.2',
                      marginTop: '1.5em',
                      marginBottom: '0.8em',
                    }}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    {...props}
                    style={{
                      fontFamily: 'var(--font-playfair)',
                      color: '#214929',
                      fontSize: '1.875em',
                      fontWeight: '700',
                      lineHeight: '1.3',
                      marginTop: '1.4em',
                      marginBottom: '0.7em',
                    }}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    {...props}
                    style={{
                      fontFamily: 'var(--font-playfair)',
                      color: '#214929',
                      fontSize: '1.5em',
                      fontWeight: '600',
                      lineHeight: '1.4',
                      marginTop: '1.2em',
                      marginBottom: '0.6em',
                    }}
                  />
                ),
                h4: ({ node, ...props }) => (
                  <h4
                    {...props}
                    style={{
                      fontFamily: 'var(--font-playfair)',
                      color: '#214929',
                      fontSize: '1.25em',
                      fontWeight: '600',
                      lineHeight: '1.4',
                      marginTop: '1em',
                      marginBottom: '0.5em',
                    }}
                  />
                ),
                p: ({ node, ...props }) => (
                  <p
                    {...props}
                    style={{
                      marginBottom: '1.5em',
                      fontSize: '1.125rem',
                      lineHeight: '1.8',
                      color: '#374151',
                    }}
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul
                    {...props}
                    style={{
                      marginBottom: '1.5em',
                      marginTop: '1em',
                      paddingLeft: '1.5em',
                      listStyleType: 'disc',
                    }}
                  />
                ),
                ol: ({ node, ...props }) => (
                  <ol
                    {...props}
                    style={{
                      marginBottom: '1.5em',
                      marginTop: '1em',
                      paddingLeft: '1.5em',
                      listStyleType: 'decimal',
                    }}
                  />
                ),
                li: ({ node, ...props }) => (
                  <li
                    {...props}
                    style={{
                      marginBottom: '0.5em',
                      lineHeight: '1.8',
                    }}
                  />
                ),
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    className="underline hover:no-underline transition-all"
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    style={{ color: '#214929', fontWeight: '500' }}
                  />
                ),
                img: ({ node, ...props }) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    {...props}
                    alt={props.alt || ''}
                    className="rounded-md my-6"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    {...props}
                    className="italic border-l-4 pl-6 py-2"
                    style={{
                      borderColor: '#214929',
                      color: '#475569',
                      marginTop: '1.5em',
                      marginBottom: '1.5em',
                      backgroundColor: '#f9fafb',
                      fontSize: '1.1rem',
                    }}
                  />
                ),
                code: ({ node, inline, className, children, ...props }) => (
                  <code
                    className={className}
                    {...props}
                    style={{
                      background: inline ? '#f1f5f9' : '#1e293b',
                      color: inline ? '#1e293b' : '#e2e8f0',
                      padding: inline ? '3px 8px' : '1em',
                      borderRadius: 6,
                      fontSize: inline ? '0.9em' : '0.95em',
                      fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                      display: inline ? 'inline' : 'block',
                      marginTop: inline ? 0 : '1em',
                      marginBottom: inline ? 0 : '1em',
                      overflowX: 'auto',
                    }}
                  >
                    {children}
                  </code>
                ),
                strong: ({ node, ...props }) => (
                  <strong {...props} style={{ fontWeight: '700', color: '#1f2937' }} />
                ),
                em: ({ node, ...props }) => (
                  <em {...props} style={{ fontStyle: 'italic', color: '#374151' }} />
                ),
                hr: ({ node, ...props }) => (
                  <hr
                    {...props}
                    style={{
                      border: 'none',
                      borderTop: '2px solid #e5e7eb',
                      marginTop: '2em',
                      marginBottom: '2em',
                    }}
                  />
                ),
              }}
            >
              {post.content || ''}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-3" style={{ color: '#214929' }}>Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-4 py-2 rounded-full text-sm"
                    style={{ backgroundColor: '#FCD900', color: '#214929' }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Share Buttons */}
          <div className="mt-12 p-6 rounded-lg" style={{ backgroundColor: 'white' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#214929' }}>
              <Share2 size={20} className="inline mr-2" />
              Bagikan Artikel Ini
            </h3>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-md text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: '#1877F2' }}
              >
                <Facebook size={18} />
                <span>Facebook</span>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-md text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: '#1DA1F2' }}
              >
                <Twitter size={18} />
                <span>Twitter</span>
              </a>
              <a
                href={`mailto:?subject=${shareTitle}&body=Baca artikel ini: ${shareUrl}`}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: '#214929' }}
              >
                <Mail size={18} />
                <span>Email</span>
              </a>
            </div>
          </div>

          {/* Back to Blog */}
          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-white font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#214929' }}
            >
              <ArrowLeft size={20} />
              <span>Lihat Artikel Lainnya</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
