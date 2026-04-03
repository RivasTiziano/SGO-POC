const { execSync } = require('child_process'); //Ejecuta comandos ddirectamente en js
const fs = require('fs'); //Opera los archivos del sistema

const { DB_USER, DB_PASS, DB_NAME } = process.env; // Se trae las variables de entorno del runner
const container = "hesk-db"; 

try {
    const data = fs.readFileSync('categories.txt', 'utf8'); //Monta el archivo en la variable
    //Sanitizacion y pasa cada categoria como elemento de un array
    const categories = data.split('\n').map(line => line.trim()).filter(line => line !== ''); 

    for (const category of categories) {
        //Arma y guarda el comando de verificacion en la variable, si existe 
        const checkCmd = `docker exec -e MYSQL_PWD="${DB_PASS}" ${container} mysql -u${DB_USER} ${DB_NAME} -sN -e "SELECT name FROM hesk_categories WHERE name='${category}';"`;
        const exists = execSync(checkCmd).toString().trim();

        if (!exists) { //Se aprovecha lo que devuelve execSync como salida
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