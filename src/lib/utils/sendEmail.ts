"use server";

import { getEmailOptions, transporter } from "@/lib/utils/emailClient";
import { centroid } from "@turf/turf";
import { Feature } from "geojson";

const GOOGLE_MAPS_URL = "https://www.google.com/maps";

const extractProperties = (properties: Feature["properties"]): string[] => {
  return properties ? Object.keys(properties).map((key) => `${key}: ${properties[key]}`) : [];
};

const sendFeaturesEmail = async (formData: { to: string; subject: string; features: Feature[] }) => {
  const { to, subject, features } = formData;

  const centroids: {
    latitude: number;
    longitude: number;
    [key: string]: string | number;
  }[] = [];

  features.forEach((feature) => {
    if (feature.geometry && feature.geometry.type === "Polygon") {
      const center = centroid(feature);
      const [longitude, latitude] = center.geometry.coordinates;

      const properties = extractProperties(feature.properties || {}).reduce(
        (acc, prop) => {
          const [key, value] = prop.split(": ");
          acc[key] = value;
          return acc;
        },
        {} as { [key: string]: string | number }
      );

      centroids.push({ latitude, longitude, ...properties });
    }
  });

  const linksHtml = centroids
    .map((point, index) => {
      const googleMapsLink = `${GOOGLE_MAPS_URL}?q=${point.latitude},${point.longitude}`;
      const propertiesHtml = Object.keys(point)
        .filter((key) => key !== "latitude" && key !== "longitude")
        .map((key) => `<li><strong>${key}:</strong> ${point[key]}</li>`)
        .join("");

      return `
      <p>
        <strong>Location ${index + 1}:</strong>
        <a href="${googleMapsLink}" target="_blank">Open in Google Maps</a><br>
        (Lat: ${point.latitude}, Lon: ${point.longitude})<br>
        <ul>${propertiesHtml}</ul>
      </p>
    `;
    })
    .join("");

  const htmlContent = `
    <html>
      <body>
        <h1>Features Details</h1>
        ${linksHtml}
      </body>
    </html>
  `;

  const mailOptions = getEmailOptions(to, subject, htmlContent);

  return await transporter.sendMail(mailOptions);
};

const sendFeatureEmail = async (formData: { to: string; subject: string; feature: Feature }) => {
  const { to, subject, feature } = formData;

  const center = centroid(feature);
  const [longitude, latitude] = center.geometry.coordinates;
  const properties = extractProperties(feature.properties);

  const googleMapsLink = `${GOOGLE_MAPS_URL}?q=${latitude},${longitude}`;

  const htmlContent = `
    <html>
      <body>
        <h1>Feature Details</h1>
        <p>
          <strong>Location:</strong>
          <a href="${googleMapsLink}" target="_blank">Open in Google Maps</a><br>
          (Lat: ${latitude}, Lon: ${longitude})<br>          
          <strong>Properties:</strong><br>
          <ul>
            ${properties.map((prop) => `<li>${prop}</li>`).join("")}
            </ul>
        </p>
      </body>
    </html>
  `;

  const mailOptions = getEmailOptions(to, subject, htmlContent);

  return await transporter.sendMail(mailOptions);
};

export { sendFeatureEmail, sendFeaturesEmail };
