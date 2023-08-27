import bcrypt from 'bcrypt';

import User from '../../modules/user/model/User.js';


const  createInitialData = async () => {
    try {
        // Forca a tabela a sincronizar os dados
        await User.sync({ force: true });
        const password = await bcrypt.hash('123456', 10);
        
        await User.create({
            name: 'first user',
            email: 'firstUser@gmail.com',
            password: password
        });
        await User.create({
            name: 'user test',
            email: 'userTest@gmail.com',
            password: password
        });
    } catch {
        console.error('Error creating initial user');
    } 
};

export default createInitialData;