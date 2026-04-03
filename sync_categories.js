const { execSync } = require('child_process');
const fs = require('fs');

const { DB_USER, DB_PASS, DB_NAME } = process.env;
const container = "hesk-db"; // Según tu docker-compose

try {
    const data = fs.readFileSync('categories.txt', 'utf8');
    const categories = data.split('\n').map(line => line.trim()).filter(line => line !== '');

    for (const category of categories) {
        // Validación de existencia (Idempotencia obligatoria) [cite: 117]
        const checkCmd = `docker exec -e MYSQL_PWD="${DB_PASS}" ${container} mysql -u${DB_USER} ${DB_NAME} -sN -e "SELECT name FROM hesk_categories WHERE name='${category}';"`;
        const exists = execSync(checkCmd).toString().trim();

        if (!exists) {
            // Inserción de nueva categoría [cite: 99]
            const insertCmd = `docker exec -e MYSQL_PWD="${DB_PASS}" ${container} mysql -u${DB_USER} ${DB_NAME} -e "INSERT INTO hesk_categories (name) VALUES ('${category}');"`;
            execSync(insertCmd);
            console.log(`[NUEVA] Categoría creada: ${category}`); 
        } else {
            console.log(`[EXISTENTE] La categoría ya existe: ${category}`); 
        }
    }
} catch (err) {
    console.error("Error en la sincronización:", err.message);
    process.exit(1);
}