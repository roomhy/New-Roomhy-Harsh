import { useEffect, useRef } from 'react';
import { fetchJson } from '../utils/api';

/**
 * Dynamic SEO hook — fetches meta data from backend by pageKey
 * Falls back to static values if API fails or data not found.
 *
 * Usage:
 *   useSEO({ pageKey: 'about' })
 *   useSEO({ pageKey: 'home', fallbackTitle: 'Roomhy - PG Booking' })
 *   useSEO({ title: 'Static Title', description: 'Static desc' })  // legacy static mode
 */
export default function useSEO({ pageKey, fallbackTitle, fallbackDescription, title, description, canonical } = {}) {
  const appliedRef = useRef(false);

  useEffect(() => {
    // LEGACY STATIC MODE: if title/description passed directly (no pageKey)
    if (!pageKey) {
      if (title) document.title = title;
      applyMeta('description', description);
      applyCanonical(canonical);
      return;
    }

    // DYNAMIC MODE: fetch from backend
    let cancelled = false;
    
    async function loadSeo() {
      try {
        const res = await fetchJson(`/api/seo/metadata?pageKey=${pageKey}`);
        if (cancelled) return;

        if (res?.success && res?.data) {
          const seo = res.data;

          // Title
          if (seo.metaTitle) {
            document.title = seo.metaTitle;
          } else if (fallbackTitle) {
            document.title = fallbackTitle;
          }

          // Description
          applyMeta('description', seo.metaDescription || fallbackDescription);

          // Keywords
          if (seo.metaKeywords) applyMeta('keywords', seo.metaKeywords);

          // Robots
          const robotsValue = seo.robots || (seo.isIndexed === false ? 'noindex, nofollow' : 'index, follow');
          applyMeta('robots', robotsValue);

          // Canonical URL
          applyCanonical(seo.canonicalUrl || canonical);

          // Open Graph basics
          applyOGMeta('og:title', seo.openGraphTitle || seo.metaTitle);
          applyOGMeta('og:description', seo.openGraphDescription || seo.metaDescription);
          if (seo.openGraphImage) applyOGMeta('og:image', seo.openGraphImage);
          applyOGMeta('og:type', 'website');

          // Twitter Card
          applyMeta('twitter:card', seo.twitterCard || 'summary_large_image');
          if (seo.twitterTitle || seo.metaTitle) applyMeta('twitter:title', seo.twitterTitle || seo.metaTitle);
          if (seo.twitterDescription || seo.metaDescription) applyMeta('twitter:description', seo.twitterDescription || seo.metaDescription);

          appliedRef.current = true;
        } else {
          // Fallback if API returned no data
          if (fallbackTitle) document.title = fallbackTitle;
          if (fallbackDescription) applyMeta('description', fallbackDescription);
        }
      } catch (err) {
        // Silent fail — fallback to static values
        if (!cancelled) {
          if (fallbackTitle) document.title = fallbackTitle;
          if (fallbackDescription) applyMeta('description', fallbackDescription);
        }
      }
    }

    loadSeo();

    return () => {
      cancelled = true;
    };
  }, [pageKey]);
}

// --- Helpers ---

function applyMeta(name, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function applyOGMeta(property, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function applyCanonical(href) {
  if (!href) return;
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
}
