export interface Category {
  description: string;
  id: string;
  name: string;
  notice: string | null;
  order: number;
}

/**
 * The full category list from `docs/PLAN.md` section 4. A category with no
 * shipped instrument stays hidden until one passes the licence gate.
 *
 * Keys are sorted, and the display order comes from `order`.
 */
export const categories: Category[] = [
  {
    description:
      "Traits that describe how a person typically thinks, feels, and acts.",
    id: "personality",
    name: "Personality and temperament",
    notice: null,
    order: 1,
  },
  {
    description:
      "Reasoning tasks such as matrix reasoning, number series, and rotation.",
    id: "cognitive",
    name: "Cognitive ability and reasoning",
    notice:
      "These tasks are not an intelligence test. They report the number of correct answers only.",
    order: 2,
  },
  {
    description: "Interest and work-preference measures.",
    id: "career",
    name: "Career and vocational interests",
    notice: null,
    order: 3,
  },
  {
    description:
      "Short screens for common mental health concerns. A screen is not a diagnosis.",
    id: "screening",
    name: "Mental health screening",
    notice:
      "A screen is not a diagnosis. If you are in crisis or thinking about harming yourself, contact your local emergency number or a crisis line now.",
    order: 4,
  },
  {
    description: "Life satisfaction and positive functioning.",
    id: "wellbeing",
    name: "Well-being and quality of life",
    notice: null,
    order: 5,
  },
  {
    description: "Self-esteem, self-efficacy, and self-concept.",
    id: "self",
    name: "Self, identity, and self-concept",
    notice: null,
    order: 6,
  },
  {
    description: "Perceived stress, coping, and burnout.",
    id: "stress",
    name: "Stress, coping, and burnout",
    notice: null,
    order: 7,
  },
  {
    description: "Grit, need for cognition, and related traits.",
    id: "motivation",
    name: "Motivation and performance traits",
    notice: null,
    order: 8,
  },
];

export const findCategory = (id: string) =>
  categories.find((category) => category.id === id);
