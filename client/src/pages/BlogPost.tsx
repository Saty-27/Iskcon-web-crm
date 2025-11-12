import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Clock, Calendar, User, ArrowLeft, Share2 } from "lucide-react";
import { type BlogPost } from "@shared/schema";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const BlogPostPage = () => {
  const [match, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: [`/api/blog-posts/${slug}`],
    enabled: !!slug,
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content: string) => {
    // Split content by paragraphs and render them
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="text-lg text-gray-700 leading-relaxed mb-6">
        {paragraph.trim()}
      </p>
    ));
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
          {/* Navigation Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 py-8">
            <div className="container mx-auto px-4">
              <Link href="/blog" className="inline-flex items-center text-white hover:text-purple-100 transition-colors mb-4">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Blog
              </Link>
            </div>
          </div>

          {/* Loading Content */}
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="animate-pulse">
              <div className="h-16 bg-gray-300 rounded mb-8"></div>
              <div className="flex items-center gap-6 mb-8">
                <div className="h-4 bg-gray-300 rounded w-32"></div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-4 bg-gray-300 rounded w-28"></div>
              </div>
              <div className="h-96 bg-gray-300 rounded-3xl mb-12"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
            <Link 
              href="/blog" 
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Return to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        {/* Header with Breadcrumb */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 py-8">
          <div className="container mx-auto px-4">
            <Link href="/blog" className="inline-flex items-center text-white hover:text-purple-100 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Blog
            </Link>
          </div>
        </div>

        {/* Blog Post Content */}
        <article className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Huge Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              {post.title}
            </h1>
            
            {/* Read Time Badge */}
            <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Clock className="w-4 h-4 mr-2" />
              {post.readTime} Minutes Read
            </div>
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-600 mb-12">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              <span className="font-medium">{post.author}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
            
            <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>

          {/* Large Bordered Image */}
          <div className="mb-12">
            <div className="relative">
              <img 
                src={post.imageUrl} 
                alt={post.title}
                className="w-full h-96 lg:h-[500px] object-cover rounded-3xl shadow-2xl border-4 border-gray-100"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/800x500/9333ea/ffffff?text=ISKCON+Blog+Image';
                }}
              />
              {/* Decorative border overlay */}
              <div className="absolute inset-0 rounded-3xl border-2 border-white shadow-inner pointer-events-none"></div>
            </div>
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg mb-12">
              <p className="text-lg text-purple-800 font-medium leading-relaxed italic">
                {post.excerpt}
              </p>
            </div>
          )}

          {/* Content Paragraphs */}
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-800">
              {formatContent(post.content)}
            </div>
          </div>

          {/* Author Info */}
          <div className="mt-16 p-8 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {post.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {post.author}
                </h3>
                <p className="text-gray-600">
                  Spiritual writer and devotee sharing insights from the sacred teachings of ISKCON Juhu.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex justify-center">
              <Link 
                href="/blog" 
                className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-full transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                View All Blog Posts
              </Link>
            </div>
          </div>
        </article>
      </div>
      <Footer />
    </>
  );
};

export default BlogPostPage;