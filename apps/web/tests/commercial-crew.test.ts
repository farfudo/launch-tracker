import {describe,it,expect} from 'vitest';
import {crewCopy,isCommercialCrewMission} from '../lib/commercial-crew';
describe('Commercial Crew educational content',()=>{
 it('has five steps and four sourced milestones in every language',()=>{for(const t of Object.values(crewCopy)){expect(t.steps).toHaveLength(5);expect(t.details).toHaveLength(5);expect(t.events).toHaveLength(4);expect(t.starlinerBody.length).toBeGreaterThan(100);}});
 it('only matches exact reviewed mission names',()=>{expect(isCommercialCrewMission('Crew-10')).toBe(true);expect(isCommercialCrewMission('  STARLINER CREW FLIGHT TEST ')).toBe(true);expect(isCommercialCrewMission('Crew-10 cargo')).toBe(false);expect(isCommercialCrewMission('Falcon 9 | Starlink')).toBe(false);});
});
