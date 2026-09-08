export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  options?: string[];
};

export const products: Product[] = [
  {
    id: "mochi-anko",
    name: "Mochi Anko",
    category: "Mochis",
    price: 3000,
    image: "/images/mochis/anko.jpg",
  },
  {
    id: "mochi-matcha",
    name: "Mochi Matcha",
    category: "Mochis",
    price: 3000,
    image: "/images/mochis/matcha.jpg",
  },
  {
    id: "mochi-yuzu",
    name: "Mochi Yuzu",
    category: "Mochis",
    price: 3000,
    image: "/images/mochis/yuzu.jpg",
  },
  {
    id: "mochi-sakura",
    name: "Mochi Sakura",
    category: "Mochis",
    price: 3000,
    image: "/images/mochis/sakura.jpg",
  },
  {
    id: "mochi-cheesecake-frambuesa",
    name: "Mochi Cheesecake de Frambuesa",
    category: "Mochis",
    price: 3000,
    image: "/images/mochis/cheesecake-frambuesa.jpg",
  },
  {
    id: "mochi-cheesecake-maracuya",
    name: "Mochi Cheesecake de Maracuyá",
    category: "Mochis",
    price: 3000,
    image: "/images/mochis/cheesecake-maracuya.jpg",
  },
  {
    id: "mochi-cheesecake-oreo-nutella",
    name: "Mochi Cheesecake Oreo con Nutella",
    category: "Mochis",
    price: 3000,
    image: "/images/mochis/cheesecake-oreo-nutella.jpg",
  },
  {
    id: "mochi-cheesecake-brownie-manjar",
    name: "Mochi Cheesecake Brownie Manjar",
    category: "Mochis",
    price: 3000,
    image: "/images/mochis/cheesecake-brownie-manjar.jpg",
  },
  {
    id: "mochi-tiramisu",
    name: "Mochi Tiramisú",
    category: "Mochis",
    price: 3000,
    image: "/images/mochis/tiramisu.jpg",
  },
  {
    id: "mochi-bon-o-bon",
    name: "Mochi Bon O Bon",
    category: "Mochis",
    price: 3000,
    image: "/images/mochis/bon-o-bon.jpg",
  },
  {
    id: "mochi-oreo-leche-condensada",
    name: "Mochi Oreo con Leche Condensada",
    category: "Mochis",
    price: 3000,
    image: "/images/mochis/oreo-leche-condensada.jpg",
  },

  {
    id: "taiyaki-oreo",
    name: "Taiyaki Oreo",
    category: "Taiyakis",
    price: 3500,
    image: "/images/taiyakis/oreo.jpg",
  },
  {
    id: "taiyaki-anko",
    name: "Taiyaki Anko",
    category: "Taiyakis",
    price: 3500,
    image: "/images/taiyakis/anko.jpg",
  },
  {
    id: "taiyaki-pistacho",
    name: "Taiyaki Pistacho",
    category: "Taiyakis",
    price: 3500,
    image: "/images/taiyakis/pistacho.jpg",
  },
  {
    id: "taiyaki-nutella",
    name: "Taiyaki Nutella",
    category: "Taiyakis",
    price: 3500,
    image: "/images/taiyakis/nutella.jpg",
  },

  {
    id: "onigiri-bulgogi",
    name: "Onigiri Bulgogi",
    category: "Onigiris",
    price: 3500,
    image: "/images/onigiris/bulgogi.jpg",
    options: ["Soya", "Teriyaki"],
  },
  {
    id: "onigiri-bimbap",
    name: "Onigiri Bimbap",
    category: "Onigiris",
    price: 3500,
    image: "/images/onigiris/bimbap.jpg",
    options: ["Soya", "Teriyaki"],
  },
  {
    id: "onigiri-kimchi",
    name: "Onigiri Kimchi Salteado",
    category: "Onigiris",
    price: 3500,
    image: "/images/onigiris/kimchi.jpg",
    options: ["Soya", "Teriyaki"],
  },
  {
    id: "onigiri-atun",
    name: "Onigiri Atún",
    category: "Onigiris",
    price: 3500,
    image: "/images/onigiris/atun.jpg",
    options: ["Soya", "Teriyaki"],
  },
  {
    id: "onigiri-atun-picante",
    name: "Onigiri Atún Picante",
    category: "Onigiris",
    price: 3500,
    image: "/images/onigiris/atun-picante.jpg",
    options: ["Soya", "Teriyaki"],
  },
  {
    id: "onigiri-salmon",
    name: "Onigiri Salmón Asado",
    category: "Onigiris",
    price: 3500,
    image: "/images/onigiris/salmon.jpg",
    options: ["Soya", "Teriyaki"],
  },
];