import { describe, expect, it } from "vitest";
import { exploreSpaceCopy, exploreSpaceNavCopy } from "../lib/explore-space";

describe("Explore Space hub content", () => {
  it.each([
    ["pt-PT", "Explora o espaço", "Explorar o espaço", "Descobertas e avanços", "Programas espaciais", "Como funcionam os foguetões", "Marcos espaciais"],
    ["en-GB", "Explore Space", "Explore Space", "Discoveries & Advances", "Space Programs", "How Rockets Work", "Space Milestones"],
    ["es-ES", "Explora el espacio", "Explorar el espacio", "Descubrimientos y avances", "Programas espaciales", "Cómo funcionan los cohetes", "Hitos espaciales"]
  ] as const)("provides four real, localized paths for %s", (locale, title, navTitle, ...titles) => {
    const copy = exploreSpaceCopy[locale];
    expect(copy.title).toBe(title);
    expect(exploreSpaceNavCopy[locale]).toBe(navTitle);
    expect(copy.cards).toHaveLength(4);
    expect(copy.cards.map(([title]) => title)).toEqual(titles);
    expect(copy.cards.map(([, , , href]) => href)).toEqual([
      "/discoveries", "/discoveries/artemis", "/discoveries#technology-lab", "/explore-space/milestones"
    ]);
    expect(copy.cards.every(([, description, action]) => description.length > 20 && action.length > 3)).toBe(true);
  });
});
