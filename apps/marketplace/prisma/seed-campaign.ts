import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find or create the spincome advertiser account
  let advertiser = await prisma.advertiser.findUnique({
    where: { email: "spincome.io@gmail.com" },
  });

  if (!advertiser) {
    advertiser = await prisma.advertiser.create({
      data: {
        email: "spincome.io@gmail.com",
        name: "spincome",
        passwordHash: "",
      },
    });
    console.log("Created advertiser:", advertiser.id);
  }

  // Seed campaign: promote spincome itself
  // Budget in milli-cents: $50 = 5000 cents = 5,000,000 milli-cents
  // CPM $5 = 500 cents
  const campaign = await prisma.campaign.create({
    data: {
      advertiserId: advertiser.id,
      headline: "Get paid to use Claude Code",
      body: "Earn 50% of ad revenue from a single terminal ad after each tool call. 30-second install.",
      cta: "Start earning free",
      clickUrl: "https://spincome.io/setup",
      maxCpmCents: 500,
      budgetCents: 5000000,
      active: true,
      deliverySpeed: "slow",
      targetLanguages: null,
      targetFrameworks: null,
    },
  });

  console.log("Seeded campaign:", campaign.id);
  console.log("Budget: $50 at $5 CPM = ~10,000 impressions");
  console.log("Campaign is ACTIVE — no Stripe payment needed.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
