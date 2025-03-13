/**
 * Agrega ceros a la izquierda de un número hasta alcanzar una longitud específica
 * @param {string} nro - El número al que se le agregarán ceros
 * @param {number} cantidad - La longitud final deseada
 * @returns {string} - El número con ceros añadidos a la izquierda
 */
export function agregarCeros(nro, cantidad) {
    let numero = nro.trim();
    let cuantos = "0";
    
    // Crear una cadena de ceros siguiendo la lógica original
    for (let i = 1; i <= cantidad; i++) {
        cuantos = cuantos + "0";
    }
    
    // Si el número ya es lo suficientemente largo, devolverlo tal cual
    if (numero.length >= cantidad) {
        return numero;
    }
    
    // Tomar la cantidad correcta de ceros y añadirlos al número
    return cuantos.substring(0, cantidad - numero.length) + numero;
}

// Exportación alternativa (como exportación por defecto)
// export default agregarCeros;