import util from 'util';
import { PrismaClient } from '@prisma/client';
let prisma = new PrismaClient();

function log(data) {
  console.log(
    util.inspect(data, { showHidden: false, depth: null, colors: true }),
  );
}

async function insert() {
  try {
    const data = {
      name: 'Sepatu Gunung',
      slug: 'sepatu-gunung',
      price: 100000,
      product_attributes: {
        create: [
          {
            name: 'Size',
            product_attribute_values: {
              create: [
                {
                  value: '40',
                },
                {
                  value: '41',
                },
                {
                  value: '42',
                },
                {
                  value: '43',
                },
              ],
            },
          },
          {
            name: 'Color',
            product_attribute_values: {
              create: [
                {
                  value: 'Brown',
                },
                {
                  value: 'Black',
                },
              ],
            },
          },
          {
            name: 'Tipe',
            product_attribute_values: {
              create: [
                {
                  value: 'Lace Up',
                },
                {
                  value: 'Slip On',
                },
              ],
            },
          },
        ],
      },
    };

    const inserted = await prisma.product.create({
      data,
    });

    // generate ProductAttributeCombination
    const productDetail = await prisma.product.findFirst({
      where: {
        id: inserted.id,
      },
      include: {
        product_attributes: {
          include: {
            product_attribute_values: true,
          },
        },
      },
    });
    log(productDetail);

    const productAttributes = {};
    productDetail.product_attributes.forEach((productAttribute) => {
      productAttribute.product_attribute_values.forEach(
        (productAttributeValue) => {
          productAttributes[productAttribute.name] =
            productAttributes[productAttribute.name] || [];
          productAttributes[productAttribute.name].push({
            id: productAttributeValue.id,
            value: productAttributeValue.value,
          });
        },
      );
    });
    console.log(productAttributes);

    const combination = [];
    const keys = Object.keys(productAttributes);
    const values = Object.values(productAttributes);
    const generateCombination = (i, combinationString, combinationId) => {
      if (i >= keys.length) {
        if (combinationString.startsWith('-')) {
          combinationString = combinationString.slice(1);
        }
        combination.push({
          string: combinationString,
          id: combinationId,
        });
        return;
      }

      values[i].forEach((value) => {
        const newCombinationString = combinationString
          ? combinationString + '-' + value.value
          : value.value;
        generateCombination(i + 1, newCombinationString, [
          ...combinationId,
          value.id,
        ]);
      });
    };
    generateCombination(0, '', []);
    log(combination);

    const productAttributeCombinations =
      await prisma.productCombination.createMany({
        data: combination.map((item) => ({
          combination: item.string,
          product_id: inserted.id,
          key: item.id.join(' '),
          price: inserted.price,
          stock: Math.floor(Math.random() * 100),
        })),
      });
    log(productAttributeCombinations);
  } catch (error) {
    console.log('Error when trying to seed products:', error);
  }
}

insert();
