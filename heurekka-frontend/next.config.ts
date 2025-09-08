import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,


  // Image optimization configuration for property photos
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    domains: [
      // Supabase Storage domains
      'your-project-id.supabase.co',
      // CDN domains for property images
      'images.heurekka.com',
      // Mapbox static images
      'api.mapbox.com',
      // External image sources (development)
      'localhost',
      '127.0.0.1'
    ],
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // PWA and Service Worker support
  experimental: {
    webpackBuildWorker: true,
  },
  
  // External packages for server components
  serverExternalPackages: ['@trpc/server'],

  // Environment variables validation
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  },

  // Headers for security and performance
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
    return [
      {
        source: '/(.*)',
        headers: [
          // Security Headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), camera=(), microphone=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'" + (isDev ? " 'unsafe-inline' 'unsafe-eval'" : ""),
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "media-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "connect-src 'self' https://*.supabase.co https://api.mapbox.com https://maps.googleapis.com" + (isDev ? " ws://localhost:* http://localhost:*" : ""),
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              "manifest-src 'self'",
              "upgrade-insecure-requests"
            ].join('; '),
          },
        ],
      },
      // Cache static assets
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects for SEO and navigation
  async redirects() {
    return [
      // Add any necessary redirects here
    ];
  },

  // Webpack configuration for optimizations
  webpack: (config, { dev, isServer }) => {
    // Bundle analyzer in development
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      );
    }

    // Optimize for production
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        trpc: {
          name: 'trpc',
          test: /[\\/]node_modules[\\/](@trpc)[\\/]/,
          chunks: 'all',
          priority: 20,
        },
        supabase: {
          name: 'supabase',
          test: /[\\/]node_modules[\\/](@supabase)[\\/]/,
          chunks: 'all',
          priority: 20,
        },
        query: {
          name: 'react-query',
          test: /[\\/]node_modules[\\/](@tanstack)[\\/]/,
          chunks: 'all',
          priority: 20,
        },
      };
    }

    return config;
  },
};

export default nextConfig;
