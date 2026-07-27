import skyParkUrl from '../assets/jump-art/sky-park.png';
import snoetjesDogUrl from '../assets/snoetjes-dog.png';

export const jumpAssetUrls = {
  skyPark: skyParkUrl,
  snoetjes: snoetjesDogUrl,
};

function loadImage(source) {
  const image = new Image();
  image.decoding = 'async';
  image.src = source;
  image.decode?.().catch(() => {});
  return image;
}

export const jumpSprites = {
  skyPark: loadImage(skyParkUrl),
  snoetjes: loadImage(snoetjesDogUrl),
};
