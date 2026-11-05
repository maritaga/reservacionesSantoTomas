export type Salon = {
  slug: string;
  name: string;
  detail: string;
};

export const salons: Salon[] = [
  { slug: "salon-san-jose", name: "Salón San José", detail: "Hasta 60 personas" },
  { slug: "salon-santa-maria", name: "Salón Santa María", detail: "Hasta 30 personas" },
  { slug: "salon-comedor", name: "Comedor parroquial", detail: "Hasta 80 personas" },
  { slug: "salon-san-pablo", name: "Salón San Pablo", detail: "Hasta 40 personas" },
  { slug: "salon-reunion", name: "Salón de reuniones", detail: "Hasta 20 personas" },
];

export function getSalon(slug: string) {
  return salons.find((salon) => salon.slug === slug);
}
