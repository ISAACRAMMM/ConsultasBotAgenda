import fetch from 'node-fetch'; // Para realizar peticiones HTTP
import { createObjectCsvWriter } from 'csv-writer'; // Para escribir archivos CSV
import { promises as fs } from 'fs';
import path from 'path';

// Función para convertir datos a CSV y guardarlos
async function guardarPedidosComoCSV(rutas) {
    const fechaActual = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const nombreArchivo = `${fechaActual}_${rutas.join('_')}.csv`; // Generar el nombre del archivo usando la fecha y las rutas
    const filePath = path.join(__dirname, './data', nombreArchivo); // Ruta al archivo

    try {
        // 1. Hacer la petición a la API
        const response = await fetch(`http://localhost:3000/get?rutas=${rutas.join(',')}`);
        const pedidos = await response.json(); // Obtener los pedidos como JSON

        // 2. Validar si hay pedidos
        if (!Array.isArray(pedidos) || pedidos.length === 0) {
            throw new Error('No se encontraron pedidos con las rutas proporcionadas.');
        }

        // 3. Definir el encabezado para el archivo CSV
        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: [
                { id: 'ruta', title: 'Ruta' },
                { id: 'fecha', title: 'Fecha' },
                { id: 'nombreCliente', title: 'Cliente' },
                { id: 'productos', title: 'Productos' }
            ]
        });

        // 4. Preparar los datos en formato adecuado para CSV
        const registrosCSV = pedidos.map(pedido => ({
            ruta: pedido.ruta,
            fecha: pedido.fecha,
            nombreCliente: pedido.nombreCliente,
            productos: pedido.productos.join(', ') // Convertir el array de productos en una cadena
        }));

        // 5. Escribir el archivo CSV
        await csvWriter.writeRecords(registrosCSV);

        console.log(`Archivo CSV guardado exitosamente en ${filePath}`);
    } catch (error) {
        console.error('Error al guardar los pedidos como CSV:', error.message);
    }
}

// Ejemplo de uso: solicitar los pedidos para las rutas "pedido1" y "pedido2"
guardarPedidosComoCSV(['pedido1', 'pedido2']);
