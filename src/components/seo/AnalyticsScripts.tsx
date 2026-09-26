"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";

interface AnalyticsScriptsProps {
  yandexMetrikaId?: string;
  yandexMetrikaWebvisor?: boolean;
  yandexMetrikaEcommerce?: boolean;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  topMailRuId?: string;
}

export function AnalyticsScripts({
  yandexMetrikaId,
  yandexMetrikaWebvisor = true,
  yandexMetrikaEcommerce = true,
  googleAnalyticsId,
  googleTagManagerId,
  topMailRuId,
}: AnalyticsScriptsProps) {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(true);

  useEffect(() => {
    const checkConsent = () => {
      try {
        const stored = localStorage.getItem("wobuy_cookie_consent");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (typeof parsed.analytics === "boolean") {
            setAnalyticsAllowed(parsed.analytics);
          }
        }
      } catch {}
    };

    checkConsent();
    window.addEventListener("cookie-consent-updated", checkConsent);
    return () => window.removeEventListener("cookie-consent-updated", checkConsent);
  }, []);

  if (!analyticsAllowed) return null;

  const cleanYmId = (yandexMetrikaId || "").trim().replace(/\D/g, "");
  const cleanGaId = (googleAnalyticsId || "").trim();
  const cleanGtmId = (googleTagManagerId || "").trim();
  const cleanVkId = (topMailRuId || "").trim().replace(/\D/g, "");

  return (
    <>
      {/* 1. Яндекс.Метрика (официальный тег с Вебвизором и E-commerce) */}
      {cleanYmId && (
        <>
          <Script id="yandex-metrika-init" strategy="afterInteractive">
            {`
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

              ym(${cleanYmId}, "init", {
                clickmap: true,
                trackLinks: true,
                accurateTrackBounce: true,
                webvisor: ${yandexMetrikaWebvisor ? "true" : "false"},
                ecommerce: ${yandexMetrikaEcommerce ? '"dataLayer"' : "false"}
              });
            `}
          </Script>
          <noscript>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://mc.yandex.ru/watch/${cleanYmId}`}
                style={{ position: "absolute", left: "-9999px" }}
                alt=""
              />
            </div>
          </noscript>
        </>
      )}

      {/* 2. Google Analytics 4 (gtag.js) */}
      {cleanGaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(cleanGaId)}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${cleanGaId}', {
                page_path: window.location.pathname,
                anonymize_ip: true
              });
            `}
          </Script>
        </>
      )}

      {/* 3. Google Tag Manager (GTM) */}
      {cleanGtmId && (
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${cleanGtmId}');
          `}
        </Script>
      )}

      {/* 4. Top.Mail.Ru / VK Реклама */}
      {cleanVkId && (
        <Script id="top-mail-ru-init" strategy="afterInteractive">
          {`
            var _tmr = window._tmr || (window._tmr = []);
            _tmr.push({id: "${cleanVkId}", type: "pageView", start: (new Date()).getTime()});
            (function (d, w, id) {
              if (d.getElementById(id)) return;
              var ts = d.createElement("script"); ts.type = "text/javascript"; ts.async = true; ts.id = id;
              ts.src = "https://top-fwz1.mail.ru/js/code.js";
              var f = function () {var s = d.getElementsByTagName("script")[0]; s.parentNode.insertBefore(ts, s);};
              if (w.opera == "[object Opera]") { d.addEventListener("DOMContentLoaded", f, false); } else { f(); }
            })(document, window, "tmr-code");
          `}
        </Script>
      )}
    </>
  );
}
