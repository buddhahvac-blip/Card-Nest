"use client";

import { useEffect, useState } from "react";

type GuardianCardProps = {
  name: string;
  cardNumber: number;
  family: string;
  rarity: string;
  artworkUrl: string | null;
  editionNumber: number;
  maxSupply: number | null;
  description?: string | null;
};

export default function GuardianCard({
  name,
  cardNumber,
  family,
  rarity,
  artworkUrl,
  editionNumber,
  maxSupply,
  description,
}: GuardianCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const number = String(cardNumber).padStart(3, "0");

  return (
    <>
      <article
        className={`guardianCard guardianCard-${rarity.toLowerCase()}`}
      >
        <button
          type="button"
          className="guardianCardArtworkButton"
          onClick={() => setIsOpen(true)}
          aria-label={`View ${name} close up`}
        >
          {artworkUrl ? (
            <img
              src={artworkUrl}
              alt={`${name} CardNest Guardian`}
              className="guardianCardArtwork"
            />
          ) : (
            <div className="guardianCardArtworkMissing">
              Guardian artwork coming soon
            </div>
          )}

          <span className="guardianCardZoom">🔍 View Guardian</span>
        </button>

        <div className="guardianCardInfo">
          <span className="guardianCardMeta">
            #{number} · {rarity.toUpperCase()}
          </span>

          <h3>{name}</h3>

          <p className="guardianCardFamily">
            {family} Guardian
          </p>

          <p className="guardianCardEdition">
            Edition #{editionNumber}
            {maxSupply ? ` / ${maxSupply}` : ""}
          </p>
        </div>
      </article>

      {isOpen && (
        <div
          className="guardianViewer"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} Guardian viewer`}
          onClick={() => setIsOpen(false)}
        >
          <button
            type="button"
            className="guardianViewerClose"
            onClick={() => setIsOpen(false)}
            aria-label="Close Guardian viewer"
          >
            ×
          </button>

          <div
            className="guardianViewerContent"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="guardianViewerArtwork">
              {artworkUrl && (
                <img
                  src={artworkUrl}
                  alt={`${name} CardNest Guardian close up`}
                />
              )}
            </div>

            <div className="guardianViewerDetails">
              <span className="guardianViewerEyebrow">
                CARDNEST · SEASON 1
              </span>

              <h2>{name}</h2>

              <div className="guardianViewerTags">
                <span>#{number}</span>
                <span>{family}</span>
                <span>{rarity}</span>
              </div>

              {description && (
                <p className="guardianViewerDescription">
                  {description}
                </p>
              )}

              <div className="guardianViewerEdition">
                <small>YOUR GUARDIAN</small>
                <strong>
                  Edition #{editionNumber}
                  {maxSupply ? ` / ${maxSupply}` : ""}
                </strong>
              </div>

              <button
                type="button"
                className="guardianViewerDone"
                onClick={() => setIsOpen(false)}
              >
                Return to My Nest
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
