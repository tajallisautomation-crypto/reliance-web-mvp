// components/Analytics.tsx
export default function Analytics() {
  return (
    <>
      {/* Plausible */}
      <script
        defer
        data-domain="reliance.tajallis.com.pk"
        src="https://plausible.io/js/script.js"
      />

      {/* Helper: window.plausible(eventName, {props}) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.plausible = window.plausible || function(){(window.plausible.q = window.plausible.q || []).push(arguments)};
          `,
        }}
      />
    </>
  );
}
