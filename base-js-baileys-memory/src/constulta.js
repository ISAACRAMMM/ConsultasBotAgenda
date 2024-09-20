import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
const filePath = path.resolve(__dirname, './data/pedidos.json');
const excelFilePath = path.resolve(__dirname, '../data/pedidos.xlsx');

export async function agregarPedido(fecha, NombreCliente, pedido) {
    try {
        // Validar entradas
        if (!fecha || !NombreCliente || !pedido || !Array.isArray(pedido.productos)) {
            throw new Error('Entrada no Valida: fecha, NombreCliente, y pedido.productos requeridos.');
        }

        let data = [];
        try {
            const jsonData = await fs.readFile(filePath, 'utf-8');
            data = jsonData ? JSON.parse(jsonData) : [];
            if (!Array.isArray(data)) {
                throw new Error('no es un array');
            }
        } catch (err) {
            if (err.code !== 'ENOENT') {
                console.error('Error de lectura de archivo:', err);
                throw err;
            }
            // El archivo no fue encontrado, inicializar un arreglo vacío
        }

        const newPedido = {
            fecha,
            NombreCliente,
            pedido: pedido.productos,
        };

        data.push(newPedido);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log('Pedido agregado con éxito');

        // Generar archivo Excel
        await generarExcel(data);
    } catch (error) {
        console.error('Error al agregar pedido:', error.message);
    }
}

async function generarExcel(data) {
    try {
        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Pedidos');

        // Escribir el archivo Excel
        await fs.writeFile(excelFilePath, xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' }));
        console.log('Archivo Excel generado con éxito');
    } catch (error) {
        console.error('Error al generar archivo Excel:', error.message);
    }
}