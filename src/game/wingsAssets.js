import wingsValleyUrl from '../assets/wings-art/wings-valley.png';
import goldBoneUrl from '../assets/wings-art/gold-bone.png';

export const wingsAssetUrls = {
  wingsValley: wingsValleyUrl,
  goldBone: goldBoneUrl,
};

function loadSprite(source) {
  const image = new Image();
  image.src = source;
  return image;
}

export const wingsSprites = {
  valley: loadSprite(wingsValleyUrl),
  goldBone: loadSprite(goldBoneUrl),
};
