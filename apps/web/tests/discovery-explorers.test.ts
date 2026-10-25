import { expect,it } from "vitest";
import { artemisSources,explorerCopy,technologySources } from "../lib/discovery-explorers";

it("keeps the visual lab and guide complete across languages with traceable sources",()=>{
  for (const locale of ["pt-PT","en-GB","es-ES"] as const) {
    const copy = explorerCopy[locale];
    expect(copy.tabs).toHaveLength(3);
    expect(copy.technologies).toHaveLength(3);
    for (const item of copy.technologies) {expect(item.states).toHaveLength(2);expect(item.labels).toHaveLength(4);expect(item.limit.length).toBeGreaterThan(30);}
    expect(copy.roles).toHaveLength(4);
    expect(copy.connections).toHaveLength(4);
    expect(copy.missions.map(item=>item.source)).toEqual(["first","second","third"]);
  }
  for (const url of [...Object.values(artemisSources),...technologySources.flat().map(source=>source.url)]) {
    expect(new URL(url).protocol).toBe("https:");
    expect(["www.nasa.gov","www.esa.int","www.spacex.com","www.blueorigin.com"]).toContain(new URL(url).hostname);
  }
});
