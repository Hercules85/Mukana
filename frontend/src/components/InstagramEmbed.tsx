'use client';

/**
 * Instagram post embed via the official embed endpoint.
 * The post shortcode (e.g. CwK6kpDSaG4 from instagram.com/p/CwK6kpDSaG4/) is
 * passed as `post`; the iframe renders the post card with its caption.
 */
export function InstagramEmbed({ post }: { post: string }) {
  return (
    <iframe
      src={`https://www.instagram.com/p/${post}/embed/captioned/`}
      title={`Instagram post ${post}`}
      width="100%"
      height={540}
      loading="lazy"
      scrolling="no"
      frameBorder={0}
      className="rounded-xl border border-mukana-line bg-white"
      allowFullScreen
    />
  );
}
