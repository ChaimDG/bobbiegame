import skyParkUrl from '../assets/jump-art/sky-park.png';
import bobbieDogUrl from '../assets/bobbie-dog.png';

export const jumpAssetUrls = {
  skyPark: skyParkUrl,
  bobbie: bobbieDogUrl,
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
  bobbie: loadImage(bobbieDogUrl),
};
