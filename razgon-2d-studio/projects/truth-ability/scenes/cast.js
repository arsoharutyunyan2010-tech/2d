// cast.js — one signature colour per character. Kept identical in every shot.
// YOU (the hero) is always the near, rim-lit figure on the left.
export const YOU   = { top: 'hoodie', color: '#d64a33', head: 'hood' };                        // burnt-orange hoodie, hood up: "you"
export const MOM   = { top: 'dress',  color: '#c98aa8', head: 'bun', headColor: '#2a2028', legs: '#2a2028' };  // dusty rose, hair bun
export const LEO   = { top: 'tshirt', color: '#3a8f8a', head: 'curly', headColor: '#241c20' };  // teal tee, curly hair
export const MIA   = { top: 'dress',  color: '#c9a6d6', head: 'ponytail', headColor: '#3a2a24' }; // lilac dress, ponytail
export const BRO   = { top: 'hoodie', color: '#e0b23c', head: 'capBack', headColor: '#243040' }; // gold hoodie, backwards cap
export const BLACK = { top: 'suit',   color: '#2a2833', head: 'fedora', headColor: '#15131a', face: 'sunglasses' }; // the man in the black suit
export const SELL  = { top: 'tshirt', color: '#5a6b8a', head: 'cap', headColor: '#8a4a3a' };   // shop clerk
export const CROWD = { top: 'none' };
export const CAST = [YOU, MOM, LEO, MIA, BRO, BLACK];
