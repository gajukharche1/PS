import { PrismaClient, UserRole, ListingStatus, ClaimStatus, ReviewStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Pimple Saudagar Directory Database Seed...");

  // 1. Clean existing records in sequence
  console.log("🧹 Clearing old data...");
  await prisma.personalDataRequest.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.media.deleteMany();
  await prisma.favourite.deleteMany();
  await prisma.claimRequest.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.review.deleteMany();
  await prisma.listingCategory.deleteMany();
  await prisma.listingLocation.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.planAuditLog.deleteMany();
  await prisma.pricingPlan.deleteMany();
  await prisma.category.deleteMany();
  await prisma.location.deleteMany();
  await prisma.session.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Pricing Plans
  console.log("💳 Seeding pricing plans...");
  const freePlan = await prisma.pricingPlan.create({
    data: {
      name: "Free Directory",
      slug: "free",
      priceMinor: 0,
      currency: "INR",
      billingPeriodDays: 365,
      maxPhotos: 4,
      maxCategories: 1,
      maxLocations: 1,
      featuredAllowed: false,
      badgeVisible: false,
      callButtonAllowed: true,
      whatsappAllowed: true,
      searchPriority: 1,
      displayOrder: 1,
      isActive: true,
      description: "Essential local presence for independent neighborhood businesses.",
    },
  });

  const standardPlan = await prisma.pricingPlan.create({
    data: {
      name: "Standard Growth",
      slug: "standard",
      priceMinor: 499900, // 4,999 INR
      currency: "INR",
      billingPeriodDays: 365,
      maxPhotos: 12,
      maxCategories: 3,
      maxLocations: 2,
      featuredAllowed: false,
      badgeVisible: true,
      callButtonAllowed: true,
      whatsappAllowed: true,
      searchPriority: 5,
      displayOrder: 2,
      isActive: true,
      description: "Enhanced visibility, verified business badge, and multi-category coverage.",
    },
  });

  const premiumPlan = await prisma.pricingPlan.create({
    data: {
      name: "Premium Spotlight",
      slug: "premium",
      priceMinor: 999900, // 9,999 INR
      currency: "INR",
      billingPeriodDays: 365,
      maxPhotos: 30,
      maxCategories: 6,
      maxLocations: 4,
      featuredAllowed: true,
      badgeVisible: true,
      callButtonAllowed: true,
      whatsappAllowed: true,
      searchPriority: 10,
      displayOrder: 3,
      isActive: true,
      description: "Maximum prominence, top search placement, homepage feature, and dedicated lead capture.",
    },
  });

  // 3. Create Hierarchical Locations
  console.log("📍 Seeding locations in Pimple Saudagar...");
  const rootLocation = await prisma.location.create({
    data: {
      name: "Pimple Saudagar",
      slug: "pimple-saudagar",
      description: "Premier residential and commercial suburb in PCMC / Pune, Maharashtra.",
      latitude: 18.5987,
      longitude: 73.7978,
      featured: true,
      sortOrder: 1,
    },
  });

  const kunalIcon = await prisma.location.create({
    data: {
      parentId: rootLocation.id,
      name: "Kunal Icon Road",
      slug: "kunal-icon-road",
      description: "Major commercial hub with clinics, retail stores, cafes, and restaurants.",
      latitude: 18.5992,
      longitude: 73.7955,
      featured: true,
      sortOrder: 1,
    },
  });

  const kokaneChowk = await prisma.location.create({
    data: {
      parentId: rootLocation.id,
      name: "Kokane Chowk",
      slug: "kokane-chowk",
      description: "Key junction connecting Pimple Saudagar to Wakad and Rahatani.",
      latitude: 18.5954,
      longitude: 73.7998,
      featured: true,
      sortOrder: 2,
    },
  });

  const shivarChowk = await prisma.location.create({
    data: {
      parentId: rootLocation.id,
      name: "Shivar Chowk",
      slug: "shivar-chowk",
      description: "Vibrant dining and retail destination along the main spine road.",
      latitude: 18.6015,
      longitude: 73.7932,
      featured: true,
      sortOrder: 3,
    },
  });

  const govindGarden = await prisma.location.create({
    data: {
      parentId: rootLocation.id,
      name: "Govind Garden Area",
      slug: "govind-garden-area",
      description: "Well-known landmark surrounded by family restaurants and shopping centers.",
      latitude: 18.5971,
      longitude: 73.8012,
      featured: true,
      sortOrder: 4,
    },
  });

  // 4. Create Hierarchical Categories
  console.log("🏷️ Seeding categories & subcategories...");
  const foodCategory = await prisma.category.create({
    data: {
      name: "Food & Dining",
      slug: "food-and-dining",
      description: "Restaurants, cafes, family dining, and sweet marts in Pimple Saudagar.",
      icon: "Utensils",
      featuredOnHome: true,
      sortOrder: 1,
    },
  });

  const healthCategory = await prisma.category.create({
    data: {
      name: "Health & Medical",
      slug: "health-and-medical",
      description: "Dentists, multispecialty clinics, pharmacies, and diagnostic centers.",
      icon: "Stethoscope",
      featuredOnHome: true,
      sortOrder: 2,
    },
  });

  const homeServicesCategory = await prisma.category.create({
    data: {
      name: "Home Services",
      slug: "home-services",
      description: "Plumbers, electricians, carpenters, AC repair, and deep cleaning experts.",
      icon: "Wrench",
      featuredOnHome: true,
      sortOrder: 3,
    },
  });

  const fitnessCategory = await prisma.category.create({
    data: {
      name: "Fitness & Beauty",
      slug: "fitness-and-beauty",
      description: "Gyms, unisex salons, wellness spas, and yoga studios.",
      icon: "Dumbbell",
      featuredOnHome: true,
      sortOrder: 4,
    },
  });

  // Subcategories
  const restaurantSub = await prisma.category.create({
    data: {
      parentId: foodCategory.id,
      name: "Fine Dining & Family Restaurants",
      slug: "family-restaurants",
      sortOrder: 1,
    },
  });

  const cafeSub = await prisma.category.create({
    data: {
      parentId: foodCategory.id,
      name: "Cafes & Bakeries",
      slug: "cafes-and-bakeries",
      sortOrder: 2,
    },
  });

  const dentistSub = await prisma.category.create({
    data: {
      parentId: healthCategory.id,
      name: "Dental Clinics",
      slug: "dental-clinics",
      sortOrder: 1,
    },
  });

  const acRepairSub = await prisma.category.create({
    data: {
      parentId: homeServicesCategory.id,
      name: "AC Repair & Maintenance",
      slug: "ac-repair-services",
      sortOrder: 1,
    },
  });

  const salonSub = await prisma.category.create({
    data: {
      parentId: fitnessCategory.id,
      name: "Unisex Salons & Hair Studios",
      slug: "unisex-salons",
      sortOrder: 1,
    },
  });

  // 5. Create System Users
  console.log("👤 Seeding system users...");
  // Standard development hash for password 'PimpleSaudagar@2026'
  const devPasswordHash = "$argon2id$v=19$m=65536,t=3,p=1$5YlY3wBw4yR9z$U9xYxL9j+wM8X8zW1sO8A==";

  const adminUser = await prisma.user.create({
    data: {
      name: "Directory Admin",
      email: "admin@pimplesaudagar.local",
      passwordHash: devPasswordHash,
      role: UserRole.admin,
      emailVerifiedAt: new Date(),
    },
  });

  const businessOwnerUser = await prisma.user.create({
    data: {
      name: "Rajesh Kulkarni",
      email: "owner@pimplesaudagar.local",
      phone: "+919876543210",
      passwordHash: devPasswordHash,
      role: UserRole.owner,
      emailVerifiedAt: new Date(),
    },
  });

  const visitorUser = await prisma.user.create({
    data: {
      name: "Pooja Sharma",
      email: "visitor@pimplesaudagar.local",
      passwordHash: devPasswordHash,
      role: UserRole.visitor,
      emailVerifiedAt: new Date(),
    },
  });

  // 6. Create Verified Listings
  console.log("🏢 Seeding verified listings in Pimple Saudagar...");

  const listing1 = await prisma.listing.create({
    data: {
      title: "Govind Garden Multi-Cuisine Family Restaurant",
      slug: "govind-garden-multi-cuisine-restaurant",
      description:
        "<p>Pimple Saudagar's landmark family restaurant serving authentic North Indian, Mughlai, Chinese, and coastal seafood delicacies. Features spacious open-air lawn seating, AC banquet halls, and dedicated kids play zone.</p>",
      status: ListingStatus.published,
      claimStatus: ClaimStatus.verified,
      ownerId: businessOwnerUser.id,
      featured: true,
      priority: 10,
      planId: premiumPlan.id,
      planStartedAt: new Date(),
      planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      averageRating: 4.6,
      reviewCount: 48,
      phone: "+919822001122",
      whatsapp: "+919822001122",
      email: "dine@govindgarden.local",
      website: "https://govindgarden.local",
      address: "Survey No. 42, Opposite Roseland Residency, Pimple Saudagar, Pune - 411027",
      locality: "Govind Garden Area",
      landmark: "Opposite Roseland Residency",
      latitude: 18.5971,
      longitude: 73.8012,
      yearEstablished: 2008,
      priceRange: 3,
      openingHours: {
        monday: { open: "11:00", close: "23:30", closed: false },
        tuesday: { open: "11:00", close: "23:30", closed: false },
        wednesday: { open: "11:00", close: "23:30", closed: false },
        thursday: { open: "11:00", close: "23:30", closed: false },
        friday: { open: "11:00", close: "00:00", closed: false },
        saturday: { open: "11:00", close: "00:00", closed: false },
        sunday: { open: "11:00", close: "00:00", closed: false },
      },
      amenities: [
        "Valet Parking",
        "Air Conditioned",
        "Outdoor Seating",
        "Home Delivery",
        "Credit Cards Accepted",
        "Kids Friendly",
      ],
      socialLinks: {
        facebook: "https://facebook.com/govindgardenps",
        instagram: "https://instagram.com/govindgardenps",
      },
      publishedAt: new Date(),
      categories: {
        create: [
          { categoryId: foodCategory.id },
          { categoryId: restaurantSub.id },
        ],
      },
      locations: {
        create: [
          { locationId: rootLocation.id, isPrimary: false },
          { locationId: govindGarden.id, isPrimary: true },
        ],
      },
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      title: "Dr. Smile Advanced Dental Clinic & Implant Center",
      slug: "dr-smile-advanced-dental-clinic-pimple-saudagar",
      description:
        "<p>State-of-the-art dental care center in Kunal Icon Road providing painless root canal treatment, clear aligners, dental implants, teeth whitening, and pediatric dentistry with modern sterilization protocols.</p>",
      status: ListingStatus.published,
      claimStatus: ClaimStatus.verified,
      ownerId: businessOwnerUser.id,
      featured: true,
      priority: 8,
      planId: standardPlan.id,
      planStartedAt: new Date(),
      planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      averageRating: 4.9,
      reviewCount: 32,
      phone: "+919765432199",
      whatsapp: "+919765432199",
      email: "contact@drsmileclinic.local",
      website: "https://drsmiledental.local",
      address: "Shop 104, 1st Floor, Kunal Icon Commercial Complex, Kunal Icon Road, Pimple Saudagar - 411027",
      locality: "Kunal Icon Road",
      landmark: "Near Kunal Icon Society",
      latitude: 18.5995,
      longitude: 73.7958,
      yearEstablished: 2015,
      priceRange: 2,
      openingHours: {
        monday: { open: "10:00", close: "21:00", closed: false },
        tuesday: { open: "10:00", close: "21:00", closed: false },
        wednesday: { open: "10:00", close: "21:00", closed: false },
        thursday: { open: "10:00", close: "21:00", closed: false },
        friday: { open: "10:00", close: "21:00", closed: false },
        saturday: { open: "10:00", close: "21:00", closed: false },
        sunday: { open: "10:00", close: "14:00", closed: false },
      },
      amenities: [
        "Prior Appointment Recommended",
        "Digital X-Ray",
        "Air Conditioned Clinic",
        "UPI & Card Accepted",
        "Wheelchair Accessible",
      ],
      socialLinks: {
        instagram: "https://instagram.com/drsmiledental_ps",
      },
      publishedAt: new Date(),
      categories: {
        create: [
          { categoryId: healthCategory.id },
          { categoryId: dentistSub.id },
        ],
      },
      locations: {
        create: [
          { locationId: rootLocation.id, isPrimary: false },
          { locationId: kunalIcon.id, isPrimary: true },
        ],
      },
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
      title: "CoolBreeze AC & Refrigerator Repair Engineers",
      slug: "coolbreeze-ac-refrigerator-repair-pimple-saudagar",
      description:
        "<p>Professional doorstep AC repair, gas charging, jet pump chemical servicing, installation, and compressor maintenance in Pimple Saudagar, Rahatani, and Wakad. 90-day warranty on all spares.</p>",
      status: ListingStatus.published,
      claimStatus: ClaimStatus.unclaimed,
      featured: false,
      priority: 1,
      planId: freePlan.id,
      averageRating: 4.5,
      reviewCount: 19,
      phone: "+919422334455",
      whatsapp: "+919422334455",
      address: "Shop 12, Shivar Chowk Main Road, Pimple Saudagar - 411027",
      locality: "Shivar Chowk",
      landmark: "Near Shivar Garden Chowk",
      latitude: 18.6015,
      longitude: 73.7932,
      yearEstablished: 2018,
      priceRange: 1,
      openingHours: {
        monday: { open: "08:30", close: "20:30", closed: false },
        tuesday: { open: "08:30", close: "20:30", closed: false },
        wednesday: { open: "08:30", close: "20:30", closed: false },
        thursday: { open: "08:30", close: "20:30", closed: false },
        friday: { open: "08:30", close: "20:30", closed: false },
        saturday: { open: "08:30", close: "20:30", closed: false },
        sunday: { open: "08:30", close: "20:30", closed: false },
      },
      amenities: ["Doorstep Service", "Same Day Service", "Original Spares", "UPI Accepted"],
      publishedAt: new Date(),
      categories: {
        create: [
          { categoryId: homeServicesCategory.id },
          { categoryId: acRepairSub.id },
        ],
      },
      locations: {
        create: [
          { locationId: rootLocation.id, isPrimary: false },
          { locationId: shivarChowk.id, isPrimary: true },
        ],
      },
    },
  });

  // 7. Seed Reviews
  console.log("⭐ Seeding verified reviews...");
  await prisma.review.create({
    data: {
      listingId: listing1.id,
      authorId: visitorUser.id,
      reviewerName: "Pooja Sharma",
      reviewerEmailHash: "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890",
      rating: 5,
      title: "Excellent family dinner ambiance & tasty food",
      body: "We visited Govind Garden last weekend with family. The open-air seating is wonderful in the evening. Paneer Tikka and Veg Biryani were exceptional. Prompt service and ample parking.",
      status: ReviewStatus.approved,
      verifiedVisit: true,
      helpfulCount: 6,
      ownerReply: "Thank you Pooja for your warm feedback! We look forward to hosting your family again.",
      ownerReplyAt: new Date(),
      moderatedAt: new Date(),
    },
  });

  await prisma.review.create({
    data: {
      listingId: listing2.id,
      authorId: visitorUser.id,
      reviewerName: "Amitabh Deshpande",
      reviewerEmailHash: "b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890a1",
      rating: 5,
      title: "Completely painless RCT experience",
      body: "Dr. Smile has very modern equipment and courteous staff. Got my root canal done with zero pain. Very hygienic clinic.",
      status: ReviewStatus.approved,
      verifiedVisit: true,
      helpfulCount: 4,
      moderatedAt: new Date(),
    },
  });

  // 8. Update Category & Location counts
  console.log("📊 Updating listing counts on categories and locations...");
  for (const cat of [foodCategory, healthCategory, homeServicesCategory, fitnessCategory, restaurantSub, cafeSub, dentistSub, acRepairSub, salonSub]) {
    const count = await prisma.listingCategory.count({ where: { categoryId: cat.id } });
    await prisma.category.update({ where: { id: cat.id }, data: { listingCount: count } });
  }

  for (const loc of [rootLocation, kunalIcon, kokaneChowk, shivarChowk, govindGarden]) {
    const count = await prisma.listingLocation.count({ where: { locationId: loc.id } });
    await prisma.location.update({ where: { id: loc.id }, data: { listingCount: count } });
  }

  console.log("✅ Seed completed successfully!");
  console.log(`• Pricing Plans: 3 (Free, Standard, Premium)`);
  console.log(`• Categories: 9`);
  console.log(`• Locations: 5`);
  console.log(`• Listings: 3`);
  console.log(`• Reviews: 2`);
  console.log(`• Users: 3 (admin, owner, visitor)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
