import { PrismaClient } from "@prisma/client";
let prisma = new PrismaClient();

const data = [
  { name: "Woman" },
  { name: "Man" },
  { name: "Shoes" },
  { name: "Shirt" },
  { name: "Bag" },
  { name: "Watch" },
  { name: "Glass" },
  { name: "Jewelry" },
];

async function insert() {
  try {
    const inserted = await prisma.category.createMany({
      data,
    });

    console.log(inserted);
  } catch (error) {
    console.log("Error when trying inserted category table:", error);
  }
}

insert();
