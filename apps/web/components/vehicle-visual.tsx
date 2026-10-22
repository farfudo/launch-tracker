"use client";

import Image from "next/image";
import { useState } from "react";

import type { Launch } from "../lib/api";
import { useLocale } from "./locale-provider";
import { RocketArt } from "./rocket-art";

function httpsUrl(value: string | null | undefined) {
  try {
    const url = new URL(value ?? "");
    return url.protocol === "https:" && !url.username ? url.href : null;
  } catch {
    return null;
  }
}

export function VehicleVisual({ launch, priority = true }: { launch: Launch; priority?: boolean }) {
  const { messages: t } = useLocale();
  const [failed, setFailed] = useState(false);
  const url = httpsUrl(launch.image_url);
  const licenseUrl = httpsUrl(launch.image_license_url);
  const hasImage = url !== null && !failed;

  return <figure className={`vehicle-visual ${hasImage ? "has-photo" : "has-illustration"}`}>
    <div className="vehicle-visual-frame">
      <div className="photo-orbit" aria-hidden="true" />
      {hasImage ? <Image
        src={url}
        alt={launch.image_title || `${t.vehiclePhoto}: ${launch.vehicle ?? launch.name}`}
        fill
        sizes="(max-width: 800px) 100vw, 560px"
        unoptimized
        preload={priority}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      /> : <RocketArt />}
      <span className="photo-type">{hasImage ? launch.image_kind === "vehicle" ? t.vehiclePhoto : t.missionPhoto : t.imageUnavailable}</span>
    </div>
    <figcaption>
      {hasImage ? <>
        <span>{t.imageCredit}: {launch.image_credit || "Launch Library 2"}</span>
        {" · "}{licenseUrl ? <a href={licenseUrl} target="_blank" rel="noreferrer">{launch.image_license || t.imageLicenseUnknown} ↗</a> : <span>{launch.image_license || t.imageLicenseUnknown}</span>}
        <span className="photo-reference-note">{t.referencePhotoNote}</span>
      </> : <span>{t.imageUnavailable}</span>}
    </figcaption>
  </figure>;
}
