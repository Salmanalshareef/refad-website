"use client";

/**
 * Last resort: this replaces the root layout, so it only runs when the layout
 * itself failed. Nothing from the app is available here — no global stylesheet,
 * so no Tailwind classes and no theme variables, and no next/font, so the
 * colours are literal and the font falls back to a system Arabic stack. The
 * document language and direction have to be set here too, because the root
 * <html> this replaces is the one that normally carries them.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          backgroundColor: "#f4f7f6",
          color: "#163f47",
          fontFamily:
            "'Cairo', 'Segoe UI', 'Noto Sans Arabic', 'Tahoma', sans-serif",
        }}
      >
        <title>حدث خطأ — صندوق رفاد</title>
        <main style={{ maxWidth: "32rem", textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>
            حدث خطأ غير متوقع
          </h1>
          <p
            style={{
              margin: "0.75rem 0 0",
              fontSize: "0.875rem",
              lineHeight: 1.8,
              color: "#6e7876",
            }}
          >
            تعذّر تحميل الصفحة. حاول مرة أخرى، وإذا تكرر الخطأ تواصل معنا على
            info@refad.sa
          </p>
          <button
            onClick={() => retry()}
            style={{
              marginTop: "2rem",
              minHeight: "2.75rem",
              padding: "0 1.5rem",
              borderRadius: "9999px",
              border: "none",
              cursor: "pointer",
              backgroundColor: "#286e62",
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 600,
              fontFamily: "inherit",
            }}
          >
            إعادة المحاولة
          </button>
          {error.digest && (
            <p
              dir="ltr"
              style={{
                marginTop: "2rem",
                fontSize: "0.75rem",
                color: "#9aa4a0",
              }}
            >
              {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
