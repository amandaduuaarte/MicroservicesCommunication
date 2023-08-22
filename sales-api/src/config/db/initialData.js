import Order from "../../modules/sales/model/Order.js";


export async function createInitialData() {
    await Order.collection.drop();
    let firstOrder = await Order.create({
        products: [
            {
                productId: 1001,
                quantity: 3,
            },
            {
                productId: 1002,
                quantity: 2,
            },
            {
                productId: 1003,
                quantity: 1,
            },
        ],
        user: {
            id: "userTestId",
            name: "userTestName",
            email: "userTestEmail@gmail.com",
        },
        status: "APPROVED",
        createdAt: new Date(),
        updateAt: new Date(),
    });
    await Order.create({
        products: [
            {
                productId: 1001,
                quantity: 3,
            },
            {
                productId: 1003,
                quantity: 4,
            },
        ],
        user: {
            id: "userTestId2",
            name: "userTestName2",
            email: "userTestEmail2@gmail.com",
        },
        status: "REJECT",
        createdAt: new Date(),
        updateAt: new Date(),
    });

    let initialData = await Order.find();
    console.info(`Initial data was created: ${JSON.stringify(initialData, undefined, 4)}`);
}