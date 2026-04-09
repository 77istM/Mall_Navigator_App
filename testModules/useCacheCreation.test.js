import { buildPickerRegion } from '../PrivateMode/utils/pickerRegion';
import { WORLD_PICKER_REGION } from '../PrivateMode/constants/PrivateModeConstants';

describe('useCacheCreation picker region', () => {
  it('falls back to the configured London region when coordinates are missing', () => {
    expect(buildPickerRegion('', '')).toEqual(WORLD_PICKER_REGION);
    expect(buildPickerRegion('   ', '   ')).toEqual(WORLD_PICKER_REGION);
    expect(buildPickerRegion(undefined, undefined)).toEqual(WORLD_PICKER_REGION);
  });

  it('uses typed coordinates when both values are valid numbers', () => {
    expect(buildPickerRegion('51.5000', '-0.1200')).toEqual({
      latitude: 51.5,
      longitude: -0.12,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  });
});
