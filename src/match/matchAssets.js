import gardenUrl from '../assets/match-art/picnic-garden.png';
import itemsUrl from '../assets/match-art/match-items.png';
import rocketUrl from '../assets/match-art/treat-rocket.png';

export const matchAssetUrls = {
  garden: gardenUrl,
  items: itemsUrl,
  rocket: rocketUrl,
};

export function preloadMatchAssets() {
  Object.values(matchAssetUrls).forEach((url) => {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    image.decode?.().catch(() => {});
  });
}
