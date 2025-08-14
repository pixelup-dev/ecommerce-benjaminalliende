// lib/gtag.js
export const GA_TRACKING_ID = process.env.GA_MEASUREMENT_ID;

// Activa el seguimiento de la página
export const pageview = (url) => {
  window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  });
};

// Activa eventos personalizados
export const event = ({ action, category, label, value }) => {
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
