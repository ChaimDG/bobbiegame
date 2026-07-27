export const itemTypes = [
  {
    id: 'bone',
    label: 'Bone',
    className: 'match-item-bone',
    spritePosition: '0% 0%',
  },
  {
    id: 'ball',
    label: 'Ball',
    className: 'match-item-ball',
    spritePosition: '100% 0%',
  },
  {
    id: 'paw',
    label: 'Paw',
    className: 'match-item-paw',
    spritePosition: '0% 50%',
  },
  {
    id: 'star',
    label: 'Star',
    className: 'match-item-star',
    spritePosition: '100% 50%',
  },
  {
    id: 'heart',
    label: 'Heart',
    className: 'match-item-heart',
    spritePosition: '0% 100%',
  },
  {
    id: 'treat',
    label: 'Treat',
    className: 'match-item-treat',
    spritePosition: '100% 100%',
  },
];

export const itemTypeIds = itemTypes.map((item) => item.id);
