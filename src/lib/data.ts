export type Salon = {
  slug: string;
  name: string;
  detail: string;
};

export const salons: Salon[] = [
  { slug: "salon-benedicto-xvi", name: "Benedicto XVI", detail: "Hasta 60 personas" },
  { slug: "salon-juan-pablo-ii", name: "Juan Pablo II", detail: "Hasta 30 personas" },
  { slug: "salon-juan-fisher", name: "Juan Fisher", detail: "Hasta 80 personas" },
  { slug: "salon-san-pablo", name: "Salón San Pablo", detail: "Hasta 40 personas" },
  { slug: "salon-reunion", name: "Salón de reuniones", detail: "Hasta 20 personas" },
];

export function getSalon(slug: string) {
  return salons.find((salon) => salon.slug === slug);
}
