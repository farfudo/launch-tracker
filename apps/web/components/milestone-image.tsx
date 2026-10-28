"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type MilestoneImageProps = {
  id: string;
  title: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  credit: string;
  sourceUrl: string;
  labels: { open: string; close: string; hint: string; newTab: string };
};

export function MilestoneImage({ id, title, src, width, height, alt, credit, sourceUrl, labels }: MilestoneImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogTitleId = `${id}-image-dialog-title`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return <>
    <figure className="milestone-image-figure">
      <button
        type="button"
        className={`milestone-image-trigger milestone-image-trigger--${id}`}
        aria-label={`${labels.open}: ${title}`}
        aria-haspopup="dialog"
        aria-controls={`${id}-image-dialog`}
        onClick={() => setIsOpen(true)}
      >
        <Image src={src} alt={alt} width={width} height={height} sizes="(max-width: 600px) 100vw, 760px" quality={82} />
        <span className="milestone-image-hint"><span aria-hidden="true">⌕</span> {labels.hint}</span>
      </button>
      <figcaption>
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
          {credit} <span aria-hidden="true">↗</span><span className="visually-hidden"> ({labels.newTab})</span>
        </a>
      </figcaption>
    </figure>
    <dialog
      ref={dialogRef}
      id={`${id}-image-dialog`}
      className="milestone-image-dialog"
      aria-labelledby={dialogTitleId}
      onClose={() => setIsOpen(false)}
      onCancel={() => setIsOpen(false)}
      onClick={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }}
    >
      <div className="milestone-image-dialog-content">
        <div className="milestone-image-dialog-top">
          <h2 id={dialogTitleId}>{title}</h2>
          <button type="button" className="milestone-image-close" onClick={() => setIsOpen(false)}>
            <span aria-hidden="true">×</span><span className="visually-hidden">{labels.close}</span>
          </button>
        </div>
        <Image src={src} alt={alt} width={width} height={height} sizes="90vw" quality={88} />
        <a className="milestone-image-dialog-credit" href={sourceUrl} target="_blank" rel="noopener noreferrer">
          {credit} <span aria-hidden="true">↗</span><span className="visually-hidden"> ({labels.newTab})</span>
        </a>
      </div>
    </dialog>
  </>;
}
